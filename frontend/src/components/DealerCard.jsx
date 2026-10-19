import { useState } from 'react'
import { lakh } from '../utils/format.js'

export default function DealerCard({ d, rank, why, future }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="dealer">
      <button className="dealer-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="num dk">{rank}</span>
        <span className="grow"><b>{d.name}</b><small>{d.city} · {d.rating != null ? `★ ${d.rating}` : 'No rating yet'} · updated {new Date(d.updated).toLocaleDateString()}</small></span>
        <span className="rr"><small>Listed {lakh(d.listed)} · −{lakh(d.discount)}</small><b>{lakh(d.effective)}</b><small>{d.hasOffer ? `${d.scheduled ? 'Expected' : 'Valid'} till ${d.validTo}` : 'No offer on this date'}</small></span>
        <span className={`arrow ${open ? 'up' : ''}`}>⌄</span>
      </button>
      {open && <div className="dealer-body"><ul>
        <li>Ex-showroom price: {lakh(d.listed)}</li><li>Dealer discount: {lakh(d.discount)}</li><li>Estimated effective price: <b>{lakh(d.effective)}</b></li>
        <li>Conditional (not counted): {d.cond || 'none'} {d.exchange ? `(≈${lakh(d.exchange)})` : ''}</li><li>Service / accessory package: {d.pkg || 'none'}</li><li>Offer validity: {d.hasOffer ? `${d.validFrom} → ${d.validTo}` : 'no valid offer'}</li><li>Stock: {d.stock}</li>
        <li>Rating: {d.rating != null ? `★ ${d.rating}` : 'No rating yet'} · Updated {d.updated}</li><li>Address: {d.address || '—'}</li><li>Contact: {d.phone || '—'}</li></ul><p className="note">{why}</p></div>}
    </div>
  )
}
