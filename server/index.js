// Server kecil yang menjadi perantara antara frontend React dan Claude API.
// API key HANYA hidup di sini (file .env), tidak pernah dikirim ke browser.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const AI_RULES =
  'Kamu adalah Asisten SIRKUL.AI, chatbot di platform tukar-menukar barang bekas mahasiswa ' +
  '(buku, elektronik, perabot kos, alat kuliah, pakaian) dengan status gratis/tukar/jual murah. ' +
  'Bantu pengguna: menentukan kategori & harga wajar untuk barang yang mau didonasikan, menulis deskripsi ' +
  'kondisi barang yang jelas, memberi tips memilah barang tak terpakai di kos, dan menjelaskan cara pakai ' +
  'fitur Jelajahi Barang, Ajukan Kebutuhan, serta Dashboard Dampak. Jawab singkat (maks 4-5 kalimat atau ' +
  'poin-poin pendek), ramah, dan dalam Bahasa Indonesia.';

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY belum diatur di server/.env' });
  }

  const messages = Array.isArray(req.body.messages) ? req.body.messages : [];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: AI_RULES,
        messages: messages.map((m) => ({ role: m.role, content: m.content }))
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gagal menghubungi Claude API' });
    }
    const reply = (data.content || []).map((b) => (b.type === 'text' ? b.text : '')).join('\n').trim();
    res.json({ reply: reply || 'Maaf, aku tidak bisa menjawab itu sekarang.' });
  } catch (e) {
    res.status(500).json({ error: 'Terjadi kesalahan saat menghubungi Claude API' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log('SIRKUL.AI chat server jalan di http://localhost:' + PORT));
