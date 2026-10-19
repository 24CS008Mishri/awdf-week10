// Small reusable UI pieces taken from the reference design
export const Bar = ({ pct, label, value }) => (
  <div className="bar-col"><b>{value}</b><small>{label}</small><div className="bar"><i style={{ width: `${Math.min(100, pct)}%` }} /></div></div>
)
export const Ring = ({ big, sup, children }) => <div className="ring"><span><b>{big}</b><sup>{sup}</sup></span>{children}</div>
export const Tabs = ({ items, value, onChange }) => (
  <div className="rtabs" role="tablist">{items.map(([k, n]) => <button key={k} role="tab" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{k}{n != null && <i>{n}</i>}</button>)}</div>
)
export const Row = ({ n, title, sub, right, pct, onClick }) => (
  <div className="rrow" onClick={onClick}><span className="num">{n}</span><div className="grow"><b>{title}</b><small>{sub}</small></div><div className="rr"><span>{right}</span>{pct != null && <div className="bar sm"><i style={{ width: `${pct}%` }} /></div>}</div></div>
)
export const AiBox = ({ loading, children }) => loading ? <div className="loader"><span className="spinner" />Generating from verified data…</div> : children ? <div className="aibox">{children}</div> : null
