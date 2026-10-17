<script setup>
import { Scale, ExternalLink, Calendar } from 'lucide-vue-next'

defineProps({
  legalBases: { type: Array, default: () => [] },
})
</script>

<template>
  <div v-if="legalBases.length" class="gov-card p-5 space-y-3">
    <div class="flex items-start gap-3">
      <div class="shrink-0 w-8 h-8 rounded bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-200">
        <Scale :size="15" stroke-width="1.8" />
      </div>
      <div>
        <h3 class="text-base font-medium text-stone-900 dark:text-white">Căn cứ pháp lý</h3>
        <p class="text-xs text-stone-500 dark:text-stone-300 mt-0.5">Các văn bản quy phạm pháp luật điều chỉnh thủ tục này</p>
      </div>
    </div>

    <ul class="space-y-3">
      <li
        v-for="(base, i) in legalBases"
        :key="i"
        class="border-l-2 border-stone-200 dark:border-stone-600 pl-3"
      >
        <a
          :href="base.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium text-stone-900 dark:text-stone-100 hover:text-gov-red dark:hover:text-red-400 transition-colors inline-flex items-start gap-1"
        >
          {{ base.title }}
          <ExternalLink :size="12" class="mt-0.5 shrink-0 text-stone-400 dark:text-stone-400" />
        </a>
        <p class="text-xs text-stone-600 dark:text-stone-200 mt-1">{{ base.article }}</p>
        <p v-if="base.last_verified_date" class="text-xs text-stone-400 dark:text-stone-400 mt-1 inline-flex items-center gap-1">
          <Calendar :size="10" /> Đã kiểm tra: {{ base.last_verified_date }}
        </p>
      </li>
    </ul>
  </div>
</template>