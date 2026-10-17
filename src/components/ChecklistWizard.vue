<script setup>
import { computed, ref, watch } from 'vue'
import { CheckCircle2, AlertTriangle, FileText, StickyNote, ScrollText, Coins, ClipboardCopy, RotateCcw, ChevronRight, ArrowLeft, Printer } from 'lucide-vue-next'

const props = defineProps({
  procedure: { type: Object, required: true },
  state: { type: Object, required: true },
})

const emit = defineEmits(['toggle-check', 'set-answer', 'reset', 'complete', 'summary'])

// QUAN TRỌNG: các ref này phải khai báo TRƯỚC mọi computed/watch đọc chúng.
// watch(progress) chạy getter ngay lúc tạo (lấy oldValue) → nếu viewAll khai báo
// sau watch sẽ TDZ crash setup → trang trắng. SSR test không bắt được (watch là
// no-op trong SSR) — chỉ crash ở client.
const currentQuestionIndex = ref(0)
const showChecklist = ref(false)
const viewAll = ref(false) // "Xem tất cả": bỏ qua wizard, liệt kê union mọi nhánh
const copied = ref(false)

function skipToAll() {
  viewAll.value = true
  showChecklist.value = true
}

const badgeMap = {
  scan: { cls: 'badge-scan', label: 'Scan / file số', icon: FileText },
  goc: { cls: 'badge-goc', label: 'Bản gốc', icon: StickyNote },
  saoy: { cls: 'badge-saoy', label: 'Sao y / công chứng', icon: ScrollText },
  fee: { cls: 'badge-fee', label: 'Lệ phí', icon: Coins },
}

const activeRuleKey = computed(() => {
  for (const [, ans] of Object.entries(props.state.answers)) {
    if (props.procedure.rules[ans]) return ans
  }
  return null
})

const activeRule = computed(() => {
  if (!activeRuleKey.value) return null
  return props.procedure.rules[activeRuleKey.value]
})

const requiredDocs = computed(() => {
  if (viewAll.value) {
    // "Xem tất cả": union giấy tờ bắt buộc của mọi nhánh rule
    const union = new Set()
    for (const rule of Object.values(props.procedure.rules)) {
      for (const id of rule.required) union.add(id)
    }
    return [...union].map(id => ({ id, ...props.procedure.documents[id], required: true }))
  }
  if (!activeRule.value) return []
  return activeRule.value.required.map(id => ({ id, ...props.procedure.documents[id], required: true }))
})

const optionalDocs = computed(() => {
  if (viewAll.value) {
    // "Xem tất cả": giấy tờ optional của mọi nhánh, trừ những gì đã liệt kê ở required
    const reqIds = new Set(requiredDocs.value.map(d => d.id))
    const union = new Set()
    for (const rule of Object.values(props.procedure.rules)) {
      for (const id of (rule.optional || [])) {
        if (!reqIds.has(id)) union.add(id)
      }
    }
    return [...union].map(id => ({ id, ...props.procedure.documents[id], required: false }))
  }
  if (!activeRule.value) return []
  return (activeRule.value.optional || []).map(id => ({ id, ...props.procedure.documents[id], required: false }))
})

const progress = computed(() => {
  const req = requiredDocs.value
  if (!req.length) return 0
  const checked = req.filter(d => props.state.checked[d.id]).length
  return Math.round((checked / req.length) * 100)
})

const missingRequired = computed(() =>
  requiredDocs.value.filter(d => !props.state.checked[d.id])
)

const allAnswered = computed(() =>
  props.procedure.questions.every(q => props.state.answers[q.id])
)

watch(progress, (v) => {
  if (v === 100) emit('complete')
})

// Mục 6: khôi phục vị trí wizard khi reload.
// Answers đã lưu trong localStorage (useProcedureProgress) — nếu user đã trả lời
// hết thì mở thẳng checklist; chưa hết thì nhảy đến câu đầu tiên chưa trả lời.
{
  const qIds = props.procedure.questions.map(q => q.id)
  const firstUnanswered = qIds.findIndex(id => !props.state.answers[id])
  if (firstUnanswered === -1) {
    showChecklist.value = true
  } else if (firstUnanswered > 0) {
    currentQuestionIndex.value = firstUnanswered
  }
}

function answerQuestion(qid, val) {
  emit('set-answer', qid, val)
  if (currentQuestionIndex.value < props.procedure.questions.length - 1) {
    currentQuestionIndex.value++
  } else {
    showChecklist.value = true
  }
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

function startChecklist() {
  showChecklist.value = true
}

function resetAll() {
  currentQuestionIndex.value = 0
  showChecklist.value = false
  viewAll.value = false
  emit('reset')
}

function printList() {
  window.print()
}

function generateSummary() {
  const lines = [props.procedure.title, '']
  lines.push('Giấy tờ cần chuẩn bị:')
  for (const d of requiredDocs.value) {
    const mark = props.state.checked[d.id] ? '[x]' : '[ ]'
    lines.push(`${mark} ${d.label}`)
  }
  if (optionalDocs.value.length) {
    lines.push('')
    lines.push('Giấy tờ phụ (nếu có):')
    for (const d of optionalDocs.value) {
      const mark = props.state.checked[d.id] ? '[x]' : '[ ]'
      lines.push(`${mark} ${d.label}`)
    }
  }
  lines.push('')
  lines.push(`Tiến độ: ${progress.value}%`)
  const feeText = props.procedure.fee === 0
    ? 'Miễn phí'
    : (props.procedure.feeMin !== undefined && props.procedure.feeMin < props.procedure.fee)
      ? `từ ${props.procedure.feeMin.toLocaleString('vi-VN')}đ`
      : `${props.procedure.fee.toLocaleString('vi-VN')}đ`
  lines.push(`Lệ phí: ${feeText}`)
  lines.push(`Nơi nộp: ${props.procedure.officeInfo.where}`)
  lines.push(`Giờ làm việc: ${props.procedure.officeInfo.hours}`)
  lines.push('')
  lines.push('— Sổ Tay Dịch Vụ Công')

  const text = lines.join('\n')
  navigator.clipboard?.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
  emit('summary', text)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Wizard -->
    <div v-if="!showChecklist" class="gov-card p-5 space-y-5">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-medium text-stone-900 dark:text-white">
          Trả lời nhanh để nhận danh sách phù hợp
        </h3>
        <span class="text-xs text-stone-500 dark:text-stone-300 font-mono">{{ currentQuestionIndex + 1 }}/{{ procedure.questions.length }}</span>
      </div>

      <!-- Stepper dọc kiểu cổ điển: số thứ tự + tiêu đề câu hỏi, nối nét đứt -->
      <div class="space-y-0">
        <div
          v-for="(q, i) in procedure.questions"
          :key="q.id"
          class="flex gap-3"
        >
          <div class="flex flex-col items-center shrink-0">
            <div
              :class="[
                'w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold border-2 transition-colors',
                i < currentQuestionIndex
                  ? 'bg-gov-red text-yellow-100 border-gov-red'
                  : i === currentQuestionIndex
                    ? 'bg-white dark:bg-stone-700 text-gov-red dark:text-red-300 border-gov-red dark:border-red-400'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-300 border-stone-300 dark:border-stone-600',
              ]"
            >
              {{ i + 1 }}
            </div>
            <div
              v-if="i < procedure.questions.length - 1"
              :class="[
                'w-0.5 flex-1 min-h-[24px] border-l-2 border-dashed transition-colors',
                i < currentQuestionIndex ? 'border-gov-red' : 'border-stone-300 dark:border-stone-600',
              ]"
            />
          </div>
          <div class="flex-1 pb-4">
            <p
              :class="[
                'text-sm mb-0.5',
                i === currentQuestionIndex
                  ? 'font-semibold text-stone-900 dark:text-white'
                  : i < currentQuestionIndex
                    ? 'text-stone-500 dark:text-stone-300 line-through'
                    : 'text-stone-400 dark:text-stone-400',
              ]"
            >
              {{ q.text }}
            </p>
            <div v-if="state.answers[q.id] && i < currentQuestionIndex" class="text-xs text-gov-red dark:text-red-300">
              ✓ {{ q.options.find(o => o.value === state.answers[q.id])?.label }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-for="(q, i) in procedure.questions"
        :key="q.id"
        v-show="i === currentQuestionIndex"
      >
        <p class="font-medium text-sm mb-3 text-stone-800 dark:text-stone-100">{{ q.text }}</p>
        <div class="grid gap-2">
          <button
            v-for="opt in q.options"
            :key="opt.value"
            @click="answerQuestion(q.id, opt.value)"
            :class="[
              'px-4 py-3 rounded border text-sm font-medium text-left transition-all duration-150',
              state.answers[q.id] === opt.value
                ? 'border-red-700 bg-red-50 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-100'
                : 'border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-100',
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <button
        v-if="allAnswered && !showChecklist"
        @click="startChecklist"
        class="btn-primary w-full"
      >
        Xem danh sách giấy tờ
        <ChevronRight :size="16" />
      </button>

      <div v-if="currentQuestionIndex > 0" class="flex justify-center">
        <button
          @click="prevQuestion"
          class="btn-ghost"
        >
          <ArrowLeft :size="15" />
          Quay lại
        </button>
      </div>

      <div class="flex justify-center">
        <button
          @click="skipToAll"
          class="text-xs text-stone-500 dark:text-stone-300 hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          Bỏ qua — xem danh sách đầy đủ
        </button>
      </div>
    </div>

    <!-- Checklist -->
    <div v-if="showChecklist" class="space-y-4">
      <div v-if="viewAll" class="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 rounded px-3 py-2">
        <AlertTriangle :size="13" class="mt-0.5 shrink-0" />
        <span>Danh sách đầy đủ mọi trường hợp. Một số giấy tờ có thể không cần cho tình huống của bạn.</span>
      </div>

      <div class="gov-card p-5">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-stone-700 dark:text-stone-100">Tiến độ chuẩn bị</span>
          <span
            :class="progress === 100 ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-stone-500 dark:text-stone-300'"
            class="text-sm font-mono"
          >
            {{ progress }}%
          </span>
        </div>
        <div class="h-2 bg-stone-200 dark:bg-stone-700 rounded overflow-hidden">
          <div
            :class="progress === 100 ? 'bg-emerald-600' : 'bg-red-700'"
            class="h-full transition-all duration-300"
            :style="{ width: progress + '%' }"
          />
        </div>

        <div
          v-if="missingRequired.length && progress < 100"
          class="mt-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200"
        >
          <AlertTriangle :size="13" class="mt-0.5 shrink-0" />
          <span>Thiếu {{ missingRequired.length }} giấy tờ bắt buộc.</span>
        </div>
        <div
          v-if="progress === 100"
          class="mt-3 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200"
        >
          <CheckCircle2 :size="13" />
          <span class="font-medium">Đủ giấy tờ. Sẵn sàng đi nộp.</span>
        </div>
      </div>

      <!-- Required: bảng kiểu tờ khai -->
      <div v-if="requiredDocs.length" class="gov-card p-5">
        <h3 class="text-sm font-medium text-stone-800 dark:text-stone-100 mb-3">
          {{ viewAll ? 'Giấy tờ có thể cần (mọi trường hợp)' : 'Giấy tờ bắt buộc' }}
        </h3>
        <table class="doc-table">
          <thead>
            <tr>
              <th class="w-10 text-center">STT</th>
              <th>Nội dung</th>
              <th class="w-32">Loại giấy tờ</th>
              <th class="w-10 text-center">Đã có</th>
            </tr>
          </thead>
          <colgroup>
          <col class="!w-[8%] sm:!w-[10%]">
          <col class="!flex-1 min-w-0">
          <col class="!w-[40%] sm:!w-[28%]">
          <col class="!w-[8%] sm:!w-[10%]">
        </colgroup>
          <tbody>
            <tr
              v-for="(doc, idx) in requiredDocs"
              :key="doc.id"
              :class="state.checked[doc.id] ? 'opacity-50' : ''"
            >
              <td class="text-center font-mono text-xs">{{ idx + 1 }}</td>
              <td class="break-words">
                <label
                  :class="state.checked[doc.id] ? 'line-through' : ''"
                  class="text-xs sm:text-sm font-medium cursor-pointer text-stone-900 dark:text-stone-100"
                >
                  {{ doc.label }}
                </label>
              </td>
              <td class="text-[10px] sm:text-xs text-stone-600 dark:text-stone-200 flex flex-wrap gap-1">
                <span v-for="b in doc.badges" :key="b" class="shrink-0 whitespace-nowrap">{{ badgeMap[b]?.label }}</span>
              </td>
              <td class="text-center">
                <input
                  type="checkbox"
                  :checked="!!state.checked[doc.id]"
                  @change="emit('toggle-check', doc.id)"
                  class="cursor-pointer"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Optional: bảng kiểu tờ khai -->
      <div v-if="optionalDocs.length" class="gov-card p-5">
        <h3 class="text-sm font-medium text-stone-500 dark:text-stone-300 mb-3">Giấy tờ phụ (nếu có)</h3>
        <table class="doc-table">
          <thead>
            <tr>
              <th class="w-10 text-center">STT</th>
              <th>Nội dung</th>
              <th class="w-32">Loại giấy tờ</th>
              <th class="w-10 text-center">Đã có</th>
            </tr>
          </thead>
          <colgroup>
          <col class="!w-[8%] sm:!w-[10%]">
          <col class="!flex-1 min-w-0">
          <col class="!w-[40%] sm:!w-[28%]">
          <col class="!w-[8%] sm:!w-[10%]">
        </colgroup>
          <tbody>
            <tr
              v-for="(doc, idx) in optionalDocs"
              :key="doc.id"
              :class="state.checked[doc.id] ? 'opacity-50' : ''"
            >
              <td class="text-center font-mono text-xs">{{ idx + 1 }}</td>
              <td class="break-words">
                <label
                  :class="state.checked[doc.id] ? 'line-through' : ''"
                  class="text-xs sm:text-sm cursor-pointer text-stone-900 dark:text-stone-100"
                >
                  {{ doc.label }}
                </label>
              </td>
              <td class="text-[10px] sm:text-xs text-stone-600 dark:text-stone-200 flex flex-wrap gap-1">
                <span v-for="b in doc.badges" :key="b" class="shrink-0 whitespace-nowrap">{{ badgeMap[b]?.label }}</span>
              </td>
              <td class="text-center">
                <input
                  type="checkbox"
                  :checked="!!state.checked[doc.id]"
                  @change="emit('toggle-check', doc.id)"
                  class="cursor-pointer"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex gap-2 no-print">
        <button @click="generateSummary" class="btn-primary flex-1">
          <CheckCircle2 v-if="copied" :size="15" class="text-emerald-200" />
          <ClipboardCopy v-else :size="15" />
          {{ copied ? 'Đã sao chép!' : 'Sao chép tóm tắt' }}
        </button>
        <button @click="printList" class="btn-outline">
          <Printer :size="15" />
          In danh sách
        </button>
        <button @click="resetAll" class="btn-ghost">
          <RotateCcw :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>