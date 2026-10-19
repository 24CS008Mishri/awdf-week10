import { useState } from 'react'
import useFetch from '../hooks/useFetch.js'
import { modelsUrl } from '../services/nhtsa.js'
import Loader from './Loader.jsx'
import ErrorMessage from './ErrorMessage.jsx'

// Consumes the public NHTSA REST API: loading → error → data list
export default function LiveModels({ make }) {
  const [attempt, setAttempt] = useState(0)
  const { data, loading, error } = useFetch(`${modelsUrl(make)}${attempt ? `&r=${attempt}` : ''}`)
  if (loading) return <Loader label={`Fetching ${make} models from NHTSA…`} />
  if (error) return <ErrorMessage message={error} onRetry={() => setAttempt(attempt + 1)} />
  const list = data?.Results || []
  if (!list.length) return <p className="empty">NHTSA has no models listed for {make}.</p>
  return (
    <div className="chips">{list.slice(0, 24).map((m) => <span className="chip soft" key={m.Model_ID}>{m.Model_Name}</span>)}</div>
  )
}
