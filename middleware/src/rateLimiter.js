import rateLimit from 'express-rate-limit'
import { ApiError } from './ApiError.js'

const make = (windowMs, limit, message) =>
  rateLimit({
    windowMs, limit, standardHeaders: true, legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    handler: (_req, _res, next) => next(new ApiError(429, message)),
  })

export const apiLimiter = make(15 * 60 * 1000, 600, 'Too many requests, please slow down')
export const authLimiter = make(15 * 60 * 1000, 30, 'Too many login attempts, try again in 15 minutes')
export const aiLimiter = make(60 * 1000, 20, 'Too many AI requests, try again in a minute')
