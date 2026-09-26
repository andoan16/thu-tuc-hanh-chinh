import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

const dir = 'src/data/procedures'
const procedures = readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')))

// Tái tạo logic viewAll trong ChecklistWizard (union mọi nhánh rule)
function viewAllDocs(p) {
  const union = new Set()
  for (const rule of Object.values(p.rules)) {
    for (const id of rule.required) union.add(id)
  }
  const reqIds = new Set(union)
  for (const rule of Object.values(p.rules)) {
    for (const id of (rule.optional || [])) {
      if (!reqIds.has(id)) union.add(id)
    }
  }
  return [...union]
}

test('viewAll = union mọi nhánh, không trùng lặp', () => {
  for (const p of procedures) {
    const docs = viewAllDocs(p)
    assert.equal(new Set(docs).size, docs.length, `${p.slug}: không được trùng document`)
    // mỗi id phải tồn tại trong documents map
    for (const id of docs) {
      assert.ok(p.documents[id], `${p.slug}: id "${id}" phải có trong documents`)
    }
    // union phải ⊇ mọi nhánh riêng lẻ
    for (const rule of Object.values(p.rules)) {
      for (const id of rule.required) {
        assert.ok(docs.includes(id), `${p.slug}: "${id}" thiếu trong union`)
      }
    }
  }
})

test('GPKX viewAll có đủ 7 documents (renew/upgrade/lost)', () => {
  const gpkx = procedures.find(p => p.slug === 'doi-gpkx')
  const docs = viewAllDocs(gpkx)
  assert.equal(docs.length, 7)
  assert.ok(docs.includes('dshv_upgrade'), 'dshv_upgrade (chỉ nhánh upgrade) phải có trong union')
})

test('viewAll nhiều hơn mọi nhánh đơn lẻ (thật sự là union)', () => {
  const gpkx = procedures.find(p => p.slug === 'doi-gpkx')
  const union = viewAllDocs(gpkx)
  for (const rule of Object.values(gpkx.rules)) {
    const branch = [...rule.required, ...(rule.optional || [])]
    assert.ok(union.length >= branch.length)
  }
})