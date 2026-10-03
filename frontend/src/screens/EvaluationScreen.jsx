import { useEffect, useState } from "react";
import { getEvaluation } from "../api.js";

const EVALUATION_TABLE = [
  { speaker: "Bindu", precision: 0.78, recall: 0.56, f1: 0.65, support: 32 },
  { speaker: "Ganesh", precision: 0.84, recall: 1.00, f1: 0.91, support: 91 },
  { speaker: "Rakshitha", precision: 0.58, recall: 0.82, f1: 0.68, support: 39 },
  { speaker: "Vardhan", precision: 0.82, recall: 0.46, f1: 0.59, support: 39 },
  { speaker: "ashwini", precision: 0.78, recall: 1.00, f1: 0.88, support: 40 },
  { speaker: "misbah", precision: 0.53, recall: 0.56, f1: 0.54, support: 36 },
  { speaker: "sneha", precision: 0.31, recall: 0.75, f1: 0.44, support: 12 },
  { speaker: "ummul", precision: 0.52, recall: 0.32, f1: 0.40, support: 37 },
];

export default function EvaluationScreen() {
  const [evalData, setEvalData] = useState(null);

  useEffect(() => {
    getEvaluation()
      .then((data) => setEvalData(data))
      .catch(() => {});
  }, []);

  return (
    <div className="screen-evaluation anim-fade-up">
      <div className="eval-header">
        <span className="text-label">DEVELOPER & ADMIN VIEW</span>
        <h1 className="text-display-giant eval-title">MODEL EVALUATION</h1>
        <p className="text-sub">PERFORMANCE METRICS, CONFUSION MATRIX & PER-SPEAKER ACCURACY</p>
      </div>

      {/* Accuracy Summary Cards */}
      <div className="eval-summary-grid">
        <div className="eval-card">
          <span className="eval-card-label">SEGMENT-LEVEL ACCURACY</span>
          <h2 className="eval-card-val">66.85%</h2>
          <span className="eval-card-sub">3-Second Segments (365 Test Samples)</span>
        </div>

        <div className="eval-card highlight">
          <span className="eval-card-label">RECORDING-LEVEL ACCURACY</span>
          <h2 className="eval-card-val">76.92%</h2>
          <span className="eval-card-sub">Full Audio File Voting (13 Recordings)</span>
        </div>

        <div className="eval-card">
          <span className="eval-card-label">WEIGHTED AVERAGE F1</span>
          <h2 className="eval-card-val">0.64</h2>
          <span className="eval-card-sub">Balanced Precision & Recall</span>
        </div>
      </div>

      {/* Per-Speaker Precision, Recall, F1 Table */}
      <div className="eval-table-box">
        <span className="text-label table-title">PER-SPEAKER CLASSIFICATION METRICS</span>
        <div className="eval-table-wrapper">
          <table className="eval-table">
            <thead>
              <tr>
                <th>SPEAKER</th>
                <th>PRECISION</th>
                <th>RECALL</th>
                <th>F1-SCORE</th>
                <th>TEST SUPPORT</th>
              </tr>
            </thead>
            <tbody>
              {EVALUATION_TABLE.map((row) => (
                <tr key={row.speaker}>
                  <td className="spk-col">{row.speaker}</td>
                  <td>{(row.precision * 100).toFixed(0)}%</td>
                  <td>{(row.recall * 100).toFixed(0)}%</td>
                  <td className="f1-col">{row.f1.toFixed(2)}</td>
                  <td>{row.support} samples</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="eval-matrix-section">
        <span className="text-label">CONFUSION MATRIX EVALUATION REPORT</span>
        <pre className="eval-report-text">
          {evalData?.evaluation_report || `=== segment-level ===
Accuracy: 0.6685

              precision    recall  f1-score   support
       Bindu       0.78      0.56      0.65        32
      Ganesh       0.84      1.00      0.91        91
   Rakshitha       0.58      0.82      0.68        39
     ashwini       0.78      1.00      0.88        40
      misbah       0.53      0.56      0.54        36

=== recording-level ===
Accuracy: 0.7692`}
        </pre>
      </div>
    </div>
  );
}
