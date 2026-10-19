import { useState } from 'react'
import Filters, { SortBar } from '../components/Filters.jsx'
import CarCard from '../components/CarCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { useStore } from '../context/StoreContext.jsx'
import useAsync from '../hooks/useAsync.js'
import useDebounce from '../hooks/useDebounce.js'
import { api } from '../services/api.js'
import { DEFAULT } from '../utils/filterCars.js'

export default function Explore() {
  const { catalogue } = useStore()
  const [f, setF] = useState(DEFAULT); const [q, setQ] = useState(''); const [page, setPage] = useState(1)
  const dq = useDebounce(q), dm = useDebounce(f.model)
  const trend = f.sort === 'trend'
  // Filters are sent to Express, which validates them and queries MongoDB (with pagination)
  const params = { search: dq, model: dm, company: f.companies, minPrice: f.min || '', maxPrice: f.max < 30 ? f.max : '', minYear: f.yMin > 2020 ? f.yMin : '', maxYear: f.yMax < 2026 ? f.yMax : '', fuel: f.fuels, transmission: f.trans, body: f.bodies, colour: f.colours, minMileage: f.mileage || '', seats: f.seats || '', minSafety: f.safety || '', features: f.features, sort: f.sort, period: trend ? f.period : '', city: trend ? f.city : '', page, limit: 6 }
  const { data, loading, error, reload } = useAsync(() => api.get('/cars', params), [JSON.stringify(params)])
  const cars = data?.data || [], meta = data?.meta
  return (
    <>
      <PageHeader title="Explore Cars" search={q} setSearch={(v) => { setQ(v); setPage(1) }} placeholder="Search Hyundai Creta…" />
      <div className="layout">
        <Filters f={f} setF={(v) => { setF(v); setPage(1) }} companies={[...new Set(catalogue.map((c) => c.company))]} />
        <section>
          <SortBar f={f} setF={(v) => { setF(v); setPage(1) }} />
          {trend && <p className="muted small">{meta?.note || 'Ranked by dealer-reported units sold (not independently verified).'}</p>}
          {error && <ErrorMessage message={error} onRetry={reload} />}
          {loading && !data && <Loader label="Loading cars…" />}
          <div className="grid" style={{ opacity: loading && data ? 0.55 : 1 }}>
            {!loading && !error && cars.length === 0 && <p className="empty">No cars match these filters. Widen the budget or reset filters.</p>}
            {cars.map((c) => <CarCard key={c.id} car={c} note={trend ? (c.reportedUnits != null ? `#${c.trendRank} · ${c.reportedUnits} units reported (dealer-reported)` : 'No reported sales data') : null} />)}
          </div>
          {meta && meta.pages > 1 && <div className="pager"><button className="pill" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {meta.pages} · {meta.total} cars</span><button className="pill" disabled={page >= meta.pages} onClick={() => setPage(page + 1)}>Next</button></div>}
        </section>
      </div>
    </>
  )
}
