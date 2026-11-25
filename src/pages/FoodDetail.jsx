import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { menuById, menus, photoById, locationText } from '../lib/db.js'
import { FoodThumb, Price, StatusBadge, CompareButton, mapLink, Lightbox, Empty } from '../components/ui.jsx'

export default function FoodDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const m = menuById[id]
  const [photo, setPhoto] = useState(null)
  if (!m)
    return (
      <div className="container page">
        <Empty title="Menu tidak ditemukan">
          <Link className="btn btn--primary" to="/jelajah">
            Kembali ke Jelajah
          </Link>
        </Empty>
      </div>
    )
  const s = m.stall
  const variants = menus.filter((x) => x.stall_id === m.stall_id && x.menu_name === m.menu_name && x.menu_id !== m.menu_id)
  const others = menus.filter((x) => x.stall_id === m.stall_id && x.menu_name !== m.menu_name && x.item_type === 'main').slice(0, 8)
  const addons = menus.filter((x) => x.stall_id === m.stall_id && x.item_type === 'addon')
  const src = photoById[m.source_image]

  return (
    <div className="container page detail">
      <button className="btn btn--link back" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/jelajah'))}>
        ← Kembali
      </button>
      <div className="detail__grid">
        <div className="detail__media">
          <FoodThumb menu={m} size="lg" />
          {src && (
            <button className="detail__source" onClick={() => setPhoto(src)}>
              📷 Lihat foto menu asli
            </button>
          )}
        </div>
        <div className="detail__info">
          <div className="chips chips--tight">
            <Link className="chip chip--cat" to={`/jelajah?kategori=${m.category}`}>
              {m.categoryObj?.icon} {m.categoryObj?.name}
            </Link>
            <span className="chip">{m.food_type}</span>
            <StatusBadge status={m.verification_status} />
          </div>
          <h1 className="detail__title">{m.menu_name}</h1>
          {m.menu_variant && <p className="detail__variant">Varian: {m.menu_variant}</p>}
          <Price value={m.price} className="price--xl" />
          {m.description && <p className="detail__desc">{m.description}</p>}

          <div className="stall-box card">
            <div>
              <p className="muted small">Warung</p>
              <h3>{s.stall_name}</h3>
              {s.alternative_names?.length > 0 && <p className="muted small">Juga dikenal: {s.alternative_names.join(', ')}</p>}
              <p className="small">📍 {locationText(s)}</p>
            </div>
            <div className="stall-box__actions">
              {s.onMap ? (
                <Link className="btn btn--primary" to={mapLink(s.stall_id, m.menu_id)}>
                  🗺️ Find on Map
                </Link>
              ) : (
                <span className="muted small">Lokasi warung ini belum ada di denah.</span>
              )}
              <CompareButton id={m.menu_id} />
            </div>
          </div>

          {variants.length > 0 && (
            <div className="detail__block">
              <h3>Varian lain</h3>
              <ul className="menu-list">
                {variants.map((v) => (
                  <li key={v.menu_id}>
                    <Link to={`/menu/${v.menu_id}`}>{v.menu_variant || v.menu_name}</Link>
                    <Price value={v.price} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {addons.length > 0 && (
            <div className="detail__block">
              <h3>Topping & tambahan di warung ini</h3>
              <div className="chips chips--tight">
                {addons.map((a) => (
                  <span key={a.menu_id} className="chip">
                    {a.menu_name} · <Price value={a.price} />
                  </span>
                ))}
              </div>
            </div>
          )}
          {m.notes && (
            <div className="note">
              <b>Catatan data:</b> {m.notes}
            </div>
          )}
          <p className="muted small">
            ID {m.menu_id} · Sumber: {src ? `${src.photo_id} – ${src.description}` : 'informasi pengelola data'}
          </p>
        </div>
      </div>

      {others.length > 0 && (
        <section className="detail__more">
          <div className="section__head">
            <h2>Menu lain di {s.stall_name}</h2>
            <Link className="link" to={`/jelajah?warung=${s.stall_id}`}>
              Semua menu warung →
            </Link>
          </div>
          <ul className="menu-list menu-list--grid">
            {others.map((o) => (
              <li key={o.menu_id}>
                <Link to={`/menu/${o.menu_id}`}>{o.fullName}</Link>
                <Price value={o.price} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <Lightbox photo={photo} onClose={() => setPhoto(null)} />
    </div>
  )
}
