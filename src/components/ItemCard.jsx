import { catInfo, STATUS } from '../data/constants.js';
import { idr, timeAgo } from '../utils/helpers.js';

export default function ItemCard({ item, onClaim, onChat, isClaimed }) {
  const c = catInfo(item.cat);
  const st = STATUS[item.status];
  return (
    <div className="card" style={{ '--cat': c.color }}>
      <div className="card-img">{item.img_url ? <img src={item.img_url} alt={item.title} /> : <span>{c.icon}</span>}</div>
      <div className="card-body">
        <div className="tagrow">
          <span className={'tag ' + st.cls}>{st.label}</span>
          <span className="meta">{timeAgo(new Date(item.created_at).getTime())}</span>
        </div>
        <h3>{item.title}</h3>
        <div className="meta">{c.label} · {item.loc}</div>
        {item.status === 'murah' && (
          <div style={{ fontWeight: 700, fontFamily: 'Space Grotesk', fontSize: 15 }}>{idr(item.price)}</div>
        )}
        <div className="meta">{item.cond}</div>
        <div className="foot">
          {isClaimed ? (
            <span className="meta" style={{ fontWeight: 600, color: 'var(--sage)' }}>✓ Sudah diklaim</span>
          ) : (
            <button className="btn sm" onClick={() => onClaim(item)}>
              {item.status === 'murah' ? 'Ambil' : 'Klaim'}
            </button>
          )}
          <button className="btn ghost sm" onClick={() => onChat(item)}>Chat</button>
        </div>
      </div>
    </div>
  );
}
