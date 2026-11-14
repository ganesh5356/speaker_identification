import React from 'react';
import { History, FileText, RotateCcw, Trash2, ShieldCheck, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

export default function HistoryScreen({
  history = [],
  onViewReport,
  onReanalyze,
  onDelete,
  onNavigate,
}) {
  return (
    <div className="screen-history anim-fade-up">
      {/* Header */}
      <div className="history-header">
        <div className="history-tag-badge">
          <History size={12} className="text-violet" />
          <span>SESSION LOGS</span>
        </div>
        <h2 className="text-heading">ANALYSIS SEQUENCE HISTORY</h2>
        <p className="text-sub">
          REVIEW VERIFIED VOICEPRINTS, FORENSIC AUDIT LOGS, AND DEEPFAKE RISK RECORDS
        </p>
      </div>

      {/* History Items Container */}
      <div className="vertical-timeline-sequence">
        {history.length === 0 ? (
          <div className="history-empty-state">
            <div className="empty-icon-wrap">
              <History size={36} className="text-muted" />
            </div>
            <h3 className="empty-title">NO ANALYSES RECORDED YET</h3>
            <p className="empty-desc">
              Your session audio scans and forensic reports will appear here automatically.
            </p>
            {onReanalyze && (
              <button className="btn-empty-action" onClick={() => onReanalyze()}>
                <span>RUN FIRST AUDIO SCAN</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          history.map((item) => {
            const isKnown = item.isKnown !== undefined ? item.isKnown : item.status === "AUTHENTICATED";
            const isHuman = item.authenticity?.is_human ?? true;

            return (
              <div key={item.id} className="timeline-seq-card modern">
                {/* Left Badge: Number */}
                <div className="seq-num-badge">
                  <span className="seq-hash">#</span>
                  <span className="seq-num-val">{item.sampleNumber || item.id}</span>
                </div>

                {/* Main Middle Block */}
                <div className="seq-main-info">
                  <div className="seq-top-row">
                    <h3 className={`seq-speaker-name ${!isKnown ? 'unidentified' : ''}`}>
                      {item.speaker || "UNKNOWN SPEAKER"}
                    </h3>

                    <div className="seq-status-tags">
                      <span className={`seq-verdict-pill ${isKnown ? 'authenticated' : 'unidentified'}`}>
                        {isKnown ? (
                          <>
                            <UserCheck size={11} />
                            <span>VERIFIED</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={11} />
                            <span>UNENROLLED</span>
                          </>
                        )}
                      </span>

                      {item.authenticity && (
                        <span className={`seq-auth-pill ${isHuman ? 'human' : 'synthetic'}`}>
                          {isHuman ? '👤 HUMAN' : '🤖 AI-GEN'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="seq-bottom-row">
                    <div className="seq-metric-item">
                      <span className="metric-label">CONFIDENCE</span>
                      <span className="metric-val">{item.confidence}%</span>
                    </div>

                    <div className="seq-metric-divider" />

                    <div className="seq-metric-item">
                      <span className="metric-label">TIMESTAMP</span>
                      <span className="metric-val">{item.timestamp || "RECENT"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="seq-actions-group">
                  <button
                    className="btn-seq-action primary"
                    onClick={() => onViewReport(item)}
                    title="View & Download printable biometric audit report"
                  >
                    <FileText size={13} />
                    <span>REPORT</span>
                  </button>

                  {onReanalyze && (
                    <button
                      className="btn-seq-action icon-only"
                      onClick={() => onReanalyze(item)}
                      title="Run new scan"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}

                  {onDelete && (
                    <button
                      className="btn-seq-action icon-only danger"
                      onClick={() => onDelete(item.id)}
                      title="Delete this history entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
