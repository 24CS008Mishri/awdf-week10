import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CarArt from '../components/CarArt.jsx'
import PriceChart from '../components/PriceChart.jsx'
import DealerCard from '../components/DealerCard.jsx'
import LiveModels from '../components/LiveModels.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { Bar, Ring, Tabs, Row, AiBox } from '../components/Bits.jsx'
import { useStore } from '../context/StoreContext.jsx'
import useAsync from '../hooks/useAsync.js'
import { api } from '../services/api.js'
import { CITIES } from '../data/options.js'
import { todayStr } from '../utils/date.js'
import { lakh, mileageLabel } from '../utils/format.js'
import FormattedAiText from '../components/FormattedAiText.jsx'

const MODES = ['Overview', 'Price insight', 'Dealer ranking']
const pct = (v, max) => (max ? Math.round((v / max) * 100) : 0)
export default function CarDetails() {
  const { id } = useParams(); const nav = useNavigate()
  const { catalogue, toggleWish, toggleCompare, wishlist, compare } = useStore()
  const [tab, setTab] = useState('Basic Info'); const [period, setPeriod] = useState('monthly'); const [vi, setVi] = useState(-1)
  const [city, setCity] = useState('Anand'); const [date, setDate] = useState(todayStr()); const [prio, setPrio] = useState('price')
  const [prompt, setPrompt] = useState('Analyse this car as a buying option and highlight the questionable points'); const [mode, setMode] = useState(MODES[0])
  const [out, setOut] = useState(null); const [busy, setBusy] = useState(false)

  const carQ = useAsync(() => api.get(`/cars/${id}`), [id]); const car = carQ.data?.data
  const vIdx = car ? (vi < 0 ? car.variants.length - 1 : vi) : 0; const variant = car?.variants[vIdx]; const price = variant?.price ?? car?.price
  const priceQ = useAsync(() => (car ? api.get(`/cars/${id}/price-history`, { period, variant: variant?.id }) : null), [car?.id, variant?.id, period])
  const dealQ = useAsync(() => (car ? api.get(`/cars/${id}/dealers`, { city, date, priority: prio, variant: variant?.id }) : null), [car?.id, variant?.id, city, date, prio])
  if (carQ.loading && !car) return <Loader big label="Loading car…" />
  if (carQ.error) return <><PageHeader title="Car Details" /><ErrorMessage message={carQ.error} onRetry={carQ.reload} /></>
  if (!car) return null

  const points = priceQ.data?.data || [], stats = priceQ.data?.stats, dealers = dealQ.data?.data || [], future = dealQ.data?.meta?.future
  const run = async (m = mode) => {
    setMode(m); setBusy(true); setOut(null)
    try {
      if (m === 'Overview') { setTab('Basic Info'); const r = await api.post('/ai/overview', { carId: id, question: prompt }); setOut({ items: r.data.sections.map((s) => [s.title, s.text]), ai: r.ai }) }
      else if (m === 'Price insight') { setTab('AI Price Analysis'); const r = await api.post('/ai/price-insight', { carId: id, variantId: variant?.id }); setOut({ items: [['AI Price Insight', r.data.text]], ai: r.ai }) }
      else { setTab('Best Dealers'); const r = await api.post('/ai/dealers', { carId: id, variantId: variant?.id, city, date, priority: prio }); setOut({ items: [['Why this ranking', r.data.text]], ai: r.ai }) }
    } catch (e) { setOut({ items: [['Could not generate', e.message]], ai: { source: 'error' } }) }
    setBusy(false)
  }
  const all = catalogue.length ? catalogue : [car]
  const maxPower = Math.max(...all.map((c) => c.power || 0)), maxMil = Math.max(...all.filter((c) => c.fuel !== 'Electric').map((c) => c.mileage || 0)), maxPrice = Math.max(...all.map((c) => c.price))
  const milPct = car.fuel === 'Electric' ? 100 : pct(car.mileage || 0, maxMil), powPct = pct(car.power || 0, maxPower)
  const specs = [['Manufacturer', car.company], ['Model', car.model], ['Variant', variant?.name || car.variant], ['Launch year', car.year], ['Body type', car.body], ['Colours', car.colors.join(', ')], ['Engine', car.engine ? `${car.engine} cc` : null], ['Power', car.power ? `${car.power} bhp` : null], ['Torque', car.torque ? `${car.torque} Nm` : null], ['Transmission', car.transmission], ['Fuel type', car.fuel], [car.fuel === 'Electric' ? 'Range' : 'Mileage', car.mileage ? mileageLabel(car) : null], ['Seating', `${car.seats} seats`], ['Boot space', car.boot ? `${car.boot} L` : null], ['Safety rating', `${car.safety}★`], ['Warranty', car.warranty], ['Comfort & tech', car.features.join(', ') || null]]
  const wished = wishlist.includes(car.id)
  const vf = [['Price', 100 - pct(price, maxPrice), lakh(price)], ['Mileage', milPct, mileageLabel(car)], ['Safety', car.safety * 20, `${car.safety}★`], ['Performance', powPct, car.power ? `${car.power} bhp` : 'n/a'], ['Features', car.features.length * 25, `${car.features.length} key`]]
  return (
    <>
      <PageHeader title="Car Details" />
      <div className="det">
        <div className="left">
          <section className="card big">
            <div className="hero-top"><div><h2>{car.company} {car.model}<sup>{variant?.name}</sup></h2><small className="muted">{car.year} · {car.body}</small></div>
              <div className="row"><button className={`pill ${wished ? 'dark' : ''}`} onClick={async () => (await toggleWish(car.id)) === 'login' && nav('/login')}>{wished ? '♥ Saved' : '♡ Wishlist'}</button><button className={`pill ${compare.includes(car.id) ? 'dark' : ''}`} onClick={() => toggleCompare(car.id)}>{compare.includes(car.id) ? '✓ Comparing' : 'Compare'}</button></div></div>
            <div className="chips"><span className="chip">Ex-showroom {lakh(price)}</span><span className="chip">{car.engine ? `${car.engine} cc` : 'Electric'}</span><span className="chip">{car.fuel}</span><span className="chip">{car.seats} seats</span><label className="chip"><span className="sr">Variant</span><select className="chipsel" value={vIdx} onChange={(e) => setVi(+e.target.value)}>{car.variants.map((v, i) => <option key={v.id} value={i}>Variant: {v.name}</option>)}</select></label></div>
            <div className="stage"><CarArt color={car.hue} body={car.body} />
              {[[18, 52], [40, 22], [62, 24], [80, 52], [48, 66]].map(([x, y], i) => <i key={i} className="dot" style={{ left: `${x}%`, top: `${y}%` }} title={car.features[i] || 'Spec point'} />)}
              <div className="tool"><button className="on" aria-label="Generate AI Car Overview" onClick={() => run('Overview')}>✦</button><button onClick={async () => (await toggleWish(car.id)) === 'login' && nav('/login')} aria-label="Wishlist">♥</button><button onClick={() => toggleCompare(car.id)} aria-label="Compare">▤</button><button onClick={() => setTab('Best Dealers')} aria-label="Dealers">✉</button></div></div>
          </section>
          <section className="ask">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} maxLength={300} aria-label="Ask AI about this car" />
            <div className="ask-bar"><div className="chips">{MODES.map((m) => <button key={m} className={`chip tg ${mode === m ? 'dark' : ''}`} onClick={() => setMode(m)}>{m}</button>)}</div><button className="send" onClick={() => run()} disabled={busy} aria-label="Run AI">➤</button></div>
          </section>
          <AiBox loading={busy}>{out && <>{out.items.map(([t, x]) => <section className="ai-result" key={t}><h3>{t}</h3><FormattedAiText text={x} /></section>)}<small className="muted">{out.ai?.source === 'llm' ? 'Generated by AI from verified data' : out.ai?.source === 'error' ? 'Request failed' : 'AI unavailable right now: showing a data-based summary'}{out.ai?.cached ? ' (cached)' : ''}</small></>}</AiBox>
        </div>
        <section className="rpanel">
          <Tabs items={[['Basic Info', specs.length], ['AI Price Analysis', points.length], ['Best Dealers', dealers.length]]} value={tab} onChange={setTab} />
          <div className="rbody">
            {tab === 'Basic Info' && <>
              <div className="rhead"><h3>#{car.id.slice(-4).toUpperCase()}-{car.year}<sup>Catalogue</sup></h3><button className="pill" onClick={() => run('Overview')}>Generate AI Car Overview</button></div>
              <div className="sub card"><div className="sub-h"><b>Key Specifications</b><span className="arr">↗</span></div>
                <div className="two"><div className="chips col">{car.features.map((f) => <span className="chip" key={f}>{f}</span>)}</div><Ring big={lakh(price)} sup="Ex-showroom" /></div>
                <div className="bars"><Bar pct={car.safety * 20} value={`${car.safety * 20}%`} label="Safety" /><Bar pct={milPct} value={`${milPct}%`} label="Mileage" /><Bar pct={powPct} value={`${powPct}%`} label="Power" /></div></div>
              <div className="sub card"><div className="sub-h"><b>Technical specifications</b><span className="arr">↗</span></div>
                <div className="scrolly">{specs.map(([k, v], i) => <Row key={k} n={i + 1} title={v ?? 'Not available'} sub={k} right={v ? '' : '—'} />)}</div></div>
              <div className="sub card"><div className="sub-h"><b>More {car.company} models · live NHTSA API</b></div><LiveModels make={car.company === 'Maruti Suzuki' ? 'Suzuki' : car.company} /></div>
            </>}
            {tab === 'AI Price Analysis' && <>
              <div className="rhead"><h3>Price Analysis<sup>{variant?.name}</sup></h3><button className="pill" onClick={() => run('Price insight')}>AI Price Insight</button></div>
              {priceQ.error && <ErrorMessage message={priceQ.error} onRetry={priceQ.reload} />}
              <div className="sub card"><div className="sub-h"><b>Current vs similar listings</b></div>
                <div className="two"><div className="chips col"><span className="chip">Similar median {stats?.similarMedian != null ? lakh(stats.similarMedian) : 'n/a'}</span><span className="chip">{stats?.observations ?? 0} observations (30d)</span><span className="chip">Ex-showroom price type</span></div><Ring big={lakh(stats?.current ?? price)} sup="Listed" /></div>
                <div className="bars"><Bar pct={Math.abs(stats?.changePct || 0) * 10} value={stats?.changePct != null ? `${stats.changePct > 0 ? '+' : ''}${stats.changePct}%` : 'n/a'} label="30-day change" /><Bar pct={stats?.similarMedian ? ((stats.current / stats.similarMedian) * 50) : 0} value={stats?.similarMedian ? `${(((stats.current - stats.similarMedian) / stats.similarMedian) * 100).toFixed(1)}%` : 'n/a'} label="vs median" /><Bar pct={Math.min(100, (stats?.observations || 0) / 1.2)} value={stats?.observations ?? 0} label="Data points" /></div></div>
              <div className="sub card"><div className="sub-h"><b>Historical Price Trend</b><div className="row">{['daily', 'monthly', 'yearly'].map((p) => <button key={p} className={`pill sm ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p[0].toUpperCase() + p.slice(1)}</button>)}</div></div>
                {priceQ.loading && !priceQ.data ? <Loader label="Loading price history…" /> : <PriceChart points={points} />}
                <small className="muted">{priceQ.data?.meta?.from ? `${priceQ.data.meta.from} → ${priceQ.data.meta.to}. ` : ''}Average of all eligible dealer observations. Missing days are left out, never zero.</small></div>
              <div className="sub card"><div className="sub-h"><b>Value for money (factors shown separately)</b></div>{vf.map(([k, p, v], i) => <Row key={k} n={i + 1} title={k} sub="vs catalogue" right={v} pct={Math.max(4, Math.min(100, p))} />)}</div>
            </>}
            {tab === 'Best Dealers' && <>
              <div className="rhead"><h3>Best Dealers<sup>{city}</sup></h3><button className="pill" onClick={() => run('Dealer ranking')}>Explain ranking</button></div>
              <div className="filt-row">
                <label>City<select value={city} onChange={(e) => setCity(e.target.value)}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label>Date<input type="date" value={date} min={todayStr()} onChange={(e) => setDate(e.target.value || todayStr())} /></label>
                <label>Priority<select value={prio} onChange={(e) => setPrio(e.target.value)}><option value="price">Lowest effective price</option><option value="rating">Highest dealer rating</option><option value="benefits">Included benefits</option></select></label>
              </div>
              {future && <p className="note">Future date: offers are scheduled / expected unless the dealer guarantees them.</p>}
              {dealQ.error && <ErrorMessage message={dealQ.error} onRetry={dealQ.reload} />}
              {dealQ.loading && !dealQ.data && <Loader label="Finding dealers…" />}
              {!dealQ.loading && !dealQ.error && dealers.length === 0 && <p className="empty">No eligible dealers in {city} for this variant on {date}. Try another city or date.</p>}
              {dealers.map((d) => <DealerCard key={d.id} d={d} rank={d.rank} future={future} why={d.why} />)}
            </>}
          </div>
        </section>
      </div>
    </>
  )
}
