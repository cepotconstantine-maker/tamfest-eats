import { useMemo, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { filterMenus, locationText } from '../lib/db.js'
import FilterPanel, { useFilters } from '../components/FilterPanel.jsx'
import { FoodThumb, Price, StatusBadge, CompareButton, mapLink, Empty } from '../components/ui.jsx'

export default function RandomPicker() {
  const { filters, update, reset } = useFilters()
  // Acak hanya dari menu utama yang punya harga, agar rekomendasi selalu jelas.
  const pool = useMemo(() => filterMenus({ ...filters, onlyPriced: true }).filter((m) => m.item_type === 'main' && m.price > 0), [filters])
  const [pick, setPick] = useState(null)
  const [rolling, setRolling] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearInterval(timer.current), [])
  useEffect(() => {
    if (pick && !pool.some((m) => m.menu_id === pick.menu_id)) setPick(null)
  }, [pool]) // eslint-disable-line

  const roll = () => {
    if (!pool.length) return
    clearInterval(timer.current)
    setRolling(true)
    let n = 0
    timer.current = setInterval(() => {
      setPick(pool[Math.floor(Math.random() * pool.length)])
      if (++n > 12) {
        clearInterval(timer.current)
        setRolling(false)
      }
    }, 70)
  }

  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <h1>🎲 Random Food Picker</h1>
          <p className="muted">Bingung mau makan apa? Atur filter & budget, lalu biarkan kami yang memilih.</p>
        </div>
      </div>
      <FilterPanel filters={filters} update={update} reset={reset} count={pool.length} showSort={false} />
      <div className="random">
        <div className={`random__stage card ${rolling ? 'is-rolling' : ''}`}>
          {pick ? (
            <>
              <FoodThumb menu={pick} size="lg" />
              <div className="random__info">
                <StatusBadge status={pick.verification_status} />
                <h2>{pick.menu_name}</h2>
                {pick.menu_variant && <p className="muted">{pick.menu_variant}</p>}
                <Price value={pick.price} className="price--xl" />
                <p>🏪 {pick.stall.stall_name}</p>
                <p className="muted small">📍 {locationText(pick.stall)}</p>
                {!rolling && (
                  <div className="row-actions">
                    <Link className="btn btn--primary" to={`/menu/${pick.menu_id}`}>
                      Lihat detail
                    </Link>
                    {pick.stall.onMap && (
                      <Link className="btn btn--ghost" to={mapLink(pick.stall_id, pick.menu_id)}>
                        🗺️ Find on Map
                      </Link>
                    )}
                    <CompareButton id={pick.menu_id} />
                  </div>
                )}
              </div>
            </>
          ) : pool.length ? (
            <div className="random__placeholder">
              <span>🍽️</span>
              <p>
                Ada <b>{pool.length}</b> menu yang cocok dengan filtermu.
              </p>
            </div>
          ) : (
            <Empty title="Tidak ada menu yang cocok">
              <p className="muted">Longgarkan filter atau budget dulu.</p>
            </Empty>
          )}
        </div>
        <button className="btn btn--accent btn--xl" onClick={roll} disabled={!pool.length || rolling}>
          {pick ? '🎲 Acak lagi' : '🎲 Acak sekarang'}
        </button>
      </div>
    </div>
  )
}
