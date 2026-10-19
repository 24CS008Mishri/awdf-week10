import express from 'express'
import { securityMiddleware, sanitizeRequest, requestLogger, apiLimiter, notFound, errorHandler } from '@autoadvisor/middleware'
import { env } from './config/env.js'
import routes from './routes/index.js'
import { registerEventHandlers } from './events/handlers.js'

registerEventHandlers()

/** Express app (no listening here, so tests can import it). */
const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(securityMiddleware({ origins: env.clientOrigins }))
app.use(requestLogger(env.nodeEnv))
app.use(express.json({ limit: '100kb' }))
app.use(sanitizeRequest)
app.use('/api', apiLimiter, routes)
app.use(notFound)
app.use(errorHandler)

export default app
