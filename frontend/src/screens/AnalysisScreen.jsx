import AudioCore from "../components/AudioCore.jsx";

export default function AnalysisScreen({
  state,
  analyser,
  onRecordStart,
  onRecordStop,
  onFileSelect,
}) {
  return (
    <div className="screen-analysis anim-fade-up">
      <div className="analysis-header">
        <span className="text-label">SCREEN 02</span>
        <h2 className="text-heading">AUDIO INTERACTION CANVAS</h2>
      </div>

      <AudioCore
        state={state}
        sampleNum="02"
        analyser={analyser}
        onRecordStart={onRecordStart}
        onRecordStop={onRecordStop}
        onFileSelect={onFileSelect}
      />
    </div>
  );
}
