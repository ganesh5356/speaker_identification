import { ArrowRight, Volume2, Sparkles, Users, Cpu, ShieldCheck } from 'lucide-react';

export default function EntryScreen({ onEnter }) {
  return (
    <div className="screen-entry anim-fade-up">
      <div className="entry-hero-wrapper">
        
        {/* Animated Acoustic Voice Wave Visualizer Centerpiece */}
        <div className="entry-sound-orb-wrap">
          {/* Concentric sound emission waves */}
          <div className="sound-wave-ripple ripple-1" />
          <div className="sound-wave-ripple ripple-2" />
          <div className="sound-wave-ripple ripple-3" />
          
          <div className="entry-audio-sphere">
            {/* Animated Audio Equalizer Bars (Acoustic Voice Frequency Spectrum) */}
            <div className="voice-equalizer-bars">
              <span className="eq-bar eq-1" />
              <span className="eq-bar eq-2" />
              <span className="eq-bar eq-3" />
              <span className="eq-bar eq-4" />
              <span className="eq-bar eq-5" />
              <span className="eq-bar eq-6" />
              <span className="eq-bar eq-7" />
              <span className="eq-bar eq-8" />
              <span className="eq-bar eq-9" />
            </div>

            {/* Glowing Center Soundwave Icon */}
            <div className="sphere-sound-glow">
              <Volume2 size={24} className="text-cyan audio-icon-glow" />
            </div>
          </div>
        </div>

        {/* System Tag */}
        <div className="entry-tag-badge">
          <Sparkles size={12} className="text-violet" />
          <span>NEURAL SPEECH & BIOMETRIC AI</span>
        </div>
        
        {/* Main Display Heading */}
        <h1 className="entry-title-modern">
          VOICE<span className="title-accent-glow">INTELLIGENCE</span>
        </h1>

        <p className="entry-desc-modern">
          Acoustic voiceprint recognition, AI vs. Human deepfake detection, and offline speech-to-text transcription.
        </p>

        {/* Feature Highlights Pills */}
        <div className="entry-features-pills">
          <span className="entry-pill">
            <Users size={12} className="text-emerald" />
            <span>12+ Enrolled Speakers</span>
          </span>
          <span className="entry-pill">
            <ShieldCheck size={12} className="text-violet" />
            <span>AI vs. Human Deepfake Detection</span>
          </span>
          <span className="entry-pill">
            <Cpu size={12} className="text-cyan" />
            <span>100% Offline Speech-to-Text</span>
          </span>
        </div>

        {/* Primary Call to Action Button */}
        <button className="btn-enter-modern" onClick={onEnter}>
          <span className="btn-enter-text">ENTER SYSTEM</span>
          <div className="btn-arrow-circle">
            <ArrowRight size={16} />
          </div>
        </button>

      </div>
    </div>
  );
}
