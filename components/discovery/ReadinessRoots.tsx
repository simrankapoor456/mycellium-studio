import type { ReadinessAssessment } from "@/lib/domain/discovery/schemas";

export function ReadinessRoots({ readiness }: { readiness: ReadinessAssessment }) {
  const areas = [...readiness.rootedAreas.map((category) => ({ category, rooted: true })), ...readiness.areasNeedingClarification.map((category) => ({ category, rooted: false }))];
  return (
    <section aria-label="Discovery readiness" className="readiness-roots">
      <div className="readiness-roots__header">
        <div><span className="eyebrow">Readiness</span><strong>{readiness.score}/100</strong></div>
        <span className="readiness-roots__status">{readiness.status.replaceAll("_", " ")}</span>
      </div>
      <div className="readiness-roots__map" role="list" aria-label="Product understanding areas">
        {areas.map((area) => <span data-rooted={area.rooted} key={area.category} role="listitem">{area.category.replaceAll("_", " ")}</span>)}
      </div>
      <p>{readiness.explanation}</p>
    </section>
  );
}
