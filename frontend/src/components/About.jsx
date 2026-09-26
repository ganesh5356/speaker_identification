import Reveal from "./Reveal.jsx";

const PIPELINE = [
  { title: "Voice input", detail: "A 3–8 second recording is captured in the browser or uploaded as a file." },
  { title: "Preprocessing", detail: "Converted to mono 16 kHz audio, silence trimmed, volume normalised, cut into overlapping 3s windows." },
  { title: "MFCC extraction", detail: "Each window becomes a sequence of 40 Mel-Frequency Cepstral Coefficients — a compact fingerprint of the voice's timbre." },
  { title: "BiLSTM network", detail: "Two bidirectional LSTM layers read the coefficient sequence forward and backward, learning how the voice changes over time." },
  { title: "Softmax classifier", detail: "A dense + softmax layer turns the learned representation into a probability for every enrolled speaker." },
  { title: "Prediction", detail: "Segment probabilities are averaged and the highest-confidence speaker is shown, with a full breakdown." },
];

const STACK = [
  { name: "Python", role: "Core language" },
  { name: "Librosa", role: "Audio + MFCC extraction" },
  { name: "TensorFlow / Keras", role: "BiLSTM model" },
  { name: "scikit-learn", role: "Splits + metrics" },
  { name: "Flask", role: "Prediction API" },
  { name: "React + Vite", role: "This interface" },
];

export default function About() {
  return (
    <div className="about">
      <Reveal className="hero">
        <p className="eyebrow">Final year project</p>
        <h2>
          Identifying <span className="grad">who</span> is speaking,
          <br />
          from the sound of their <span className="grad">voice</span> alone.
        </h2>
        <p className="lead">
          This system enrolls a small, closed set of speakers, learns each one's vocal fingerprint using MFCC
          features and a bidirectional LSTM, and predicts the speaker of a brand-new recording in real time.
        </p>
      </Reveal>

      <Reveal as="section" className="card about-card" delay={80}>
        <p className="eyebrow">How a prediction happens</p>
        <ol className="flow">
          {PIPELINE.map((step, i) => (
            <li key={step.title} style={{ transitionDelay: `${120 + i * 90}ms` }}>
              <span className="flow-num">{i + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p className="muted">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <div className="about-grid">
        <Reveal as="section" className="card" delay={60}>
          <p className="eyebrow">Scope</p>
          <ul className="check-list">
            <li>Closed-set identification — chooses only among enrolled speakers</li>
            <li>3–5 enrolled speakers in the first prototype</li>
            <li>Evaluated with accuracy, precision, recall, F1 and a confusion matrix</li>
            <li>Unknown-speaker / open-set detection is future scope</li>
          </ul>
        </Reveal>

        <Reveal as="section" className="card" delay={140}>
          <p className="eyebrow">Tech stack</p>
          <ul className="stack-list">
            {STACK.map((t) => (
              <li key={t.name}>
                <span>{t.name}</span>
                <span className="muted">{t.role}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}