export default function AboutScreen() {
  return (
    <div className="screen-about anim-fade-up">
      <div className="about-center-container">
        <span className="text-label">04 / ABOUT THE PROJECT</span>
        
        <h1 className="text-display-giant about-title">
          VOICE<br />
          INTELLIGENCE
        </h1>

        <p className="text-sub about-intro">
          A frontend interface designed for analyzing and understanding voice signals through an intelligent audio analysis system.
        </p>

        <div className="about-grid-blocks">
          <div className="about-block">
            <span className="text-label block-label">PURPOSE</span>
            <p className="text-sub block-text">
              Voice analysis and intelligent audio interpretation.
            </p>
          </div>

          <div className="about-block">
            <span className="text-label block-label">CORE IDEA</span>
            <p className="text-sub block-text">
              Analyze voice characteristics and present the results through an interactive interface.
            </p>
          </div>
        </div>

        {/* System Flow Diagram */}
        <div className="system-flow-section">
          <span className="text-label flow-section-title">SYSTEM FLOW</span>
          <div className="system-flow-diagram">
            <div className="flow-step">
              <span className="flow-num-tag">01</span>
              <span className="flow-text">AUDIO INPUT</span>
            </div>
            <span className="flow-arrow">↓</span>

            <div className="flow-step">
              <span className="flow-num-tag">02</span>
              <span className="flow-text">SIGNAL ANALYSIS</span>
            </div>
            <span className="flow-arrow">↓</span>

            <div className="flow-step">
              <span className="flow-num-tag">03</span>
              <span className="flow-text">FEATURE EXTRACTION</span>
            </div>
            <span className="flow-arrow">↓</span>

            <div className="flow-step highlight">
              <span className="flow-num-tag">04</span>
              <span className="flow-text">INTELLIGENT RESULT</span>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="technology-section">
          <span className="text-label tech-title">TECHNOLOGY</span>
          <div className="tech-tags-list">
            <span className="tech-tag">AI / Machine Learning</span>
            <span className="tech-tag">Audio Signal Processing</span>
            <span className="tech-tag">Modern Web Interface</span>
          </div>
        </div>
      </div>
    </div>
  );
}
