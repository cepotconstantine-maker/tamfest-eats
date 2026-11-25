import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CompareTray from './components/CompareTray.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import Budget from './pages/Budget.jsx'
import FoodDetail from './pages/FoodDetail.jsx'
import Compare from './pages/Compare.jsx'
import RandomPicker from './pages/RandomPicker.jsx'
import MapPage from './pages/MapPage.jsx'
import Stalls from './pages/Stalls.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isMap = pathname.startsWith('/peta')
  return (
    <div className={`app ${isMap ? 'app--map' : ''}`}>
      <ScrollTop />
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jelajah" element={<Explore />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/menu/:id" element={<FoodDetail />} />
          <Route path="/bandingkan" element={<Compare />} />
          <Route path="/acak" element={<RandomPicker />} />
          <Route path="/peta" element={<MapPage />} />
          <Route path="/warung" element={<Stalls />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isMap && <Footer />}
      <CompareTray />
    </div>
  )
}
