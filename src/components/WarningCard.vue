<script setup>
import { computed } from 'vue'
import { AlertTriangle, Scale, FileX2, TrendingUp, Ban } from 'lucide-vue-next'

const props = defineProps({
  warnings: { type: Array, required: true },
})

const warningConfig = {
  deadline: { icon: TrendingUp, cls: 'border-amber-300 bg-amber-50', label: 'Thời hạn', labelCls: 'text-amber-800 bg-amber-100' },
  penalty: { icon: Scale, cls: 'border-orange-300 bg-orange-50', label: 'Xử phạt', labelCls: 'text-orange-800 bg-orange-100' },
  reject_reason: { icon: Ban, cls: 'border-red-300 bg-red-50', label: 'Nguyên nhân từ chối', labelCls: 'text-red-800 bg-red-100' },
  risk: { icon: FileX2, cls: 'border-stone-300 bg-stone-50', label: 'Rủi ro', labelCls: 'text-stone-800 bg-stone-100' },
}

function getWarning(type) {
  return warningConfig[type] || warningConfig.risk
}
</script>

<template>
  <div class="gov-card p-5 space-y-4">
    <h3 class="text-sm font-medium text-stone-800 mb-1 flex items-center gap-2">
      <AlertTriangle :size="14" class="text-amber-600" />
      Cảnh báo pháp lý
    </h3>
    <p class="text-xs text-stone-500 200 100">Những điểm cần lưu ý để tránh vi phạm hoặc bị từ chối hồ sơ.</p>

    <div class="space-y-3">
      <div
        v-for="(warn, i) in warnings"
        :key="i"
        :class="getWarning(warn.type).cls"
        class="border rounded-none p-4"
      >
        <div class="flex items-start gap-3">
          <div class="shrink-0 mt-0.5">
            <component :is="getWarning(warn.type).icon" :size="16" class="text-stone-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span :class="getWarning(warn.type).labelCls" class="text-xs px-2 py-0.5 font-medium">
                {{ getWarning(warn.type).label }}
              </span>
            </div>
            <p class="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">{{ warn.content }}</p>
            <p v-if="warn.solution" class="text-xs text-stone-600 dark:text-stone-100  mt-2 pt-2 border-t border-stone-200 dark:border-stone-600">
              <span class="font-medium text-stone-700">Xử lý:</span> {{ warn.solution }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
