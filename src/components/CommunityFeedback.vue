<script setup>
import { ref, computed } from 'vue'
import { ThumbsUp, ServerCrash, Users, Flag, Check } from 'lucide-vue-next'

const props = defineProps({
  slug: { type: String, required: true },
  title: { type: String, required: true },
})

const REPO_URL = 'https://github.com/andoan16/thu-tuc-hanh-chinh'

const STORAGE_KEY = computed(() => `tttc_survey_${props.slug}`)
const survey = ref(localStorage.getItem(STORAGE_KEY.value) || '')
const submitted = ref(!!survey.value)

function vote(val) {
  survey.value = val
  submitted.value = true
  try {
    localStorage.setItem(STORAGE_KEY.value, val)
  } catch { /* ignore */ }
}

const options = [
  { value: 'smooth', label: 'Mượt mà', icon: ThumbsUp },
  { value: 'online_error', label: 'Cổng lỗi', icon: ServerCrash },
  { value: 'crowded', label: 'Đông người', icon: Users },
]

function reportUrl() {
  const body = [
    `## Thủ tục: ${props.title}`,
    `Slug: ${props.slug}`,
    '',
    '### Thông tin đã thay đổi hoặc sai sót:',
    '<!-- Mô tả cụ thể: lệ phí, giờ làm việc, giấy tờ, liên kết... -->',
    '',
    '### Nguồn tham khảo (nếu có):',
    '',
    '### Ghi chú thêm:',
    '',
    '---',
    '_Báo cáo từ Sổ Tay Dịch Vụ Công_',
  ].join('\n')
  return `${REPO_URL}/issues/new?title=${encodeURIComponent('[Cập nhật] ' + props.title)}&body=${encodeURIComponent(body)}`
}
</script>

<template>
  <div class="space-y-3">
    <div class="gov-card p-4">
      <h3 class="text-sm font-medium text-stone-800 50 50  mb-1">
        Trải nghiệm làm thủ tục của bạn thế nào?
      </h3>
      <p class="text-xs text-stone-500 200 100   mb-3">
        Ghi chú cá nhân trên máy bạn — không gửi đi đâu, không cộng đồng nào thấy.
      </p>

      <div v-if="submitted" class="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-100  ">
        <Check :size="15" class="text-emerald-600" />
        <span>Đã ghi nhớ: {{ options.find(o => o.value === survey)?.label }}</span>
      </div>

      <div v-else class="grid grid-cols-3 gap-2">
        <button
          v-for="opt in options"
          :key="opt.value"
          @click="vote(opt.value)"
          class="flex flex-col items-center gap-1.5 py-3 rounded border border-stone-200 600 bg-white hover:border-stone-400 400 hover:bg-stone-50 :bg-stone-700 800 transition-all duration-150 600 500 :border-stone-600"
        >
          <component :is="opt.icon" :size="17" stroke-width="1.7" class="text-stone-500" />
          <span class="text-xs font-medium text-stone-700 dark:text-stone-100  ">{{ opt.label }}</span>
        </button>
      </div>
    </div>

    <div class="flex justify-center">
      <a
        :href="reportUrl()"
        target="_blank"
        class="text-xs text-stone-500 200 100  hover:text-red-700 inline-flex items-center gap-1.5 transition-colors  :text-red-400"
      >
        <Flag :size="11" /> Báo thông tin cần cập nhật
      </a>
    </div>
  </div>
</template>