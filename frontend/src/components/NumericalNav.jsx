import { SCREENS } from "../data/mockData.js";

export default function NumericalNav({ activeScreen, onNavigate }) {
  return (
    <nav className="numerical-nav-panel" aria-label="System Navigation">
      {/* Subtle Vertical Connecting Track */}
      <div className="nav-vertical-line" />

      <div className="nav-items-list">
        {SCREENS.map((item) => {
          const isActive = activeScreen === item.key;
          return (
            <button
              key={item.id}
              className={`nav-timeline-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.key)}
              title={`${item.id} — ${item.label}`}
            >
              <div className="nav-num-box">
                <span className="nav-num-text">{item.id}</span>
                <span className="nav-dot" />
              </div>

              <div className="nav-dash" />

              <span className="nav-label-text">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
