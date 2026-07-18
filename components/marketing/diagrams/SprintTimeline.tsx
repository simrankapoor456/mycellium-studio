import { useId } from "react";

import { executionSummary } from "@/lib/marketing/signature-experience";

export function SprintTimeline() {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <figure aria-label="Scrollable sprint allocation timeline" className="diagram-surface sprint-timeline" tabIndex={0}>
      <div className="diagram-heading"><span>Sprint allocation timeline</span><span>Dependency aware</span></div>
      <svg aria-describedby={descriptionId} aria-labelledby={titleId} className="diagram-canvas" role="img" viewBox="0 0 660 300">
        <title id={titleId}>Sprint allocation timeline</title>
        <desc id={descriptionId}>Identity and the project model lead into CRUD and ownership states, followed by the discovery continuation point across three sprints.</desc>
        <defs>
          <marker id={`${titleId}-arrow`} markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4"><path d="M0 0L8 4L0 8Z" /></marker>
        </defs>
        <path className="sprint-timeline__axis" d="M38 226H622" />
        <path className="diagram-edge diagram-edge--arrow" d="M214 132H252" markerEnd={`url(#${titleId}-arrow)`} />
        <path className="diagram-edge diagram-edge--arrow" d="M408 132H446" markerEnd={`url(#${titleId}-arrow)`} />
        {executionSummary.sprints.map((sprint, index) => {
          const x = 48 + index * 194;

          return (
            <g className="sprint-timeline__sprint" key={sprint.label} transform={`translate(${x} 76)`}>
              <rect height="112" rx="10" width="166" />
              <text className="sprint-timeline__label" x="18" y="30">{sprint.label}</text>
              <text className="sprint-timeline__work" x="18" y="58">{sprint.work}</text>
              <circle cx="83" cy="150" r="7" />
            </g>
          );
        })}
      </svg>
      <figcaption className="diagram-note">Later work begins only after the identity and ownership path is stable.</figcaption>
    </figure>
  );
}
