import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import useAsync from '../hooks/useAsync.js'
import { api } from '../services/api.js'

const blank = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' }
export default function Tasks() {
  const portal = /^\/(dealer|admin)/.test(useLocation().pathname)
  const [filter, setFilter] = useState('')
  const { data, loading, error, reload } = useAsync(() => api.get('/tasks', { status: filter }), [filter])
  const [f, setF] = useState(blank); const [editId, setEditId] = useState(null); const [msg, setMsg] = useState('')
  const [aiBusy, setAiBusy] = useState(false); const [aiNote, setAiNote] = useState(''); const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const suggest = async () => {            // AI description -> editable textarea, app keeps working if AI fails
    if (f.title.trim().length < 2) return setMsg('Enter a title first.')
    setAiBusy(true); setAiNote(''); setMsg('')
    try {
      const r = await api.post('/tasks/ai-description', { title: f.title })
      setF((x) => ({ ...x, description: r.data.description }))
      setAiNote(r.ai.source === 'llm' ? 'AI suggestion — edit it freely.' : 'AI is unavailable right now, so this is a template suggestion — edit it freely.')
    } catch { setAiNote('Could not get a suggestion. Please write the description yourself.') }
    setAiBusy(false)
  }
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      const body = { ...f, dueDate: f.dueDate || null }
      editId ? await api.put(`/tasks/${editId}`, body) : await api.post('/tasks', body)
      setF(blank); setEditId(null); setAiNote(''); reload()
    } catch (x) { setMsg(x.message) }
    setSaving(false)
  }
  const patch = async (t, body) => { try { await api.put(`/tasks/${t.id}`, body); reload() } catch (x) { setMsg(x.message) } }
  const remove = async (t) => { try { await api.del(`/tasks/${t.id}`); if (editId === t.id) { setEditId(null); setF(blank) } reload() } catch (x) { setMsg(x.message) } }
  const tasks = data?.data || []
  return (
    <>
      <PageHeader noBack={portal} title="My Tasks"><select className="pill sm" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status"><option value="">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select></PageHeader>
      <form className="card advisor" onSubmit={submit}>
        <label className="wide">Title<input value={f.title} onChange={set('title')} placeholder="e.g. Book a Creta test drive" maxLength={120} /></label>
        <label className="wide">Description <button type="button" className="pill sm" onClick={suggest} disabled={aiBusy}>{aiBusy ? 'Thinking…' : '✦ AI suggest'}</button>
          <textarea value={f.description} onChange={set('description')} rows={3} maxLength={1000} placeholder="Optional details" /></label>
        {aiNote && <p className="note wide">{aiNote}</p>}
        <label>Status<select value={f.status} onChange={set('status')}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select></label>
        <label>Priority<select value={f.priority} onChange={set('priority')}><option>low</option><option>medium</option><option>high</option></select></label>
        <label>Due date<input type="date" value={f.dueDate} onChange={set('dueDate')} /></label>
        <div className="row"><button className="pill dark" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update task' : 'Add task'}</button>{editId && <button type="button" className="pill" onClick={() => { setEditId(null); setF(blank) }}>Cancel</button>}</div>
        {msg && <p className="error wide" role="alert">{msg}</p>}
      </form>
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {loading && !data && <Loader label="Loading tasks…" />}
      <div className="card">
        {!loading && !error && tasks.length === 0 && <p className="empty">No tasks yet. Add one above. Tasks are saved in MongoDB, so they stay after a refresh.</p>}
        {tasks.map((t, i) => (
          <div className="rrow" key={t.id}><span className="num">{i + 1}</span>
            <div className="grow"><b style={{ textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</b><small>{t.description || 'No description'}{t.dueDate ? ` · due ${t.dueDate.slice(0, 10)}` : ''}</small></div>
            <span className="chip">{t.priority}</span>
            <select value={t.status} onChange={(e) => patch(t, { status: e.target.value })} aria-label={`Status of ${t.title}`}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select>
            <button className="pill sm" onClick={() => { setEditId(t.id); setF({ title: t.title, description: t.description || '', status: t.status, priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Edit</button>
            <button className="pill sm" onClick={() => remove(t)}>Delete</button></div>
        ))}
      </div>
    </>
  )
}
