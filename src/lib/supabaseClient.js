import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);

// Memastikan setiap pengunjung punya sesi (anonim) dan baris profil,
// sehingga RLS (Row Level Security) tahu siapa "Kamu" tanpa perlu form login.
export async function ensureSession() {
  let { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    session = data.session;
  }

  const userId = session.user.id;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (!profile) {
    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: userId, name: 'Kamu' })
      .select()
      .single();
    return created;
  }
  return profile;
}
