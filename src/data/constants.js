export const CATS = [
  { id: 'buku', label: 'Buku', icon: '📚', color: '#6E8B6B' },
  { id: 'elektronik', label: 'Elektronik', icon: '🔌', color: '#C65A36' },
  { id: 'perabot', label: 'Perabot Kos', icon: '🪑', color: '#D9A441' },
  { id: 'kuliah', label: 'Alat Kuliah', icon: '✏️', color: '#4C6E8B' },
  { id: 'pakaian', label: 'Pakaian', icon: '👕', color: '#8B5C8B' }
];

export const catInfo = (id) => CATS.find((c) => c.id === id) || CATS[0];

export const STATUS = {
  gratis: { label: 'Gratis', cls: 'gratis' },
  tukar: { label: 'Tukar', cls: 'tukar' },
  murah: { label: 'Jual Murah', cls: 'murah' }
};

// Estimasi kasar untuk Dashboard Dampak
export const AVG_PRICE = { buku: 35000, elektronik: 120000, perabot: 150000, kuliah: 60000, pakaian: 80000 };
export const AVG_CO2 = { buku: 2, elektronik: 18, perabot: 25, kuliah: 5, pakaian: 8 }; // kg CO2e dihindari per barang
