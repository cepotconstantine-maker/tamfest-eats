import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categories, featuredMenus, filterMenus, stats, formatPrice } from '../lib/db.js'
import { MenuCard } from '../components/ui.jsx'

const BUDGETS = [
  { label: 'Hemat banget', max: 10000, note: 'sampai Rp10.000' },
  { label: 'Pas di kantong', max: 15000, note: 'sampai Rp15.000' },
  { label: 'Makan kenyang', max: 20000, note: 'sampai Rp20.000' },
]

export default function Home() {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const popular = [...categories].filter((c) => c.category_id !== 'tambahan').sort((a, b) => b.menu_count - a.menu_count).slice(0, 8)
  const featured = featuredMenus(8)

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">Taman Festival · Tamansari Food Fest</p>
            <h1>
              Mau makan apa
              <br />
              <span className="hl">di Tamfest</span> hari ini?
            </h1>
            <p className="lead">Your Food, Your Budget, Your Choice. Cari menu, bandingkan harga, dan temukan warungnya di peta.</p>
            <form
              className="search search--hero"
              onSubmit={(e) => {
                e.preventDefault()
                nav(`/jelajah${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
              }}
              role="search"
            >
              <span aria-hidden>🔍</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari soto, geprek, matcha, seblak…" aria-label="Cari makanan" />
              <button className="btn btn--accent" type="submit">
                Cari
              </button>
            </form>
            <div className="hero__stats">
              <div>
                <b>{stats.menus}</b>
                <span>menu</span>
              </div>
              <div>
                <b>{stats.stallsWithMenu}</b>
                <span>warung bermenu</span>
              </div>
              <div>
                <b>{formatPrice(stats.cheapest)}</b>
                <span>harga termurah</span>
              </div>
            </div>
          </div>
          <Link to="/peta" className="hero__map" aria-label="Buka peta foodcourt">
            <div className="mini-map" aria-hidden>
              {Array.from({ length: 17 }).map((_, i) => (
                <span key={i} className="mini-map__cell" style={{ left: `${3 + i * 5.6}%`, top: '10%' }} />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={`b${i}`} className="mini-map__cell" style={{ left: `${10 + i * 11}%`, top: '48%' }} />
              ))}
              <span className="mini-map__pin" style={{ left: '62%', top: '6%' }}>
                📍
              </span>
              <span className="mini-map__road">JALAN</span>
            </div>
            <div className="hero__map-text">
              <b>🗺️ Peta Interaktif Foodcourt</b>
              <span>{stats.onMap} warung di denah. Klik untuk lihat menu & lokasi →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Kategori populer</h2>
          <Link to="/jelajah" className="link">
            Lihat semua →
          </Link>
        </div>
        <div className="cat-grid">
          {popular.map((c) => (
            <Link key={c.category_id} to={`/jelajah?kategori=${c.category_id}`} className="cat-card">
              <span className="cat-card__icon">{c.icon}</span>
              <b>{c.name}</b>
              <span className="muted small">{c.menu_count} menu</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Rekomendasi sesuai budget</h2>
          <Link to="/budget" className="link">
            Atur budget sendiri →
          </Link>
        </div>
        <div className="budget-grid">
          {BUDGETS.map((b) => {
            const list = filterMenus({ max: b.max, types: ['Makanan Berat'], sort: 'termahal' })
            const drinks = filterMenus({ max: b.max, types: ['Minuman'] })
            return (
              <Link key={b.max} to={`/budget?max=${b.max}`} className="budget-card">
                <span className="budget-card__label">{b.label}</span>
                <b className="budget-card__amount">{b.note}</b>
                <span className="muted small">
                  {list.length} makanan berat · {drinks.length} minuman
                </span>
                {list[0] && (
                  <span className="budget-card__eg">
                    Contoh: {list[0].menu_name} ({list[0].stall.stall_name}) — {formatPrice(list[0].price)}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Menu pilihan hari ini</h2>
          <Link to="/acak" className="link">
            🎲 Bingung? Acak saja →
          </Link>
        </div>
        <div className="menu-grid">
          {featured.map((m) => (
            <MenuCard key={m.menu_id} menu={m} />
          ))}
        </div>
      </section>

      <section className="container section">
        <Link to="/peta" className="cta-map">
          <div>
            <h2>Sudah tahu mau makan apa?</h2>
            <p>Buka peta, cari warungnya, langsung jalan ke sana.</p>
          </div>
          <span className="btn btn--accent">Explore Map →</span>
        </Link>
      </section>
    </>
  )
}
