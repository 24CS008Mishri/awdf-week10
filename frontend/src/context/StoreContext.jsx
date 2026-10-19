import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, setUnauthorizedHandler } from '../services/api.js'
const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(!!getToken())
  const [wishlist, setWishlist] = useState([])   // car ids saved by the logged-in customer (stored in MongoDB)
  const [compare, setCompare] = useState([])     // car ids (session only)
  const [catalogue, setCatalogue] = useState([]) // all cars, for dropdowns and lookups

  useEffect(() => { setUnauthorizedHandler(() => { setUser(null); setWishlist([]) }) }, [])
  useEffect(() => {
    if (!getToken()) return
    api.get('/auth/me').then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setBooting(false))
  }, [])
  useEffect(() => { api.get('/cars', { limit: 100 }).then((r) => setCatalogue(r.data)).catch(() => {}) }, [])
  useEffect(() => {
    if (user?.role === 'customer') api.get('/favorites/ids').then((r) => setWishlist(r.data)).catch(() => {})
    else setWishlist([])
  }, [user?.id, user?.role])

  const finish = (r) => { setToken(r.token); setUser(r.user); return r.user }
  const value = {
    user, booting, wishlist, compare, catalogue,
    login: async (email, password) => finish(await api.post('/auth/login', { email, password })),
    register: async (payload) => finish(await api.post('/auth/register', payload)),
    logout: () => { setToken(null); setUser(null); setWishlist([]) },
    refreshUser: () => api.get('/auth/me').then((r) => setUser(r.user)),
    /** returns 'login' when the visitor must log in first */
    toggleWish: async (id) => {
      if (!user) return 'login'
      const on = wishlist.includes(id)
      setWishlist((w) => (on ? w.filter((x) => x !== id) : [...w, id])) // optimistic
      try { on ? await api.del(`/favorites/${id}`) : await api.post(`/favorites/${id}`) } catch { setWishlist((w) => (on ? [...w, id] : w.filter((x) => x !== id))) }
      return null
    },
    toggleCompare: (id) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 4 ? c : [...c, id])),
    clearCompare: () => setCompare([]),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
