import { validationResult } from 'express-validator'
import { ApiError } from './ApiError.js'

/** Place after express-validator rule arrays. Rejects with 422 before the controller / database is reached. */
export function validate(req, _res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) return next()
  const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg, location: e.location }))
  next(ApiError.unprocessable('Validation failed', errors))
}
