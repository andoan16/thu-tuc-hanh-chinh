<script setup>
import { computed } from 'vue'
import { Clock, Sun, CalendarClock, Wallet, Lightbulb, MapPin, ListChecks } from 'lucide-vue-next'

const props = defineProps({
  info: { type: Object, required: true },
})

const payments = computed(() => props.info.payment?.join(', ') || '')
const multiSteps = computed(() => props.info.multi_step || [])
</script>

<template>
  <div class="gov-card p-5 space-y-4">
    <div class="flex items-start gap-3">
      <div class="shrink-0 w-8 h-8 rounded-none bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-600">
        <MapPin :size="15" stroke-width="2" />
      </div>
      <div>
        <h3 class="text-base font-bold text-stone-900">Nơi nộp hồ sơ</h3>
        <p class="text-sm text-stone-600 dark:text-stone-100  mt-1">{{ info.where }}</p>
      </div>
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-1.5 text-xs text-stone-500">
          <Clock :size="12" /> Giờ làm việc
        </div>
        <p class="text-sm text-stone-800">{{ info.hours }}</p>
        <p class="text-xs text-amber-700">{{ info.lunchNote }}</p>
      </div>

      <div class="space-y-1">
        <div class="flex items-center gap-1.5 text-xs text-stone-500">
          <Wallet :size="12" /> Thanh toán
        </div>
        <p class="text-sm text-stone-800">{{ payments }}</p>
      </div>
    </div>

    <div class="grid sm:grid-cols-2 gap-3">
      <div class="p-3 rounded-none bg-yellow-50 border border-yellow-200">
        <div class="flex items-center gap-1.5 text-xs font-medium text-yellow-800 mb-1">
          <CalendarClock :size="12" /> Nên đi
        </div>
        <p class="text-sm text-yellow-900">{{ info.bestTime }}</p>
      </div>

      <div class="p-3 rounded-none bg-red-50 border border-red-200">
        <div class="flex items-center gap-1.5 text-xs font-medium text-red-800 mb-1">
          <CalendarClock :size="12" /> Nên tránh
        </div>
        <p class="text-sm text-red-900">{{ info.busyTime }}</p>
      </div>
    </div>

    <!-- Multi-step guide (procedures with multiple locations/steps) -->
    <div v-if="multiSteps.length" class="pt-3 border-t border-stone-200 dark:border-stone-600 space-y-3">
      <div class="flex items-center gap-1.5 text-xs text-stone-500">
        <ListChecks :size="12" /> Các bước thực hiện
      </div>
      <ol class="space-y-3">
        <li
          v-for="step in multiSteps"
          :key="step.step"
          class="flex gap-3"
        >
          <div class="shrink-0 w-7 h-7 rounded-none bg-gov-red text-white flex items-center justify-center text-xs font-bold">
            {{ step.step }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-stone-800">{{ step.title }}</p>
            <p class="text-sm text-stone-600 dark:text-stone-100  mt-0.5">{{ step.where }}</p>
            <p class="text-xs text-stone-500 200 100  mt-1">{{ step.note }}</p>
          </div>
        </li>
      </ol>
    </div>

    <div v-if="info.tips?.length" class="pt-3 border-t border-stone-200">
      <div class="flex items-center gap-1.5 text-xs text-stone-500 200 100  mb-2">
        <Lightbulb :size="12" /> Lưu ý khi đi làm
      </div>
      <ul class="space-y-2">
        <li
          v-for="(tip, i) in info.tips"
          :key="i"
          class="text-sm text-stone-700 dark:text-stone-100  pl-3 border-l-2 border-stone-300"
        >
          {{ tip }}
        </li>
      </ul>
    </div>
  </div>
</template>