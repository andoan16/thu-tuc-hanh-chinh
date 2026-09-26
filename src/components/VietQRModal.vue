<script setup>
import { ref, computed } from 'vue'
import { X, Coffee, Milk, UtensilsCrossed, Copy, Check, ExternalLink, Settings } from 'lucide-vue-next'
import { useVietQR } from '../composables/useStore.js'
import banks from '../data/banks.json'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const { cfg, update, qrUrl } = useVietQR()

const amounts = [
  { label: 'Cà phê', value: 20000, icon: Coffee },
  { label: 'Trà sữa', value: 35000, icon: Milk },
  { label: 'Cơm trưa', value: 50000, icon: UtensilsCrossed },
]

const selectedAmount = ref(20000)
const showSettings = ref(false)
const copiedField = ref('')

const qr = computed(() => qrUrl(selectedAmount.value))
const bankName = computed(() => banks.find(b => b.bin === cfg.value.bankBin)?.name || '')

function copy(text, field) {
  navigator.clipboard?.writeText(text)
  copiedField.value = field
  setTimeout(() => (copiedField.value = ''), 1500)
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-stone-900/60"
      @click.self="emit('close')"
    >
      <div class="gov-card w-full max-w-sm p-5 max-h-[90vh] overflow-y-auto shadow-soft">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium flex items-center gap-2 text-stone-900  ">
            <Coffee :size="18" class="text-stone-500" />
            Mời admin ly cà phê
          </h3>
          <button
            @click="emit('close')"
            class="p-1.5 rounded hover:bg-stone-100 :bg-stone-600 700 :bg-stone-600"
          >
            <X :size="18" />
          </button>
        </div>

        <p class="text-sm text-stone-500 200 100   mb-4">
          Nếu app giúp ích, bạn có thể gửi chút đồ uống. Không bắt buộc.
        </p>

        <div class="flex justify-center mb-4">
          <img
            :src="qr"
            alt="VietQR"
            class="w-52 h-52 rounded border border-stone-200 600 500 bg-white"
          />
        </div>

        <div class="flex gap-2 mb-4">
          <button
            v-for="a in amounts"
            :key="a.value"
            @click="selectedAmount = a.value"
            :class="[
              'flex-1 flex flex-col items-center gap-1 py-2.5 rounded border text-xs font-medium transition-all duration-150',
              selectedAmount === a.value
                ? 'border-red-700 bg-red-50 text-red-800 dark:bg-red-900/40 200'
                : 'border-stone-200 600 bg-white text-stone-600 100  hover:border-stone-400 400 600 500 ',
            ]"
          >
            <component :is="a.icon" :size="16" />
            {{ a.label }}
            <span class="text-[10px] opacity-70">{{ a.value.toLocaleString('vi-VN') }}đ</span>
          </button>
        </div>

        <div class="space-y-2 text-sm rounded border border-stone-200 600 500 p-3">
          <div class="flex items-center justify-between">
            <span class="text-stone-500">Ngân hàng</span>
            <span class="font-medium">{{ bankName }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-stone-500 200 100  shrink-0">Số TK</span>
            <span class="font-mono font-medium">{{ cfg.accountNo }}</span>
            <button
              @click="copy(cfg.accountNo, 'stk')"
              class="p-1 rounded hover:bg-stone-100 :bg-stone-600 700 :bg-stone-600"
            >
              <Check v-if="copiedField === 'stk'" :size="13" class="text-emerald-600" />
              <Copy v-else :size="13" />
            </button>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-stone-500 200 100  shrink-0">Chủ TK</span>
            <span class="font-medium truncate">{{ cfg.accountName }}</span>
            <button
              @click="copy(cfg.accountName, 'ctk')"
              class="p-1 rounded hover:bg-stone-100 :bg-stone-600 700 :bg-stone-600"
            >
              <Check v-if="copiedField === 'ctk'" :size="13" class="text-emerald-600" />
              <Copy v-else :size="13" />
            </button>
          </div>
        </div>

        <button
          @click="showSettings = !showSettings"
          class="mt-3 text-xs text-stone-500 200 100  hover:text-red-700 flex items-center gap-1 mx-auto  :text-red-400"
        >
          <Settings :size="12" /> {{ showSettings ? 'Ẩn' : 'Cấu hình' }} thông tin nhận
        </button>

        <div
          v-if="showSettings"
          class="mt-3 space-y-2 border-t border-stone-200 600 500 pt-3"
        >
          <select
            :value="cfg.bankBin"
            @change="update({ bankBin: $event.target.value })"
            class="input"
          >
            <option v-for="b in banks" :key="b.bin" :value="b.bin">{{ b.name }}</option>
          </select>
          <input
            :value="cfg.accountNo"
            @input="update({ accountNo: $event.target.value })"
            placeholder="Số tài khoản"
            class="input font-mono"
          />
          <input
            :value="cfg.accountName"
            @input="update({ accountName: $event.target.value.toUpperCase() })"
            placeholder="TÊN CHỦ TÀI KHOẢN"
            class="input uppercase"
          />
        </div>

        <div class="mt-3 text-center">
          <a
            href="https://vietqr.io"
            target="_blank"
            class="text-xs text-stone-400 200 100  hover:text-stone-600 100  inline-flex items-center gap-1 200"
          >
            QR từ VietQR.io <ExternalLink :size="11" />
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>