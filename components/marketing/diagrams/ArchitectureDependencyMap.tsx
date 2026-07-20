import { useId } from "react";

export function ArchitectureDependencyMap() {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <figure aria-label="Scrollable architecture dependency map" className="diagram-surface dependency-map" tabIndex={0}>
      <div className="diagram-heading"><span>Architecture dependency map</span><span>Decision path</span></div>
      <svg aria-describedby={descriptionId} aria-labelledby={titleId} className="diagram-canvas" role="img" viewBox="0 0 560 330">
        <title id={titleId}>Architecture dependency map</title>
        <desc id={descriptionId}>Server verified identity protects project operations, which validate project contracts before persisting user-owned data. A future AI provider remains outside the core boundary.</desc>
        <defs>
          <marker id={`${titleId}-arrow`} markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4"><path d="M0 0L8 4L0 8Z" /></marker>
        </defs>
        <path className="diagram-edge diagram-edge--arrow" d="M142 164H212" markerEnd={`url(#${titleId}-arrow)`} />
        <path className="diagram-edge diagram-edge--arrow" d="M348 164H418" markerEnd={`url(#${titleId}-arrow)`} />
        <path className="diagram-edge diagram-edge--future" d="M280 112V68H456V112" />
        <g className="diagram-node diagram-node--active" transform="translate(26 132)"><rect height="64" rx="8" width="116" /><text x="58" y="29" textAnchor="middle">Identity</text><text className="diagram-node__detail" x="58" y="46" textAnchor="middle">Server verified</text></g>
        <g className="diagram-node diagram-node--active" transform="translate(212 132)"><rect height="64" rx="8" width="136" /><text x="68" y="29" textAnchor="middle">Project operations</text><text className="diagram-node__detail" x="68" y="46" textAnchor="middle">Ownership filtered</text></g>
        <g className="diagram-node diagram-node--active" transform="translate(418 132)"><rect height="64" rx="8" width="116" /><text x="58" y="29" textAnchor="middle">Database</text><text className="diagram-node__detail" x="58" y="46" textAnchor="middle">RLS enforced</text></g>
        <g className="diagram-node diagram-node--future" transform="translate(398 22)"><rect height="46" rx="8" width="116" /><text x="58" y="29" textAnchor="middle">AI provider</text></g>
        <text className="diagram-label" x="234" y="226">Zod contracts validate each boundary</text>
      </svg>
      <figcaption className="diagram-note">Provider access can change later without moving identity or project ownership into the browser.</figcaption>
    </figure>
  );
}
