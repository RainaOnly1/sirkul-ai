import { useEffect, useRef, useState } from 'react';

/* =====================================================
   SIRKUL.AI
   LOCAL CHATBOT - TANPA API

   Sistem:
   - Pattern matching
   - Keyword detection
   - Intent detection
   - Object detection
   - Conversation response
   ===================================================== */


/* =====================================================
   1. DATABASE KATEGORI BARANG
   ===================================================== */

const categories = [
  {
    name: 'Buku & Pendidikan',
    keywords: [
      'buku kuliah',
      'buku pelajaran',
      'alat tulis',
      'buku',
      'novel',
      'komik',
      'modul',
      'majalah',
      'kamus',
      'pensil',
      'pulpen'
    ]
  },

  {
    name: 'Elektronik',
    keywords: [
      'handphone',
      'smartphone',
      'komputer',
      'laptop',
      'tablet',
      'hp',
      'pc',
      'charger',
      'headset',
      'earphone',
      'mouse',
      'keyboard',
      'monitor',
      'speaker',
      'elektronik'
    ]
  },

  {
    name: 'Fashion & Pakaian',
    keywords: [
      'kaos',
      'kemeja',
      'jaket',
      'hoodie',
      'celana',
      'pakaian',
      'sepatu',
      'sandal',
      'tas',
      'baju',
      'rok',
      'fashion'
    ]
  },

  {
    name: 'Perabotan',
    keywords: [
      'meja belajar',
      'meja',
      'kursi',
      'lemari',
      'rak',
      'kasur',
      'sofa',
      'perabotan',
      'perabot'
    ]
  },

  {
    name: 'Perlengkapan',
    keywords: [
      'alat makan',
      'alat masak',
      'botol',
      'tumbler',
      'payung',
      'kabel',
      'peralatan',
      'perlengkapan'
    ]
  }
];


/* =====================================================
   2. NORMALISASI TEKS
   ===================================================== */

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[?!.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}


/* =====================================================
   3. CEK KEYWORD
   ===================================================== */

function hasAny(text, keywords) {
  return keywords.some((keyword) =>
    text.includes(keyword)
  );
}


/* =====================================================
   4. DETEKSI KATEGORI
   ===================================================== */

function detectCategory(text) {
  let result = null;

  for (const category of categories) {
    for (const keyword of category.keywords) {
      if (text.includes(keyword)) {

        if (
          !result ||
          keyword.length > result.keyword.length
        ) {
          result = {
            category: category.name,
            keyword
          };
        }

      }
    }
  }

  return result;
}


/* =====================================================
   5. DETEKSI NAMA BARANG
   ===================================================== */

function detectItem(text) {
  const result = detectCategory(text);

  if (!result) {
    return null;
  }

  return result.keyword;
}


/* =====================================================
   6. BERSIHKAN NAMA BARANG
   ===================================================== */

function cleanItemPhrase(value) {
  return value
    .replace(
      /^(aku|saya|gue|gua|kami|kita|ingin|mau|pengen|punya|memiliki)\s+/i,
      ''
    )
    .replace(
      /\s+(dong|ya|yah|nih|aja|saja|kok)$/i,
      ''
    )
    .trim();
}


/* =====================================================
   7. DETEKSI POLA TUKAR
   ===================================================== */

function detectExchange(text) {

  const patterns = [

    /(?:tukar|menukar|barter)\s+(.+?)\s+(?:dengan|sama|untuk)\s+(.+)/i,

    /(?:mau|ingin|pengen)\s+(?:tukar|menukar|barter)\s+(.+?)\s+(?:dengan|sama|untuk)\s+(.+)/i,

    /(?:bisa|boleh)\s+(?:tukar|menukar|barter)\s+(.+?)\s+(?:dengan|sama|untuk)\s+(.+)/i,

    /(?:aku|saya)\s+(?:mau|ingin|pengen)\s+(?:tukar|menukar|barter)\s+(.+?)\s+(?:dengan|sama|untuk)\s+(.+)/i
  ];


  for (const pattern of patterns) {

    const match = text.match(pattern);

    if (match) {

      return {
        give: cleanItemPhrase(match[1]),
        want: cleanItemPhrase(match[2])
      };

    }
  }


  return null;
}


/* =====================================================
   8. DETEKSI BARANG DONASI
   ===================================================== */

function detectDonationItem(text) {

  const patterns = [

    /(?:donasi|donasikan|sumbangkan|sumbang)\s+(.+)/i,

    /(?:mau|ingin|pengen)\s+(?:donasi|donasikan|sumbangkan|sumbang)\s+(.+)/i,

    /(?:aku|saya)\s+(?:punya|memiliki)\s+(.+?)\s+(?:yang\s+)?(?:mau|ingin)\s+(?:didonasikan|disumbangkan)/i
  ];


  for (const pattern of patterns) {

    const match = text.match(pattern);

    if (match) {
      return cleanItemPhrase(match[1]);
    }

  }


  return null;
}


/* =====================================================
   9. DETEKSI BARANG YANG DICARI
   ===================================================== */

function detectWantedItem(text) {

  const patterns = [

    /(?:cari|mencari|butuh|membutuhkan)\s+(.+)/i,

    /(?:aku|saya)\s+(?:sedang\s+)?(?:cari|mencari|butuh|membutuhkan)\s+(.+)/i,

    /(?:ingin|mau)\s+(?:mencari|cari)\s+(.+)/i
  ];


  for (const pattern of patterns) {

    const match = text.match(pattern);

    if (match) {
      return cleanItemPhrase(match[1]);
    }

  }


  return null;
}


/* =====================================================
   10. DETEKSI BARANG UNTUK HARGA
   ===================================================== */

function detectPriceItem(text) {

  const patterns = [

    /(?:berapa\s+harga)\s+(.+)/i,

    /(?:harga)\s+(?:untuk|dari)?\s*(.+)/i,

    /(?:harga\s+barang)\s+(.+)/i,

    /(?:mau|ingin)\s+(?:jual|menjual)\s+(.+)/i,

    /(?:jual|menjual)\s+(.+)/i
  ];


  for (const pattern of patterns) {

    const match = text.match(pattern);

    if (match) {
      return cleanItemPhrase(match[1]);
    }

  }


  return null;
}


/* =====================================================
   11. DETEKSI BARANG UNTUK DESKRIPSI
   ===================================================== */

function detectDescriptionItem(text) {

  const patterns = [

    /(?:deskripsi|deskripsikan|buatkan deskripsi)\s+(?:untuk)?\s*(.+)/i,

    /(?:buat|buatkan)\s+(?:deskripsi|keterangan)\s+(?:untuk)?\s*(.+)/i,

    /(?:bagaimana\s+cara\s+mendeskripsikan)\s+(.+)/i
  ];


  for (const pattern of patterns) {

    const match = text.match(pattern);

    if (match) {
      return cleanItemPhrase(match[1]);
    }

  }


  return null;
}


/* =====================================================
   12. DETEKSI BARANG UNTUK KONDISI
   ===================================================== */

function detectConditionItem(text) {

  const patterns = [

    /(?:kondisi)\s+(.+)/i,

    /(?:bagaimana\s+kondisi)\s+(.+)/i,

    /(?:menilai|nilai)\s+(?:kondisi)?\s*(.+)/i,

    /(?:apakah)\s+(.+?)\s+(?:masih\s+)?layak/i
  ];


  for (const pattern of patterns) {

    const match = text.match(pattern);

    if (match) {
      return cleanItemPhrase(match[1]);
    }

  }


  return null;
}


/* =====================================================
   13. DETEKSI INTENT
   ===================================================== */

function detectIntent(text) {

  /* TUKAR */

  if (
    hasAny(text, [
      'tukar',
      'menukar',
      'barter',
      'pertukaran'
    ])
  ) {
    return 'exchange';
  }


  /* DONASI */

  if (
    hasAny(text, [
      'donasi',
      'donasikan',
      'sumbang',
      'sumbangkan',
      'didonasikan'
    ])
  ) {
    return 'donation';
  }


  /* HARGA */

  if (
    hasAny(text, [
      'harga',
      'berapa',
      'jual',
      'menjual',
      'dijual'
    ])
  ) {
    return 'price';
  }


  /* DESKRIPSI */

  if (
    hasAny(text, [
      'deskripsi',
      'deskripsikan',
      'keterangan barang',
      'caption barang'
    ])
  ) {
    return 'description';
  }


  /* KONDISI */

  if (
    hasAny(text, [
      'kondisi barang',
      'kondisi',
      'layak pakai',
      'masih layak',
      'barang bekas'
    ])
  ) {
    return 'condition';
  }


  /* CARI */

  if (
    hasAny(text, [
      'cari barang',
      'mencari barang',
      'butuh barang',
      'membutuhkan barang'
    ])
  ) {
    return 'search';
  }


  /* KATEGORI */

  if (
    hasAny(text, [
      'kategori',
      'jenis barang',
      'masuk kategori',
      'termasuk kategori'
    ])
  ) {
    return 'category';
  }


  /* MEMILAH */

  if (
    hasAny(text, [
      'memilah',
      'pilah barang',
      'barang kos',
      'barang kosan',
      'tidak terpakai',
      'tidak dipakai',
      'declutter'
    ])
  ) {
    return 'sorting';
  }


  /* LINGKUNGAN */

  if (
    hasAny(text, [
      'lingkungan',
      'sampah',
      'limbah',
      'ramah lingkungan',
      'berkelanjutan'
    ])
  ) {
    return 'environment';
  }


  /* MANFAAT */

  if (
    hasAny(text, [
      'manfaat sirkul',
      'manfaat aplikasi',
      'dampak sirkul',
      'keuntungan sirkul'
    ])
  ) {
    return 'benefit';
  }


  /* CARA MENGGUNAKAN */

  if (
    hasAny(text, [
      'cara menggunakan',
      'cara pakai',
      'cara kerja',
      'bagaimana menggunakan'
    ])
  ) {
    return 'howto';
  }


  /* BANTUAN */

  if (
    hasAny(text, [
      'bisa apa',
      'bisa bantu',
      'fitur',
      'bantuan'
    ])
  ) {
    return 'help';
  }


  return 'unknown';
}


/* =====================================================
   14. MESIN JAWABAN
   ===================================================== */

function getLocalReply(message) {

  const text = normalize(message);

  const intent = detectIntent(text);

  const categoryInfo = detectCategory(text);

  const item = detectItem(text);


  /* ===================================================
     SAPAAN
     =================================================== */

  if (
    [
      'hai',
      'halo',
      'hello',
      'hi',
      'hey',
      'hei',
      'hallo'
    ].includes(text)
  ) {

    return `Halo! 👋

Aku SIRKUL.AI. Ada yang ingin kamu tanyakan tentang barang, donasi, atau pertukaran? ♻️`;
  }


  /* ===================================================
     SAPAAN DENGAN NAMA
     =================================================== */

  if (
    text.includes('halo sirkul') ||
    text.includes('hai sirkul') ||
    text.includes('halo ai') ||
    text.includes('hai ai')
  ) {

    return `Halo! 👋 Senang bertemu denganmu.

Aku siap membantu soal barang di SIRKUL.AI. ♻️`;
  }


  /* ===================================================
     APA KABAR
     =================================================== */

  if (
    [
      'apa kabar',
      'gimana kabarnya',
      'bagaimana kabarnya',
      'kabar'
    ].includes(text)
  ) {

    return `Aku baik dan siap membantu! 😊

Ada barang yang ingin kamu tanyakan?`;
  }


  /* ===================================================
     SIAPA KAMU
     =================================================== */

  if (
    text === 'siapa kamu' ||
    text === 'kamu siapa' ||
    text === 'kamu itu siapa' ||
    text.includes('apa itu sirkul')
  ) {

    return `Aku SIRKUL.AI 🤖

Aku adalah asisten yang membantu kamu memahami kategori, kondisi, donasi, pertukaran, dan pemanfaatan kembali barang. ♻️`;
  }


  /* ===================================================
     OKE / OK / SIP
     =================================================== */

  if (
    [
      'oke',
      'ok',
      'okay',
      'sip',
      'siap',
      'baik',
      'baiklah',
      'oke deh',
      'ok deh'
    ].includes(text)
  ) {

    return `Oke! 👍

Kalau ada yang ingin ditanyakan, langsung saja tulis di sini.`;
  }


  /* ===================================================
     IYA / YA
     =================================================== */

  if (
    [
      'iya',
      'ya',
      'iyap',
      'yap',
      'yup',
      'yes',
      'benar',
      'betul'
    ].includes(text)
  ) {

    return `Baik! 😊

Ada hal lain yang ingin kamu tanyakan tentang barang atau SIRKUL.AI?`;
  }


  /* ===================================================
     BUKAN / TIDAK
     =================================================== */

  if (
    [
      'bukan',
      'bukan itu',
      'nggak',
      'enggak',
      'tidak',
      'gak',
      'ga',
      'ngga',
      'enggak deh',
      'nggak deh'
    ].includes(text)
  ) {

    return `Oke, tidak masalah. 😊

Coba jelaskan sedikit lebih detail apa yang kamu maksud.`;
  }


  /* ===================================================
     MUNGKIN / BELUM TAHU
     =================================================== */

  if (
    [
      'mungkin',
      'belum tahu',
      'gatau',
      'gak tahu',
      'tidak tahu',
      'kurang tahu'
    ].includes(text)
  ) {

    return `Tidak masalah. 😊

Ceritakan barang atau situasinya, nanti aku bantu menjelaskannya.`;
  }


  /* ===================================================
     TERIMA KASIH
     =================================================== */

  if (
    hasAny(text, [
      'terima kasih',
      'makasih',
      'thanks',
      'thank you',
      'trimakasih',
      'terimakasih'
    ])
  ) {

    return `Sama-sama! 😊

Semoga barangmu bisa kembali bermanfaat. ♻️`;
  }


  /* ===================================================
     MINTA MAAF
     =================================================== */

  if (
    hasAny(text, [
      'maaf',
      'sorry',
      'mohon maaf'
    ])
  ) {

    return `Tidak apa-apa. 😊

Silakan lanjutkan pertanyaanmu.`;
  }


  /* ===================================================
     BINGUNG
     =================================================== */

  if (
    hasAny(text, [
      'aku bingung',
      'saya bingung',
      'bingung',
      'gimana ya',
      'bagaimana ya'
    ])
  ) {

    return `Tidak perlu bingung. 😊

Ceritakan saja barang atau kebutuhanmu, misalnya:

"Tukar baju dengan buku"

atau

"Saya punya laptop yang sudah tidak dipakai."`;
  }


  /* ===================================================
     TERTARIK
     =================================================== */

  if (
    hasAny(text, [
      'tertarik',
      'aku tertarik',
      'saya tertarik',
      'mau dong'
    ])
  ) {

    return `Boleh! 😊

Ceritakan barang atau kebutuhanmu, nanti aku bantu.`;
  }


  /* ===================================================
     TUKAR BARANG
     =================================================== */

  if (intent === 'exchange') {

    const exchange = detectExchange(text);


    if (exchange) {

      return `Bisa. 🔄

Kamu ingin menukar **${exchange.give}** dengan **${exchange.want}**.

Pastikan kondisi dan kelengkapan barang dicantumkan agar pertukaran lebih jelas.`;
    }


    return `Bisa. 🔄

Sebutkan barang yang ingin kamu tukar dan barang yang kamu inginkan.

Contoh:
"Tukar baju dengan buku."`;
  }


  /* ===================================================
     DONASI
     =================================================== */

  if (intent === 'donation') {

    const donationItem =
      detectDonationItem(text);


    if (donationItem) {

      return `Bisa. 🎁

${donationItem} dapat didonasikan selama masih layak digunakan.

Tambahkan foto, kondisi, dan deskripsi singkat agar calon penerima mengetahui keadaan barang.`;
    }


    return `Barang yang masih layak pakai bisa didonasikan. 🎁

Contohnya buku, pakaian, elektronik, atau perlengkapan kos.

Masuk ke halaman Ajukan kebutuhan, pilih bagian donasi barang, Cantumkan foto, kondisi, dan deskripsi barang dengan jelas.`;
  }


  /* ===================================================
     HARGA / JUAL
     =================================================== */

  if (intent === 'price') {

    const priceItem =
      detectPriceItem(text);


    if (priceItem) {

      return `Untuk **${priceItem}**, harga bekas sebaiknya mempertimbangkan kondisi, usia penggunaan, kelengkapan, dan fungsi.

Semakin baik kondisinya, semakin tinggi nilai jual yang bisa dipertimbangkan. 💰`;
    }


    return `Untuk menentukan harga barang bekas, perhatikan kondisi, usia penggunaan, kelengkapan, dan fungsi barang. 💰`;
  }


  /* ===================================================
     DESKRIPSI
     =================================================== */

  if (intent === 'description') {

    const descriptionItem =
      detectDescriptionItem(text) ||
      item ||
      'barang tersebut';


    return `Untuk **${descriptionItem}**, deskripsi sebaiknya mencantumkan:

• Kondisi barang
• Lama penggunaan
• Kelengkapan
• Kekurangan jika ada

Contoh:
"${descriptionItem} kondisi baik, masih berfungsi normal, dan terdapat sedikit tanda penggunaan."`;
  }


  /* ===================================================
     KONDISI
     =================================================== */

  if (intent === 'condition') {

    const conditionItem =
      detectConditionItem(text) ||
      item ||
      'barang';


    return `Kondisi **${conditionItem}** bisa dijelaskan sebagai:

🟢 Sangat Baik — hampir tidak ada kekurangan.
🟡 Baik — ada sedikit tanda penggunaan.
🟠 Cukup — terdapat beberapa kekurangan.
🔴 Perlu Perbaikan — membutuhkan perbaikan.`;
  }


  /* ===================================================
     PENCARIAN
     =================================================== */

  if (intent === 'search') {

    const wantedItem =
      detectWantedItem(text);


    if (wantedItem) {

      return `Kamu sedang mencari **${wantedItem}**. 🔎

Tambahkan spesifikasi, kondisi yang diinginkan, dan jumlah agar pencarian lebih mudah.`;
    }


    return `Sebutkan barang yang kamu cari beserta spesifikasinya.

Contoh:
"Saya mencari meja belajar kecil yang masih kokoh." 🔎`;
  }


  /* ===================================================
     KATEGORI
     =================================================== */

  if (intent === 'category') {

    if (categoryInfo) {

      return `**${categoryInfo.keyword}** termasuk kategori **${categoryInfo.category}**. 📦`;
    }


    return `Kategori barang di SIRKUL.AI antara lain:

📚 Buku & Pendidikan
💻 Elektronik
👕 Fashion & Pakaian
🏠 Perabotan
🎒 Perlengkapan

Sebutkan nama barangnya untuk menentukan kategorinya.`;
  }


  /* ===================================================
     BARANG LANGSUNG
     =================================================== */

  if (categoryInfo) {

    return `**${categoryInfo.keyword}** termasuk kategori **${categoryInfo.category}**. 📦

Kalau masih layak, barang tersebut bisa didonasikan atau ditukar.`;
  }


  /* ===================================================
     MEMILAH BARANG
     =================================================== */

  if (intent === 'sorting') {

    return `Untuk memilah barang, kelompokkan menjadi:

❤️ Masih digunakan
🔄 Bisa ditukar
🎁 Bisa didonasikan
🗑️ Tidak layak digunakan

Prioritaskan barang yang masih memiliki manfaat. ♻️`;
  }


  /* ===================================================
     LINGKUNGAN
     =================================================== */

  if (intent === 'environment') {

    return `SIRKUL.AI membantu memperpanjang masa pakai barang melalui penggunaan kembali, donasi, dan pertukaran.

Dengan begitu, barang yang masih layak tidak langsung menjadi sampah. 🌱`;
  }


  /* ===================================================
     MANFAAT
     =================================================== */

  if (intent === 'benefit') {

    return `SIRKUL.AI membantu:

♻️ Menggunakan kembali barang
🎁 Mendonasikan barang
🔄 Menukar barang
💰 Mendapatkan barang dengan lebih terjangkau
🌱 Mengurangi barang terbuang`;
  }


  /* ===================================================
     CARA MENGGUNAKAN
     =================================================== */

  if (intent === 'howto') {

    return `Cara menggunakan SIRKUL.AI:

1. Jelajahi barang.
2. Pilih barang yang dibutuhkan.
3. Ajukan pertukaran atau donasi.
4. Lengkapi informasi barang.
5. Lanjutkan proses dengan pengguna terkait.`;
  }


  /* ===================================================
     BANTUAN
     =================================================== */

  if (intent === 'help') {

    return `Aku bisa membantu:

📦 Menentukan kategori barang
🔄 Menjelaskan pertukaran
🎁 Menjelaskan donasi
💰 Memberi pertimbangan harga
📝 Membuat deskripsi
✨ Menilai kondisi barang`;
  }


  /* ===================================================
     FALLBACK
     =================================================== */

  return `Aku belum memahami pertanyaan itu. 😄

Coba tanyakan seperti:

• "Tukar baju dengan buku"
• "Laptop masuk kategori apa?"
• "Bagaimana cara donasi?"
• "Buat deskripsi untuk meja"
• "Bagaimana menilai kondisi barang?"

Atau langsung sebutkan barang yang ingin kamu tanyakan.`;
}


/* =====================================================
   COMPONENT AI CHAT
   ===================================================== */

export default function AIChat() {

  const [turns, setTurns] = useState([]);

  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);

  const logRef = useRef(null);


  /* ===================================================
     AUTO SCROLL
     =================================================== */

  useEffect(() => {

    if (logRef.current) {

      logRef.current.scrollTop =
        logRef.current.scrollHeight;

    }

  }, [turns, loading]);


  /* ===================================================
     SEND MESSAGE
     =================================================== */

  const send = (e) => {

    e.preventDefault();

    const message = input.trim();


    if (!message || loading) {
      return;
    }


    const userMessage = {
      role: 'user',
      content: message
    };


    setTurns((prev) => [
      ...prev,
      userMessage
    ]);


    setInput('');

    setLoading(true);


    setTimeout(() => {

      const reply =
        getLocalReply(message);


      const botMessage = {
        role: 'assistant',
        content: reply
      };


      setTurns((prev) => [
        ...prev,
        botMessage
      ]);


      setLoading(false);

    }, 350);
  };


  /* ===================================================
     QUICK QUESTIONS
     =================================================== */

  const quickQuestions = [
    'Tukar baju dengan buku',
    'Laptop masuk kategori apa?',
    'Bagaimana cara donasi?',
    'Buat deskripsi untuk meja'
  ];


  /* ===================================================
     UI
     =================================================== */

  return (

    <section>

      <div className="sect-head">

        <h2>
          Chat dengan AI SIRKUL.AI
        </h2>

      </div>


      <p
        style={{
          color: 'var(--ink-soft)',
          fontSize: 14,
          maxWidth: '60ch',
          marginBottom: 14
        }}
      >
        Tanyakan tentang barang, kategori, kondisi, donasi, pertukaran, atau harga barang.
      </p>


      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          flexDirection: 'column',
          height: 440,
          overflow: 'hidden'
        }}
      >


        {/* ============================================
            CHAT LOG
            ============================================ */}

        <div
          className="chatlog"
          ref={logRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16
          }}
        >


          {/* WELCOME */}

          {turns.length === 0 && (

            <>

              <div
                className="msg them"
                style={{
                  whiteSpace: 'pre-line'
                }}
              >
                {`Halo! 👋 Aku SIRKUL.AI.

Aku bisa membantu kamu tentang kategori,
kondisi, donasi, tukar barang, dan harga. ♻️`}
              </div>


              {/* QUICK QUESTIONS */}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 12
                }}
              >

                {quickQuestions.map(
                  (question) => (

                    <button
                      key={question}
                      type="button"
                      onClick={() => {
                        setInput(question);
                      }}
                      style={{
                        border: '1px solid var(--line)',
                        background: 'var(--card)',
                        borderRadius: 999,
                        padding: '7px 11px',
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      {question}
                    </button>

                  )
                )}

              </div>

            </>

          )}


          {/* ==========================================
              MESSAGES
              ========================================== */}

          {turns.map(
            (turn, index) => (

              <div
                key={index}
                className={
                  'msg ' +
                  (
                    turn.role === 'user'
                      ? 'me'
                      : 'them'
                  )
                }
                style={{
                  whiteSpace: 'pre-line'
                }}
              >
                {turn.content}
              </div>

            )
          )}


          {/* ==========================================
              LOADING
              ========================================== */}

          {loading && (

            <div className="msg them">
              Menyiapkan jawaban... 💭
            </div>

          )}

        </div>


        {/* ============================================
            INPUT
            ============================================ */}

        <form
          className="chat-input"
          onSubmit={send}
        >

          <input
            type="text"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder="Tulis pertanyaanmu..."
            disabled={loading}
          />


          <button
            type="submit"
            disabled={
              loading ||
              !input.trim()
            }
          >
            {loading ? '...' : 'Kirim'}
          </button>

        </form>

      </div>

    </section>

  );
}