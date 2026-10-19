// Vector car illustration tinted per model (placeholder until real images are hosted)
export default function CarArt({ color = '#2f6f4f', body = 'SUV' }) {
  const h = body === 'Hatchback' ? 0 : body === 'Sedan' ? 4 : -6
  return (
    <svg viewBox="0 0 300 130" className="car-art" role="img" aria-label={`${body} illustration`}>
      <ellipse cx="150" cy="116" rx="125" ry="7" fill="rgba(20,40,25,.25)" />
      <path d={`M20 92 Q22 70 55 66 L88 ${44 + h} Q150 ${28 + h} 214 ${48 + h} L252 66 Q282 72 282 94 L282 100 L20 100Z`} fill={color} />
      <path d={`M96 ${50 + h} L120 ${38 + h} L160 ${37 + h} L160 66 L90 66Z M168 ${37 + h} L208 ${50 + h} L226 66 L168 66Z`} fill="rgba(255,255,255,.55)" />
      {[78, 226].map((x) => (<g key={x}><circle cx={x} cy="100" r="21" fill="#1b1f1c" /><circle cx={x} cy="100" r="11" fill="#cfd6cf" /><circle cx={x} cy="100" r="3" fill="#1b1f1c" /></g>))}
      {[[100, 54], [150, 60], [214, 70]].map(([x, y]) => (<circle key={x} cx={x} cy={y} r="3" fill="#c8f031" stroke="#16231a" strokeWidth=".6" />))}
    </svg>
  )
}
