import { Link, useLocation } from 'react-router-dom'
import { useCompare } from '../lib/compare.jsx'

export default function CompareTray() {
  const { ids, toast } = useCompare()
  const { pathname } = useLocation()
  const show = ids.length > 0 && pathname !== '/bandingkan' && !pathname.startsWith('/peta')
  return (
    <>
      {show && (
        <Link to="/bandingkan" className="compare-tray">
          ⚖️ Bandingkan {ids.length}/3 menu →
        </Link>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  )
}
