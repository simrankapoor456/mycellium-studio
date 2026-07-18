import { useId } from "react";

export function ScopeBoundaryMap() {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <figure aria-label="Scrollable scope boundary map" className="diagram-surface scope-map" tabIndex={0}>
      <div className="diagram-heading"><span>Scope boundary</span><span>Personal release</span></div>
      <svg aria-describedby={descriptionId} aria-labelledby={titleId} className="diagram-canvas" role="img" viewBox="0 0 520 330">
        <title id={titleId}>Scope boundary map</title>
        <desc id={descriptionId}>Personal projects, discovery context, and ownership controls are inside the first release. Teams, billing, and publishing remain outside.</desc>
        <rect className="scope-map__boundary" height="230" rx="18" width="332" x="30" y="48" />
        <text className="diagram-label" x="54" y="78">Inside the release</text>
        <g className="diagram-node diagram-node--active" transform="translate(58 102)"><rect height="54" rx="8" width="132" /><text x="66" y="33" textAnchor="middle">Personal projects</text></g>
        <g className="diagram-node diagram-node--active" transform="translate(202 102)"><rect height="54" rx="8" width="132" /><text x="66" y="33" textAnchor="middle">Discovery context</text></g>
        <g className="diagram-node diagram-node--active" transform="translate(130 178)"><rect height="54" rx="8" width="132" /><text x="66" y="33" textAnchor="middle">Ownership controls</text></g>
        <path className="diagram-edge" d="M190 129H202M196 156V178" />
        <text className="diagram-label" x="392" y="78">Later boundary</text>
        <g className="diagram-node diagram-node--future" transform="translate(388 102)"><rect height="46" rx="8" width="104" /><text x="52" y="29" textAnchor="middle">Teams</text></g>
        <g className="diagram-node diagram-node--future" transform="translate(388 164)"><rect height="46" rx="8" width="104" /><text x="52" y="29" textAnchor="middle">Billing</text></g>
        <g className="diagram-node diagram-node--future" transform="translate(388 226)"><rect height="46" rx="8" width="104" /><text x="52" y="29" textAnchor="middle">Publishing</text></g>
      </svg>
      <figcaption className="diagram-note">The boundary is explicit: collaboration and external publishing do not enter the personal foundation.</figcaption>
    </figure>
  );
}
