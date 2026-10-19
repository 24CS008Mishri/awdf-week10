/** Operational error with an HTTP status. Thrown anywhere; rendered by errorHandler. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.isOperational = true
    Error.captureStackTrace?.(this, ApiError)
  }
  static badRequest = (m = 'Bad request', d) => new ApiError(400, m, d)
  static unauthorized = (m = 'Authentication required') => new ApiError(401, m)
  static forbidden = (m = 'You do not have permission to do this') => new ApiError(403, m)
  static notFound = (m = 'Resource not found') => new ApiError(404, m)
  static conflict = (m = 'Conflict') => new ApiError(409, m)
  static unprocessable = (m = 'Validation failed', d) => new ApiError(422, m, d)
}
