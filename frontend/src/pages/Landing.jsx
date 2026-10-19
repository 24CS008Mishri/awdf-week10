import { Link, Navigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import CarArt from '../components/CarArt.jsx'
import { homeFor } from '../components/SiteLayout.jsx'
import { useStore } from '../context/StoreContext.jsx'
import useAsync from '../hooks/useAsync.js'
import { api } from '../services/api.js'

const FEATURES = [['Explore Cars', 'Filter by company, price, fuel, safety and features. Sort by newest, mileage or dealer-reported trending.'], ['AI Car Advisor', 'Tell us your budget and priorities and get your top five matches with a clear verdict.'], ['Car Comparison', 'Put two to four cars side by side with category-wise verdicts.'], ['Price Analysis', 'Daily, monthly and yearly average dealer prices, from real observations, no guesses.'], ['Best Dealers', 'Dealers ranked by effective price in your city, with the full price breakdown.'], ['Wishlist & Tasks', 'Save cars, track price changes and keep a to-do list for your car search.']]
const STEPS = [['01', 'Discover', 'Browse the catalogue or let the Advisor shortlist cars for you.'], ['02', 'Understand', 'See specs, price history and an AI overview built only from verified data.'], ['03', 'Decide', 'Compare cars and pick the dealer with the best effective price.']]

export default function Landing() {
  const { user, booting } = useStore()
  const { data } = useAsync(() => api.get('/stats'), [])
  if (!booting && user && user.role !== 'customer') return <Navigate to={homeFor(user)} replace />
  const s = data?.data
  return (
    <div className="shell land">
      <header className="nav"><Logo />
        <nav className="nav-pills" aria-label="Sections"><a className="pill" href="#features">Features</a><a className="pill" href="#how">How it works</a><a className="pill" href="#roles">For dealers</a></nav>
        {user ? <Link to="/explore" className="pill dark">Continue exploring</Link> : <Link to="/login" className="pill dark">Login / Register</Link>}
      </header>
      <section className="hero-l">
        <div>
          <span className="chip">AI-powered car discovery</span>
          <h1>Find the right car at the right price.</h1>
          <p className="lead">AutoAdvisor brings specs, price history and dealer offers into one place, so you can compare, shortlist and buy with confidence.</p>
          <div className="row"><Link to="/explore" className="pill dark big-cta">Explore Cars →</Link><Link to="/advisor" className="pill big-cta">Try the AI Advisor</Link></div>
          <div className="kpis"><div><b>{s ? `${s.cars}+` : '—'}</b><small>car models</small></div><div><b>{s ? s.dealers : '—'}</b><small>approved dealers</small></div><div><b>{s ? s.manufacturers : '—'}</b><small>manufacturers</small></div></div>
        </div>
        <div className="card hero-card">
          <div className="stage sm"><CarArt color="#2f6f4f" body="SUV" /><i className="dot" style={{ left: '22%', top: '55%' }} /><i className="dot" style={{ left: '48%', top: '30%' }} /><i className="dot" style={{ left: '78%', top: '55%' }} /></div>
          <div className="float f1"><small>Best dealer</small><b>Lowest effective price</b></div><div className="float f2"><small>Price trend</small><b>Daily · Monthly · Yearly</b></div><div className="float f3"><small>Safety</small><b>5★</b></div>
        </div>
      </section>
      <section id="features"><h2 className="sec">Everything you need to decide</h2>
        <div className="grid">{FEATURES.map(([t, d], i) => <div className="card" key={t}><span className="num dk">{i + 1}</span><h3>{t}</h3><p className="muted">{d}</p></div>)}</div></section>
      <section id="how"><h2 className="sec">How it works</h2>
        <div className="grid">{STEPS.map(([n, t, d]) => <div className="card" key={n}><b className="step">{n}</b><h3>{t}</h3><p className="muted">{d}</p></div>)}</div></section>
      <section id="roles"><h2 className="sec">Built for everyone in the car market</h2>
        <div className="grid">
          <div className="card"><h3>Customers</h3><p className="muted">Explore, compare, save and find the best dealer.</p><Link to="/explore" className="pill dark">Explore Cars</Link></div>
          <div className="card"><h3>Dealers</h3><p className="muted">List cars, set prices and offers, and report daily sales after admin approval.</p><Link to="/login" className="pill">Dealer login / register</Link></div>
          <div className="card"><h3>Admins</h3><p className="muted">Manage the catalogue, approve dealers and keep the data clean.</p><Link to="/login" className="pill">Admin login</Link></div>
        </div></section>
      <footer className="foot"><Logo /><span className="muted small">AutoAdvisor · Prices are ex-showroom unless stated. Sales figures are dealer-reported.</span></footer>
    </div>
  )
}
