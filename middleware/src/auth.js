import jwt from 'jsonwebtoken'
import { ApiError } from './ApiError.js'
import { asyncHandler } from './asyncHandler.js'

/**
 * Builds JWT middleware. Kept independent of any model: the host app injects
 * `findUserById(id)` so this package never imports backend code.
 *   401 -> missing / invalid / expired token, or user no longer exists
 *   403 -> suspended account, or role not allowed
 */
export function createAuth({ secret, findUserById }) {
  if (!secret) throw new Error('createAuth: secret is required')
  const bearer = (req) => {
    const h = req.headers.authorization || ''
    return h.startsWith('Bearer ') ? h.slice(7).trim() : null
  }
  async function resolveUser(req) {
    const token = bearer(req)
    if (!token) return null
    let payload
    try {
      payload = jwt.verify(token, secret)
    } catch (e) {
      throw ApiError.unauthorized(e.name === 'TokenExpiredError' ? 'Token expired, please log in again' : 'Invalid token')
    }
    const user = await findUserById(payload.sub)
    if (!user) throw ApiError.unauthorized('User no longer exists')
    if (user.active === false) throw ApiError.forbidden('This account is suspended')
    return user
  }
  /** Rejects the request unless a valid token is supplied. */
  const protect = asyncHandler(async (req, _res, next) => {
    const user = await resolveUser(req)
    if (!user) throw ApiError.unauthorized('Authentication token missing')
    req.user = user
    next()
  })
  /** Attaches req.user when a valid token exists; anonymous requests pass through. */
  const optionalAuth = asyncHandler(async (req, _res, next) => {
    const user = await resolveUser(req)
    if (user) req.user = user
    next()
  })
  /** Role gate. Must run after protect. */
  const authorize = (...roles) => (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized())
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden(`Role '${req.user.role}' is not allowed to access this resource`))
    next()
  }
  const signToken = (user, expiresIn = '7d') => jwt.sign({ sub: String(user._id), role: user.role }, secret, { expiresIn })
  return { protect, optionalAuth, authorize, signToken }
}
