// =============================================================
// TAMFEST EATS — centralized data layer
// Semua halaman mengambil data dari file ini. Jangan hardcode menu
// di komponen. Untuk update data, edit file JSON di src/data/.
// =============================================================
import stallsRaw from '../data/stalls.json'
import menusRaw from '../data/menus.json'
import categoriesRaw from '../data/categories.json'
import mapRaw from '../data/map.json'
import photosRaw from '../data/photos.json'

const BASE = import.meta.env.BASE_URL || '/'
/** Ubah path "/menu-photos/x.jpg" menjadi URL sesuai base deploy. */
export const asset = (p) => (p ? BASE.replace(/\/$/, '') + p : null)

export const categories = categoriesRaw
export const categoryById = Object.fromEntries(categories.map((c) => [c.category_id, c]))

export const photos = photosRaw
export const photoById = Object.fromEntries(photos.map((p) => [p.photo_id, p]))

export const mapInfo = mapRaw
export const markers = mapRaw.markers
export const markerByStall = Object.fromEntries(markers.map((m) => [m.stall_id, m]))

export const ZONE_LABEL = {
  'Baris Atas': 'Baris atas (deret panjang)',
  'Baris Tengah': 'Baris tengah',
  'Sisi Kiri': 'Sisi kiri',
  'Sisi Kanan': 'Sisi kanan',
}

const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

// Warung yang digabung (merged_into) tetap ada di JSON sebagai riwayat, tapi tidak ditampilkan.
export const stalls = stallsRaw.filter((s) => !s.merged_into).map((s) => {
  const own = menusRaw.filter((m) => m.stall_id === s.stall_id)
  const priced = own.filter((m) => m.item_type === 'main' && m.price != null && m.price > 0)
  return {
    ...s,
    menuCount: own.filter((m) => m.item_type === 'main').length,
    minPrice: priced.length ? Math.min(...priced.map((m) => m.price)) : null,
    maxPrice: priced.length ? Math.max(...priced.map((m) => m.price)) : null,
    categoryIds: [...new Set(own.map((m) => m.category))],
    photos: photos.filter((p) => p.stall_id === s.stall_id),
    onMap: s.map_x != null,
    _search: norm([s.stall_name, ...(s.alternative_names || [])].join(' ')),
  }
})
export const stallById = Object.fromEntries(stalls.map((s) => [s.stall_id, s]))

export const menus = menusRaw.map((m) => {
  const s = stallById[m.stall_id]
  return {
    ...m,
    stall: s,
    categoryObj: categoryById[m.category],
    fullName: m.menu_variant ? `${m.menu_name} · ${m.menu_variant}` : m.menu_name,
    _search: norm(
      [m.menu_name, m.menu_variant, m.description, s?.stall_name, ...(s?.alternative_names || []), categoryById[m.category]?.name].join(' '),
    ),
  }
})
export const menuById = Object.fromEntries(menus.map((m) => [m.menu_id, m]))

export const mainMenus = menus.filter((m) => m.item_type === 'main')
export const FOOD_TYPES = ['Makanan Berat', 'Camilan', 'Minuman', 'Dessert', 'Tambahan']

export const pricedValues = menus.filter((m) => m.price != null).map((m) => m.price)
export const PRICE_MIN = 0
export const PRICE_MAX = Math.ceil(Math.max(...pricedValues) / 5000) * 5000

// ------------------------------------------------------------- helpers
export function formatPrice(p) {
  if (p == null) return 'Harga belum tercantum'
  if (p === 0) return 'Gratis'
  return 'Rp' + p.toLocaleString('id-ID')
}
export const shortPrice = (p) => (p == null ? '–' : p === 0 ? 'Free' : `${Math.round(p / 100) / 10}K`.replace('.', ','))

export function locationText(stall) {
  if (!stall) return ''
  if (!stall.onMap) return 'Belum ada di denah'
  return `${ZONE_LABEL[stall.location_zone] || stall.location_zone} · Kode ${stall.booth_number}`
}

/**
 * Filter utama. Dipakai Explore, Budget, Acak, dan Peta agar hasil konsisten.
 * f = { q, cats:[], types:[], stalls:[], min, max, sort, addons, onlyPriced }
 */
export function filterMenus(f = {}) {
  const q = norm(f.q)
  const terms = q ? q.split(' ') : []
  const hasMin = f.min !== '' && f.min != null && !Number.isNaN(Number(f.min))
  const hasMax = f.max !== '' && f.max != null && !Number.isNaN(Number(f.max))
  const usesPrice = hasMin || hasMax || f.onlyPriced
  let list = menus.filter((m) => {
    if (!f.addons && m.item_type === 'addon' && !(f.cats || []).includes('tambahan')) return false
    if (terms.length && !terms.every((t) => m._search.includes(t))) return false
    if (f.cats?.length && !f.cats.includes(m.category)) return false
    if (f.types?.length && !f.types.includes(m.food_type)) return false
    if (f.stalls?.length && !f.stalls.includes(m.stall_id)) return false
    if (usesPrice && m.price == null) return false
    if (hasMin && m.price < Number(f.min)) return false
    if (hasMax && m.price > Number(f.max)) return false
    return true
  })
  const nullLast = (a, b, dir) => {
    if (a.price == null && b.price == null) return 0
    if (a.price == null) return 1
    if (b.price == null) return -1
    return dir * (a.price - b.price)
  }
  if (f.sort === 'termurah') list = [...list].sort((a, b) => nullLast(a, b, 1))
  else if (f.sort === 'termahal') list = [...list].sort((a, b) => nullLast(a, b, -1))
  else if (f.sort === 'nama') list = [...list].sort((a, b) => a.menu_name.localeCompare(b.menu_name, 'id'))
  return list
}

export function searchStalls(q) {
  const t = norm(q)
  if (!t) return stalls
  return stalls.filter((s) => t.split(' ').every((w) => s._search.includes(w)))
}

/** Menu pilihan beranda: menu utama terverifikasi, 1 per warung, bergilir harian. */
export function featuredMenus(n = 8) {
  const day = Math.floor(Date.now() / 86400000)
  const byStall = {}
  for (const m of mainMenus) {
    if (m.verification_status === 'NEEDS_VERIFICATION' || m.price == null) continue
    ;(byStall[m.stall_id] ||= []).push(m)
  }
  const ids = Object.keys(byStall).sort()
  const out = []
  for (let i = 0; i < ids.length && out.length < n; i++) {
    const id = ids[(i + day) % ids.length]
    const list = byStall[id]
    out.push(list[(day + i) % list.length])
  }
  return out
}

export const stats = {
  stalls: stalls.length,
  stallsWithMenu: stalls.filter((s) => s.menuCount > 0).length,
  menus: mainMenus.length,
  onMap: markers.length,
  cheapest: Math.min(...mainMenus.filter((m) => m.price > 0).map((m) => m.price)),
}

// ------------------------------------------------------------- URL <-> filter
export function filtersFromParams(sp) {
  const list = (k) => (sp.get(k) ? sp.get(k).split(',').filter(Boolean) : [])
  return {
    q: sp.get('q') || '',
    cats: list('kategori'),
    types: list('jenis'),
    stalls: list('warung'),
    min: sp.get('min') || '',
    max: sp.get('max') || '',
    sort: sp.get('urut') || '',
    addons: sp.get('topping') === '1',
  }
}
export function paramsFromFilters(f) {
  const p = {}
  if (f.q) p.q = f.q
  if (f.cats?.length) p.kategori = f.cats.join(',')
  if (f.types?.length) p.jenis = f.types.join(',')
  if (f.stalls?.length) p.warung = f.stalls.join(',')
  if (f.min !== '' && f.min != null) p.min = String(f.min)
  if (f.max !== '' && f.max != null) p.max = String(f.max)
  if (f.sort) p.urut = f.sort
  if (f.addons) p.topping = '1'
  return p
}
export const STATUS_LABEL = {
  NEEDS_VERIFICATION: 'Perlu verifikasi',
  USER_PROVIDED: 'Info pengelola data',
  VERIFIED: 'Sesuai foto menu',
}
