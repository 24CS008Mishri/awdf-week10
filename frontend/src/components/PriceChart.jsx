import { lakh } from '../utils/format.js'
// Lightweight SVG line chart
export default function PriceChart({ points }) {
  if (!points.length) return <p className="empty">No historical data available</p>
  const W = 640, H = 220, P = 28
  const vals = points.map((p) => p.value); const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1
  const x = (i) => P + (i * (W - 2 * P)) / Math.max(points.length - 1, 1)
  const y = (v) => H - P - ((v - lo) / span) * (H - 2 * P)
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)} ${y(p.value)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Historical average price chart">
      <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8fd14f" stopOpacity=".55" /><stop offset="1" stopColor="#8fd14f" stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${x(points.length - 1)} ${H - P} L${x(0)} ${H - P}Z`} fill="url(#g)" />
      <path d={d} fill="none" stroke="#1d6b3c" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p, i) => <circle key={p.label} cx={x(i)} cy={y(p.value)} r="3.5" fill="#c8f031" stroke="#16231a"><title>{p.label}: {lakh(p.value)} ({p.n} obs)</title></circle>)}
      <text x={P} y="14" className="axis">{lakh(hi)}</text><text x={P} y={H - 8} className="axis">{lakh(lo)}</text>
      <text x={W - P} y={H - 8} textAnchor="end" className="axis">{points[points.length - 1].label}</text>
    </svg>
  )
}
