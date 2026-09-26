<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronRight, Clock } from 'lucide-vue-next'

const props = defineProps({
  procedure: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

const feeLabel = computed(() => {
  const min = props.procedure.feeMin
  if (props.procedure.fee === 0) return 'Miễn phí'
  if (min !== undefined && min < props.procedure.fee) {
    return 'từ ' + min.toLocaleString('vi-VN') + 'đ'
  }
  return props.procedure.fee.toLocaleString('vi-VN') + 'đ'
})
</script>

<template>
  <RouterLink
    :to="{ name: 'procedure', params: { slug: procedure.slug } }"
    class="block group transition-colors duration-150 border-l-4 border-transparent hover:border-gov-red dark:hover:border-red-400 py-4 px-4 hover:bg-stone-50 dark:hover:bg-stone-800"
  >
    <div class="flex items-center gap-4">
      <div class="shrink-0 w-8 h-8 rounded-none bg-gov-red text-white flex items-center justify-center text-xs font-bold">
        {{ index + 1 }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-0.5">
          <span class="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-300 font-medium">{{ procedure.category }}</span>
        </div>
        <h3 class="font-medium text-sm leading-snug text-stone-900 dark:text-stone-50 group-hover:text-gov-red transition-colors">
          {{ procedure.title }}
        </h3>
        <div class="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-stone-600 dark:text-stone-200 mt-1">
          <span class="inline-flex items-center gap-1">
            <Clock :size="11" /> {{ procedure.processingTime }}
          </span>
          <span>{{ feeLabel }}</span>
        </div>
      </div>

      <ChevronRight
        :size="16"
        class="shrink-0 text-stone-300 dark:text-stone-500 group-hover:text-gov-red transition-colors"
      />
    </div>
  </RouterLink>
</template>
