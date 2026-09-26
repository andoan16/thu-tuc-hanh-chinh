// Chuẩn hóa chuỗi tiếng Việt để tìm kiếm không dấu.
// "Lý lịch tư pháp" → "ly lich tu phap" — query "ly lich" hoặc "lý lịch" đều match.
export function normalize(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()
}