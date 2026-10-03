export default function HistoryScreen({
  history = [],
  onViewReport,
  onReanalyze,
  onDelete,
}) {
  return (
    <div className="screen-history anim-fade-up">
      <div className="history-header">
        <span className="text-label">SCREEN 05</span>
        <h2 className="text-heading">ANALYSIS SEQUENCE HISTORY</h2>
        <p className="text-sub">COMPARE PAST ANALYSES, VIEW DETAILED REPORTS & RE-RUN SCANS</p>
      </div>

      <div className="vertical-timeline-sequence">
        {history.length === 0 ? (
          <p className="text-sub">NO PREVIOUS ANALYSES LOGGED IN CURRENT SESSION.</p>
        ) : (
          history.map((item) => (
            <div key={item.id} className="timeline-seq-card">
              <span className="seq-num">{item.sampleNumber || item.id}</span>
              
              <div className="seq-main">
                <span className="seq-pct">{item.confidence}%</span>
                <h3 className="seq-status">{item.status || item.speaker}</h3>
                <span className="seq-time">{item.timestamp || "RECENT"}</span>
              </div>

              <div className="seq-actions">
                <button
                  className="btn-seq-action"
                  onClick={() => onViewReport(item)}
                  title="View & Download PDF Report"
                >
                  📄 VIEW REPORT
                </button>

                {onReanalyze && (
                  <button
                    className="btn-seq-action"
                    onClick={() => onReanalyze(item)}
                    title="Re-analyze sample"
                  >
                    🔄
                  </button>
                )}

                {onDelete && (
                  <button
                    className="btn-seq-action danger"
                    onClick={() => onDelete(item.id)}
                    title="Delete history entry"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
