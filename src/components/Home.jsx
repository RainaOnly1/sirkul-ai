import { idr } from '../utils/helpers.js';

export default function Home({ setTab, items, points }) {
  const activeCount = items.filter((i) => !i.claimed_by).length;
  const claimedCount = items.filter((i) => i.claimed_by).length;
  return (
    <section className="hero">
      <h1>Sirkulasikan Barang Kosmu: Solusi Donasi & Tukar Barang Gratis Antar-Mahasiswa.</h1>
      <p className="lead">
        Buku, charger, hingga perabot kos—temukan pemilih barunya di Sirkul AI. Platform donasi dan tukar barang gratis antar-mahasiswa untuk kurangi sampah dan saling bantu memenuhi kebutuhan kuliah.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => setTab('browse')}>Jelajahi Barang</button>
        <button className="btn ghost" onClick={() => setTab('need')}>Ajukan Kebutuhan</button>
      </div>
      <div className="stat-row">
        <div className="stat">
          <b>{activeCount + claimedCount}</b>
          <span>barang beredar di komunitas</span>
        </div>
        <div className="stat">
          <b>{idr(points * 1500)}</b>
          <span>estimasi uang dihemat komunitas</span>
        </div>
        <div className="stat">
          <b>{claimedCount}</b>
          <span>barang berhasil diselamatkan</span>
        </div>
      </div>
    </section>
  );
}
