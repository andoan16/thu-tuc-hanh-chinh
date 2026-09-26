<script setup>
import { ref } from 'vue'
import { Coffee, ExternalLink, Code, ShieldCheck, FileStack } from 'lucide-vue-next'
import VietQRModal from '../components/VietQRModal.vue'

const showQR = ref(false)
const REPO_URL = 'https://github.com/andoan16/thu-tuc-hanh-chinh'
</script>

<template>
  <div class="space-y-6">
    <div class="gov-card p-6">
      <h2 class="text-xl font-semibold mb-3 text-stone-900  ">Giới thiệu</h2>
      <p class="text-sm text-stone-700 dark:text-stone-100   leading-relaxed mb-4">
        Sổ tay hành chính là dự án mã nguồn mở phi lợi nhuận do cộng đồng phát triển,
        giúp người dân Việt Nam tra cứu nhanh giấy tờ cần chuẩn bị trước khi ra cơ quan
        hành chính. Ứng dụng hoạt động hoàn toàn trên trình duyệt, không yêu cầu đăng nhập,
        không gửi dữ liệu cá nhân lên máy chủ.
      </p>

      <div class="space-y-3 pt-3 border-t border-stone-200 600 500">
        <div class="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-100  ">
          <ShieldCheck :size="16" class="shrink-0 mt-0.5 text-stone-500" />
          <span>Dữ liệu chỉ lưu trong trình duyệt của bạn (localStorage). Không có máy chủ, không thu thập thông tin.</span>
        </div>
        <div class="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-100  ">
          <FileStack :size="16" class="shrink-0 mt-0.5 text-stone-500" />
          <span>Thông tin thủ tục được tổng hợp từ các văn bản pháp quy hiện hành. Nếu thấy thông tin cần cập nhật, vui lòng báo cáo trên GitHub.</span>
        </div>
        <div class="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-100  ">
          <Code :size="16" class="shrink-0 mt-0.5 text-stone-500" />
          <span>Mã nguồn mở, sử dụng tự do.</span>
        </div>
      </div>

      <a
        :href="REPO_URL"
        target="_blank"
        class="inline-flex items-center gap-1 mt-4 text-sm link"
      >
        Xem mã nguồn trên GitHub <ExternalLink :size="13" />
      </a>
    </div>

    <div class="gov-card p-6">
      <h3 class="text-base font-medium mb-2 text-stone-900  ">Ủng hộ tác giả</h3>
      <p class="text-sm text-stone-600 dark:text-stone-100   mb-4">
        Nếu ứng dụng giúp ích, bạn có thể gửi chút đồ uống cho tác giả.
        Không bắt buộc, hoàn toàn tự nguyện.
      </p>
      <button @click="showQR = true" class="btn-primary">
        <Coffee :size="15" />
        Mời tác giả ly cà phê
      </button>
    </div>

    <VietQRModal :open="showQR" @close="showQR = false" />
  </div>
</template>