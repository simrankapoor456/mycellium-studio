"use client";

import { useEffect, useState } from "react";

import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

const STAGES = ["Gathering the strongest roots", "Turning intent into goals", "Anchoring the requirements", "Connecting architecture decisions", "Drawing the scope boundary", "Branching work into epics", "Giving stories a path", "Shaping the first sprints"] as const;

export function ArchitectureReveal({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { const immediate = window.setTimeout(() => { setStage(STAGES.length); onComplete(); }, 0); return () => window.clearTimeout(immediate); }
    const timer = window.setInterval(() => setStage((current) => { if (current >= STAGES.length - 1) { window.clearInterval(timer); window.setTimeout(onComplete, 260); return STAGES.length; } return current + 1; }), 220);
    return () => window.clearInterval(timer);
  }, [onComplete]);
  return <section aria-live="polite" className="architecture-reveal"><div className="architecture-reveal__plane">{STAGES.map((label, index) => <span data-active={index <= stage} key={label}>{index + 1}</span>)}</div><span className="eyebrow">Product architecture</span><h2>{STAGES[Math.min(stage, STAGES.length - 1)]}</h2><p>{MYCELLIUM_COPY.generation.reveal}</p><button onClick={onComplete} type="button">Show me the blueprint</button></section>;
}

export { STAGES as ARCHITECTURE_REVEAL_STAGES };
