export function timeAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 864e5);
  if (d <= 0) return 'hari ini';
  if (d === 1) return '1 hari lalu';
  return d + ' hari lalu';
}

export function idr(n) {
  return 'Rp' + Number(n || 0).toLocaleString('id-ID');
}

// Pendeteksi kategori sederhana berbasis kata kunci pada judul barang.
// Ini heuristik teks, BUKAN pengenalan gambar sungguhan.
export function guessCategory(title) {
  const t = title.toLowerCase();
  const rules = [
    ['buku', ['buku', 'novel', 'modul', 'diktat']],
    ['elektronik', ['charger', 'kabel', 'mouse', 'laptop', 'hp', 'headset', 'power bank', 'adaptor']],
    ['perabot', ['meja', 'kursi', 'rak', 'lemari', 'kasur', 'bantal']],
    ['kuliah', ['kalkulator', 'penggaris', 'jangka', 'alat tulis', 'map', 'binder']],
    ['pakaian', ['jaket', 'kaos', 'kemeja', 'celana', 'almamater']]
  ];
  for (const [cat, words] of rules) {
    if (words.some((w) => t.includes(w))) return cat;
  }
  return null;
}
