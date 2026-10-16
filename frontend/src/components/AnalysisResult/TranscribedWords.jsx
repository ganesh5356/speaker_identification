import React from 'react';

const TranscribedWords = ({ transcription }) => {
  if (!transcription) return null;

  return (
    <div className="analysis-summary-card" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
      <div className="section-label">TRANSCRIBED SPEECH</div>
      <blockquote className="summary-quote" style={{ fontStyle: 'normal', fontFamily: 'monospace', color: 'var(--text-color)', fontSize: '1.1rem' }}>
        {transcription}
      </blockquote>
    </div>
  );
};

export default TranscribedWords;
