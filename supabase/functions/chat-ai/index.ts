// Supabase Edge Function: chat-ai
// Deploy: supabase functions deploy chat-ai
// Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Panggil dari frontend: POST {SUPABASE_URL}/functions/v1/chat-ai

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const AI_RULES =
  "Kamu adalah Asisten SIRKUL.AI, chatbot di platform tukar-menukar barang bekas mahasiswa " +
  "(buku, elektronik, perabot kos, alat kuliah, pakaian) dengan status gratis/tukar/jual murah. " +
  "Bantu pengguna: menentukan kategori & harga wajar untuk barang yang mau didonasikan, menulis deskripsi " +
  "kondisi barang yang jelas, memberi tips memilah barang tak terpakai di kos, dan menjelaskan cara pakai " +
  "fitur Jelajahi Barang, Ajukan Kebutuhan, serta Dashboard Dampak. Jawab singkat (maks 4-5 kalimat atau " +
  "poin-poin pendek), ramah, dan dalam Bahasa Indonesia.";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY belum diatur sebagai secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { messages } = await req.json();
    const turns = Array.isArray(messages) ? messages : [];

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: AI_RULES,
        messages: turns.map((m) => ({ role: m.role, content: m.content }))
      })
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Gagal menghubungi Claude API" }), {
        status: anthropicRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const reply = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();

    return new Response(JSON.stringify({ reply: reply || "Maaf, aku tidak bisa menjawab itu sekarang." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
