import { useEffect, useState } from 'react';
import TopBar from './components/TopBar.jsx';
import Home from './components/Home.jsx';
import Browse from './components/Browse.jsx';
import DonateForm from './components/DonateForm.jsx';
import NeedForm from './components/NeedForm.jsx';
import Impact from './components/Impact.jsx';
import AIChat from './components/AIChat.jsx';
import ChatModal from './components/ChatModal.jsx';
import Toast from './components/Toast.jsx';
import { supabase, ensureSession } from './lib/supabaseClient.js';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('home');
  const [theme, setTheme] = useState('auto');
  const [toastMsg, setToastMsg] = useState('');
  const [chatItem, setChatItem] = useState(null);
  const [ready, setReady] = useState(false);

  const toast = (m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(''), 2600);
  };

  const loadItems = async () => {
    const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  const refreshProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  useEffect(() => {
    (async () => {
      const p = await ensureSession();
      setProfile(p);
      await loadItems();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const channel = supabase
      .channel('items-catalog')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => loadItems())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [ready]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'auto' ? '' : theme);
  }, [theme]);

  if (!ready || !profile) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>Menyiapkan SIRKUL.AI…</div>;
  }

  const claimItem = async (item) => {
    const { error } = await supabase
      .from('items')
      .update({ claimed_by: profile.id, claimed_at: new Date().toISOString() })
      .eq('id', item.id)
      .is('claimed_by', null);
    if (error) {
      toast('Gagal klaim: ' + error.message);
      return;
    }
    await supabase.rpc('add_points', { delta: 10 });
    await refreshProfile(profile.id);
    await loadItems();
    toast('Barang berhasil diklaim · +10 poin');
  };

  const activeItems = items.filter((i) => !i.claimed_by);

  return (
    <div>
      <TopBar
        tab={tab}
        setTab={setTab}
        theme={theme === 'dark' ? 'dark' : 'light'}
        toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      <div className="wrap">
        {tab === 'home' && <Home setTab={setTab} items={items} points={profile.points} />}
        {tab === 'browse' && <Browse items={items} onClaim={claimItem} onChat={setChatItem} />}
        {tab === 'need' && (
          <section>
            <NeedForm items={activeItems} userId={profile.id} toast={toast} />
            <div style={{ height: 26 }} />
            <DonateForm userId={profile.id} onAdded={loadItems} toast={toast} />
          </section>
        )}
        {tab === 'ai' && <AIChat />}
        {tab === 'impact' && <Impact items={items} userId={profile.id} points={profile.points} />}
      </div>
      {chatItem && <ChatModal item={chatItem} userId={profile.id} onClose={() => setChatItem(null)} />}
      <Toast msg={toastMsg} />
    </div>
  );
}
