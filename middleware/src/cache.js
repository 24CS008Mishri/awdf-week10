import NodeCache from 'node-cache'

/**
 * Process-local cache (node-cache). Fast and simple, but NOT shared between
 * processes: with several server instances each one has its own copy, so a write
 * handled by instance A does not invalidate instance B. Use Redis (shared) for that.
 */
export const cache = new NodeCache({ stdTTL: 60, checkperiod: 120, useClones: false })

/** Caches successful (200) GET responses. Adds X-Cache: HIT | MISS. */
export const cacheMiddleware = ({ ttl = 60, scope = '', key = (req) => req.originalUrl } = {}) => (req, res, next) => {
  if (req.method !== 'GET') return next()
  const k = `${scope}${key(req)}`
  const hit = cache.get(k)
  if (hit !== undefined) {
    res.set('X-Cache', 'HIT')
    return res.json(hit)
  }
  res.set('X-Cache', 'MISS')
  const json = res.json.bind(res)
  res.json = (body) => {
    if (res.statusCode === 200) cache.set(k, body, ttl)
    return json(body)
  }
  next()
}

/** Removes every cached key that starts with `prefix`. Returns how many were removed. */
export function invalidate(prefix) {
  const keys = cache.keys().filter((k) => k.startsWith(prefix))
  cache.del(keys)
  return keys.length
}
