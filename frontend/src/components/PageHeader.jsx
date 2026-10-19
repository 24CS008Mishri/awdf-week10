import { useNavigate } from 'react-router-dom'
export default function PageHeader({ noBack, title, search, setSearch, placeholder, children }) {
  const nav = useNavigate()
  return (
    <div className="head">
      {!noBack && <button className="round" onClick={() => nav(-1)} aria-label="Go back">←</button>}
      <h1>{title}</h1>
      {setSearch && <div className="search"><span aria-hidden>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} aria-label="Search" />{search && <button onClick={() => setSearch('')} aria-label="Clear search">✕</button>}</div>}
      {children}
    </div>
  )
}
