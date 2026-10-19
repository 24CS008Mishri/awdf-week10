import { Navigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import Loader from './Loader.jsx'
import { homeFor } from './SiteLayout.jsx'
// Client-side guard only; the Express API enforces roles again on every request
export default function ProtectedRoute({ roles, children }) {
  const { user, booting } = useStore()
  if (booting) return <Loader big label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />
  return children
}
