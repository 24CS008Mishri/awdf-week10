import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { Tabs, Row } from '../components/Bits.jsx'
import useAsync from '../hooks/useAsync.js'
import { api } from '../services/api.js'
import { lakh } from '../utils/format.js'

const PANELS = { Overview, Cars, Dealers, 'Offers & Prices': Offers, 'Sales Reports': Sales, Users }
const TABS = ['Overview', 'Cars', 'Dealers', 'Offers & Prices', 'Sales Reports', 'Users']
export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const Panel = PANELS[tab] // rendered as a component so each tab keeps its own hooks
  return (
    <>
      <PageHeader noBack title="Admin Dashboard" />
      <section className="rpanel wide"><Tabs items={TABS.map((t) => [t, null])} value={tab} onChange={setTab} />
        <div className="rbody"><Panel /></div></section>
    </>
  )
}
// Small helper: loads one endpoint with loading / error handling
function Load({ path, children }) {
  const { data, loading, error, reload } = useAsync(() => api.get(path), [path])
  if (error) return <ErrorMessage message={error} onRetry={reload} />
  if (!data) return <Loader label="Loading…" />
  return children(data.data, reload)
}
const useAct = () => { const [err, setErr] = useState(''); return [err, (fn, reload) => async () => { setErr(''); try { await fn(); reload() } catch (e) { setErr(e.message) } }, <>{err && <p className="error" role="alert">{err}</p>}</>] }

function Overview() {
  return <Load path="/admin/overview">{(d) => <>
    <div className="stats">{[['Car models', d.cars], ['Variants', d.variants], ['Manufacturers', d.manufacturers], ['Customers', d.customers], ['Dealers', d.dealers], ['Pending approvals', d.pendingDealers], ['Active listings', d.activeListings], ['Current offers', d.currentOffers], ['Price updates', d.priceUpdates]].map(([k, v]) => <div className="card stat" key={k}><small className="muted">{k}</small><b>{v}</b></div>)}</div>
    <h4>Recent price updates</h4>{d.recentPriceUpdates.length ? d.recentPriceUpdates.map((p, i) => <Row key={i} n={i + 1} title={p.car} sub={new Date(p.at).toLocaleString()} right={`${p.previous != null ? lakh(p.previous) : 'new'} → ${lakh(p.price)}`} />) : <p className="empty">None yet.</p>}
    <h4>Recent sales reports (dealer-reported)</h4>{d.recentSalesReports.map((s, i) => <Row key={i} n={i + 1} title={`${s.car} · ${s.units} units`} sub={`${s.day}${s.flagged ? ' · flagged' : ''}`} />)}
    <Load path="/admin/freshness">{(f) => <p className="muted small">Data freshness · last listing update {f.lastListingUpdate ? new Date(f.lastListingUpdate).toLocaleString() : '—'} · last sales report {f.lastSalesReport ? new Date(f.lastSalesReport).toLocaleString() : '—'} · last price snapshot {f.lastPriceSnapshotDay || '—'} · stale listings (7d+): {f.staleListings}</p>}</Load>
  </>}</Load>
}

const blank = { company: '', model: '', variant: '', year: 2024, price: '', fuel: 'Petrol', transmission: 'Manual', mileage: '', body: 'SUV', seats: 5, safety: 3, power: '', features: '', colors: '', variantsText: '' }
function Cars() {
  const { data, error, reload } = useAsync(() => api.get('/cars', { limit: 100, sort: 'new' }), [])
  const [f, setF] = useState(blank); const [editId, setEditId] = useState(null); const [msg, setMsg] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const list = (s) => String(s).split(',').map((x) => x.trim()).filter(Boolean)
  const save = async (e) => {
    e.preventDefault(); setMsg('')
    const variants = list(f.variantsText).map((p) => { const [name, price] = p.split(':'); return { name: name.trim(), price: Number(price) } })
    const body = { company: f.company, model: f.model, variant: f.variant, year: +f.year, price: +f.price, fuel: f.fuel, transmission: f.transmission, body: f.body, seats: +f.seats, safety: +f.safety, features: list(f.features), colors: list(f.colors), ...(f.mileage !== '' && f.mileage != null && { mileage: +f.mileage }), ...(f.power !== '' && f.power != null && { power: +f.power }), ...(variants.length && { variants }) }
    try { editId ? await api.put(`/cars/${editId}`, body) : await api.post('/cars', body); setF(blank); setEditId(null); reload() } catch (x) { setMsg(x.message) }
  }
  const del = async (c) => { setMsg(''); try { await api.del(`/cars/${c.id}`); reload() } catch (x) { setMsg(x.message) } }
  if (error) return <ErrorMessage message={error} onRetry={reload} />
  return <>
    <form className="advisor" onSubmit={save}>
      {[['company', 'Company'], ['model', 'Model'], ['variant', 'Listed variant'], ['year', 'Year', 'number'], ['price', 'Price ₹L', 'number'], ['mileage', 'Mileage', 'number'], ['seats', 'Seats', 'number'], ['safety', 'Safety ★', 'number'], ['power', 'Power bhp', 'number']].map(([k, l, t]) => <label key={k}>{l}<input type={t || 'text'} step="any" value={f[k] ?? ''} onChange={set(k)} /></label>)}
      <label>Fuel<select value={f.fuel} onChange={set('fuel')}>{['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Transmission<select value={f.transmission} onChange={set('transmission')}><option>Manual</option><option>Automatic</option></select></label>
      <label>Body<select value={f.body} onChange={set('body')}>{['SUV', 'Sedan', 'Hatchback', 'MPV'].map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Features (comma separated)<input value={f.features} onChange={set('features')} /></label><label>Colours (comma separated)<input value={f.colors} onChange={set('colors')} /></label>
      <label>Variants (name:price, ...)<input value={f.variantsText} onChange={set('variantsText')} placeholder="S:12.5, SX:15.8" /></label>
      <button className="pill dark">{editId ? 'Update car' : 'Add car'}</button>{editId && <button type="button" className="pill" onClick={() => { setEditId(null); setF(blank) }}>Cancel</button>}</form>
    {msg && <p className="error" role="alert">{msg}</p>}
    {!data ? <Loader label="Loading cars…" /> : data.data.map((c, i) => <Row key={c.id} n={i + 1} title={`${c.company} ${c.model} ${c.variant}`} sub={`${c.year} · ${c.fuel} · ${lakh(c.price)} · ${c.variants.length} variants`} right={<><button className="pill sm" onClick={() => { setEditId(c.id); setF({ ...blank, ...c, features: c.features.join(', '), colors: c.colors.join(', '), variantsText: c.variants.map((v) => `${v.name}:${v.price}`).join(', '), mileage: c.mileage ?? '', power: c.power ?? '' }) }}>Edit</button> <button className="pill sm" onClick={() => del(c)}>Delete</button></>} />)}
  </>
}
function Dealers() {
  const [msg, act, box] = useAct()
  return <Load path="/admin/dealers">{(rows, reload) => <>{box}{rows.map((d, i) => <Row key={d.id} n={i + 1} title={d.businessName} sub={`${d.city} · ${d.contactPerson || '—'} · ${d.status}${d.rating != null ? ` · ★${d.rating}` : ''}`} right={<>{d.status !== 'approved' && <button className="pill sm" onClick={act(() => api.patch(`/admin/dealers/${d.id}/status`, { status: 'approved' }), reload)}>Approve</button>} {d.status === 'pending' && <button className="pill sm" onClick={act(() => api.patch(`/admin/dealers/${d.id}/status`, { status: 'rejected' }), reload)}>Reject</button>} {d.status === 'approved' && <button className="pill sm" onClick={act(() => api.patch(`/admin/dealers/${d.id}/status`, { status: 'suspended' }), reload)}>Suspend</button>}</>} />)}</>}</Load>
}
function Offers() {
  const [, act, box] = useAct()
  return <>
    <Load path="/admin/offers">{(rows, reload) => <>{box}<h4>Offers</h4>{rows.map((o, i) => <Row key={o.id} n={i + 1} title={`${o.car} · −${lakh(o.discount)}`} sub={`${o.dealerName} · ${o.validFrom} → ${o.validTo} · ${o.status}`} right={o.status === 'active' ? <button className="pill sm" onClick={act(() => api.patch(`/admin/offers/${o.id}/expire`), reload)}>Expire</button> : 'Expired'} />)}</>}</Load>
    <Load path="/admin/price-updates">{(rows) => <><h4>Price update history (audit trail)</h4>{rows.length === 0 ? <p className="empty">No price changes recorded yet.</p> : rows.map((p, i) => <Row key={p.id} n={i + 1} title={`${p.car} ${p.variant || ''}`} sub={`${p.dealer} · ${new Date(p.at).toLocaleString()}${p.suspicious ? ' · ⚠ unusual price' : ''}`} right={`${p.previous != null ? lakh(p.previous) : 'new'} → ${lakh(p.price)}`} />)}</>}</Load>
    <Load path="/admin/audit">{(rows) => <><h4>Admin audit log</h4>{rows.length === 0 ? <p className="empty">No admin changes yet.</p> : rows.slice(0, 10).map((a, i) => <Row key={a.id} n={i + 1} title={`${a.action} · ${a.entity}`} sub={`${a.actor?.name || 'admin'} · ${new Date(a.createdAt).toLocaleString()}`} />)}</>}</Load>
  </>
}
function Sales() {
  const [, act, box] = useAct()
  return <Load path="/admin/sales">{(rows, reload) => <>{box}{rows.map((s, i) => <Row key={s.id} n={i + 1} title={`${s.car} · ${s.units} units (dealer-reported)`} sub={`${s.dealer} · ${s.day}${s.corrections ? ` · corrected ${s.corrections}×` : ''}${s.flagged ? ` · flagged: ${s.flagReason}` : ''}`} right={<><button className="pill sm" onClick={act(() => api.patch(`/admin/sales/${s.id}/flag`, { flagged: !s.flagged, reason: 'Suspicious value' }), reload)}>{s.flagged ? 'Unflag' : 'Flag'}</button> <button className="pill sm" onClick={act(async () => { const u = window.prompt('Corrected units (whole number)', s.units); if (u === null) return; const reason = window.prompt('Reason for correction (kept in the audit log)'); if (!reason) return; await api.patch(`/admin/sales/${s.id}`, { units: Number(u), reason }) }, reload)}>Correct</button></>} />)}</>}</Load>
}
function Users() {
  const [, act, box] = useAct()
  return <Load path="/admin/users">{(rows, reload) => <>{box}{rows.map((u, i) => <Row key={u.id} n={i + 1} title={u.name} sub={`${u.email} · ${u.role}${u.dealerProfile ? ` · ${u.dealerProfile.status}` : ''}${u.active ? '' : ' · suspended'}`} right={u.role === 'admin' ? 'Protected' : <button className="pill sm" onClick={act(() => api.patch(`/admin/users/${u.id}/status`, { active: !u.active }), reload)}>{u.active ? 'Suspend' : 'Activate'}</button>} />)}</>}</Load>
}
