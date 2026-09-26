// Smoke test render thật: pre-compile TOÀN BỘ .vue bằng @vue/compiler-sfc (đúng
// compiler vite dùng), import như module ESM thường, mount createSSRApp + renderToString.
// Bắt lỗi runtime (TDZ, computed crash, missing export) mà `vite build` bỏ sót.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, '.render-test-cache')
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const require = createRequire(import.meta.url)

// --- browser stubs (đủ cho useStore + runtime-dom load) ---
const store = {}
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v) },
  removeItem: (k) => { delete store[k] },
}
globalThis.window = {
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  addEventListener: () => {},
}
globalThis.history = { state: null, pushState: () => {}, replaceState: () => {} }
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: () => {} }, configurable: true, writable: true,
})
const elStub = () => ({
  style: {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
  setAttribute: () => {}, appendChild: () => {}, childNodes: [],
})
globalThis.document = {
  documentElement: elStub(),
  addEventListener: () => {},
  createElement: elStub,
  createTextNode: () => ({}),
  querySelector: () => null,
  querySelectorAll: () => [],
  head: { appendChild: () => {} },
  body: { appendChild: () => {} },
}

// --- 1. collect + pre-compile mọi .vue và .js trong src/ ---
const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc')

function rewriteImports(code, abs) {
  let jsonCounter = 0
  return code.replace(
    /import\s+(?:({[^}]*})|(\w+))\s+from\s+'([^']+)'/g,
    (m, named, def, spec) => {
      if (!spec.startsWith('.') && !spec.startsWith('/')) return m // package — node tự resolve
      const resolved = path.resolve(path.dirname(abs), spec)
      if (spec.endsWith('.json')) {
        // node JSON module chỉ có default export. Vite cho phép named — tự tách:
        // import { provinces as p } from 'x.json' → import __j1 from 'x.json'; const { provinces: p } = __j1
        const url = pathToFileURL(resolved).href
        const id = `__json_${++jsonCounter}`
        const withAttr = `import ${id} from '${url}' with { type: 'json' }`
        if (named) return `${withAttr}; const ${named.replace(/\s+as\s+/g, ': ')} = ${id}`
        return `${withAttr}; const ${def} = ${id}.default ?? ${id}`
      }
      if (spec.endsWith('.vue') || spec.endsWith('.js')) {
        const child = compiledVue.get(resolved)
        if (!child) throw new Error('chưa pre-compile: ' + resolved)
        return `import ${named || def} from '${pathToFileURL(child).href}'`
      }
      return `import ${named || def} from '${pathToFileURL(resolved).href}'`
    }
  )
}

const compiledVue = new Map() // abs (.vue|.js) → abs .mjs

function preCompile(abs) {
  if (compiledVue.has(abs)) return compiledVue.get(abs)
  const src = readFileSync(abs, 'utf8')
  let code
  if (abs.endsWith('.vue')) {
    const { descriptor, errors } = parse(src, { filename: abs })
    if (errors.length) throw new Error(`parse ${abs}: ${errors[0].message}`)
    const script = compileScript(descriptor, { id: 'x' })
    code = rewriteImports(script.content, abs)
    if (descriptor.template) {
      const t = compileTemplate({
        source: descriptor.template.content,
        filename: abs,
        id: 'x',
        compilerOptions: { mode: 'module', bindingMetadata: script.bindings },
      })
      if (t.errors.length) throw new Error(`template ${abs}: ${t.errors[0].message}`)
      code += `\n${t.code}\n`
      // render export riêng, default export là object literal không tên →
      // bọc lại: đổi `export default {...}` thành gán render qua wrapper import
      code = code.replace(
        /export default \{/,
        'var __component = {'
      )
      code += `\n__component.render = render\nexport default __component\n`
    }
  } else {
    // .js thường — chỉ rewrite import specifier
    code = rewriteImports(src, abs)
  }
  const rel = path.relative(ROOT, abs).replace(/\W/g, '_')
  const outFile = path.join(OUT, rel + '.mjs')
  writeFileSync(outFile, code)
  compiledVue.set(abs, outFile)
  return outFile
}

const allVue = []
function collect(dir) {
  for (const f of readdirSync(dir)) {
    const full = path.join(dir, f)
    if (statSync(full).isDirectory()) collect(full)
    else if (f.endsWith('.vue') || (f.endsWith('.js') && !full.includes('node_modules'))) allVue.push(full)
  }
}
collect(path.join(ROOT, 'src'))
// compile nhiều pass đến kín (cha cần con đã compile trước)
let pending = [...allVue]
for (let pass = 0; pass < 8 && pending.length; pass++) {
  const next = []
  for (const f of pending) {
    try { preCompile(f) } catch { next.push(f) }
  }
  if (next.length === pending.length) throw new Error('pre-compile stuck: ' + next.join(', '))
  pending = next
}

// --- 2. load app ---
// ESM import — cùng module instance với compiled .mjs (specifier trần 'vue')
const { createSSRApp, h } = await import('vue')
const { renderToString } = await import('vue/server-renderer')
const { createRouter, createMemoryHistory } = await import('vue-router')

const App = (await import(pathToFileURL(compiledVue.get(path.join(ROOT, 'src/App.vue'))).href)).default
const HomeView = (await import(pathToFileURL(compiledVue.get(path.join(ROOT, 'src/views/HomeView.vue'))).href)).default
const ProcedureView = (await import(pathToFileURL(compiledVue.get(path.join(ROOT, 'src/views/ProcedureView.vue'))).href)).default
const AboutView = (await import(pathToFileURL(compiledVue.get(path.join(ROOT, 'src/views/AboutView.vue'))).href)).default

const procDir = path.join(ROOT, 'src/data/procedures')
const procedures = readdirSync(procDir).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(readFileSync(path.join(procDir, f), 'utf8')))

// --- 3. render từng route ---
let failures = []

async function renderRoute(pathName) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomeView },
      { path: '/procedure/:slug', name: 'procedure', component: ProcedureView, props: true },
      { path: '/gioi-thieu', name: 'about', component: AboutView },
    ],
  })
  router.push(pathName)
  await router.isReady()
  const app = createSSRApp({ render: () => h(App) })
  app.use(router)
  return await renderToString(app)
}

console.log('--- / (home) ---')
try {
  const html = await renderRoute('/')
  const cards = (html.match(/procedure\//g) || []).length
  const heroOk = html.includes('Sổ tay hành chính')
  console.log('hero:', heroOk, '| cards:', cards)
  if (!heroOk) failures.push('home: thiếu hero text')
  if (cards < 4) failures.push(`home: chỉ ${cards} procedure link (kỳ vọng >= 4)`)
} catch (e) {
  failures.push(`home CRASH: ${e.message}`)
  console.log('CRASH:', e.stack.split('\n').slice(0, 4).join('\n'))
}

for (const p of procedures) {
  console.log(`--- /procedure/${p.slug} ---`)
  try {
    const html = await renderRoute(`/procedure/${p.slug}`)
    const checks = {
      'tiêu đề': html.includes(p.title),
      'wizard q1': html.includes(p.questions[0].text),
      'office': html.includes(p.officeInfo.where.slice(0, 15)),
      'feedback': html.includes('Trải nghiệm làm thủ tục'),
      'location': html.includes('Nơi nộp hồ sơ'),
    }
    const bad = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k)
    if (bad.length) failures.push(`${p.slug}: thiếu ${bad.join(', ')}`)
    console.log(bad.length ? 'MISSING: ' + bad.join(', ') : 'full render OK')
  } catch (e) {
    failures.push(`${p.slug} CRASH: ${e.message}`)
    console.log('CRASH:', e.stack.split('\n').slice(0, 4).join('\n'))
  }
}

console.log('\n=====================')
if (failures.length) {
  console.log('FAIL:\n' + failures.map(f => ' - ' + f).join('\n'))
  process.exit(1)
}
console.log('ALL RENDER CHECKS PASS')