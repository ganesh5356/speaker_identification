import React from 'react';
import { generatePlainSummary } from '../../utils/confidenceUtils';

const AnalysisSummary = ({ speaker, confidence, probabilities = [], summaryText }) => {
  const text = summaryText || generatePlainSummary(speaker, confidence, probabilities);

  return (
    <div className="analysis-summary-card">
      <div className="section-label">ANALYSIS SUMMARY</div>
      <blockquote className="summary-quote">
        "{text}"
      </blockquote>
    </div>
  );
};

export default AnalysisSummary;
