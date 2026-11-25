import { NavLink, Link } from 'react-router-dom'
import { useCompare } from '../lib/compare.jsx'

const LINKS = [
  { to: '/', label: 'Beranda', icon: '🏠', end: true },
  { to: '/jelajah', label: 'Jelajah', icon: '🍽️' },
  { to: '/peta', label: 'Peta', icon: '🗺️' },
  { to: '/budget', label: 'Budget', icon: '💸' },
  { to: '/warung', label: 'Warung', icon: '🏪' },
  { to: '/acak', label: 'Acak', icon: '🎲' },
]

export default function Navbar() {
  const { ids } = useCompare()
  return (
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand" aria-label="TAMFEST EATS beranda">
            <span className="brand__mark">TF</span>
            <span className="brand__text">
              TAMFEST <b>EATS</b>
            </span>
          </Link>
          <nav className="topnav" aria-label="Navigasi utama">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="topnav__link">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <NavLink to="/bandingkan" className="compare-btn" aria-label="Bandingkan menu">
            ⚖️ <span className="hide-sm">Bandingkan</span>
            {ids.length > 0 && <span className="pill-count">{ids.length}</span>}
          </NavLink>
        </div>
      </header>
      <nav className="tabbar" aria-label="Navigasi bawah">
        {LINKS.filter((l) => l.to !== '/warung').map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className="tabbar__link">
            <span className="tabbar__icon" aria-hidden>
              {l.icon}
            </span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
