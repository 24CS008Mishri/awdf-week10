import { EventEmitter } from 'node:events'

/** Custom event bus. Handlers run outside the request/response cycle. */
class AppEvents extends EventEmitter {
  /** Emits on the next tick so the HTTP response is flushed first. */
  emitAsync(event, payload) { setImmediate(() => this.emit(event, { ...payload, emittedAt: new Date().toISOString() })) }
}
export const appEvents = new AppEvents()
appEvents.on('error', (e) => console.error('[events] unhandled event error', e))
