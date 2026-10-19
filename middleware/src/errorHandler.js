import { ApiError } from './ApiError.js'

export const notFound = (req, _res, next) => next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))

/** Single place that turns any error into a consistent JSON body: { success:false, status, message, errors? } */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let status = err.status || err.statusCode || 500
  let message = err.message || 'Internal server error'
  let errors = err.details

  if (err.name === 'ValidationError' && err.errors) {            // Mongoose schema validation
    status = 422; message = 'Validation failed'
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
  } else if (err.name === 'CastError') {                           // bad ObjectId etc.
    status = 400; message = `Invalid value for '${err.path}'`
  } else if (err.code === 11000) {                                 // duplicate key
    status = 409; message = `Duplicate value for ${Object.keys(err.keyPattern || {}).join(', ') || 'unique field'}`
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401; message = 'Invalid or expired token'
  } else if (err.type === 'entity.parse.failed') {
    status = 400; message = 'Malformed JSON body'
  } else if (err.type === 'entity.too.large') {
    status = 413; message = 'Request body too large'
  }

  const isProd = process.env.NODE_ENV === 'production'
  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err)
    if (isProd && !err.isOperational) message = 'Internal server error'
  }
  const body = { success: false, status, message }
  if (errors) body.errors = errors
  if (!isProd && status >= 500) body.stack = err.stack
  res.status(status).json(body)
}
