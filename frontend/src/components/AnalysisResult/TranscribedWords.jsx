import React, { useState } from 'react';
import { MessageSquare, Copy, Check, Sparkles } from 'lucide-react';

const TranscribedWords = ({ transcription }) => {
  const [copied, setCopied] = useState(false);

  if (!transcription) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = transcription.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="transcribed-speech-card anim-fade-up">
      {/* Header with Title & Action */}
      <div className="transcription-header-row">
        <div className="transcription-title-wrap">
          <MessageSquare size={16} className="text-cyan trans-icon-glow" />
          <span className="section-label">TRANSCRIBED SPEECH</span>
          <span className="trans-badge-offline">100% OFFLINE WHISPER</span>
        </div>

        <button
          className="btn-copy-transcription"
          onClick={handleCopy}
          title="Copy transcribed text to clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald" />
              <span className="copy-label text-emerald">COPIED</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span className="copy-label">COPY</span>
            </>
          )}
        </button>
      </div>

      {/* Main Speech Quote Body */}
      <div className="transcription-quote-body">
        <blockquote className="transcription-text">
          &ldquo;{transcription}&rdquo;
        </blockquote>
      </div>

      {/* Footer Metrics */}
      <div className="transcription-meta-footer">
        <span className="trans-stat-pill">
          <strong>{wordCount}</strong> Words Spoken
        </span>
        <span className="trans-stat-pill muted">
          VAD Noise Filtered &bull; Zero Cloud Upload
        </span>
      </div>
    </div>
  );
};

export default TranscribedWords;
