const TABS = [
  ['home', 'Beranda'],
  ['browse', 'Jelajahi Barang'],
  ['need', 'Ajukan Kebutuhan'],
  ['ai', 'Chat AI'],
  ['impact', 'Dashboard Dampak']
];

export default function TopBar({ tab, setTab, theme, toggleTheme }) {
  return (
    <div className="topbar">
      <div className="topbar-in">
        <div className="brand">
          <div className="brand-mark" />
          SIRKUL.AI
        </div>
        <nav>
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="themebtn" onClick={toggleTheme} title="Ganti tema">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}
