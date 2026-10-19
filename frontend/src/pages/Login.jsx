import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { CITIES } from '../data/options.js'
import { homeFor } from '../components/SiteLayout.jsx'

export default function Login() {
  const { user, login, register, logout } = useStore(); const nav = useNavigate()
  const [mode, setMode] = useState('login'); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'customer', businessName: '', phone: '', address: '', city: 'Anand' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.')
    if (f.password.length < 6) return setErr('Password needs at least 6 characters.')
    if (mode === 'register' && (!f.name || (f.role === 'dealer' && !f.businessName))) return setErr('Fill in all required fields.')
    setBusy(true); setErr('')
    try {
      const u = mode === 'login' ? await login(f.email, f.password) : await register({ name: f.name, email: f.email, password: f.password, role: f.role, ...(f.role === 'dealer' && { businessName: f.businessName, phone: f.phone, address: f.address, city: f.city }) })
      nav(homeFor(u))
    } catch (x) { setErr(x.message) }
    setBusy(false)
  }
  if (user) return (<><PageHeader title={`Hi, ${user.name}`} /><div className="card"><p>Signed in as <b>{user.role}</b>.</p><button className="pill dark" onClick={() => { logout(); nav('/') }}>Log out</button></div></>)
  return (
    <>
      <PageHeader title={mode === 'login' ? 'Login' : 'Register'} />
      <div className="layout two-col">
        <form className="card advisor one" onSubmit={submit}>
          <div className="row"><button type="button" className={`pill ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button><button type="button" className={`pill ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button></div>
          {mode === 'register' && <label>Name<input value={f.name} onChange={set('name')} /></label>}
          <label>Email<input value={f.email} onChange={set('email')} placeholder="you@email.com" autoComplete="email" /></label>
          <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {mode === 'register' && <label>Account type<select value={f.role} onChange={set('role')}><option value="customer">Customer</option><option value="dealer">Dealer (needs admin approval)</option></select></label>}
          {mode === 'register' && f.role === 'dealer' && <><label>Dealership name<input value={f.businessName} onChange={set('businessName')} /></label><label>Phone<input value={f.phone} onChange={set('phone')} /></label><label>Address<input value={f.address} onChange={set('address')} /></label><label>City<select value={f.city} onChange={set('city')}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></label></>}
          {err && <p className="error" role="alert">{err}</p>}<button className="pill dark" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
        <div className="card"><h3>Demo accounts (after `npm run seed:fresh`)</h3><p className="muted">customer@demo.in / demo123<br />dealer@demo.in / demo123<br />admin@demo.in / admin123</p><p className="muted small">Passwords are hashed with bcrypt and sessions use a JWT. Admin accounts cannot be created from this form.</p></div>
      </div>
    </>
  )
}
