import morgan from 'morgan'

morgan.token('cache', (_req, res) => res.getHeader('X-Cache') || '-')
morgan.token('uid', (req) => req.user?.id || 'anon')

/** HTTP request logging with morgan. Shows cache HIT/MISS and the authenticated user id. */
export function requestLogger(env = 'development') {
  if (env === 'test') return (_req, _res, next) => next()
  const fmt = env === 'production'
    ? ':remote-addr :method :url :status :res[content-length] - :response-time ms [cache=:cache user=:uid]'
    : ':method :url :status :response-time ms - :res[content-length] [cache=:cache user=:uid]'
  return morgan(fmt)
}
