import helmet from 'helmet'
import cors from 'cors'

/** Helmet security headers + CORS limited to the configured front-end origins. */
export function securityMiddleware({ origins = [] } = {}) {
  return [
    helmet(),
    cors({
      origin: (origin, cb) => (!origin || origins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed by CORS'))),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  ]
}

const clean = (o) => {
  if (Array.isArray(o)) return o.forEach(clean)
  if (o && typeof o === 'object') {
    for (const k of Object.keys(o)) {
      if (k.startsWith('$') || k.includes('.')) delete o[k] // blocks NoSQL operator injection ({"$gt": ""})
      else clean(o[k])
    }
  }
}
/** Strips Mongo operator keys from body, params and query. */
export function sanitizeRequest(req, _res, next) {
  clean(req.body); clean(req.params); clean(req.query)
  next()
}
