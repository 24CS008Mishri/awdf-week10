import { useEffect, useState } from 'react'
// Async fetch with loading / error / data states
export default function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  useEffect(() => {
    if (!url) return
    const ctrl = new AbortController()
    async function load() {
      setState({ data: null, loading: true, error: null })
      try {
        const res = await fetch(url, { signal: ctrl.signal })
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        setState({ data: await res.json(), loading: false, error: null })
      } catch (e) {
        if (e.name !== 'AbortError') setState({ data: null, loading: false, error: e.message })
      }
    }
    load()
    return () => ctrl.abort()
  }, [url])
  return state
}
