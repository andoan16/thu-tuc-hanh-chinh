<script setup>
import { HelpCircle, Wrench, AlertTriangle } from 'lucide-vue-next'

defineProps({
  issues: { type: Array, required: true },
})
</script>

<template>
  <div class="gov-card p-5 space-y-4">
    <h3 class="text-sm font-medium text-stone-800 mb-1 flex items-center gap-2">
      <HelpCircle :size="14" class="text-blue-600" />
      Tình huống thường gặp
    </h3>
    <p class="text-xs text-stone-500 200 100">Các vấn đề phổ biến và cách giải quyết khi thực hiện thủ tục.</p>

    <div class="space-y-3">
      <div
        v-for="(issue, i) in issues"
        :key="i"
        class="border border-stone-200 dark:border-stone-600 rounded-none p-4"
      >
        <div class="flex items-start gap-3">
          <div class="shrink-0 mt-0.5">
            <AlertTriangle :size="14" class="text-amber-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-stone-800 dark:text-stone-100 mb-2">{{ issue.problem }}</p>
            <div class="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-100  bg-stone-50 dark:bg-stone-700 p-2.5 rounded-none">
              <Wrench :size="12" class="shrink-0 mt-0.5 text-emerald-600" />
              <span><span class="font-medium text-emerald-700 dark:text-emerald-300">Giải quyết:</span> {{ issue.solution }}</span>
            </div>
            <p v-if="issue.impact" class="text-xs text-stone-500  mt-2">
              <span class="font-medium">Hậu quả:</span> {{ issue.impact }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
