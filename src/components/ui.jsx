import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { asset, formatPrice, STATUS_LABEL } from '../lib/db.js'
import { useCompare } from '../lib/compare.jsx'

const CAT_COLORS = {
  nasi: ['#F6E3B4', '#E9B949'], ayam: ['#FAD6B8', '#E8873A'], mie: ['#F8E7A8', '#E3A72F'],
  berkuah: ['#F3DCC0', '#C9773A'], daging: ['#EBC9BC', '#A4523A'], seafood: ['#CFE7E6', '#3E8E8A'],
  sayur: ['#D7EBC9', '#5E9A47'], camilan: ['#F4D9C6', '#C76A3A'], roti: ['#F2DFC1', '#B9813F'],
  dessert: ['#F8D5E0', '#D9668B'], kopi: ['#E3D2C2', '#6E4A33'], minuman: ['#D9E8D6', '#3F7D5A'],
  jus: ['#F9E0B8', '#EE8A2E'], tambahan: ['#E5E1D6', '#7D7766'],
}

export function mapLink(stallId, menuId) {
  return `/peta?warung=${stallId}${menuId ? `&menu=${menuId}` : ''}`
}

export function FoodThumb({ menu, size = 'md' }) {
  const [a, b] = CAT_COLORS[menu.category] || CAT_COLORS.tambahan
  if (menu.image_path)
    return <img className={`thumb thumb--${size}`} src={asset(menu.image_path)} alt={menu.menu_name} loading="lazy" />
  return (
    <div className={`thumb thumb--${size}`} style={{ background: `radial-gradient(circle at 30% 25%, ${a}, ${b})` }} aria-hidden>
      <span className="thumb__emoji">{menu.categoryObj?.icon || '🍽️'}</span>
      <span className="thumb__stall">{menu.stall?.stall_name}</span>
    </div>
  )
}

export function StatusBadge({ status }) {
  if (status === 'NEEDS_VERIFICATION') return <span className="badge badge--warn">⚠ {STATUS_LABEL[status]}</span>
  if (status === 'USER_PROVIDED') return <span className="badge badge--info">{STATUS_LABEL[status]}</span>
  return null
}

export function Price({ value, className = '' }) {
  return <span className={`price ${value == null ? 'price--na' : ''} ${className}`}>{formatPrice(value)}</span>
}

export function CompareButton({ id, compact }) {
  const { has, toggle } = useCompare()
  const on = has(id)
  return (
    <button
      type="button"
      className={`btn btn--ghost ${compact ? 'btn--sm' : ''} ${on ? 'is-on' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(id)
      }}
      aria-pressed={on}
    >
      {on ? '✓ Dibandingkan' : '⚖️ Bandingkan'}
    </button>
  )
}

export function MenuCard({ menu }) {
  return (
    <article className="card menu-card">
      <Link to={`/menu/${menu.menu_id}`} className="menu-card__link" aria-label={`Detail ${menu.fullName}`}>
        <FoodThumb menu={menu} />
        <div className="menu-card__body">
          <div className="menu-card__meta">
            <span className="chip chip--cat">
              {menu.categoryObj?.icon} {menu.categoryObj?.name}
            </span>
            <StatusBadge status={menu.verification_status} />
          </div>
          <h3 className="menu-card__name">{menu.menu_name}</h3>
          {menu.menu_variant && <p className="menu-card__variant">{menu.menu_variant}</p>}
          <p className="menu-card__stall">🏪 {menu.stall?.stall_name}</p>
          <Price value={menu.price} />
        </div>
      </Link>
      <div className="menu-card__actions">
        <Link className="btn btn--primary btn--sm" to={`/menu/${menu.menu_id}`}>
          Detail
        </Link>
        <CompareButton id={menu.menu_id} compact />
      </div>
    </article>
  )
}

export function Lightbox({ photo, onClose }) {
  useEffect(() => {
    if (!photo) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [photo, onClose])
  if (!photo) return null
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.description} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={asset(photo.image_path)} alt={photo.description} />
        <figcaption>
          {photo.description} <span className="muted">({photo.photo_id})</span>
        </figcaption>
        <button className="btn btn--primary" onClick={onClose}>
          Tutup
        </button>
      </figure>
    </div>
  )
}

export function PhotoStrip({ photos }) {
  const [open, setOpen] = useState(null)
  if (!photos?.length) return <p className="muted small">Belum ada foto menu.</p>
  return (
    <>
      <div className="photo-strip">
        {photos.map((p) => (
          <button key={p.photo_id} className="photo-strip__item" onClick={() => setOpen(p)} aria-label={`Buka foto: ${p.description}`}>
            <img src={asset(p.image_path)} alt={p.description} loading="lazy" />
          </button>
        ))}
      </div>
      <Lightbox photo={open} onClose={() => setOpen(null)} />
    </>
  )
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <div className="empty__icon">🍽️</div>
      <h3>{title}</h3>
      {children}
    </div>
  )
}
