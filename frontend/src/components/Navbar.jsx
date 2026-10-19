import { NavLink, Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'

const base = [['/explore', 'Explore Cars'], ['/advisor', 'AI Car Advisor'], ['/compare', 'Car Comparison'], ['/wishlist', 'Wishlist / Favorites']]
export default function Navbar() {
  const { wishlist, compare, user } = useStore()
  const links = user ? [...base, ['/tasks', 'My Tasks']] : base
  const count = { '/compare': compare.length, '/wishlist': wishlist.length }
  const home = user?.role === 'admin' ? '/admin' : user?.role === 'dealer' ? '/dealer' : null
  return (
    <header className="nav">
      <Link to="/" className="logo" aria-label="AutoAdvisor home">
        <svg width="34" height="34" viewBox="0 0 32 32"><path d="M16 3v9M16 20v9M3 16h9M20 16h9" stroke="#16231a" strokeWidth="2.6" strokeLinecap="round" /></svg>
      </Link>
      <nav className="nav-pills" aria-label="Main">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `pill ${isActive ? 'active' : ''}`}>{label}{count[to] > 0 && <i className="badge">{count[to]}</i>}</NavLink>
        ))}
        {home && <NavLink to={home} className={({ isActive }) => `pill ${isActive ? 'active' : ''}`}>Dashboard</NavLink>}
      </nav>
      <div className="nav-right">
        <Link to="/wishlist" className="round" aria-label="Wishlist">♥</Link>
        <Link to="/compare" className="round" aria-label="Comparison">☰</Link>
        {user ? <Link to="/login" className="avatar" title={`${user.name} (${user.role})`}>{user.name[0]}</Link> : <Link to="/login" className="pill dark">Login / Register</Link>}
      </div>
    </header>
  )
}
