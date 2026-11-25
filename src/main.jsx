import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/bricolage-grotesque'
import './styles.css'
import App from './App.jsx'
import { CompareProvider } from './lib/compare.jsx'

// VITE_HASH_ROUTER=1 → URL pakai "#/" (berguna untuk hosting statis tanpa rewrite).
// Default: BrowserRouter (URL bersih, Vercel memakai vercel.json untuk rewrite).
const Router = import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router basename={import.meta.env.VITE_HASH_ROUTER === '1' ? undefined : import.meta.env.BASE_URL}>
      <CompareProvider>
        <App />
      </CompareProvider>
    </Router>
  </StrictMode>,
)
