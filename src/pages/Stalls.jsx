import { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchStalls, formatPrice, locationText, categoryById, asset } from '../lib/db.js'
import { mapLink } from '../components/ui.jsx'

export default function Stalls() {
  const [q, setQ] = useState('')
  const [onlyMenu, setOnlyMenu] = useState(false)
  const list = searchStalls(q)
    .filter((s) => !onlyMenu || s.menuCount > 0)
    .sort((a, b) => (b.menuCount > 0) - (a.menuCount > 0) || a.stall_name.localeCompare(b.stall_name))
  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <h1>Daftar Warung</h1>
          <p className="muted">Semua warung di Taman Festival beserta lokasi di denah.</p>
        </div>
      </div>
      <div className="filters__bar">
        <div className="search search--inline">
          <span aria-hidden>🔍</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari warung…" aria-label="Cari warung" />
        </div>
        <label className="check">
          <input type="checkbox" checked={onlyMenu} onChange={(e) => setOnlyMenu(e.target.checked)} /> Hanya yang sudah ada menunya
        </label>
        <p className="result-count">
          <b>{list.length}</b> warung
        </p>
      </div>
      <div className="stall-grid">
        {list.map((s) => (
          <article key={s.stall_id} className="card stall-card">
            {s.image_path && <img className="stall-card__img" src={asset(s.image_path)} alt={`Tampak depan ${s.stall_name}`} loading="lazy" />}
            <div className="stall-card__top">
              <span className="booth">{s.booth_number || '—'}</span>
              <div>
                <h3>{s.stall_name}</h3>
                <p className="muted small">📍 {locationText(s)}</p>
              </div>
            </div>
            {s.description && <p className="small">{s.description}</p>}
            <div className="chips chips--tight">
              {s.categoryIds
                .filter((c) => c !== 'tambahan')
                .map((c) => (
                  <span key={c} className="chip">
                    {categoryById[c]?.icon} {categoryById[c]?.name}
                  </span>
                ))}
            </div>
            <p className="small">
              {s.menuCount > 0 ? (
                <>
                  <b>{s.menuCount}</b> menu · {s.minPrice != null ? `${formatPrice(s.minPrice)} – ${formatPrice(s.maxPrice)}` : 'harga belum tercantum'}
                </>
              ) : (
                <span className="muted">Menu belum didata.</span>
              )}
            </p>
            <div className="row-actions">
              {s.menuCount > 0 && (
                <Link className="btn btn--primary btn--sm" to={`/jelajah?warung=${s.stall_id}`}>
                  Lihat menu
                </Link>
              )}
              {s.onMap && (
                <Link className="btn btn--ghost btn--sm" to={mapLink(s.stall_id)}>
                  🗺️ Di peta
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
