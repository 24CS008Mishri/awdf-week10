import fs from 'node:fs'
import path from 'node:path'
import { invalidate } from '@autoadvisor/middleware'
import { appEvents } from './appEvents.js'
import { env } from '../config/env.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const LOG_DIR = path.resolve(process.cwd(), 'logs')
export const notifications = [] // in-memory proof, exposed at GET /api/tasks/events/notifications

function logNotification(entry) {
  notifications.unshift(entry); notifications.length = Math.min(notifications.length, 50)
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); fs.appendFileSync(path.join(LOG_DIR, 'notifications.log'), `${JSON.stringify(entry)}\n`) } catch { /* logging must never break the app */ }
}

export function registerEventHandlers() {
  // Task created: slow background "notification" that must not delay the API response.
  appEvents.on('task-created', async ({ taskId, title, assignedTo, emittedAt, respondedAt }) => {
    const started = new Date()
    console.log(`[event] task-created received   ${started.toISOString()}  (api responded ${respondedAt})`)
    try {
      await sleep(env.eventDelayMs) // simulates e-mail / push work
      const finished = new Date()
      const entry = { event: 'task-created', taskId, title, assignedTo, apiRespondedAt: respondedAt, handlerStartedAt: started.toISOString(), handlerFinishedAt: finished.toISOString(), handlerDurationMs: finished - started, message: `Notification: task "${title}" assigned to ${assignedTo}` }
      logNotification(entry)
      console.log(`[event] task-created completed  ${finished.toISOString()}  (+${entry.handlerDurationMs} ms) ${entry.message}`)
    } catch (e) { console.error('[event] task-created handler failed', e.message) }
  })
  // Data-change events keep caches fresh and make price/sales changes observable.
  appEvents.on('price-changed', ({ dealerId, carId, from, to }) => { invalidate('cars:'); console.log(`[event] price-changed dealer=${dealerId} car=${carId} ${from} -> ${to}`) })
  appEvents.on('sales-reported', ({ dealerId, carId, day, units }) => { invalidate('cars:'); console.log(`[event] sales-reported dealer=${dealerId} car=${carId} ${day} units=${units}`) })
  appEvents.on('catalogue-changed', () => { invalidate('cars:'); invalidate('stats:') })
}
