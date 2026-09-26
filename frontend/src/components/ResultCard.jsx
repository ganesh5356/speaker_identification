import { useEffect, useState } from "react";

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

export default function ResultCard({ result, threshold }) {
  const { speaker, confidence, probabilities } = result;
  const [shown, setShown] = useState(false);

  // trigger the CSS transitions after the first paint
  useEffect(() => {
    setShown(false);
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, [result]);

  const low = confidence < threshold;
  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  return (
    <section className={`card result ${low ? "low" : ""}`}>
      <p className="eyebrow">Result</p>
      <div className="result-head">
        <div className="ring">
          <svg viewBox="0 0 120 120">
            <circle className="ring-bg" cx="60" cy="60" r={RADIUS} />
            <circle
              className="ring-fg"
              cx="60"
              cy="60"
              r={RADIUS}
              strokeDasharray={CIRC}
              strokeDashoffset={shown ? CIRC * (1 - confidence) : CIRC}
            />
          </svg>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div>
          <p className="muted">Predicted speaker</p>
          <h2 className="speaker-name">{speaker}</h2>
          {low && (
            <p className="warn">
              Low confidence — this may be a voice that isn't enrolled, or a noisy recording.
            </p>
          )}
        </div>
      </div>

      <ul className="bars">
        {sorted.map(([name, p]) => (
          <li key={name}>
            <span className="bar-name">{name}</span>
            <div className="bar-track">
              <div
                className={`bar-fill ${name === speaker ? "top" : ""}`}
                style={{ width: shown ? `${p * 100}%` : "0%" }}
              />
            </div>
            <span className="bar-pct">{(p * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}