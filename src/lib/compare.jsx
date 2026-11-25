import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const KEY = 'tamfest-compare'
const MAX = 3
const Ctx = createContext(null)

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? v.slice(0, MAX) : []
  } catch {
    return []
  }
}

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(load)
  const [toast, setToast] = useState('')
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids))
    } catch {
      /* storage tidak tersedia — tetap jalan di memori */
    }
  }, [ids])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const toggle = useCallback((id) => {
    setIds((cur) => {
      if (cur.includes(id)) {
        setToast('Dihapus dari perbandingan')
        return cur.filter((x) => x !== id)
      }
      if (cur.length >= MAX) {
        setToast('Maksimal 3 menu. Hapus salah satu dulu.')
        return cur
      }
      setToast(`Ditambahkan ke perbandingan (${cur.length + 1}/3)`)
      return [...cur, id]
    })
  }, [])
  const remove = useCallback((id) => setIds((c) => c.filter((x) => x !== id)), [])
  const clear = useCallback(() => setIds([]), [])

  return <Ctx.Provider value={{ ids, toggle, remove, clear, has: (id) => ids.includes(id), max: MAX, toast }}>{children}</Ctx.Provider>
}

export const useCompare = () => useContext(Ctx)
