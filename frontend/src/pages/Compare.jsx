import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { AiBox } from '../components/Bits.jsx'
import { useStore } from '../context/StoreContext.jsx'
import useAsync from '../hooks/useAsync.js'
import { api } from '../services/api.js'
import { lakh, mileageLabel } from '../utils/format.js'
import FormattedAiText from '../components/FormattedAiText.jsx'

const NA = 'Not available'
export default function Compare() {
  const { compare, toggleCompare, clearCompare } = useStore()
  const ready = compare.length >= 2
  // Backend returns the latest specs, objective metrics and the AI verdict in one call
  const { data, loading, error, reload } = useAsync(() => (ready ? api.post('/ai/compare', { ids: compare }) : null), [compare.join(',')])
  if (!ready) return (<><PageHeader title="Car Comparison" /><p className="empty card">Pick 2 to 4 cars to compare — {compare.length} selected. <Link to="/explore">Browse cars</Link></p></>)
  const sel = data?.data?.cars || []
  const rows = [['Company / model', (c) => `${c.company} ${c.model}`], ['Variant', (c) => c.variant], ['Price (ex-showroom)', (c) => lakh(c.price)], ['Launch year', (c) => c.year], ['Engine / power', (c) => `${c.engine ? `${c.engine} cc` : 'Electric'} / ${c.power ? `${c.power} bhp` : NA}`], ['Torque', (c) => (c.torque ? `${c.torque} Nm` : NA)], ['Mileage / range', (c) => (c.mileage ? mileageLabel(c) : NA)], ['Fuel / transmission', (c) => `${c.fuel} / ${c.transmission}`], ['Safety', (c) => `${c.safety}★`], ['Seating capacity', (c) => c.seats], ['Key features', (c) => c.features.join(', ') || NA], ['Warranty', (c) => c.warranty || NA]]
  return (
    <>
      <PageHeader title="Car Comparison"><button className="pill" onClick={clearCompare}>Clear all</button></PageHeader>
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {loading && !data && <Loader label="Comparing…" />}
      {sel.length > 0 && <>
        <div className="card scroll"><table className="table"><thead><tr><th>Specification</th>{sel.map((c) => <th key={c.id}>{c.model}<button className="x" onClick={() => toggleCompare(c.id)} aria-label={`Remove ${c.model}`}>✕</button></th>)}</tr></thead>
          <tbody>{rows.map(([k, fn]) => <tr key={k}><td>{k}</td>{sel.map((c) => <td key={c.id}>{fn(c)}</td>)}</tr>)}</tbody></table></div>
        <AiBox><section className="ai-result"><h3>Verdict</h3><FormattedAiText text={data.data.summary} /></section><div className="verdicts">{data.data.metrics.categories.map((c) => <div key={c.label}><small>{c.label}</small><b>{c.car}</b></div>)}<div><small>Most balanced</small><b>{data.data.metrics.overall.car}</b></div></div><small className="muted">{data.ai?.source === 'llm' ? 'Narrated by AI from computed metrics' : 'AI unavailable: data-based verdict'}</small></AiBox>
      </>}
    </>
  )
}
