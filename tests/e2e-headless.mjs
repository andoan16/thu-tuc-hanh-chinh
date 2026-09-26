// E2E thật: Chrome headless load app từ vite preview, dump DOM sau khi JS chạy.
// Nếu setup() crash (vd TDZ) → #app rỗng, không có marker text.
// Cách chạy: node tests/e2e-headless.mjs [port=4173]
import { spawnSync } from 'node:child_process'

const port = process.argv[2] || '4173'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const base = `http://localhost:${port}`

const routes = [
  { frag: '', marker: 'Sổ tay hành chính', name: 'home (hero)' },
  { frag: '#/procedure/doi-gpkx', marker: 'Đổi Giấy phép lái xe', name: 'GPKX (tiêu đề)' },
  { frag: '#/procedure/doi-gpkx', marker: 'Trả lời nhanh để nhận danh sách phù hợp', name: 'GPKX (wizard)' },
  { frag: '#/procedure/ly-lich-tu-phap', marker: 'Nơi nộp hồ sơ', name: 'LLTP (location card)' },
  { frag: '#/procedure/chung-thuc-sao-y', marker: 'Trải nghiệm làm thủ tục', name: 'Sao y (feedback)' },
  { frag: '#/gioi-thieu', marker: 'Giới thiệu', name: 'About (tiêu đề)' },
]

let failures = []
for (const rt of routes) {
  const r = spawnSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    '--virtual-time-budget=5000', '--dump-dom',
    `${base}/index.html${rt.frag}`,
  ], { encoding: 'utf8', timeout: 30000 })
  const ok = (r.stdout || '').includes(rt.marker)
  console.log(`${rt.name.padEnd(28)} ${ok ? 'OK' : 'MISSING MARKER'}`)
  if (!ok) failures.push(rt.name)
}

console.log(failures.length ? `FAIL: ${failures.join(', ')}` : 'HEADLESS E2E ALL OK')
process.exit(failures.length ? 1 : 0)