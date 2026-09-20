import { useState } from 'react';
import { CATS, STATUS } from '../data/constants.js';
import ItemCard from './ItemCard.jsx';

export default function Browse({ items, onClaim, onChat }) {
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const filtered = items.filter((i) => (cat === 'all' || i.cat === cat) && (status === 'all' || i.status === status));

  return (
    <section>
      <div className="sect-head"><h2>Jelajahi Barang</h2></div>
      <div className="chips">
        <span className={'chip' + (cat === 'all' ? ' active' : '')} onClick={() => setCat('all')}>Semua Kategori</span>
        {CATS.map((c) => (
          <span key={c.id} className={'chip' + (cat === c.id ? ' active' : '')} onClick={() => setCat(c.id)}>
            {c.icon} {c.label}
          </span>
        ))}
      </div>
      <div className="chips">
        <span className={'chip' + (status === 'all' ? ' active' : '')} onClick={() => setStatus('all')}>Semua Status</span>
        {Object.keys(STATUS).map((s) => (
          <span key={s} className={'chip' + (status === s ? ' active' : '')} onClick={() => setStatus(s)}>
            {STATUS[s].label}
          </span>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty">Belum ada barang yang cocok dengan filter ini.</div>
      ) : (
        <div className="grid">
          {filtered.map((i) => (
            <ItemCard key={i.id} item={i} onClaim={onClaim} onChat={onChat} isClaimed={!!i.claimed_by} />
          ))}
        </div>
      )}
    </section>
  );
}
