import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { useStore } from '../context/StoreContext.jsx'
// Shell for Dealer / Admin: only their own pages
export default function PortalLayout() {
  const { user, logout } = useStore(); const nav = useNavigate()
  const base = user.role === 'admin' ? '/admin' : '/dealer'
  const cls = ({ isActive }) => `pill ${isActive ? 'active' : ''}`
  return (
    <div className="shell">
      <header className="nav"><Logo />
        <nav className="nav-pills"><NavLink end to={base} className={cls}>{user.role === 'admin' ? 'Admin Dashboard' : 'Dealer Dashboard'}</NavLink><NavLink to={`${base}/tasks`} className={cls}>My Tasks</NavLink></nav>
        <span className="muted small">{user.name} · {user.role}</span><button className="pill dark" onClick={() => { logout(); nav('/') }}>Log out</button></header>
      <main><Outlet /></main>
    </div>
  )
}
