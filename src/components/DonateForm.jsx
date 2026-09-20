import { useState } from 'react';
import { CATS, STATUS, catInfo } from '../data/constants.js';
import { guessCategory } from '../utils/helpers.js';
import { supabase } from '../lib/supabaseClient.js';
import CameraUpload from './CameraUpload.jsx';

export default function DonateForm({ userId, onAdded, toast }) {
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('buku');
  const [status, setStatus] = useState('gratis');
  const [price, setPrice] = useState('');
  const [cond, setCond] = useState('');
  const [loc, setLoc] = useState('');
  const [file, setFile] = useState(null);
  const [suggested, setSuggested] = useState(null);
  const [saving, setSaving] = useState(false);

  const onTitleChange = (v) => {
    setTitle(v);
    setSuggested(guessCategory(v));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);

    let img_url = null;
    if (file) {
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('item-photos').upload(path, file);
      if (!upErr) {
        img_url = supabase.storage.from('item-photos').getPublicUrl(path).data.publicUrl;
      }
    }

    const { error } = await supabase.from('items').insert({
      owner_id: userId,
      title,
      cat,
      status,
      price: Number(price) || 0,
      cond: cond || 'Kondisi baik',
      loc: loc || 'Belum diisi',
      img_url
    });

    setSaving(false);
    if (error) {
      toast('Gagal menyimpan barang: ' + error.message);
      return;
    }

    await supabase.rpc('add_points', { delta: 15 });
    setTitle('');
    setCond('');
    setLoc('');
    setPrice('');
    setFile(null);
    setSuggested(null);
    onAdded();
    toast('Barang berhasil ditambahkan ke katalog · +15 poin');
  };

  return (
    <form className="form" onSubmit={submit}>
      <h3 style={{ marginTop: 0 }}>Donasikan / Tukar Barang</h3>
      <div className="field"><CameraUpload onFile={setFile} /></div>
      <div className="field">
        <label>Nama barang</label>
        <input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="mis. Charger laptop 65W" required />
        {suggested && (
          <div className="help">
            💡 Sistem mendeteksi kata kunci ini cocok kategori "{catInfo(suggested).label}" —{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setCat(suggested); }}>pakai kategori ini</a>
          </div>
        )}
      </div>
      <div className="field">
        <label>Kategori</label>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      {status === 'murah' && (
        <div className="field">
          <label>Harga (Rp)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="20000" />
        </div>
      )}
      <div className="field">
        <label>Kondisi barang</label>
        <textarea value={cond} onChange={(e) => setCond(e.target.value)} placeholder="mis. Masih bagus, sedikit lecet di sudut" />
      </div>
      <div className="field">
        <label>Lokasi (kos / gedung)</label>
        <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="mis. Kos Melati, Blok C" />
      </div>
      <button className="btn" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Tambahkan ke Katalog'}</button>
    </form>
  );
}
