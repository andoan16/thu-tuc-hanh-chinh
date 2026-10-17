<script setup>
import { computed } from 'vue'
import { Scale } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const todayFormatted = computed(() => {
  const d = new Date()
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
  const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  return `${days[d.getDay()]}, ngày ${d.getDate()} tháng ${months[d.getMonth()]} năm ${d.getFullYear()}`
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Top utility bar — kiểu cổng DVC -->
    <div class="bg-gov-red text-white text-xs border-b border-gov-red-dark">
      <div class="max-w-5xl mx-auto px-5 py-1.5 flex items-center justify-between">
        <span class="font-medium tracking-wide uppercase">Cổng thông tin tra cứu thủ tục hành chính</span>
        <span class="text-red-200">{{ todayFormatted }}</span>
      </div>
    </div>

    <!-- Community badge bar -->
    <div class="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-xs">
      <div class="max-w-5xl mx-auto px-5 py-1.5">
        <strong>Lưu ý:</strong> Đây là dự án cộng đồng, <strong>không phải</strong> ứng dụng chính thức của Chính phủ. Để nộp hồ sơ chính thức, vui lòng truy cập <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer" class="link font-medium">dichvucong.gov.vn</a>
      </div>
    </div>

    <!-- Main nav bar -->
    <nav class="bg-white dark:bg-stone-800 border-b-2 border-gov-red">
      <div class="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <RouterLink to="/" class="flex items-center gap-3 min-w-0">
          <!-- Logo kiểu cổng thông tin -->
          <div class="shrink-0 w-10 h-10 rounded-none bg-gov-red flex items-center justify-center text-white">
            <Scale :size="20" stroke-width="2" />
          </div>
          <div class="min-w-0">
            <h1 class="text-base font-bold leading-tight text-stone-900 dark:text-stone-100">
              SỔ TAY HÀNH CHÍNH
            </h1>
            <span class="text-[11px] text-stone-500 dark:text-stone-300 leading-tight">Dự án mã nguồn mở cộng đồng</span>
          </div>
        </RouterLink>

        <div class="flex items-center gap-1 shrink-0">
          <RouterLink
            to="/"
            class="px-3 py-1.5 text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-gov-red dark:hover:text-red-400 border-b-2 border-transparent hover:border-gov-red transition-colors"
            active-class="!text-gov-red dark:!text-red-400 !border-gov-red"
          >
            Trang chủ
          </RouterLink>
          <RouterLink
            to="/gioi-thieu"
            class="px-3 py-1.5 text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-gov-red dark:hover:text-red-400 border-b-2 border-transparent hover:border-gov-red transition-colors"
            active-class="!text-gov-red dark:!text-red-400 !border-gov-red"
          >
            Giới thiệu
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <div class="max-w-5xl mx-auto px-5 py-6 md:py-10 pb-24">
      <main>
        <RouterView />
      </main>

      <footer class="mt-16 pt-6 border-t-2 border-gov-red">
        <!-- Disclaimer -->
        <div class="mb-6 p-4 rounded-none bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong class="block mb-1">THÔNG BÁO</strong>
          Sổ Tay Hành Chính là dự án mã nguồn mở phi lợi nhuận do cộng đồng phát triển nhằm mục đích hỗ trợ người dân tra cứu quy trình. Ứng dụng <strong>KHÔNG</strong> đại diện, <strong>KHÔNG</strong> liên kết và <strong>KHÔNG</strong> thay thế cho bất kỳ cơ quan nhà nước hay cổng dịch vụ công chính thống nào. Để thực hiện nộp hồ sơ trực tuyến chính thức, vui lòng truy cập Cổng Dịch vụ công Quốc gia tại địa chỉ: <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer" class="link font-medium">dichvucong.gov.vn</a>
        </div>

        <div class="grid sm:grid-cols-3 gap-6 text-xs text-stone-600 dark:text-stone-200">
          <!-- Cột 1: Giới thiệu -->
          <div class="space-y-1.5">
            <h4 class="text-sm font-bold text-stone-800 dark:text-stone-100 mb-2">
              SỔ TAY HÀNH CHÍNH
            </h4>
            <p class="leading-relaxed">
              Ứng dụng tra cứu giấy tờ thủ tục hành chính cho người dân Việt Nam.
              Dữ liệu chỉ lưu trên trình duyệt, không gửi lên máy chủ.
            </p>
          </div>

          <!-- Cột 2: Liên kết nhanh -->
          <div class="space-y-1.5">
            <h4 class="text-sm font-bold text-stone-800 dark:text-stone-100 mb-2">
              LIÊN KẾT
            </h4>
            <RouterLink to="/" class="block hover:text-gov-red dark:hover:text-red-400 transition-colors">Trang chủ</RouterLink>
            <RouterLink to="/gioi-thieu" class="block hover:text-gov-red dark:hover:text-red-400 transition-colors">Giới thiệu</RouterLink>
            <a href="https://github.com/andoan16/thu-tuc-hanh-chinh" target="_blank" class="block hover:text-gov-red dark:hover:text-red-400 transition-colors">Mã nguồn mở (GitHub)</a>
          </div>

          <!-- Cột 3: Thông tin -->
          <div class="space-y-1.5">
            <h4 class="text-sm font-bold text-stone-800 dark:text-stone-100 mb-2">
              THÔNG TIN
            </h4>
            <p>Không yêu cầu đăng nhập.</p>
            <p>Không thu thập dữ liệu cá nhân.</p>
            <p>Thông tin từ văn bản pháp quy hiện hành.</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-stone-200 dark:border-stone-600 text-center text-[11px] text-stone-400 dark:text-stone-400">
          © {{ new Date().getFullYear() }} Sổ tay hành chính — Phiên bản cộng đồng, phi lợi nhuận
        </div>
      </footer>
    </div>
  </div>
</template>
