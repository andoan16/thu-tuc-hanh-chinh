<script setup>
import { PackageCheck, Mail, UserCheck, RotateCcw } from 'lucide-vue-next'

defineProps({
  data: { type: Object, required: true },
})
</script>

<template>
  <div class="gov-card p-5 space-y-4">
    <h3 class="text-sm font-medium text-stone-800 mb-1 flex items-center gap-2">
      <PackageCheck :size="14" class="text-emerald-600" />
      Sau khi hoàn thành
    </h3>
    <p class="text-xs text-stone-500 200 100">Những điểm cần biết sau khi đã nộp hồ sơ và nhận kết quả.</p>

    <div class="grid gap-3 sm:grid-cols-2">
      <div class="border border-stone-200 dark:border-stone-600 rounded-none p-4">
        <div class="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-2">
          <PackageCheck :size="12" />
          Cách nhận kết quả
        </div>
        <p class="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">{{ data.how_to_receive }}</p>
      </div>

      <div class="border border-stone-200 dark:border-stone-600 rounded-none p-4">
        <div class="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-2">
          <Mail :size="12" />
          Người nhận
        </div>
        <p class="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">{{ data.receive_by_other }}</p>
      </div>
    </div>

    <div class="border border-stone-200 dark:border-stone-600 rounded-none p-4">
      <div class="flex items-center gap-1.5 text-xs font-medium text-stone-700 mb-2">
        <RotateCcw :size="12" />
        Nếu bị từ chối
      </div>
      <p class="text-sm text-stone-800 dark:text-stone-100 leading-relaxed">{{ data.rejected_solution }}</p>
    </div>
  </div>
</template>
