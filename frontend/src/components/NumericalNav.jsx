import { Sparkles, Mic, CheckCircle2, Info, Clock, BarChart3 } from "lucide-react";
import { SCREENS } from "../data/mockData.js";

const SCREEN_ICONS = {
  entry: Sparkles,
  analysis: Mic,
  result: CheckCircle2,
  about: Info,
  history: Clock,
  evaluation: BarChart3,
};

export default function NumericalNav({ activeScreen, onNavigate }) {
  return (
    <nav className="numerical-nav-panel" aria-label="System Navigation">
      <div className="nav-items-list">
        {SCREENS.map((item) => {
          const isActive = activeScreen === item.key;
          const Icon = SCREEN_ICONS[item.key] || Sparkles;
          
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
                <Icon size={13} className="nav-item-icon" />
                <span className="nav-dot" />
              </div>

              <span className="nav-label-text">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
