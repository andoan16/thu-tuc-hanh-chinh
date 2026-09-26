import { ref, watch } from 'vue'

const STORAGE_KEY = 'tttc_progress_v1'

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* quota exceeded or disabled */
  }
}

// Global reactive store
const store = ref(loadAll())

watch(store, (v) => saveAll(v), { deep: true })

export function useProcedureProgress(slug) {
  if (!store.value[slug]) {
    store.value[slug] = { answers: {}, checked: {} }
  }

  function setAnswer(qid, val) {
    store.value[slug].answers[qid] = val
  }

  function toggleCheck(docId, val) {
    const c = store.value[slug].checked
    if (val === undefined) {
      c[docId] = !c[docId]
    } else {
      c[docId] = val
    }
    store.value = { ...store.value }
  }

  function reset() {
    store.value[slug] = { answers: {}, checked: {} }
    store.value = { ...store.value }
  }

  return {
    state: store.value[slug],
    setAnswer,
    toggleCheck,
    reset,
  }
}

export function useDarkMode() {
  // Khởi tạo: class đã được inline script trong index.html set trước khi Vue mount
  // (chống nháy trắng). Ở đây chỉ đọc lại trạng thái.
  const dark = ref(document.documentElement.classList.contains('dark'))

  // Đồng bộ khi hệ điều hành đổi theme — chỉ khi người dùng chưa chọn thủ công
  try {
    const saved = localStorage.getItem('tttc_dark')
    if (saved === null && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = (e) => {
        if (localStorage.getItem('tttc_dark') !== null) return
        dark.value = e.matches
        document.documentElement.classList.toggle('dark', dark.value)
      }
      if (mq.addEventListener) mq.addEventListener('change', onChange)
    }
  } catch { /* ignore */ }

  function toggle() {
    dark.value = !dark.value
    document.documentElement.classList.toggle('dark', dark.value)
    try {
      localStorage.setItem('tttc_dark', dark.value ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  return { dark, toggle }
}

export function useVietQR() {
  // Editable config — stored in localStorage so the user can set their own
  const CFG_KEY = 'tttc_vietqr_cfg'
  const defaultCfg = {
    bankBin: '970436', // Vietcombank default
    accountNo: '0711000123456', // placeholder
    accountName: 'TRAN VAN A',
  }
  const cfg = ref({ ...defaultCfg, ...loadCfg() })

  function loadCfg() {
    try {
      return JSON.parse(localStorage.getItem(CFG_KEY) || '{}')
    } catch {
      return {}
    }
  }
  function saveCfg() {
    try {
      localStorage.setItem(CFG_KEY, JSON.stringify(cfg.value))
    } catch {
      /* ignore */
    }
  }
  function update(patch) {
    cfg.value = { ...cfg.value, ...patch }
    saveCfg()
  }

  function qrUrl(amount = 0) {
    const { bankBin, accountNo } = cfg.value
    const a = amount ? `&amount=${amount}` : ''
    return `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?accountName=${encodeURIComponent(cfg.value.accountName)}${a}`
  }

  return { cfg, update, qrUrl }
}