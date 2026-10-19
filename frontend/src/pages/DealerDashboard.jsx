import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { Tabs, Row } from '../components/Bits.jsx'
import { useStore } from '../context/StoreContext.jsx'
import useAsync from '../hooks/useAsync.js'
import { api } from '../services/api.js'
import { todayStr } from '../utils/date.js'
import { lakh } from '../utils/format.js'

const load = () => Promise.all([api.get('/dealer/profile'), api.get('/dealer/listings'), api.get('/dealer/offers'), api.get('/dealer/sales'), api.get('/dealer/sales/summary'), api.get('/dealer/price-history')])
  .then(([p, l, o, s, sm, ph]) => ({ profile: p.data, listings: l.data, offers: o.data, sales: s.data, summary: sm.data, priceLog: ph.data }))

export default function DealerDashboard() {
  const { catalogue, refreshUser } = useStore()
  const { data, loading, error, reload } = useAsync(load, [])
  const [tab, setTab] = useState('Listings & Offers'); const [per, setPer] = useState('today'); const [err, setErr] = useState(''); const [ok, setOk] = useState('')
  const [l, setL] = useState({ carId: '', variantId: '', price: '', available: true, stock: 1 })
  const [o, setO] = useState({ carId: '', discount: '', validFrom: todayStr(), validTo: '', conditions: '', accessoryPackage: '', exchangeBonus: '', guaranteed: false })
  const [s, setS] = useState({ carId: '', day: todayStr(), units: '' }); const [pf, setPf] = useState(null)
  if (error) return <><PageHeader noBack title="Dealer Dashboard" /><ErrorMessage message={error} onRetry={reload} /></>
  if (!data || !catalogue.length) return <Loader big label="Loading dashboard…" />
  const { profile, listings, offers, sales, summary, priceLog } = data
  const approved = profile.status === 'approved'
  const car = (id) => catalogue.find((c) => c.id === id)
  const cid = l.carId || catalogue[0]?.id, lc = car(cid)
  const act = (fn, msg) => async (e) => { e?.preventDefault?.(); setErr(''); setOk(''); try { await fn(); setOk(msg); reload(); refreshUser() } catch (x) { setErr(x.message) } }
  const existing = sales.find((x) => x.carId === (s.carId || catalogue[0]?.id) && x.day === s.day)
  return (
    <>
      <PageHeader noBack title="Dealer Dashboard" />
      {!approved && <p className="error">Your dealership is <b>{profile.status}</b>. An admin must approve it before listings, offers and sales reports can be published.</p>}
      <div className="stats">{[['Dealership', profile.businessName], ['City', profile.city], ['Listings', listings.length], [`Units ${per}`, summary[per]]].map(([k, v]) => <div className="card stat" key={k}><small className="muted">{k}</small><b>{v}</b></div>)}</div>
      {err && <p className="error" role="alert">{err}</p>}{ok && <p className="note">{ok}</p>}
      <section className="rpanel wide"><Tabs items={[['Listings & Offers', listings.length], ['Sales Reporting', null], ['Price History', priceLog.length], ['Profile', null]]} value={tab} onChange={setTab} />
        <div className="rbody">
          {tab === 'Listings & Offers' && <fieldset disabled={!approved} className="plain">
            <form className="advisor" onSubmit={act(() => api.post('/dealer/listings', { carId: cid, variantId: l.variantId || lc.variants[0].id, price: +l.price || lc.variants.find((v) => v.id === (l.variantId || lc.variants[0].id)).price, available: l.available, stock: +l.stock }), 'Listing saved. A price change is stored in price history.')}>
              <label>Car (master catalogue)<select value={cid} onChange={(e) => setL({ ...l, carId: e.target.value, variantId: '', price: '' })}>{catalogue.map((c) => <option key={c.id} value={c.id}>{c.company} {c.model}</option>)}</select></label>
              <label>Variant<select value={l.variantId || lc?.variants[0]?.id} onChange={(e) => setL({ ...l, variantId: e.target.value, price: '' })}>{lc?.variants.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
              <label>Listed ex-showroom price (₹L)<input type="number" step="0.01" value={l.price} placeholder={lc?.variants.find((v) => v.id === (l.variantId || lc.variants[0].id))?.price} onChange={(e) => setL({ ...l, price: e.target.value })} /></label>
              <label>Stock<input type="number" min="0" value={l.stock} onChange={(e) => setL({ ...l, stock: e.target.value })} /></label>
              <label>Availability<select value={l.available} onChange={(e) => setL({ ...l, available: e.target.value === 'true' })}><option value="true">In stock</option><option value="false">Out of stock</option></select></label>
              <button className="pill dark">Save listing</button></form>
            {listings.map((x, i) => <Row key={x.id} n={i + 1} title={`${x.car} ${x.variant}`} sub={`${x.available ? `In stock (${x.stock})` : 'Out of stock'} · updated ${new Date(x.updatedAt).toLocaleDateString()}`} right={<>{lakh(x.price)} <button type="button" className="x" onClick={act(() => api.del(`/dealer/listings/${x.id}`), 'Listing removed')} aria-label="Remove listing">✕</button></>} />)}
            <h4>Add offer</h4>
            <form className="advisor" onSubmit={act(() => api.post('/dealer/offers', { carId: o.carId || catalogue[0].id, discount: +o.discount, exchangeBonus: +o.exchangeBonus || 0, validFrom: o.validFrom, validTo: o.validTo, conditions: o.conditions, accessoryPackage: o.accessoryPackage, guaranteed: o.guaranteed }), 'Offer added')}>
              <label>Car<select value={o.carId || catalogue[0]?.id} onChange={(e) => setO({ ...o, carId: e.target.value })}>{catalogue.map((c) => <option key={c.id} value={c.id}>{c.model}</option>)}</select></label>
              <label>Discount (₹L, guaranteed)<input type="number" step="0.05" value={o.discount} onChange={(e) => setO({ ...o, discount: e.target.value })} /></label>
              <label>Exchange bonus (₹L, conditional)<input type="number" step="0.05" value={o.exchangeBonus} onChange={(e) => setO({ ...o, exchangeBonus: e.target.value })} /></label>
              <label>Start<input type="date" value={o.validFrom} onChange={(e) => setO({ ...o, validFrom: e.target.value })} /></label><label>End<input type="date" value={o.validTo} onChange={(e) => setO({ ...o, validTo: e.target.value })} /></label>
              <label>Eligibility conditions<input value={o.conditions} onChange={(e) => setO({ ...o, conditions: e.target.value })} /></label><label>Accessory / service package<input value={o.accessoryPackage} onChange={(e) => setO({ ...o, accessoryPackage: e.target.value })} /></label>
              <label>Guaranteed for future dates<select value={o.guaranteed} onChange={(e) => setO({ ...o, guaranteed: e.target.value === 'true' })}><option value="false">No (expected)</option><option value="true">Yes (guaranteed)</option></select></label>
              <button className="pill dark">Add offer</button></form>
            {offers.map((x, i) => <Row key={x.id} n={i + 1} title={`${x.car} · −${lakh(x.discount)}`} sub={`${x.validFrom} → ${x.validTo} · ${x.conditions || 'no conditions'} · ${x.status}`} right={<>{x.status === 'active' && <button type="button" className="pill sm" onClick={act(() => api.post(`/dealer/offers/${x.id}/expire`), 'Offer expired')}>Expire</button>} <button type="button" className="x" onClick={act(() => api.del(`/dealer/offers/${x.id}`), 'Offer removed')} aria-label="Delete offer">✕</button></>} />)}
          </fieldset>}
          {tab === 'Sales Reporting' && <fieldset disabled={!approved} className="plain">
            <div className="row">{[['today', 'Daily'], ['month', 'Monthly'], ['year', 'Yearly']].map(([k, n]) => <button key={k} className={`pill ${per === k ? 'active' : ''}`} onClick={() => setPer(k)}>{n}: {summary[k]} units</button>)}</div>
            <form className="advisor" onSubmit={act(() => api.put('/dealer/sales', { carId: s.carId || catalogue[0].id, day: s.day, units: Number(s.units) }), existing ? 'Report corrected (units replaced, not added)' : 'Report submitted')}>
              <label>Car<select value={s.carId || catalogue[0]?.id} onChange={(e) => setS({ ...s, carId: e.target.value })}>{catalogue.map((c) => <option key={c.id} value={c.id}>{c.company} {c.model}</option>)}</select></label>
              <label>Reporting date<input type="date" max={todayStr()} value={s.day} onChange={(e) => setS({ ...s, day: e.target.value })} /></label>
              <label>Units sold {existing ? `(reported ${existing.units}; saving corrects it)` : ''}<input type="number" min="0" step="1" value={s.units} onChange={(e) => setS({ ...s, units: e.target.value })} /></label>
              <button className="pill dark">{existing ? 'Correct report' : 'Submit report'}</button></form>
            <p className="muted small">Daily reports, labelled dealer-reported. A correction replaces the old number.</p>
            {sales.slice(0, 10).map((x, i) => <Row key={x.id} n={i + 1} title={`${x.car} · ${x.units} units`} sub={`${x.day}${x.corrections ? ` · corrected ${x.corrections}×` : ''}${x.flagged ? ' · flagged by admin' : ''} · dealer-reported`} right={<button type="button" className="pill sm" onClick={() => setS({ carId: x.carId, day: x.day, units: x.units })}>Edit</button>} />)}
          </fieldset>}
          {tab === 'Price History' && (priceLog.length === 0 ? <p className="empty">No price changes yet. Change a listing price to record history.</p> : priceLog.map((p, i) => <Row key={p.id} n={i + 1} title={`${p.car} ${p.variant}`} sub={p.day} right={`${p.previous != null ? lakh(p.previous) : 'new'} → ${lakh(p.price)}`} />))}
          {tab === 'Profile' && (() => { const v = pf || profile; return (
            <form className="advisor" onSubmit={act(() => api.put('/dealer/profile', { businessName: v.businessName, phone: v.phone, address: v.address, city: v.city }), 'Profile updated')}>
              {[['businessName', 'Dealership name'], ['phone', 'Phone'], ['address', 'Address'], ['city', 'City']].map(([k, n]) => <label key={k}>{n}<input value={v[k] || ''} onChange={(e) => setPf({ ...v, [k]: e.target.value })} /></label>)}
              <p className="muted small">Status: {profile.status} · Rating: {profile.rating ?? 'none yet'}</p><button className="pill dark">Save profile</button></form>) })()}
        </div></section>
    </>
  )
}
