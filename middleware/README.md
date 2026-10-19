# @autoadvisor/middleware


| File | Purpose |
|---|---|
| `ApiError.js` | Operational error class with HTTP status helpers |
| `asyncHandler.js` | Passes async errors to Express |
| `auth.js` | `createAuth({secret, findUserById})` -> `protect`, `optionalAuth`, `authorize(...roles)`, `signToken` (401 / 403) |
| `validate.js` | Turns express-validator results into a 422 |
| `errorHandler.js` | `notFound` + global `errorHandler` (Mongoose, JWT, duplicate key, malformed JSON) |
| `requestLogger.js` | morgan, with cache HIT/MISS and user id |
| `cache.js` | node-cache instance, `cacheMiddleware`, `invalidate(prefix)` |
| `rateLimiter.js` | Global, auth and AI rate limits |
| `security.js` | Helmet, CORS, NoSQL-operator sanitising |

## Install
```
cd middleware && npm install
```
The backend depends on this folder through `"@autoadvisor/middleware": "file:../middleware"`.
