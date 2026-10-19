// Single place that talks to the Express backend. The JWT is attached automatically.
const BASE = import.meta.env.VITE_API_URL || '/api'
const KEY = 'aa_token'
let token = localStorage.getItem(KEY)
let onUnauthorized = () => {}

export const getToken = () => token
export const setToken = (t) => { token = t; t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY) }
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

const qs = (params = {}) => {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === '' || v == null || v === false || (Array.isArray(v) && !v.length)) return
    p.set(k, Array.isArray(v) ? v.join(',') : v)
  })
  const s = p.toString(); return s ? `?${s}` : ''
}

async function request(path, { method = 'GET', body, params } = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}${qs(params)}`, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch { throw new Error('Cannot reach the server. Is the backend running?') }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && token) { setToken(null); onUnauthorized() } // expired / invalid token
    const detail = json.errors?.length ? `: ${json.errors.map((e) => e.message).join(', ')}` : ''
    const err = new Error(`${json.message || `Request failed (${res.status})`}${detail}`); err.status = res.status; throw err
  }
  return json
}
export const api = {
  get: (p, params) => request(p, { params }),
  post: (p, body = {}) => request(p, { method: 'POST', body }),
  put: (p, body = {}) => request(p, { method: 'PUT', body }),
  patch: (p, body = {}) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
}
