import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, FOOD_TYPES, stalls, filtersFromParams, paramsFromFilters } from '../lib/db.js'

/** State filter disimpan di URL agar bisa dibagikan & dipakai lintas halaman. */
export function useFilters() {
  const [sp, setSp] = useSearchParams()
  const filters = useMemo(() => filtersFromParams(sp), [sp])
  const update = (patch) => setSp(paramsFromFilters({ ...filters, ...patch }), { replace: true })
  const reset = () => setSp({}, { replace: true })
  return { filters, update, reset }
}

const PRESETS = [
  { label: '≤ 10rb', min: '', max: 10000 },
  { label: '10–15rb', min: 10000, max: 15000 },
  { label: '15–20rb', min: 15000, max: 20000 },
  { label: '> 20rb', min: 20001, max: '' },
]

export default function FilterPanel({ filters, update, reset, count, showSort = true, showSearch = true, showPrice = true }) {
  const [open, setOpen] = useState(false)
  const toggleIn = (key, val) => {
    const cur = filters[key] || []
    update({ [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] })
  }
  const active =
    (filters.q ? 1 : 0) + filters.cats.length + filters.types.length + filters.stalls.length + (filters.min !== '' ? 1 : 0) + (filters.max !== '' ? 1 : 0) + (filters.addons ? 1 : 0)
  const stallOpts = stalls.filter((s) => s.menuCount > 0).sort((a, b) => a.stall_name.localeCompare(b.stall_name))

  return (
    <section className="filters" aria-label="Filter menu">
      {showSearch && (
        <div className="search">
          <span aria-hidden>🔍</span>
          <input
            type="search"
            placeholder="Cari menu atau warung… (mis. soto, matcha, geprek)"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            aria-label="Cari menu"
          />
        </div>
      )}
      <div className="filters__bar">
        <button type="button" className="btn btn--ghost btn--sm filters__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          ⚙️ Filter{active ? ` (${active})` : ''}
        </button>
        <p className="result-count" aria-live="polite">
          <b>{count}</b> menu ditemukan
        </p>
        {showSort && (
          <select className="select" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Urutkan">
            <option value="">Urutan default</option>
            <option value="termurah">Harga termurah</option>
            <option value="termahal">Harga termahal</option>
            <option value="nama">Nama A–Z</option>
          </select>
        )}
        <button type="button" className="btn btn--link btn--sm" onClick={reset} disabled={!active && !filters.sort}>
          Reset filter
        </button>
      </div>

      <div className={`filters__body ${open ? 'is-open' : ''}`}>
        <div className="filter-group">
          <h4>Kategori</h4>
          <div className="chips">
            {categories
              .filter((c) => c.category_id !== 'tambahan' || filters.addons)
              .map((c) => (
                <button
                  key={c.category_id}
                  type="button"
                  className={`chip chip--toggle ${filters.cats.includes(c.category_id) ? 'is-on' : ''}`}
                  onClick={() => toggleIn('cats', c.category_id)}
                  aria-pressed={filters.cats.includes(c.category_id)}
                >
                  {c.icon} {c.name}
                </button>
              ))}
          </div>
        </div>
        <div className="filter-group">
          <h4>Jenis</h4>
          <div className="chips">
            {FOOD_TYPES.filter((t) => t !== 'Tambahan').map((t) => (
              <button
                key={t}
                type="button"
                className={`chip chip--toggle ${filters.types.includes(t) ? 'is-on' : ''}`}
                onClick={() => toggleIn('types', t)}
                aria-pressed={filters.types.includes(t)}
              >
                {t}
              </button>
            ))}
            <label className="check">
              <input type="checkbox" checked={filters.addons} onChange={(e) => update({ addons: e.target.checked })} /> Tampilkan topping & tambahan
            </label>
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-group">
            <h4>Warung</h4>
            <select
              className="select"
              value={filters.stalls[0] || ''}
              onChange={(e) => update({ stalls: e.target.value ? [e.target.value] : [] })}
              aria-label="Filter warung"
            >
              <option value="">Semua warung</option>
              {stallOpts.map((s) => (
                <option key={s.stall_id} value={s.stall_id}>
                  {s.stall_name}
                </option>
              ))}
            </select>
          </div>
          {showPrice && (
            <div className="filter-group">
              <h4>Rentang harga (Rp)</h4>
              <div className="price-inputs">
                <input type="number" inputMode="numeric" min="0" step="1000" placeholder="Min" value={filters.min} onChange={(e) => update({ min: e.target.value })} aria-label="Harga minimum" />
                <span>–</span>
                <input type="number" inputMode="numeric" min="0" step="1000" placeholder="Maks" value={filters.max} onChange={(e) => update({ max: e.target.value })} aria-label="Harga maksimum" />
              </div>
              <div className="chips chips--tight">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className={`chip chip--toggle ${String(filters.min) === String(p.min) && String(filters.max) === String(p.max) ? 'is-on' : ''}`}
                    onClick={() => update({ min: p.min, max: p.max })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
