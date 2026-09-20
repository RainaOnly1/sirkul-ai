import { useRef, useState } from 'react';

// Menggunakan input file dengan atribut `capture` sehingga di perangkat mobile
// ini langsung membuka kamera belakang; di desktop akan membuka file picker biasa.
// Memberi File asli ke parent (untuk diunggah ke Supabase Storage) sekaligus
// menampilkan pratinjau lokal dengan FileReader.
export default function CameraUpload({ onFile }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    onFile(file);
  };

  return (
    <div className="cambox">
      {preview ? <img src={preview} alt="Pratinjau barang" /> : <div style={{ fontSize: 30, marginBottom: 8 }}>📷</div>}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <button type="button" className="btn ghost sm" onClick={() => inputRef.current.click()}>
        {preview ? 'Ambil Ulang Foto' : 'Pindai / Ambil Foto Barang'}
      </button>
      <div className="help">Foto diunggah ke Supabase Storage dan langsung masuk katalog barang.</div>
    </div>
  );
}
