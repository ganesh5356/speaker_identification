import { SCREENS } from "../data/mockData.js";

export default function NumericalNav({ activeScreen, onNavigate }) {
  return (
    <nav className="numerical-nav-panel" aria-label="System Navigation">
      {/* Track line (hidden on modern dock) */}
      <div className="nav-vertical-line" />

      <div className="nav-items-list">
        {SCREENS.map((item) => {
          const isActive = activeScreen === item.key;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-timeline-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.key)}
              title={`${item.id} — ${item.label}`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="nav-num-box">
                <span className="nav-num-text">{item.id}</span>
                <span className="nav-dot" />
              </div>

              <div className="nav-dash" />

              <span className="nav-label-text">{item.id} · {item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
