import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const { normalize } = await import('../src/utils/search.js')

// Tái tạo đúng logic filter trong SearchSelect.vue (filtered computed)
// + cấu trúc options từ LocationSelector.vue (provinceOptions/wardOptions)
function filterOptions(options, query) {
  const q = normalize(query)
  const opts = q
    ? options.filter(o => normalize(o.label).includes(q))
    : options
  return opts.slice(0, 50)
}

const data = JSON.parse(readFileSync('src/data/provinces-wards.json', 'utf8'))
const provinces = data.provinces
const provinceOptions = provinces.map(p => ({ value: p.id, label: p.name }))

test('provinceOptions có đủ 34 tỉnh', () => {
  assert.equal(provinceOptions.length, 34)
})

test('tìm tỉnh không dấu "ha noi" → Hà Nội', () => {
  const r = filterOptions(provinceOptions, 'ha noi')
  assert.ok(r.some(o => o.label === 'Hà Nội'), 'phải tìm thấy Hà Nội khi gõ "ha noi"')
})

test('tìm tỉnh có dấu "Thanh Hóa" → Thanh Hóa', () => {
  const r = filterOptions(provinceOptions, 'Thanh Hóa')
  assert.ok(r.some(o => o.label === 'Thanh Hóa'))
})

test('tìm phường không dấu trong tỉnh 168 phường (HCM)', () => {
  const hcm = provinces.find(p => p.name === 'Hồ Chí Minh')
  const wardOptions = hcm.wards.map(w => ({ value: w.id, label: w.name }))
  assert.ok(wardOptions.length > 100, 'HCM phải có nhiều phường')
  // gõ không dấu — dùng phường thật trong data sau sáp nhập
  const r1 = filterOptions(wardOptions, 'thu dau mot')
  assert.ok(r1.length >= 1, `"thu dau mot" phải match "Thủ Dầu Một", got ${r1.length}`)
  // gõ có dấu
  const r2 = filterOptions(wardOptions, 'Thủ Dầu Một')
  assert.ok(r2.some(o => o.label === 'Thủ Dầu Một'))
})

test('query rỗng → trả về tối đa 50 (không phải 168)', () => {
  const hcm = provinces.find(p => p.name === 'Hồ Chí Minh')
  const wardOptions = hcm.wards.map(w => ({ value: w.id, label: w.name }))
  const r = filterOptions(wardOptions, '')
  assert.equal(r.length, 50, 'giới hạn 50 kết quả để DOM nhẹ')
})

test('không match → mảng rỗng, UI hiện "Không tìm thấy"', () => {
  const r = filterOptions(provinceOptions, 'xyzkhongco')
  assert.equal(r.length, 0)
})