import { Link } from 'react-router-dom'
import { stats, asset } from '../lib/db.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <div className="brand brand--footer">
            <span className="brand__mark">TF</span>
            <span className="brand__text">
              TAMFEST <b>EATS</b>
            </span>
          </div>
          <p className="muted">Your Food, Your Budget, Your Choice.</p>
          <p className="muted small">
            Direktori makanan Taman Festival (Tamansari Food Fest). Bukan layanan pemesanan atau pembayaran.
          </p>
        </div>
        <div className="footer__links">
          <Link to="/jelajah">Jelajah Menu</Link>
          <Link to="/peta">Peta Foodcourt</Link>
          <Link to="/budget">Cari Sesuai Budget</Link>
          <Link to="/warung">Daftar Warung</Link>
          <a href={asset('/map/Map-Tamfest.pdf')} target="_blank" rel="noreferrer">
            Denah PDF asli
          </a>
        </div>
        <p className="muted small footer__note">
          Data: {stats.menus} menu dari {stats.stallsWithMenu} warung, disalin dari foto papan menu. Harga bisa berubah
          sewaktu-waktu. Item bertanda <span className="badge badge--warn">Perlu verifikasi</span> belum dipastikan.
        </p>
      </div>
    </footer>
  )
}
