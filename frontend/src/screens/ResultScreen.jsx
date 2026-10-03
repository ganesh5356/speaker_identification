import React from 'react';
import { normalizeResultData } from '../utils/mockData';
import { getConfidenceState } from '../utils/confidenceUtils';

import SpeakerResult from '../components/AnalysisResult/SpeakerResult';
import ConfidenceScore from '../components/AnalysisResult/ConfidenceScore';
import UnknownSpeakerWarning from '../components/AnalysisResult/UnknownSpeakerWarning';
import ProbabilityChart from '../components/AnalysisResult/ProbabilityChart';
import AudioDetails from '../components/AnalysisResult/AudioDetails';
import AudioQuality from '../components/AnalysisResult/AudioQuality';
import Waveform from '../components/AnalysisResult/Waveform';
import FeatureHeatmap from '../components/AnalysisResult/FeatureHeatmap';
import AnalysisSummary from '../components/AnalysisResult/AnalysisSummary';
import LowConfidenceTips from '../components/AnalysisResult/LowConfidenceTips';
import DownloadReport from '../components/AnalysisResult/DownloadReport';

export default function ResultScreen({ result, onReset }) {
  // Normalize incoming result or fallback to standard mock object
  const data = normalizeResultData(result);
  const { isUnknown, level } = getConfidenceState(data.confidence, data.threshold);

  return (
    <div className="analysis-console-screen anim-fade-up">
      {/* Top Console Navigation Bar */}
      <div className="console-nav-header">
        <div className="console-title-group">
          <span className="text-label">04 / VOICE INTELLIGENCE CONSOLE</span>
          <span className="console-status-dot green"></span>
          <span className="console-status-text">ANALYSIS COMPLETE</span>
        </div>
        <button className="btn-action reset-btn" onClick={onReset}>
          ↻ RUN NEW ANALYSIS
        </button>
      </div>

      {/* Main Analysis Console Container */}
      <div className="console-main-layout">
        
        {/* HERO HEADER: Speaker & Confidence */}
        <section className="console-hero-section">
          <div className="hero-left">
            <SpeakerResult speaker={data.speaker} confidence={data.confidence} threshold={data.threshold} />
          </div>
          <div className="hero-right">
            <ConfidenceScore confidence={data.confidence} threshold={data.threshold} />
          </div>
        </section>

        {/* UNKNOWN SPEAKER WARNING BANNER (If confidence < threshold) */}
        {isUnknown && (
          <section className="console-warning-section">
            <UnknownSpeakerWarning confidence={data.confidence} threshold={data.threshold} />
          </section>
        )}

        {/* 2-COLUMN INTELLIGENCE GRID */}
        <div className="console-grid">
          
          {/* LEFT COLUMN: Signal & Probabilities */}
          <div className="grid-column left-col">
            {/* WAVEFORM */}
            <Waveform waveformData={data.waveform} />

            {/* PROBABILITY DISTRIBUTION CHART */}
            <ProbabilityChart probabilities={data.probabilities} predictedSpeaker={data.speaker} />

            {/* SPECTROGRAM / MFCC HEATMAP */}
            <FeatureHeatmap mfccData={data.mfcc} />
          </div>

          {/* RIGHT COLUMN: Metadata, Quality, Narrative & Action */}
          <div className="grid-column right-col">
            {/* AUDIO DETAILS */}
            <AudioDetails audio={data.audio} />

            {/* AUDIO QUALITY FLAGS */}
            <AudioQuality quality={data.quality} />

            {/* PLAIN-LANGUAGE SUMMARY */}
            <AnalysisSummary
              speaker={data.speaker}
              confidence={data.confidence}
              probabilities={data.probabilities}
              summaryText={data.summary}
            />

            {/* LOW CONFIDENCE TIPS (If confidence low) */}
            {isUnknown && (
              <LowConfidenceTips isVisible={isUnknown} />
            )}

            {/* DOWNLOAD REPORT BUTTON */}
            <DownloadReport resultData={data} />
          </div>

        </div>

      </div>
    </div>
  );
}
