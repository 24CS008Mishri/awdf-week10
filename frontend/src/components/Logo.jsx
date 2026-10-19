import { Link } from 'react-router-dom'
export default function Logo() {
  return <Link to="/" className="logo" aria-label="AutoAdvisor home"><svg width="34" height="34" viewBox="0 0 32 32"><path d="M16 3v9M16 20v9M3 16h9M20 16h9" stroke="#15201a" strokeWidth="2.6" strokeLinecap="round" /></svg></Link>
}
