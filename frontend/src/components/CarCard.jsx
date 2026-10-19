import { Link, useNavigate } from 'react-router-dom'
import CarArt from './CarArt.jsx'
import { useStore } from '../context/StoreContext.jsx'
import { mileageLabel } from '../utils/format.js'

export default function CarCard({ car, match, reason, note }) {
  const { wishlist, compare, toggleWish, toggleCompare } = useStore()
  const nav = useNavigate()
  const liked = wishlist.includes(car.id); const cmp = compare.includes(car.id)
  const prices = car.variants.length ? car.variants.map((v) => v.price) : [car.price]; const lo = Math.min(...prices), hi = Math.max(...prices)
  return (
    <article className="card">
      <div className="card-art"><CarArt color={car.hue} body={car.body} />
        <button className={`round ${liked ? 'on' : ''}`} onClick={async () => (await toggleWish(car.id)) === 'login' && nav('/login')} aria-pressed={liked} aria-label="Toggle wishlist">♥</button>
        {match != null && <span className="match">{match}% match</span>}</div>
      <h3>{car.company} {car.model}<sup>{car.variant}</sup></h3>
      <p className="muted">{car.year} · {car.body} · {car.variants.length} variants</p>
      <p className="pr">₹{lo}–{hi} lakh <small>ex-showroom</small></p>
      <div className="chips">{[car.fuel, car.transmission, mileageLabel(car), `${car.seats} seats`, ...car.features].map((t) => <span className="chip" key={t}>{t}</span>)}</div>
      {note && <p className="note">{note}</p>}
      {reason && <p className="note">{reason}</p>}
      <div className="row">
        <label className={`pill ${cmp ? 'active' : ''}`}><input type="checkbox" className="sr" checked={cmp} onChange={() => toggleCompare(car.id)} />{cmp ? '✓ Comparing' : 'Compare'}</label>
        <Link className="pill dark" to={`/cars/${car.id}`}>View Details</Link>
      </div>
    </article>
  )
}
