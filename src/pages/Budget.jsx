import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { filterMenus, formatPrice, PRICE_MAX, paramsFromFilters } from '../lib/db.js'
import { useFilters } from '../components/FilterPanel.jsx'
import { MenuCard, Empty } from '../components/ui.jsx'

const TYPES = ['Makanan Berat', 'Camilan', 'Minuman', 'Dessert']

export default function Budget() {
  const { filters, update, reset } = useFilters()
  const min = filters.min === '' ? '' : Number(filters.min)
  const max = filters.max === '' ? '' : Number(filters.max)
  const invalid = min !== '' && max !== '' && min > max
  const ready = filters.max !== '' || filters.min !== ''
  const results = useMemo(
    () => (ready && !invalid ? filterMenus({ ...filters, sort: filters.sort || 'termurah', onlyPriced: true }) : []),
    [filters, ready, invalid],
  )
  const byType = TYPES.map((t) => ({ t, n: results.filter((m) => m.food_type === t).length }))
  const stallCount = new Set(results.map((m) => m.stall_id)).size
  const randomHref = `/acak?${new URLSearchParams(paramsFromFilters(filters)).toString()}`

  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <h1>Budget Finder</h1>
          <p className="muted">Masukkan budget-mu, kami tampilkan semua menu yang masuk.</p>
        </div>
      </div>

      <section className="budget-box card">
        <div className="budget-box__inputs">
          <label>
            <span>Budget minimum</span>
            <div className="money">
              <span>Rp</span>
              <input type="number" inputMode="numeric" min="0" step="1000" value={filters.min} placeholder="0" onChange={(e) => update({ min: e.target.value })} />
            </div>
          </label>
          <label>
            <span>Budget maksimum</span>
            <div className="money">
              <span>Rp</span>
              <input type="number" inputMode="numeric" min="0" step="1000" value={filters.max} placeholder="15000" onChange={(e) => update({ max: e.target.value })} />
            </div>
          </label>
        </div>
        <input
          type="range"
          className="range"
          min="0"
          max={PRICE_MAX > 30000 ? 30000 : PRICE_MAX}
          step="1000"
          value={max === '' ? 0 : Math.min(max, 30000)}
          onChange={(e) => update({ max: e.target.value })}
          aria-label="Geser budget maksimum"
        />
        <div className="chips">
          {[5000, 10000, 15000, 20000, 25000].map((v) => (
            <button key={v} type="button" className={`chip chip--toggle ${max === v && filters.min === '' ? 'is-on' : ''}`} onClick={() => update({ min: '', max: v })}>
              ≤ {formatPrice(v)}
            </button>
          ))}
        </div>
        <div className="chips">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip chip--toggle ${filters.types.includes(t) ? 'is-on' : ''}`}
              onClick={() => update({ types: filters.types.includes(t) ? filters.types.filter((x) => x !== t) : [...filters.types, t] })}
            >
              {t}
            </button>
          ))}
          <select className="select" value={filters.sort || 'termurah'} onChange={(e) => update({ sort: e.target.value })} aria-label="Urutkan">
            <option value="termurah">Termurah dulu</option>
            <option value="termahal">Termahal dulu</option>
          </select>
          <button type="button" className="btn btn--link btn--sm" onClick={reset}>
            Reset
          </button>
        </div>
        {invalid && <p className="error">Budget minimum lebih besar dari maksimum.</p>}
      </section>

      {!ready ? (
        <Empty title="Isi budget dulu, ya">
          <p className="muted">Pilih salah satu tombol di atas atau ketik nominalnya.</p>
        </Empty>
      ) : results.length === 0 ? (
        <Empty title="Belum ada menu di rentang ini">
          <p className="muted">Coba naikkan budget maksimum.</p>
        </Empty>
      ) : (
        <>
          <div className="budget-summary">
            <p>
              <b>{results.length}</b> menu dari <b>{stallCount}</b> warung masuk budget{' '}
              {min !== '' && `${formatPrice(min)} – `}
              {max !== '' ? formatPrice(max) : 'ke atas'}.
            </p>
            <div className="chips chips--tight">
              {byType.filter((x) => x.n).map((x) => (
                <span key={x.t} className="chip">
                  {x.t}: {x.n}
                </span>
              ))}
            </div>
            <Link className="btn btn--accent btn--sm" to={randomHref}>
              🎲 Pilihkan satu
            </Link>
          </div>
          <div className="menu-grid">
            {results.map((m) => (
              <MenuCard key={m.menu_id} menu={m} />
            ))}
          </div>
          <p className="muted small">Menu tanpa harga tercantum tidak ditampilkan di Budget Finder.</p>
        </>
      )}
    </div>
  )
}
