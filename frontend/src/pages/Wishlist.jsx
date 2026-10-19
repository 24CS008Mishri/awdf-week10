import { Link } from 'react-router-dom'
import CarCard from '../components/CarCard.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { useStore } from '../context/StoreContext.jsx'
import useAsync from '../hooks/useAsync.js'
import { api } from '../services/api.js'
import { lakh } from '../utils/format.js'

export default function Wishlist() {
  const { user, wishlist } = useStore()
  const { data, loading, error, reload } = useAsync(() => (user ? api.get('/favorites') : null), [user?.id, wishlist.length])
  if (!user) return (<><PageHeader title="Wishlist / Favorites" /><p className="empty card">Log in to save favourites to your account. <Link to="/login">Login / Register</Link></p></>)
  const items = data?.data || []
  return (
    <>
      <PageHeader title="Wishlist / Favorites" />
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {loading && !data && <Loader label="Loading favourites…" />}
      {!loading && !error && items.length === 0 && <p className="empty card">No saved cars yet. Tap ♥ on a car in <Link to="/explore">Explore Cars</Link>.</p>}
      <div className="grid">{items.filter((i) => wishlist.includes(i.car.id)).map(({ car, savedPrice, currentPrice, priceChanged }) => <CarCard key={car.id} car={car} note={priceChanged ? `Price changed: ${lakh(savedPrice)} → ${lakh(currentPrice)} (${(((currentPrice - savedPrice) / savedPrice) * 100).toFixed(1)}%)` : `Latest listed price ${lakh(currentPrice)}`} />)}</div>
    </>
  )
}
