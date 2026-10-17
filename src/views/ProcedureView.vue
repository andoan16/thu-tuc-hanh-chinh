<script setup>
import { ref, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ExternalLink, Clock, Coins, Car, Home, FileText, Copy, Scale, Database } from 'lucide-vue-next'
import { getProcedure } from '../data/index.js'
import { useProcedureProgress } from '../composables/useStore.js'
import ChecklistWizard from '../components/ChecklistWizard.vue'
import OfficeInfoCard from '../components/OfficeInfoCard.vue'
import LocationSelector from '../components/LocationSelector.vue'
import CommunityFeedback from '../components/CommunityFeedback.vue'
import LegalBases from '../components/LegalBases.vue'
import FormsSection from '../components/FormsSection.vue'
import WarningCard from '../components/WarningCard.vue'
import AfterProcedureCard from '../components/AfterProcedureCard.vue'
import CommonIssues from '../components/CommonIssues.vue'

const props = defineProps({ slug: { type: String, required: true } })

const procedure = getProcedure(props.slug)
if (!procedure) throw new Error('Procedure not found')

const { state, setAnswer, toggleCheck, reset } = useProcedureProgress(props.slug)

function onComplete() { /* no auto-popup */ }
function onSummary() { /* no auto-popup */ }

const icons = { car: Car, home: Home, 'file-text': FileText, copy: Copy }

const userLocation = ref({})
const adaptedOfficeInfo = ref({ ...procedure.officeInfo })

// Section numbering: I=Thông tin, II=Danh sách giấy tờ, III=Cảnh báo, IV=Mẫu tờ khai, V=Nơi nộp, VI=Sau hoàn thành, VII=Tình huống, VIII=Căn cứ pháp lý, IX=Góp ý
const hasLegal = computed(() => !!procedure.legal_bases?.length)
const hasWarnings = computed(() => !!procedure.warnings?.length)
const hasForms = computed(() => !!procedure.forms?.length)
const hasAfter = computed(() => !!procedure.after_procedure)
const hasIssues = computed(() => !!procedure.common_issues?.length)

const sections = computed(() => {
  const result = {}
  let num = 1
  result.info = num++
  result.docs = num++
  if (hasWarnings.value) result.warnings = num++
  if (hasForms.value) result.forms = num++
  result.office = num++
  if (hasAfter.value) result.after = num++
  if (hasIssues.value) result.issues = num++
  if (hasLegal.value) result.legal = num++
  result.feedback = num++
  return result
})

watch(userLocation, (loc) => {
  if (loc.officeName) {
    adaptedOfficeInfo.value = {
      ...procedure.officeInfo,
      where: loc.officeName + (loc.address ? ` — ${loc.address}` : ''),
    }
  } else {
    adaptedOfficeInfo.value = { ...procedure.officeInfo }
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 py-2 px-3 border border-stone-200 dark:border-stone-700" aria-label="Breadcrumb">
      <RouterLink to="/" class="hover:text-gov-red dark:hover:text-red-400 transition-colors">Trang chủ</RouterLink>
      <span class="text-stone-300 dark:text-stone-600">/</span>
      <span class="text-stone-400 dark:text-stone-400">{{ procedure.category }}</span>
      <span class="text-stone-300 dark:text-stone-600">/</span>
      <span class="text-stone-800 dark:text-stone-100 font-medium">{{ procedure.title }}</span>
    </nav>

    <!-- Thông tin thủ tục -->
    <div class="space-y-2">
      <h3 class="section-title"><span class="section-num">{{ sections.info }}</span> Thông tin thủ tục</h3>
      <div class="gov-card p-5 md:p-6">
        <div class="flex items-start gap-4">
          <div class="shrink-0 w-12 h-12 rounded-none bg-gov-red flex items-center justify-center text-white">
            <Scale :size="22" stroke-width="2" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl md:text-2xl font-bold text-stone-900 dark:text-white mb-2">
              {{ procedure.title }}
            </h2>
            <div class="flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-300">
              <span class="inline-flex items-center gap-1">
                <Clock :size="14" /> {{ procedure.processingTime }}
              </span>
              <span class="inline-flex items-center gap-1">
                <Coins :size="14" />
                {{ procedure.fee === 0 ? 'Miễn phí' :
                   (procedure.feeMin !== undefined && procedure.feeMin < procedure.fee)
                     ? 'từ ' + procedure.feeMin.toLocaleString('vi-VN') + 'đ'
                     : procedure.fee.toLocaleString('vi-VN') + 'đ' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p class="mt-4 text-sm text-stone-600 dark:text-stone-200">{{ procedure.feeNote }}</p>

      <a
        :href="procedure.portalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 mt-3 text-sm link"
      >
        {{ procedure.slug === 'ly-lich-tu-phap' ? 'Nộp trực tuyến qua Cổng Pháp luật quốc gia' :
           procedure.slug === 'doi-gpkx' ? 'Nộp trực tuyến qua Cổng GPLX' :
           (procedure.slug === 'dang-ky-tam-tru' || procedure.slug === 'khai-bao-vang-mat') ? 'Đăng ký qua VNeID (Bộ Công an)' :
           'Xem hướng dẫn nộp trên Cổng DVC' }}
        <ExternalLink :size="13" />
      </a>

      <div class="mt-4 pt-3 border-t border-stone-200 dark:border-stone-700 flex items-start gap-2 text-xs text-stone-500 dark:text-stone-300">
        <Database :size="13" class="shrink-0 mt-0.5" />
        <div>
          <span>Nguồn tham chiếu: Cổng Dịch vụ công Quốc gia / Cổng Pháp luật quốc gia</span>
          <span v-if="procedure.last_updated" class="block mt-0.5">Cập nhật gần nhất: {{ procedure.last_updated }}</span>
        </div>
      </div>
    </div>

    <!-- Danh sách giấy tờ -->
    <div class="space-y-2">
      <h3 class="section-title"><span class="section-num">{{ sections.docs }}</span> Danh sách giấy tờ</h3>
      <ChecklistWizard
        :procedure="procedure"
        :state="state"
        @set-answer="setAnswer"
        @toggle-check="toggleCheck"
        @reset="reset"
        @complete="onComplete"
        @summary="onSummary"
      />
    </div>

    <!-- Cảnh báo pháp lý -->
    <div v-if="procedure.warnings?.length" class="space-y-2">
      <h3 class="section-title"><span class="section-num">{{ sections.warnings }}</span> Cảnh báo pháp lý</h3>
      <WarningCard :warnings="procedure.warnings" />
    </div>

    <!-- Mẫu tờ khai -->
    <div v-if="procedure.forms?.length" class="space-y-2">
      <h3 class="section-title"><span class="section-num">{{ sections.forms }}</span> Mẫu tờ khai / Biểu mẫu</h3>
      <FormsSection :forms="procedure.forms" />
    </div>

    <!-- Nơi nộp hồ sơ -->
    <div class="space-y-2">
      <h3 class="section-title"><span class="section-num">{{ sections.office }}</span> Nơi nộp hồ sơ</h3>
      <LocationSelector v-model="userLocation" :office-info="procedure.officeInfo" />
      <OfficeInfoCard :info="adaptedOfficeInfo" />
    </div>

    <!-- Sau khi hoàn thành -->
    <div v-if="procedure.after_procedure" class="space-y-2">
      <h3 class="section-title"><span class="section-num">{{ sections.after }}</span> Sau khi hoàn thành</h3>
      <AfterProcedureCard :data="procedure.after_procedure" />
    </div>

    <!-- Tình huống thường gặp -->
    <div v-if="procedure.common_issues?.length" class="space-y-2">
      <h3 class="section-title"><span class="section-num">{{ sections.issues }}</span> Tình huống thường gặp</h3>
      <CommonIssues :issues="procedure.common_issues" />
    </div>

    <!-- Căn cứ pháp lý -->
    <div v-if="procedure.legal_bases?.length" class="space-y-2">
      <h3 class="section-title"><span class="section-num">{{ sections.legal }}</span> Căn cứ pháp lý</h3>
      <LegalBases :legal-bases="procedure.legal_bases" />
    </div>

    <!-- Góp ý -->
    <div class="space-y-2 no-print">
      <h3 class="section-title"><span class="section-num">{{ sections.feedback }}</span> Góp ý</h3>
      <CommunityFeedback :slug="procedure.slug" :title="procedure.title" />
    </div>
  </div>
</template>
