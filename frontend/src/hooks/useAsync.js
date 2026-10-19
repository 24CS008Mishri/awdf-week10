import { useEffect, useState } from 'react'
// Runs an async function and exposes { data, loading, error, reload }. Keeps old data while reloading.
export default function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true, error: null }))
    Promise.resolve(fn()).then((data) => live && setState({ data, loading: false, error: null })).catch((e) => live && setState({ data: null, loading: false, error: e.message }))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { ...state, reload: () => setTick((t) => t + 1) }
}
