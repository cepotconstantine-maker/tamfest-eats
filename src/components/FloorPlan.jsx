import { useMemo } from 'react'
import { markers, stallById, asset } from '../lib/db.js'

// Kanvas denah bergaya. Koordinat marker (x,y 0–1) diambil dari map.json,
// yaitu posisi label tiap warung pada PDF denah. Kanvas ini meregangkan
// sumbu Y supaya denah yang sangat lebar tetap nyaman dibaca.
export const W = 1600
export const H = 560
const ORIG_H = Math.round((W * 358) / 4141) // rasio gambar denah asli

const BANDS = {
  'Baris Atas': { y0: 0.03, y1: 0.21 },
  'Baris Tengah': { y0: 0.43, y1: 0.61 },
}

function wrap(text, maxChars) {
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 4)
}

function buildCells() {
  const cells = []
  const byZone = (z) => markers.filter((m) => m.zone === z)
  // Baris atas: deret bersambung, batas di titik tengah antar-label
  const top = byZone('Baris Atas').sort((a, b) => a.x - b.x)
  top.forEach((m, i) => {
    const l = i === 0 ? m.x - (top[1].x - m.x) / 2 : (top[i - 1].x + m.x) / 2
    const r = i === top.length - 1 ? Math.min(0.955, m.x + (m.x - top[i - 1].x) / 2) : (m.x + top[i + 1].x) / 2
    cells.push({ m, x0: l, x1: r, ...BANDS['Baris Atas'] })
  })
  // Baris tengah: lebar mengikuti label, tidak saling tumpang
  const mid = byZone('Baris Tengah').sort((a, b) => a.x - b.x)
  mid.forEach((m, i) => {
    const half = Math.max(m.label_width * 0.7, 0.03)
    let l = m.x - half
    let r = m.x + half
    if (i > 0) l = Math.max(l, (mid[i - 1].x + m.x) / 2)
    if (i < mid.length - 1) r = Math.min(r, (m.x + mid[i + 1].x) / 2)
    cells.push({ m, x0: l, x1: r, ...BANDS['Baris Tengah'] })
  })
  // Sisi kiri & kanan: kolom vertikal
  // Urutan atas→bawah mengikuti PDF; tinggi sel diratakan agar label terbaca.
  for (const [zone, x0, x1, top, bottom] of [
    ['Sisi Kiri', 0.006, 0.058, 0.245, 0.735],
    ['Sisi Kanan', 0.958, 0.996, 0.225, 0.63],
  ]) {
    const col = byZone(zone).sort((a, b) => a.y - b.y)
    const step = (bottom - top) / col.length
    col.forEach((m, i) => cells.push({ m, x0, x1, y0: top + i * step, y1: top + (i + 1) * step }))
  }
  return cells
}
const CELLS = buildCells()

export default function FloorPlan({ mode, selectedId, matchIds, onSelect }) {
  const cells = useMemo(() => CELLS, [])

  if (mode === 'asli') {
    return (
      <svg className="floorplan floorplan--orig" viewBox={`0 0 ${W} ${ORIG_H}`} width={W} height={ORIG_H} role="img" aria-label="Denah asli Taman Festival">
        <image href={asset('/map/denah-asli.png')} x="0" y="0" width={W} height={ORIG_H} />
        {markers.map((m) => {
          const s = stallById[m.stall_id]
          const sel = selectedId === m.stall_id
          const dim = matchIds && !matchIds.has(m.stall_id)
          return (
            <g
              key={m.stall_id}
              id={`booth-${m.stall_id}`}
              className={`pin ${sel ? 'is-selected' : ''} ${dim ? 'is-dim' : ''} ${s.menuCount ? 'has-menu' : ''}`}
              transform={`translate(${m.x * W},${m.y * ORIG_H})`}
              onClick={() => onSelect(m.stall_id)}
              role="button"
              tabIndex={0}
              aria-label={`${s.stall_name}, kode ${m.booth_number}`}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(m.stall_id)}
            >
              <circle r={sel ? 9 : 6} />
              {sel && <circle r="16" className="pin__pulse" />}
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <svg className="floorplan" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Denah interaktif Taman Festival">
      <defs>
        <pattern id="tiles" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="rgba(31,77,58,.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={W} height={H} rx="18" className="fp-floor" />
      <rect x="0" y="0" width={W} height={H * 0.84} fill="url(#tiles)" />
      <text x={W * 0.5} y={H * 0.33} className="fp-zone">AREA MAKAN · LORONG</text>
      <text x={W * 0.5} y={H * 0.72} className="fp-zone">AREA MAKAN</text>
      <rect x="0" y={H * 0.86} width={W} height={H * 0.14} className="fp-road" />
      <text x={W / 2} y={H * 0.945} className="fp-road__label">
        JALAN
      </text>
      {cells.map(({ m, x0, x1, y0, y1 }) => {
        const s = stallById[m.stall_id]
        const sel = selectedId === m.stall_id
        const dim = matchIds && !matchIds.has(m.stall_id)
        const w = (x1 - x0) * W - 4
        const h = (y1 - y0) * H - 4
        const maxChars = Math.max(6, Math.floor(w / 7.2))
        const lines = wrap(s.stall_name, maxChars)
        const fs = w < 70 ? 10.5 : 12
        return (
          <g
            key={m.stall_id}
            id={`booth-${m.stall_id}`}
            className={`booth-cell ${sel ? 'is-selected' : ''} ${dim ? 'is-dim' : ''} ${s.menuCount ? 'has-menu' : 'no-menu'}`}
            onClick={() => onSelect(m.stall_id)}
            role="button"
            tabIndex={0}
            aria-label={`${s.stall_name}, kode ${m.booth_number}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(m.stall_id)}
          >
            <rect x={x0 * W + 2} y={y0 * H + 2} width={w} height={h} rx="8" />
            <text x={x0 * W + 2 + w / 2} y={y0 * H + 18} className="booth-cell__code">
              {m.booth_number}
            </text>
            <text className="booth-cell__name" fontSize={fs} x={x0 * W + 2 + w / 2} y={y0 * H + 2 + 26 + (h - 26) / 2 - ((lines.length - 1) * fs * 1.15) / 2 + fs * 0.35}>
              {lines.map((ln, i) => (
                <tspan key={i} x={x0 * W + 2 + w / 2} dy={i === 0 ? 0 : fs * 1.15}>
                  {ln}
                </tspan>
              ))}
            </text>
            {sel && <rect x={x0 * W - 3} y={y0 * H - 3} width={w + 10} height={h + 10} rx="11" className="booth-cell__ring" />}
          </g>
        )
      })}
    </svg>
  )
}
