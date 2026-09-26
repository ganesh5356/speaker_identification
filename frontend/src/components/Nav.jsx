export default function Nav({ tab, setTab, health, onRefresh }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo">🎧</span>
        <div>
          <h1>Voice Recognition</h1>
          <p className="muted">MFCC + BiLSTM speaker identification</p>
        </div>
      </div>

      <nav className="tabs">
        <button className={tab === "identify" ? "active" : ""} onClick={() => setTab("identify")}>
          Identify
        </button>
        <button className={tab === "about" ? "active" : ""} onClick={() => setTab("about")}>
          About the project
        </button>
      </nav>

      <button className={`pill ${health.state}`} onClick={onRefresh} title="Click to re-check">
        <span className="dot" />
        {health.state === "online" && `Online · ${health.speakers.length} speakers`}
        {health.state === "loading" && "Connecting…"}
        {health.state === "offline" && "Backend offline"}
      </button>
    </header>
  );
}