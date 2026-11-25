import { Link } from 'react-router-dom'
import { Empty } from '../components/ui.jsx'

export default function NotFound() {
  return (
    <div className="container page">
      <Empty title="Halaman tidak ditemukan">
        <Link className="btn btn--primary" to="/">
          Ke Beranda
        </Link>
      </Empty>
    </div>
  )
}
