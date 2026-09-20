// Skor kecocokan sederhana antara kebutuhan (need) dan barang (item).
// Berbasis kategori, kata kunci judul, dan kecocokan lokasi.
export function scoreMatch(need, item) {
  let s = 0;
  if (need.cat === item.cat) s += 60;
  const kw = (need.keyword || '').toLowerCase().split(/\s+/).filter(Boolean);
  const title = item.title.toLowerCase();
  kw.forEach((w) => {
    if (w.length > 2 && title.includes(w)) s += 15;
  });
  if (need.loc && item.loc && item.loc.toLowerCase().includes(need.loc.toLowerCase())) s += 10;
  return Math.min(99, s);
}
