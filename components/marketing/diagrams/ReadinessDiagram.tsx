import { useId } from "react";

const readinessSignals = [
  ["Users", "Confirmed"],
  ["Evidence", "Strong"],
  ["Scope", "Review"],
  ["Risk", "Open"],
  ["Feasibility", "Grounded"],
] as const;

export function ReadinessDiagram() {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <figure aria-label="Scrollable discovery readiness diagram" className="diagram-surface readiness-diagram" tabIndex={0}>
      <svg aria-describedby={descriptionId} aria-labelledby={titleId} className="diagram-canvas" role="img" viewBox="0 0 360 300">
        <title id={titleId}>Discovery readiness view</title>
        <desc id={descriptionId}>A five-axis readiness view showing strong user, evidence, and feasibility signals with scope under review and one open risk.</desc>
        <g aria-hidden="true" className="readiness-diagram__rings">
          <polygon points="180,34 314,132 263,286 97,286 46,132" />
          <polygon points="180,72 278,143 241,256 119,256 82,143" />
          <polygon points="180,110 242,154 218,226 142,226 118,154" />
          <path d="M180 170V34M180 170L314 132M180 170L263 286M180 170L97 286M180 170L46 132" />
        </g>
        <polygon className="readiness-diagram__signal" points="180,49 287,139 226,235 115,260 73,140" />
        <g aria-hidden="true" className="readiness-diagram__points">
          <circle cx="180" cy="49" r="6" />
          <circle cx="287" cy="139" r="6" />
          <circle cx="226" cy="235" r="6" />
          <circle cx="115" cy="260" r="6" />
          <circle cx="73" cy="140" r="6" />
        </g>
      </svg>
      <figcaption className="diagram-key">
        {readinessSignals.map(([label, state]) => (
          <span key={label}><strong>{label}</strong>{state}</span>
        ))}
      </figcaption>
    </figure>
  );
}
