import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { menus, categoryById, locationText, formatPrice, asset, photos as allPhotos } from '../lib/db.js'
import { PhotoStrip, Price, StatusBadge, Lightbox } from './ui.jsx'

export default function StallPanel({ stall, menuId, expanded, onToggle, onClose }) {
  const hlRef = useRef(null)
  const [front, setFront] = useState(null)
  const bodyRef = useRef(null)
  // Scroll hanya di dalam panel (scrollIntoView ikut menggeser kanvas peta).
  useEffect(() => {
    const el = hlRef.current
    const body = bodyRef.current
    if (!menuId || !el || !body) return
    const top = el.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop
    body.scrollTo({ top: Math.max(0, top - 60), behavior: 'smooth' })
  }, [menuId, stall?.stall_id])
  if (!stall) return null
  const own = menus.filter((m) => m.stall_id === stall.stall_id)
  const main = own.filter((m) => m.item_type === 'main')
  const addons = own.filter((m) => m.item_type === 'addon')
  const groups = {}
  for (const m of main) (groups[m.category] ||= []).push(m)
  const hl = menuId ? own.find((m) => m.menu_id === menuId) : null

  return (
    <aside className={`stall-panel ${expanded ? 'is-expanded' : ''}`} aria-label={`Detail ${stall.stall_name}`}>
      <button className="stall-panel__handle" onClick={onToggle} aria-label={expanded ? 'Kecilkan panel' : 'Perbesar panel'}>
        <span />
      </button>
      <header className="stall-panel__head">
        <div className="stall-panel__title">
          <span className="booth">{stall.booth_number || '—'}</span>
          <div>
            <h2>{stall.stall_name}</h2>
            <p className="muted small">📍 {locationText(stall)}</p>
          </div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Tutup panel">
          ✕
        </button>
      </header>
      <div className="stall-panel__body" ref={bodyRef}>
        {stall.image_path && (
          <button className="stall-hero" onClick={() => setFront(allPhotos.find((p) => p.image_path === stall.image_path))} aria-label={`Foto ${stall.stall_name}`}>
            <img src={asset(stall.image_path)} alt={`Tampak depan ${stall.stall_name}`} loading="lazy" />
          </button>
        )}
        {stall.alternative_names?.length > 0 && <p className="muted small">Juga dikenal: {stall.alternative_names.join(', ')}</p>}
        {stall.description && <p>{stall.description}</p>}
        {hl && (
          <div className="hl-menu" ref={hlRef}>
            <p className="muted small">Menu yang kamu cari</p>
            <div className="hl-menu__row">
              <Link to={`/menu/${hl.menu_id}`}>
                <b>{hl.menu_name}</b>
                {hl.menu_variant && <span className="muted"> · {hl.menu_variant}</span>}
              </Link>
              <Price value={hl.price} className="price--lg" />
            </div>
          </div>
        )}
        <h3 className="stall-panel__sub">Foto menu</h3>
        <PhotoStrip photos={stall.photos} />

        <h3 className="stall-panel__sub">
          Menu {main.length > 0 && <span className="muted small">({main.length})</span>}
        </h3>
        {main.length === 0 ? (
          <p className="muted">Menu warung ini belum didata.</p>
        ) : (
          Object.entries(groups).map(([cat, list]) => (
            <div key={cat} className="menu-group">
              <h4>
                {categoryById[cat]?.icon} {categoryById[cat]?.name}
              </h4>
              <ul className="menu-list">
                {list.map((m) => (
                  <li key={m.menu_id} className={m.menu_id === menuId ? 'is-hl' : ''} ref={m.menu_id === menuId && !hl ? hlRef : undefined}>
                    <Link to={`/menu/${m.menu_id}`}>
                      {m.menu_name}
                      {m.menu_variant && <span className="muted"> · {m.menu_variant}</span>}
                      {m.verification_status === 'NEEDS_VERIFICATION' && <span className="warn-dot" title="Perlu verifikasi"> ⚠</span>}
                    </Link>
                    <Price value={m.price} />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        {addons.length > 0 && (
          <div className="menu-group">
            <h4>➕ Topping & tambahan</h4>
            <div className="chips chips--tight">
              {addons.map((a) => (
                <span key={a.menu_id} className={`chip ${a.menu_id === menuId ? 'is-on' : ''}`}>
                  {a.menu_name} · {formatPrice(a.price)}
                </span>
              ))}
            </div>
          </div>
        )}
        {stall.verification_status !== 'VERIFIED' && stall.notes && (
          <div className="note">
            <StatusBadge status="NEEDS_VERIFICATION" /> {stall.notes}
          </div>
        )}
        {main.length > 0 && (
          <Link className="btn btn--primary btn--block" to={`/jelajah?warung=${stall.stall_id}`}>
            Lihat semua menu di Jelajah
          </Link>
        )}
      </div>
      <Lightbox photo={front} onClose={() => setFront(null)} />
    </aside>
  )
}
