export default function Nav({ tab, setTab, health, onRefresh }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </div>
        <div>
          <h1 className="brand-title">VOICE AUTHENTICATION</h1>
          <p className="brand-sub">AI BIOMETRIC SECURITY CONSOLE</p>
        </div>
      </div>

      <nav className="tabs">
        <button className={tab === "identify" ? "active" : ""} onClick={() => setTab("identify")}>
          ANALYSIS CONSOLE
        </button>
        <button className={tab === "about" ? "active" : ""} onClick={() => setTab("about")}>
          SYSTEM ARCHITECTURE
        </button>
      </nav>

      <button className={`pill ${health.state}`} onClick={onRefresh} title="Click to re-check system status">
        <span className="dot" />
        <span className="pill-text">
          {health.state === "online" && `ONLINE · ${health.speakers.length} ENROLLED`}
          {health.state === "loading" && "CONNECTING..."}
          {health.state === "offline" && "SYSTEM OFFLINE"}
        </span>
      </button>
    </header>
  );
}