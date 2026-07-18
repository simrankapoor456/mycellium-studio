import type { ReadinessAssessment } from "@/lib/domain/discovery/schemas";
import { getReadinessPresentation } from "@/lib/voice/mycellium";

export function ReadinessRoots({ readiness }: { readiness: ReadinessAssessment }) {
  const areas = [...readiness.rootedAreas.map((category) => ({ category, rooted: true })), ...readiness.areasNeedingClarification.map((category) => ({ category, rooted: false }))];
  const presentation = getReadinessPresentation(readiness);
  return (
    <section aria-label="Discovery readiness" className="readiness-roots">
      <div className="readiness-roots__header">
        <div><span className="eyebrow">Product foundation</span><strong>{presentation.title}</strong></div>
        <span className="readiness-roots__status">{presentation.statusLabel}</span>
      </div>
      <div className="readiness-roots__map" role="list" aria-label="Product understanding areas">
        {areas.map((area) => <span data-rooted={area.rooted} key={area.category} role="listitem">{area.category.replaceAll("_", " ")}</span>)}
      </div>
      <p>{presentation.summary}</p>
      <small>{presentation.momentum}</small>
    </section>
  );
}
