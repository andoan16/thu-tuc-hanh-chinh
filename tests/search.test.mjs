import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Load src/utils/search.js (ESM thuần, không dependency)
const { normalize } = await import('../src/utils/search.js')

test('normalize bỏ dấu tiếng Việt', () => {
  assert.equal(normalize('Lý lịch tư pháp'), 'ly lich tu phap')
  assert.equal(normalize('Phường 1'), 'phuong 1')
  assert.equal(normalize('Đặng'), 'dang')
  assert.equal(normalize('Thủ tục HÀNH CHÍNH'), 'thu tuc hanh chinh')
})

test('normalize xử lý chuỗi rỗng/không có', () => {
  assert.equal(normalize(''), '')
  assert.equal(normalize(null), '')
  assert.equal(normalize(undefined), '')
})

test('tìm không dấu match thủ tục thật trong data', () => {
  const data = JSON.parse(readFileSync('src/data/procedures/ly-lich-tu-phap.json', 'utf8'))
  const idx = normalize([data.title, data.category, Object.values(data.documents).map(d => d.label).join(' ')].join(' '))
  // query không dấu vẫn phải match
  assert.ok(idx.includes(normalize('ly lich tu phap')))
  assert.ok(idx.includes(normalize('phiêu')), 'từ trong label giấy tờ phải match')
})

test('query có dấu vẫn match như cũ', () => {
  const data = JSON.parse(readFileSync('src/data/procedures/doi-gpkx.json', 'utf8'))
  const idx = normalize([data.title, data.category].join(' '))
  assert.ok(idx.includes(normalize('Giấy phép lái xe')))
})