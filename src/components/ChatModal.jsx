import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export default function ChatModal({ item, userId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const logRef = useRef();

  useEffect(() => {
    let active = true;
    supabase
      .from('messages')
      .select('*')
      .eq('item_id', item.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (active && data) setMessages(data); });

    const channel = supabase
      .channel('messages-' + item.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `item_id=eq.${item.id}` }, (payload) => {
        setMessages((cur) => [...cur, payload.new]);
      })
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [item.id]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const body = text;
    setText('');
    await supabase.from('messages').insert({ item_id: item.id, sender_id: userId, text: body });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Chat soal "{item.title}"</h3>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="chatlog" ref={logRef}>
          {messages.length === 0 && (
            <div className="msg them">Mulai percakapan dengan pemilik barang ini.</div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={'msg ' + (m.sender_id === userId ? 'me' : 'them')}>{m.text}</div>
          ))}
        </div>
        <form className="chat-input" onSubmit={send}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesan..." />
          <button type="submit">Kirim</button>
        </form>
      </div>
    </div>
  );
}
