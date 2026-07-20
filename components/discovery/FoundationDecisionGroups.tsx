import type { DiscoveryContext, ReadinessAssessment } from "@/lib/domain/discovery/schemas";
import { buildFoundationReviewGroups } from "@/lib/discovery/review-groups";

export function FoundationDecisionGroups({ context, readiness }: Readonly<{ context: DiscoveryContext; readiness: ReadinessAssessment }>) {
  const groups = buildFoundationReviewGroups(context, readiness);

  return (
    <section aria-labelledby="foundation-decisions-title" className="foundation-decision-groups">
      <header><span className="eyebrow">Progression rules</span><h2 id="foundation-decisions-title">What needs judgment, and what can stay open.</h2><p>Architecture uses confirmed facts, accepted assumptions, and explicit unknowns. Nothing unresolved becomes a fact silently.</p></header>
      <div>
        {groups.map((group) => (
          <article data-group={group.id} key={group.id}>
            <div><span>{group.items.length}</span><h3>{group.label}</h3></div>
            <p>{group.description}</p>
            {group.items.length > 0
              ? <ul>{group.items.map((item) => <li key={item.id}><a href={`#${item.targetId}`}><strong>{item.label}</strong><span>{item.detail}</span></a></li>)}</ul>
              : <small>Nothing in this group right now.</small>}
          </article>
        ))}
      </div>
    </section>
  );
}
