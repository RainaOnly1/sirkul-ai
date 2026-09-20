import { AVG_PRICE, AVG_CO2 } from '../data/constants.js';
import { idr } from '../utils/helpers.js';

export default function Impact({ items, userId, points }) {
  const claimedByYou = items.filter((i) => i.claimed_by === userId);
  const activeCount = items.filter((i) => !i.claimed_by).length;
  const savedCount = claimedByYou.length;
  const money = claimedByYou.reduce((a, it) => a + Math.max(0, (AVG_PRICE[it.cat] || 0) - (it.status === 'murah' ? it.price : 0)), 0);
  const co2 = claimedByYou.reduce((a, it) => a + (AVG_CO2[it.cat] || 0), 0);
  const target = 50;
  const pct = Math.min(100, Math.round((savedCount / target) * 100));

  return (
    <section>
      <div className="sect-head"><h2>Dashboard Dampak</h2></div>
      <div className="impact-grid">
        <div className="impact-card"><b>{savedCount}</b><span>barang diselamatkan dari klaim kamu</span></div>
        <div className="impact-card"><b>{idr(money)}</b><span>estimasi uang dihemat dari barang yang kamu ambil</span></div>
        <div className="impact-card"><b>{co2} kg</b><span>estimasi emisi produksi baru yang dihindari (CO₂e)</span></div>
        <div className="impact-card"><b>{activeCount}</b><span>barang aktif menunggu diklaim saat ini</span></div>
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-soft)' }}>
          <span>Target komunitas: 50 barang diselamatkan/bulan</span>
          <span>{pct}%</span>
        </div>
        <div className="bar"><i style={{ width: pct + '%' }} /></div>
      </div>
      <p style={{ marginTop: 18, fontSize: 12.5, color: 'var(--ink-soft)' }}>Total poin kamu saat ini: {points}</p>
    </section>
  );
}
