import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { stallById, stalls, categories, searchStalls, menus } from '../lib/db.js'
import FloorPlan from '../components/FloorPlan.jsx'
import StallPanel from '../components/StallPanel.jsx'

// Skala awal: seluruh lebar denah terlihat (desktop); di HP minimal 0.38 agar label masih terbaca.
function fitScale() {
  const w = typeof window === 'undefined' ? 1200 : window.innerWidth
  const fit = (w - (w >= 900 ? 60 : 24)) / 1680
  return w < 760 ? Math.max(0.38, fit) : Math.min(1, fit)
}

export default function MapPage() {
  const [sp, setSp] = useSearchParams()
  const selectedId = sp.get('warung') || null
  const menuId = sp.get('menu') || null
  const cat = sp.get('kategori') || ''
  const mode = sp.get('mode') === 'asli' ? 'asli' : 'gaya'
  const [q, setQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showUnplaced, setShowUnplaced] = useState(false)
  const api = useRef(null)
  const ready = useRef(false)

  const setParam = useCallback(
    (patch) => {
      const next = new URLSearchParams(sp)
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v)
        else next.delete(k)
      }
      setSp(next, { replace: true })
    },
    [sp, setSp],
  )

  // Warung yang cocok dengan kategori / pencarian → yang lain diredupkan
  const matchIds = useMemo(() => {
    let set = null
    if (cat) set = new Set(menus.filter((m) => m.category === cat).map((m) => m.stall_id))
    if (q.trim()) {
      const qs = new Set(searchStalls(q).map((s) => s.stall_id))
      const t = q.toLowerCase()
      menus.forEach((m) => m.menu_name.toLowerCase().includes(t) && qs.add(m.stall_id))
      set = set ? new Set([...set].filter((x) => qs.has(x))) : qs
    }
    return set
  }, [cat, q])

  const results = useMemo(() => {
    if (!q.trim()) return []
    const t = q.toLowerCase()
    const byName = searchStalls(q)
    const byMenu = stalls.filter((s) => !byName.includes(s) && menus.some((m) => m.stall_id === s.stall_id && m.menu_name.toLowerCase().includes(t)))
    return [...byName, ...byMenu].slice(0, 8)
  }, [q])

  const focus = useCallback((id, animate = true) => {
    const el = document.getElementById(`booth-${id}`)
    if (el && api.current) api.current.zoomToElement(el, window.innerWidth < 760 ? 1.5 : 1.3, animate ? 500 : 0)
  }, [])

  const select = (id, extra = {}) => {
    setParam({ warung: id, menu: extra.menu || null })
    setExpanded(false)
    setSearchOpen(false)
    setShowUnplaced(false)
    if (stallById[id]?.onMap) setTimeout(() => focus(id), 30)
  }

  // Deep-link (?warung=…&menu=…) dari tombol Find on Map
  useEffect(() => {
    if (!ready.current) return
    if (selectedId && stallById[selectedId]?.onMap) focus(selectedId)
  }, [mode]) // eslint-disable-line
  const onInit = (ref) => {
    api.current = ref
    ready.current = true
    if (selectedId && stallById[selectedId]?.onMap) setTimeout(() => focus(selectedId, false), 80)
  }

  const stall = selectedId ? stallById[selectedId] : null
  const unplaced = stalls.filter((s) => !s.onMap)

  return (
    <div className={`map-page ${stall ? 'has-panel' : ''}`}>
      <div className="map-toolbar">
        <div className="map-search">
          <div className="search search--inline">
            <span aria-hidden>🔍</span>
            <input
              type="search"
              value={q}
              placeholder="Cari warung atau menu di peta…"
              onChange={(e) => {
                setQ(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              aria-label="Cari warung di peta"
            />
          </div>
          {searchOpen && results.length > 0 && (
            <ul className="map-search__results" role="listbox">
              {results.map((s) => (
                <li key={s.stall_id}>
                  <button onClick={() => select(s.stall_id)}>
                    <span className="booth booth--sm">{s.booth_number || '—'}</span>
                    <span>
                      {s.stall_name}
                      {!s.onMap && <em className="muted small"> · belum di denah</em>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="map-cats" role="toolbar" aria-label="Filter kategori di peta">
          <button className={`chip chip--toggle ${!cat ? 'is-on' : ''}`} onClick={() => setParam({ kategori: null })}>
            Semua
          </button>
          {categories
            .filter((c) => c.category_id !== 'tambahan')
            .map((c) => (
              <button key={c.category_id} className={`chip chip--toggle ${cat === c.category_id ? 'is-on' : ''}`} onClick={() => setParam({ kategori: cat === c.category_id ? null : c.category_id })}>
                {c.icon} {c.name}
              </button>
            ))}
        </div>
      </div>

      <div className="map-stage">
        <TransformWrapper minScale={0.15} maxScale={6} initialScale={fitScale()} centerOnInit limitToBounds={false} wheel={{ step: 0.15 }} doubleClick={{ mode: 'zoomIn' }} onInit={onInit}>
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <>
              <div className="map-controls">
                <button className="icon-btn" onClick={() => zoomIn()} aria-label="Perbesar">
                  ＋
                </button>
                <button className="icon-btn" onClick={() => zoomOut()} aria-label="Perkecil">
                  －
                </button>
                <button
                  className="icon-btn"
                  onClick={() => {
                    resetTransform()
                    setTimeout(() => centerView(fitScale()), 10)
                  }}
                  aria-label="Tampilkan seluruh denah"
                  title="Seluruh denah"
                >
                  ⤢
                </button>
              </div>
              <TransformComponent wrapperClass="map-wrap" contentClass="map-content">
                <FloorPlan mode={mode} selectedId={selectedId} matchIds={matchIds} onSelect={(id) => select(id)} />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>

        <div className="map-bottom-left">
          <div className="seg" role="group" aria-label="Tampilan denah">
            <button className={mode === 'gaya' ? 'is-on' : ''} onClick={() => setParam({ mode: null })}>
              Denah interaktif
            </button>
            <button className={mode === 'asli' ? 'is-on' : ''} onClick={() => setParam({ mode: 'asli' })}>
              Denah asli (PDF)
            </button>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={() => setShowUnplaced((v) => !v)} aria-expanded={showUnplaced}>
            📌 Belum di denah ({unplaced.length})
          </button>
          {showUnplaced && (
            <div className="unplaced card">
              <p className="small muted">Warung ini ada di daftar, tapi posisinya belum terlihat di denah PDF.</p>
              <ul>
                {unplaced.map((s) => (
                  <li key={s.stall_id}>
                    <button className="btn btn--link btn--sm" onClick={() => select(s.stall_id)}>
                      {s.stall_name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="legend small">
            <span>
              <i className="lg lg--menu" /> Ada menu
            </span>
            <span>
              <i className="lg lg--nomenu" /> Menu belum didata
            </span>
            <span>
              <i className="lg lg--sel" /> Dipilih
            </span>
          </div>
        </div>

        {stall && (
          <StallPanel
            stall={stall}
            menuId={menuId}
            expanded={expanded}
            onToggle={() => setExpanded((e) => !e)}
            onClose={() => setParam({ warung: null, menu: null })}
          />
        )}
      </div>
    </div>
  )
}
