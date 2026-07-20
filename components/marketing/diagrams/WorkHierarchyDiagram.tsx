import { useId } from "react";

export function WorkHierarchyDiagram() {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <figure aria-label="Scrollable epic story and task hierarchy" className="diagram-surface work-hierarchy" tabIndex={0}>
      <div className="diagram-heading"><span>Epic, story, task hierarchy</span><span>Traceable work</span></div>
      <svg aria-describedby={descriptionId} aria-labelledby={titleId} className="diagram-canvas" role="img" viewBox="0 0 600 360">
        <title id={titleId}>Epic story and task hierarchy</title>
        <desc id={descriptionId}>An approved outcome contains a core journey and trust boundary. Their tasks validate input, persist state, enforce access, and verify recovery.</desc>
        <path className="diagram-edge" d="M300 82V120H158V154M300 120H442V154M158 208V244H90V278M158 244H226V278M442 208V244H374V278M442 244H510V278" />
        <g className="diagram-node diagram-node--epic" transform="translate(198 28)"><rect height="54" rx="8" width="204" /><text x="102" y="33" textAnchor="middle">Approved outcome</text></g>
        <g className="diagram-node diagram-node--story" transform="translate(74 154)"><rect height="54" rx="8" width="168" /><text x="84" y="33" textAnchor="middle">Core journey</text></g>
        <g className="diagram-node diagram-node--story" transform="translate(358 154)"><rect height="54" rx="8" width="168" /><text x="84" y="33" textAnchor="middle">Trust boundary</text></g>
        <g className="diagram-node diagram-node--task" transform="translate(28 278)"><rect height="44" rx="8" width="124" /><text x="62" y="28" textAnchor="middle">Validate input</text></g>
        <g className="diagram-node diagram-node--task" transform="translate(164 278)"><rect height="44" rx="8" width="124" /><text x="62" y="28" textAnchor="middle">Persist state</text></g>
        <g className="diagram-node diagram-node--task" transform="translate(312 278)"><rect height="44" rx="8" width="124" /><text x="62" y="28" textAnchor="middle">Enforce access</text></g>
        <g className="diagram-node diagram-node--task" transform="translate(448 278)"><rect height="44" rx="8" width="124" /><text x="62" y="28" textAnchor="middle">Verify recovery</text></g>
      </svg>
      <figcaption className="diagram-note">Each task remains attached to a story, an epic, and the approved requirement that created it.</figcaption>
    </figure>
  );
}
