import { Link, Outlet } from 'react-router-dom'
import Logo from './Logo.jsx'
export default function AuthLayout() {
  return <div className="shell"><header className="nav"><Logo /><span className="grow" /><Link to="/" className="pill">← Back to home</Link></header><main><Outlet /></main></div>
}
