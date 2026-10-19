import { useState } from 'react'
import { FUELS, BODIES, FEATURES, COLORS, CITIES } from '../data/options.js'
import { DEFAULT, SORTS } from '../utils/filterCars.js'

const Group = ({ title, opts, sel, on }) => (
  <fieldset><legend>{title}</legend><div className="chips">{opts.map((o) => <button type="button" key={o} className={`chip tg ${sel.includes(o) ? 'on' : ''}`} aria-pressed={sel.includes(o)} onClick={() => on(sel.includes(o) ? sel.filter((x) => x !== o) : [...sel, o])}>{o}</button>)}</div></fieldset>
)
export default function Filters({ f, setF, companies }) {
  const [open, setOpen] = useState(true)
  const set = (k) => (v) => setF({ ...f, [k]: v }); const num = (k) => (e) => set(k)(+e.target.value)
  return (
    <aside className="card filters">
      <button className="pill filt-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>Filters {open ? '−' : '+'}</button>
      {open && <>
        <Group title="Company" opts={companies} sel={f.companies} on={set('companies')} />
        <label>Model<input value={f.model} onChange={(e) => set('model')(e.target.value)} placeholder="e.g. Creta" /></label>
        <label>Price: ₹{f.min}L – ₹{f.max}L<input type="range" min="0" max="30" value={f.min} onChange={(e) => set('min')(Math.min(+e.target.value, f.max))} /><input type="range" min="0" max="30" value={f.max} onChange={(e) => set('max')(Math.max(+e.target.value, f.min))} /></label>
        <label>Launch year {f.yMin}–{f.yMax}<input type="range" min="2020" max="2026" value={f.yMin} onChange={(e) => set('yMin')(Math.min(+e.target.value, f.yMax))} /><input type="range" min="2020" max="2026" value={f.yMax} onChange={(e) => set('yMax')(Math.max(+e.target.value, f.yMin))} /></label>
        <Group title="Fuel type" opts={FUELS} sel={f.fuels} on={set('fuels')} />
        <label>Transmission<select value={f.trans} onChange={(e) => set('trans')(e.target.value)}><option value="">Any</option><option>Manual</option><option>Automatic</option></select></label>
        <Group title="Body type" opts={BODIES} sel={f.bodies} on={set('bodies')} />
        <Group title="Colour" opts={COLORS} sel={f.colours} on={set('colours')} />
        <label>Min mileage: {f.mileage} kmpl<input type="range" min="0" max="30" value={f.mileage} onChange={num('mileage')} /></label>
        <label>Seating<select value={f.seats} onChange={num('seats')}><option value="0">Any</option>{[4, 5, 7].map((s) => <option key={s} value={s}>{s}+ seats</option>)}</select></label>
        <label>Min safety rating: {f.safety}★<input type="range" min="0" max="5" value={f.safety} onChange={num('safety')} /></label>
        <Group title="Features" opts={FEATURES} sel={f.features} on={set('features')} />
        <button className="pill" onClick={() => setF({ ...DEFAULT, sort: f.sort })}>Reset filters</button>
      </>}
    </aside>
  )
}
export function SortBar({ f, setF }) {
  return (
    <div className="sortbar">
      <label className="inline">Sort by<select value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value })}>{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      {f.sort === 'trend' && <>
        {[['today', 'Trending today'], ['month', 'This month'], ['year', 'This year']].map(([k, l]) => <button key={k} className={`pill ${f.period === k ? 'active' : ''}`} onClick={() => setF({ ...f, period: k })}>{l}</button>)}
        <label className="inline">City<select value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}><option value="">All cities</option>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></label>
      </>}
    </div>
  )
}
