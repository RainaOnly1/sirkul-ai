import { useState } from 'react';
import { CATS, STATUS, catInfo } from '../data/constants.js';
import { scoreMatch } from '../utils/match.js';
import { supabase } from '../lib/supabaseClient.js';

export default function NeedForm({ items, userId, toast }) {
  const [keyword, setKeyword] = useState('');
  const [cat, setCat] = useState('buku');
  const [loc, setLoc] = useState('');
  const [matches, setMatches] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || saving) return;
    setSaving(true);
    const need = { keyword, cat, loc };

    const { error } = await supabase.from('needs').insert({ owner_id: userId, keyword, cat, loc: loc || null });
    setSaving(false);
    if (error) {
      toast('Gagal menyimpan kebutuhan: ' + error.message);
      return;
    }
    await supabase.rpc('add_points', { delta: 5 });

    const scored = items
      .map((i) => ({ item: i, score: scoreMatch(need, i) }))
      .filter((x) => x.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setMatches(scored);
    toast('Kebutuhan diajukan · Cocokkan AI menemukan ' + scored.length + ' kandidat · +5 poin');
  };

  return (
    <div>
      <form className="form" onSubmit={submit}>
        <h3 style={{ marginTop: 0 }}>Ajukan Kebutuhan</h3>
        <div className="field">
          <label>Barang apa yang kamu cari?</label>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="mis. kalkulator scientific" required />
        </div>
        <div className="field">
          <label>Kategori</label>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Lokasi preferensi (opsional)</label>
          <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="mis. Kos Melati" />
        </div>
        <button className="btn" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Cocokkan dengan AI'}</button>
      </form>

      {matches && (
        <div className="matchbox">
          <h3>Hasil Cocokkan AI</h3>
          {matches.length === 0 ? (
            <div className="empty">Belum ada barang yang cukup cocok. Kebutuhanmu tetap tersimpan dan akan dicek ulang saat ada barang baru.</div>
          ) : (
            matches.map(({ item, score }) => (
              <div key={item.id} className="matchcard">
                <div className="mi">{item.img_url ? <img src={item.img_url} alt={item.title} /> : catInfo(item.cat).icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  <div className="meta">{item.loc} · {STATUS[item.status].label}</div>
                </div>
                <div className="score">{score}% cocok</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
