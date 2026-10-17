<script setup>
import { computed } from 'vue'
import { FileText, Download, PenLine, Monitor, MapPin, Copy, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps({
  forms: { type: Array, required: true },
})

const fillModeConfig = {
  offline: { label: 'Điền trực tiếp', icon: MapPin, cls: 'text-stone-600 bg-stone-100 dark:text-stone-200 dark:bg-stone-700' },
  online: { label: 'Điền online', icon: Monitor, cls: 'text-emerald-700 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-950/60' },
  both: { label: 'Cả hai hình thức', icon: PenLine, cls: 'text-blue-700 bg-blue-50 dark:text-blue-200 dark:bg-blue-950/60' },
}

function getFillMode(mode) {
  return fillModeConfig[mode] || fillModeConfig.offline
}
</script>

<template>
  <div class="gov-card p-5 space-y-4">
    <h3 class="text-sm font-medium text-stone-800 dark:text-white mb-3 flex items-center gap-2">
      <FileText :size="14" />
      Mẫu tờ khai / Biểu mẫu
    </h3>

    <div class="space-y-3">
      <div
        v-for="(form, i) in forms"
        :key="i"
        class="border border-stone-200 dark:border-stone-600 rounded-none p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono font-bold text-gov-red dark:text-red-300 bg-red-50 dark:bg-red-900/40 px-2 py-0.5">
                {{ form.form_code }}
              </span>
              <span
                :class="getFillMode(form.fill_mode).cls"
                class="text-xs px-2 py-0.5 inline-flex items-center gap-1"
              >
                <component :is="getFillMode(form.fill_mode).icon" :size="11" />
                {{ getFillMode(form.fill_mode).label }}
              </span>
              <span v-if="form.copies_count > 1" class="text-xs text-stone-500 dark:text-stone-200 bg-stone-100 dark:bg-stone-700 px-2 py-0.5">
                {{ form.copies_count }} bản
              </span>
            </div>
            <p class="text-sm font-medium text-stone-800 dark:text-stone-100 mt-1.5">{{ form.form_name }}</p>
            <p v-if="form.note" class="text-xs text-stone-500 dark:text-stone-300 mt-1">{{ form.note }}</p>
          </div>
          <a
            :href="form.download_url"
            target="_blank"
            rel="noopener noreferrer"
            class="shrink-0 inline-flex items-center gap-1.5 text-xs text-gov-red dark:text-red-300 hover:underline"
          >
            <Download :size="12" />
            Tải mẫu
          </a>
        </div>
      </div>
    </div>

    <div v-if="forms.length === 1" class="pt-3 border-t border-stone-200 dark:border-stone-600">
      <p class="text-xs text-stone-500 dark:text-stone-300">
        <span class="font-medium">Lưu ý:</span> Mang tờ khai đã điền + bản sao CCCD khi đến nộp hồ sơ.
      </p>
    </div>
  </div>
</template>
