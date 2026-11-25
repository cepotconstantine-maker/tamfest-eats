import { Link } from 'react-router-dom'
import { menuById, locationText } from '../lib/db.js'
import { useCompare } from '../lib/compare.jsx'
import { FoodThumb, Price, StatusBadge, Empty, mapLink } from '../components/ui.jsx'

export default function Compare() {
  const { ids, remove, clear } = useCompare()
  const items = ids.map((id) => menuById[id]).filter(Boolean)
  const priced = items.filter((m) => m.price != null)
  const cheapest = priced.length > 1 ? Math.min(...priced.map((m) => m.price)) : null

  return (
    <div className="container page">
      <div className="page__head">
        <div>
          <h1>Bandingkan Menu</h1>
          <p className="muted">Pilih sampai 3 menu lewat tombol ⚖️ Bandingkan di kartu menu.</p>
        </div>
        {items.length > 0 && (
          <button className="btn btn--ghost" onClick={clear}>
            Kosongkan
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <Empty title="Belum ada menu yang dipilih">
          <Link className="btn btn--primary" to="/jelajah">
            Pilih menu di Jelajah
          </Link>
        </Empty>
      ) : (
        <div className="compare" style={{ '--cols': items.length }}>
          {items.map((m) => (
            <article key={m.menu_id} className={`card compare__col ${cheapest != null && m.price === cheapest ? 'is-best' : ''}`}>
              {cheapest != null && m.price === cheapest && <span className="compare__best">💰 Termurah</span>}
              <FoodThumb menu={m} />
              <dl>
                <dt>Menu</dt>
                <dd>
                  <Link to={`/menu/${m.menu_id}`}>
                    <b>{m.menu_name}</b>
                  </Link>
                  {m.menu_variant && <div className="muted small">{m.menu_variant}</div>}
                  <StatusBadge status={m.verification_status} />
                </dd>
                <dt>Harga</dt>
                <dd>
                  <Price value={m.price} className="price--lg" />
                </dd>
                <dt>Warung</dt>
                <dd>{m.stall.stall_name}</dd>
                <dt>Kategori</dt>
                <dd>
                  {m.categoryObj?.icon} {m.categoryObj?.name}
                </dd>
                <dt>Lokasi</dt>
                <dd>{locationText(m.stall)}</dd>
              </dl>
              <div className="compare__actions">
                {m.stall.onMap && (
                  <Link className="btn btn--primary btn--sm" to={mapLink(m.stall_id, m.menu_id)}>
                    🗺️ Find on Map
                  </Link>
                )}
                <button className="btn btn--ghost btn--sm" onClick={() => remove(m.menu_id)}>
                  Hapus
                </button>
              </div>
            </article>
          ))}
          {items.length < 3 && (
            <Link to="/jelajah" className="compare__add">
              <span>＋</span>
              Tambah menu
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
