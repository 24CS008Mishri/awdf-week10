import { ApiError, asyncHandler, invalidate } from '@autoadvisor/middleware'
import Task from '../models/Task.js'
import { appEvents } from '../events/appEvents.js'
import { notifications } from '../events/handlers.js'
import { narrate } from '../services/ai.service.js'
import * as fb from '../services/ai.fallbacks.js'
import { escapeRegex } from '../services/carQuery.service.js'
import { pick } from '../utils/pick.js'

const FIELDS = ['title', 'description', 'status', 'priority', 'dueDate', 'car']
const bust = (req) => invalidate(`tasks:${req.user.id}:`) // cache invalidation on every write

export const listTasks = asyncHandler(async (req, res) => {
  const { status, priority, q } = req.query
  const filter = { user: req.user._id, ...(status && { status }), ...(priority && { priority }), ...(q && { title: { $regex: escapeRegex(q), $options: 'i' } }) }
  const data = await Task.find(filter).sort({ createdAt: -1 }).lean()
  res.json({ success: true, count: data.length, data: data.map(({ _id, __v, ...t }) => ({ ...t, id: String(_id) })) })
})
export const getTask = asyncHandler(async (req, res) => {
  const t = await Task.findOne({ _id: req.params.id, user: req.user._id })
  if (!t) throw ApiError.notFound('Task not found')
  res.json({ success: true, data: t })
})
export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...pick(req.body, FIELDS), user: req.user._id })
  bust(req)
  const respondedAt = new Date().toISOString()
  res.status(201).json({ success: true, data: task, meta: { respondedAt, note: 'Notification is processed in the background' } })
  // Fired AFTER the response is sent: the handler (slow) cannot delay the API.
  appEvents.emitAsync('task-created', { taskId: String(task._id), title: task.title, assignedTo: req.user.name, respondedAt })
})
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, pick(req.body, FIELDS), { new: true, runValidators: true })
  if (!task) throw ApiError.notFound('Task not found')
  bust(req); res.json({ success: true, data: task })
})
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  if (!task) throw ApiError.notFound('Task not found')
  bust(req); res.json({ success: true, message: 'Task deleted' })
})
/** AI-suggested description. Never breaks the form: on failure we return a template with source:'fallback'. */
export const aiDescription = asyncHandler(async (req, res) => {
  const title = String(req.body.title).replace(/[\r\n]+/g, ' ').slice(0, 120)
  const r = await narrate({ kind: 'task', facts: { title }, fallback: () => fb.task(title), instruction: 'Write a clear 2 sentence description for a car-buying to-do task with the given title. Do not invent specific prices, dates or facts. Return plain text only.' })
  res.json({ success: true, data: { description: r.result }, ai: { source: r.source, ...(r.reason && { reason: r.reason }) } })
})
export const eventNotifications = (_req, res) => res.json({ success: true, data: notifications })
