<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'
import { normalize } from '../utils/search.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] }, // [{ value, label }]
  placeholder: { type: String, default: 'Tìm...' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const activeIndex = ref(0)
const rootEl = ref(null)
const listEl = ref(null)
const inputEl = ref(null)

// Label đang chọn — hiển thị trong input khi đóng
const selected = computed(() => props.options.find(o => o.value === props.modelValue))

// Lọc theo query không dấu, giới hạn 50 kết quả để DOM nhẹ
const filtered = computed(() => {
  const q = normalize(query.value)
  const opts = q
    ? props.options.filter(o => normalize(o.label).includes(q))
    : props.options
  return opts.slice(0, 50)
})

watch(open, (v) => {
  if (v) {
    query.value = ''
    activeIndex.value = 0
  } else {
    // khi đóng: khôi phục text = label đã chọn (hoặc rỗng)
    query.value = selected.value?.label || ''
  }
})

// Đồng bộ text khi modelValue đổi từ bên ngoài (vd: GPS tự chọn)
watch(() => props.modelValue, () => {
  if (!open.value) query.value = selected.value?.label || ''
})

watch(filtered, (list) => {
  if (activeIndex.value >= list.length) activeIndex.value = Math.max(0, list.length - 1)
}, { immediate: true })

function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    query.value = ''
    inputEl.value?.focus()
  }
}

function select(opt) {
  emit('update:modelValue', opt.value)
  open.value = false
}

function onKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!open.value) { open.value = true; return }
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
    scrollActiveIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const opt = filtered.value[activeIndex.value]
    if (open.value && opt) select(opt)
    else if (!open.value && filtered.value.length) open.value = true
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function scrollActiveIntoView() {
  requestAnimationFrame(() => {
    const el = listEl.value?.children[activeIndex.value]
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function onDocClick(e) {
  if (!rootEl.value?.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="rootEl" class="relative" data-testid="search-select">
    <div class="relative">
      <input
        ref="inputEl"
        v-model="query"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input pr-8 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="!disabled && (open = true)"
        @keydown="onKeydown"
      />
      <button
        type="button"
        tabindex="-1"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-300 hover:text-stone-600 dark:hover:text-stone-100"
        :disabled="disabled"
        @click="toggleOpen"
        aria-label="Mở danh sách"
      >
        <ChevronDown :size="15" :class="open ? 'rotate-180' : ''" class="transition-transform" />
      </button>
    </div>

    <ul
      v-if="open && !disabled"
      ref="listEl"
      class="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 shadow-lg"
      role="listbox"
    >
      <li v-if="!filtered.length" class="px-3 py-2 text-sm text-stone-400 dark:text-stone-400">
        Không tìm thấy
      </li>
      <li
        v-for="(opt, i) in filtered"
        :key="opt.value"
        role="option"
        :aria-selected="opt.value === modelValue"
        :class="[
          'flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer',
          i === activeIndex ? 'bg-stone-100 dark:bg-stone-700' : '',
          opt.value === modelValue ? 'font-medium text-red-800 dark:text-red-300' : 'text-stone-700 dark:text-stone-100',
        ]"
        @mouseenter="activeIndex = i"
        @click="select(opt)"
      >
        <span class="truncate">{{ opt.label }}</span>
        <Check v-if="opt.value === modelValue" :size="14" class="shrink-0 text-red-700 dark:text-red-300" />
      </li>
    </ul>
  </div>
</template>