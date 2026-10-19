export default function Loader({ label = 'Loading…', big }) {
  return (
    <div className={`loader ${big ? 'big' : ''}`} role="status">
      <span className="spinner" /><span>{label}</span>
    </div>
  )
}
