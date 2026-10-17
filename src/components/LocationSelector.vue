<script setup>
import { ref, computed, watch } from 'vue'
import { MapPin, LocateFixed, Loader2, X, Navigation, Building2 } from 'lucide-vue-next'
import { provinces as provinceData } from '../data/provinces-wards.json'
import SearchSelect from './SearchSelect.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  officeInfo: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue'])

// --- State ---
const selectedProvince = ref(props.modelValue.provinceId || '')
const selectedWard = ref(props.modelValue.wardId || '')
const geoLoading = ref(false)
const geoError = ref('')

// On-demand reverse geocoded office address
const officeLookup = ref(null) // { display_name, lat, lon } from Nominatim
const officeLoading = ref(false)

// --- Computed ---
const provinces = computed(() => provinceData)

const wards = computed(() => {
  const p = provinces.value.find(p => p.id === selectedProvince.value)
  return p?.wards || []
})

// Options cho SearchSelect — đổi cấu trúc {id, name} → {value, label}
const provinceOptions = computed(() =>
  provinces.value.map(p => ({ value: p.id, label: p.name }))
)

const wardOptions = computed(() =>
  wards.value.map(w => ({ value: w.id, label: w.name }))
)

const province = computed(() => provinces.value.find(p => p.id === selectedProvince.value))
const ward = computed(() => wards.value.find(w => w.id === selectedWard.value))

const provinceName = computed(() => province.value?.name || '')
const wardName = computed(() => ward.value?.name || '')

const fullAddress = computed(() => {
  const parts = []
  if (wardName.value) parts.push(wardName.value)
  if (provinceName.value) parts.push(provinceName.value)
  return parts.join(', ')
})

// Coordinates: prefer Nominatim result (actual office location), fall back to ward/province center
const lat = computed(() => {
  if (officeLookup.value?.lat) return officeLookup.value.lat
  if (props.officeInfo?.officeLevel === 'province') return province.value?.lat
  return ward.value?.lat
})
const lon = computed(() => {
  if (officeLookup.value?.lon) return officeLookup.value.lon
  if (props.officeInfo?.officeLevel === 'province') return province.value?.lon
  return ward.value?.lon
})

// Display address: prefer Nominatim full address, fall back to ward + province
const displayAddress = computed(() => {
  if (officeLookup.value?.display_name) return officeLookup.value.display_name
  return fullAddress.value
})

// Office name
const officeAddress = computed(() => {
  if (!fullAddress.value) return null

  const prefix = props.officeInfo?.officePrefix || 'UBND'
  const level = props.officeInfo?.officeLevel || 'ward'

  let officeName
  let searchQuery

  if (level === 'ward') {
    officeName = `${prefix} ${wardName.value}`
    searchQuery = `${prefix} ${wardName.value}, ${provinceName.value}`
  } else {
    officeName = `${prefix} ${provinceName.value}`
    searchQuery = `${prefix} ${provinceName.value}`
  }

  return {
    name: officeName,
    address: displayAddress.value,
    lat: lat.value,
    lon: lon.value,
    searchQuery: encodeURIComponent(searchQuery),
    hasCoords: !!(lat.value && lon.value),
    isExact: !!officeLookup.value,
  }
})

const googleMapsDirUrl = computed(() => {
  if (!officeAddress.value) return ''
  const oa = officeAddress.value
  if (oa.hasCoords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${oa.lat},${oa.lon}`
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${oa.searchQuery}`
})

const googleMapsSearchUrl = computed(() => {
  if (!officeAddress.value) return ''
  const oa = officeAddress.value
  if (oa.isExact && oa.hasCoords) {
    // Exact address confirmed via Nominatim: use coords as query → Google Maps drops 1 pin
    return `https://www.google.com/maps/search/?api=1&query=${oa.lat},${oa.lon}`
  }
  if (oa.hasCoords) {
    // Fallback (no exact address): search by name, center on ward coords
    return `https://www.google.com/maps/search/?api=1&query=${oa.searchQuery}&center=${oa.lat},${oa.lon}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${oa.searchQuery}`
})

// --- Watchers ---
watch(selectedProvince, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    selectedWard.value = ''
  }
})

// Reset office lookup when selection changes
watch([selectedProvince, selectedWard], () => {
  officeLookup.value = null
})

watch([selectedProvince, selectedWard, fullAddress], () => {
  emit('update:modelValue', {
    provinceId: selectedProvince.value,
    wardId: selectedWard.value,
    address: fullAddress.value,
    officeName: officeAddress.value?.name || '',
  })
})

// --- Nominatim lookup: search for office by name ---
async function lookupOffice() {
  if (!selectedProvince.value) return
  // For province-level, we only need province selected
  // For ward-level, we need ward selected
  const level = props.officeInfo?.officeLevel || 'ward'
  if (level === 'ward' && !selectedWard.value) return

  officeLoading.value = true

  const prefix = props.officeInfo?.officePrefix || 'UBND'
  let query
  if (level === 'ward') {
    query = `${prefix} ${wardName.value}, ${provinceName.value}`
  } else {
    query = `${prefix} ${provinceName.value}`
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=vi&addressdetails=1`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'vi' },
    })
    const data = await res.json()
    if (data && data.length > 0) {
      officeLookup.value = {
        display_name: data[0].display_name,
        lat: data[0].lat,
        lon: data[0].lon,
      }
    }
  } catch (e) {
    // Silent fail — fall back to ward/province center coords
  } finally {
    officeLoading.value = false
  }
}

// Trigger lookup when both province + ward are selected (or province for province-level)
watch(
  () => [selectedProvince.value, selectedWard.value],
  ([p, w]) => {
    const level = props.officeInfo?.officeLevel || 'ward'
    if (p && (level === 'province' || w)) {
      lookupOffice()
    }
  },
  { immediate: true }
)

// --- Haversine distance (km) ---
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// --- Geo location: GPS coords → nearest ward by haversine ---
async function detectLocation() {
  geoLoading.value = true
  geoError.value = ''

  if (!navigator.geolocation) {
    geoError.value = 'Trình duyệt không hỗ trợ định vị'
    geoLoading.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords

      let nearest = null
      let minDist = Infinity

      for (const prov of provinces.value) {
        for (const w of prov.wards) {
          if (!w.lat || !w.lon) continue
          const d = haversine(latitude, longitude, parseFloat(w.lat), parseFloat(w.lon))
          if (d < minDist) {
            minDist = d
            nearest = { provinceId: prov.id, wardId: w.id, dist: d }
          }
        }
      }

      if (nearest) {
        selectedProvince.value = nearest.provinceId
        setTimeout(() => {
          selectedWard.value = nearest.wardId
        }, 0)
      } else {
        geoError.value = 'Không tìm thấy phường/xã gần vị trí của bạn'
      }

      geoLoading.value = false
    },
    (err) => {
      geoError.value = err.code === 1
        ? 'Bạn đã từ chối truy cập vị trí'
        : 'Không lấy được vị trí. Hãy bật GPS và thử lại.'
      geoLoading.value = false
    },
    { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
  )
}

function clearLocation() {
  selectedProvince.value = ''
  selectedWard.value = ''
  geoError.value = ''
  officeLookup.value = null
}
</script>

<template>
  <div class="gov-card p-5 space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-3">
        <div class="shrink-0 w-8 h-8 rounded bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-200">
          <MapPin :size="15" stroke-width="1.8" />
        </div>
        <div>
          <h3 class="text-base font-medium text-stone-900 dark:text-white">Nơi nộp hồ sơ</h3>
          <p class="text-sm text-stone-600 dark:text-stone-200 mt-1">
            Chọn địa bàn để xem cơ quan tiếp nhận gần bạn nhất.
          </p>
        </div>
      </div>
      <button
        @click="detectLocation"
        :disabled="geoLoading"
        class="btn-outline btn-sm shrink-0"
      >
        <Loader2 v-if="geoLoading" :size="14" class="animate-spin" />
        <LocateFixed v-else :size="14" />
        {{ geoLoading ? 'Đang xác định...' : 'Vị trí hiện tại' }}
      </button>
    </div>

    <!-- Geo error -->
    <div
      v-if="geoError"
      class="flex items-center gap-2 text-xs text-red-700 dark:text-red-200 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700/50 rounded px-3 py-2"
    >
      <X :size="12" />
      {{ geoError }}
    </div>

    <!-- Combobox tìm kiếm: Tỉnh → Phường (không dấu OK) -->
    <div class="grid sm:grid-cols-2 gap-3">
      <div class="space-y-1.5">
        <label class="text-xs text-stone-500 dark:text-stone-300">Tỉnh / Thành phố</label>
        <SearchSelect
          v-model="selectedProvince"
          :options="provinceOptions"
          placeholder="Chọn / tìm tỉnh..."
        />
      </div>

      <div class="space-y-1.5">
        <label class="text-xs text-stone-500 dark:text-stone-300">Phường / Xã</label>
        <SearchSelect
          v-model="selectedWard"
          :options="wardOptions"
          placeholder="Chọn / tìm phường..."
          :disabled="!selectedProvince"
        />
      </div>
    </div>

    <!-- Office result: specific office name + street address + map buttons -->
    <div v-if="officeAddress" class="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-3">
      <!-- Office name + address -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="shrink-0 w-9 h-9 rounded bg-red-50 dark:bg-red-900/40 flex items-center justify-center text-red-700 dark:text-red-200">
            <Building2 :size="17" stroke-width="1.7" />
          </div>
          <div class="min-w-0">
            <div class="text-xs text-stone-500 dark:text-stone-300 mb-0.5">Cơ quan tiếp nhận</div>
            <p class="text-sm font-semibold text-stone-900 dark:text-white">{{ officeAddress.name }}</p>
            <!-- Loading state -->
            <div v-if="officeLoading" class="flex items-center gap-1.5 mt-1">
              <Loader2 :size="12" class="animate-spin text-stone-400" />
              <span class="text-xs text-stone-400">Đang tra cứu địa chỉ...</span>
            </div>
            <!-- Address found -->
            <p v-else class="text-sm text-stone-500 dark:text-stone-200 mt-0.5 break-words">{{ officeAddress.address }}</p>
            <!-- Badge: exact vs approximate -->
            <div v-if="!officeLoading && officeAddress.isExact" class="mt-1">
              <span class="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Đã xác nhận địa chỉ</span>
            </div>
            <div v-else-if="!officeLoading && !officeAddress.isExact && fullAddress" class="mt-1">
              <span class="text-[11px] text-stone-400 dark:text-stone-400">Địa chỉ theo phường/xã</span>
            </div>
          </div>
        </div>
        <button
          @click="clearLocation"
          class="text-xs text-stone-400 dark:text-stone-300 hover:text-red-700 dark:hover:text-red-400 transition-colors shrink-0"
        >
          Xóa
        </button>
      </div>

      <!-- Map action buttons -->
      <div class="flex gap-2">
        <a
          :href="googleMapsDirUrl"
          target="_blank"
          class="btn-primary btn-sm flex-1"
        >
          <Navigation :size="14" />
          Chỉ đường
        </a>
        <a
          :href="googleMapsSearchUrl"
          target="_blank"
          class="btn-outline btn-sm"
        >
          <MapPin :size="14" />
          Xem trên bản đồ
        </a>
      </div>
    </div>
  </div>
</template>