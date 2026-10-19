# Week 10 – Event-Driven Architecture

## Topics Covered
- Node.js EventEmitter for custom events
- task-created event emitted after POST /tasks
- Async background handler: notification logging with simulated delay
- API response returns BEFORE event handler completes (non-blocking)
- Timestamp logging proves async execution order

## Proving the event is non-blocking
`POST /api/tasks` responds 201 first; `task-created` is emitted afterwards and its handler waits `EVENT_HANDLER_DELAY_MS` (default 1500 ms). Server console shows:
```
[event] task-created received   ...T10:00:00.012Z  (api responded ...T10:00:00.010Z)
[event] task-created completed  ...T10:00:01.515Z  (+1503 ms) Notification: task "..." assigned to Demo Customer
```
Also stored in `logs/notifications.log` and at `GET /api/tasks/events/notifications` (apiRespondedAt < handlerStartedAt < handlerFinishedAt).