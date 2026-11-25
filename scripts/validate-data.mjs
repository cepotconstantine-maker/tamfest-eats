// Cek kesehatan database sebelum deploy:  npm run validate
import { readFileSync, existsSync } from 'node:fs'
const load = (n) => JSON.parse(readFileSync(new URL(`../src/data/${n}`, import.meta.url), 'utf8'))
const stalls = load('stalls.json'), menus = load('menus.json'), cats = load('categories.json')
const map = load('map.json'), photos = load('photos.json')
const errors = [], warns = []
const sid = new Set(stalls.map((s) => s.stall_id)), cid = new Set(cats.map((c) => c.category_id)), pid = new Set(photos.map((p) => p.photo_id))
const STATUS = ['VERIFIED', 'NEEDS_VERIFICATION', 'USER_PROVIDED']
const dup = (arr, k) => arr.map((x) => x[k]).filter((v, i, a) => a.indexOf(v) !== i)

dup(stalls, 'stall_id').forEach((d) => errors.push(`stall_id ganda: ${d}`))
dup(menus, 'menu_id').forEach((d) => errors.push(`menu_id ganda: ${d}`))
const seen = new Set()
for (const m of menus) {
  const tag = `${m.menu_id} (${m.menu_name})`
  if (!sid.has(m.stall_id)) errors.push(`${tag}: stall_id ${m.stall_id} tidak ada`)
  if (!cid.has(m.category)) errors.push(`${tag}: kategori ${m.category} tidak ada`)
  if (m.price !== null && (typeof m.price !== 'number' || m.price < 0)) errors.push(`${tag}: harga harus angka ≥ 0 atau null`)
  if (!STATUS.includes(m.verification_status)) errors.push(`${tag}: verification_status tidak dikenal`)
  if (!['main', 'addon'].includes(m.item_type)) errors.push(`${tag}: item_type harus main/addon`)
  if (m.source_image !== 'USER_TEXT' && !pid.has(m.source_image)) errors.push(`${tag}: source_image ${m.source_image} tidak ada di photos.json`)
  if (m.price === null && m.verification_status !== 'NEEDS_VERIFICATION') warns.push(`${tag}: harga kosong tapi status bukan NEEDS_VERIFICATION`)
  const key = `${m.stall_id}|${m.menu_name.toLowerCase()}|${(m.menu_variant || '').toLowerCase()}`
  if (seen.has(key)) errors.push(`${tag}: duplikat nama+varian di warung yang sama`)
  seen.add(key)
}
for (const mk of map.markers) {
  if (!sid.has(mk.stall_id)) errors.push(`map: ${mk.stall_id} tidak ada di stalls.json`)
  if (!(mk.x >= 0 && mk.x <= 1 && mk.y >= 0 && mk.y <= 1)) errors.push(`map: koordinat ${mk.stall_id} harus 0–1`)
}
for (const p of photos) if (!existsSync(new URL(`../public${p.image_path}`, import.meta.url))) errors.push(`foto hilang: public${p.image_path}`)

console.log(`Warung ${stalls.length} · Menu ${menus.length} · Marker ${map.markers.length} · Foto ${photos.length}`)
warns.forEach((w) => console.log('⚠ ', w))
if (errors.length) {
  errors.forEach((e) => console.log('✗ ', e))
  console.log(`\n${errors.length} error. Perbaiki dulu sebelum deploy.`)
  process.exit(1)
}
console.log('✓ Data valid.')
