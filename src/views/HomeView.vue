<script setup>
import { ref, computed } from 'vue'
import { procedures } from '../data/index.js'
import ProcedureCard from '../components/ProcedureCard.vue'
import { Search, ShieldCheck } from 'lucide-vue-next'
import { normalize } from '../utils/search.js'

const query = ref('')

// Pre-build chuỗi tìm kiếm của từng thủ tục 1 lần duy nhất:
// title + category + label giấy tờ (đã bỏ dấu). Tránh normalize lại mỗi keystroke.
const searchIndex = procedures.map(p => {
  const docLabels = Object.values(p.documents || {})
    .map(d => d.label)
    .join(' ')
  return normalize([p.title, p.category, docLabels].join(' '))
})

const filtered = computed(() => {
  const q = normalize(query.value)
  if (!q) return procedures
  return procedures.filter((p, i) => searchIndex[i].includes(q))
})
</script>

<template>
  <div class="space-y-8">
    <!-- Hero: tiêu đề + mô tả + ô tìm kiếm -->
    <section class="text-center pt-2 pb-6 border-b border-stone-200">
      <h2 class="text-balance text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-3">
        SỔ TAY HÀNH CHÍNH
      </h2>
      <p class="text-sm md:text-base text-stone-600 dark:text-stone-100  max-w-2xl mx-auto mb-6">
        Tra cứu nhanh giấy tờ cần chuẩn bị trước khi ra cơ quan hành chính.
        Chọn thủ tục bên dưới để xem chi tiết quy trình và danh sách giấy tờ.
      </p>

      <div class="max-w-xl mx-auto">
        <div class="relative">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            v-model="query"
            placeholder="Tìm thủ tục..."
            class="input pl-9 text-base"
          />
        </div>
        <div class="mt-3 flex items-center justify-center gap-2 text-xs text-stone-500">
          <ShieldCheck :size="13" />
          <span>Dữ liệu chỉ lưu ở máy bạn. Không cần đăng nhập.</span>
        </div>
      </div>
    </section>

    <!-- Procedure list -->
    <section v-if="filtered.length">
      <h3 class="text-sm font-medium text-stone-500 200 100   mb-3 uppercase tracking-wide">
        Danh sách thủ tục ({{ filtered.length }})
      </h3>
      <div class="divide-y divide-stone-200 border border-stone-200 dark:border-stone-600 rounded-none">
        <ProcedureCard
          v-for="(p, i) in filtered"
          :key="p.slug"
          :procedure="p"
          :index="i"
        />
      </div>
    </section>

    <div v-else class="py-12 text-center border border-dashed border-stone-300 500 500 rounded-sm">
      <p class="text-sm text-stone-500">Không tìm thấy thủ tục phù hợp.</p>
    </div>
  </div>
</template>