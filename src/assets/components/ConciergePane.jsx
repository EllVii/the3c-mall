// src/assets/components/ConciergePane.jsx
import { useState } from "react";

const TONES = [
  {
    id: "coach",
    label: "Coach Mode · Hype",
    line: "Yo. You’re aging like fine wine, not like a boomer. Let’s tighten up today.",
  },
  {
    id: "clinical",
    label: "Clinical · Data first",
    line: "Here’s the clean protein, lowest unit price, and how it impacts your macros.",
  },
  {
    id: "chill",
    label: "Chill · Soft landings",
    line: "Rough week? We’ll make the next step tiny, safe, and actually doable.",
  },
];

export default function ConciergePane() {
  const [toneIndex, setToneIndex] = useState(0);
  const tone = TONES[toneIndex];

  const cycleTone = () => {
    setToneIndex((i) => (i + 1) % TONES.length);
  };

  return (
    <aside className="concierge-pane">
      <div className="concierge-label">Adaptive concierge</div>
      <p className="concierge-question">{tone.line}</p>
      <button className="btn btn-ghost concierge-tone-pill" onClick={cycleTone}>
        <span>🎛</span>
        <span>{tone.label}</span>
      </button>
    </aside>
  );
}
