import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

// Tái tạo đúng logic feeLabel ở ProcedureCard / ProcedureView / ChecklistWizard
function feeLabel(p) {
  const min = p.feeMin
  if (p.fee === 0) return 'Miễn phí'
  if (min !== undefined && min < p.fee) {
    return 'từ ' + min.toLocaleString('vi-VN') + 'đ'
  }
  return p.fee.toLocaleString('vi-VN') + 'đ'
}

const dir = 'src/data/procedures'
const procedures = readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')))

test('LLTP có feeMin < fee → hiển thị "từ 100.000đ"', () => {
  const lltp = procedures.find(p => p.slug === 'ly-lich-tu-phap')
  assert.ok(lltp.feeMin, 'LLTP phải có feeMin trong data')
  assert.equal(feeLabel(lltp), 'từ 100.000đ')
})

test('thủ tục không có feeMin → giữ hiển thị cũ', () => {
  const gpkx = procedures.find(p => p.slug === 'doi-gpkx')
  assert.equal(feeLabel(gpkx), '115.000đ')
  const tamtru = procedures.find(p => p.slug === 'dang-ky-tam-tru')
  assert.equal(feeLabel(tamtru), 'Miễn phí')
  const saoy = procedures.find(p => p.slug === 'chung-thuc-sao-y')
  assert.equal(feeLabel(saoy), '2.000đ')
})

test('feeMin >= fee → không hiện "từ" (phòng data sai)', () => {
  assert.equal(feeLabel({ fee: 100000, feeMin: 100000 }), '100.000đ')
  assert.equal(feeLabel({ fee: 100000, feeMin: 200000 }), '100.000đ')
})