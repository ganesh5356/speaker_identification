export default function EntryScreen({ onEnter }) {
  return (
    <div className="screen-entry anim-fade-up">
      <div className="entry-content">
        <span className="text-label entry-sys-tag">SYSTEM / 01</span>
        
        <h1 className="text-display-giant entry-title">
          VOICE<br />
          INTELLIGENCE
        </h1>

        <p className="text-sub entry-desc">
          REAL-TIME SPEAKER RECOGNITION & BIOMETRIC DIARIZATION CANVAS
        </p>

        <button className="btn-enter" onClick={onEnter}>
          <span className="btn-enter-text">[ ENTER SYSTEM ]</span>
          <span className="btn-enter-arrow">→</span>
        </button>
      </div>
    </div>
  );
}
