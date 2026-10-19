import { Navigate, Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Loader from './Loader.jsx'
import { useStore } from '../context/StoreContext.jsx'
export const homeFor = (u) => (u?.role === 'admin' ? '/admin' : u?.role === 'dealer' ? '/dealer' : '/explore')
// The customer website. Dealers and admins are sent to their own dashboards.
export default function SiteLayout() {
  const { user, booting } = useStore()
  if (booting) return <Loader big label="Checking your session…" />
  if (user && user.role !== 'customer') return <Navigate to={homeFor(user)} replace />
  return <div className="shell"><Navbar /><main><Outlet /></main></div>
}
