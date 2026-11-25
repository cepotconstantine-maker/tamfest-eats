import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { filterMenus, paramsFromFilters } from '../lib/db.js'
import FilterPanel, { useFilters } from '../components/FilterPanel.jsx'
import { MenuCard, Empty } from '../components/ui.jsx'

const PAGE = 24

export default function Explore() {
  const { filters, update, reset } = useFilters()
  const results = useMemo(() => filterMenus(filters), [filters])
  const [limit, setLimit] = useState(PAGE)
  useEffect(() => setLimit(PAGE), [filters])
  const randomHref = `/acak?${new URLSearchParams(paramsFromFilters(filters)).toString()}`

  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <h1>Jelajah Menu</h1>
          <p className="muted">Semua makanan & minuman di Tamfest. Gabungkan filter sesukamu.</p>
        </div>
        <Link to={randomHref} className="btn btn--accent">
          🎲 Acak dari hasil ini
        </Link>
      </div>
      <FilterPanel filters={filters} update={update} reset={reset} count={results.length} />
      {results.length === 0 ? (
        <Empty title="Belum ada menu yang cocok">
          <p className="muted">Coba kurangi filter atau ganti kata kunci.</p>
          <button className="btn btn--primary" onClick={reset}>
            Reset filter
          </button>
        </Empty>
      ) : (
        <>
          <div className="menu-grid">
            {results.slice(0, limit).map((m) => (
              <MenuCard key={m.menu_id} menu={m} />
            ))}
          </div>
          {limit < results.length && (
            <div className="center">
              <button className="btn btn--ghost" onClick={() => setLimit((l) => l + PAGE)}>
                Tampilkan lebih banyak ({results.length - limit} lagi)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
