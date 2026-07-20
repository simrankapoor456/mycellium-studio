import { Button } from "@/components/ui/Button";
import type { DiscoveryContext, DiscoveryReviewInput, ProductChallenge } from "@/lib/domain/discovery/schemas";

type ReviewChallengesProps = Readonly<{
  context: DiscoveryContext;
  pending: boolean;
  blockingTargetIds?: ReadonlySet<string>;
  onBlockerRef?: (targetId: string, element: HTMLElement | null) => void;
  onMutate: (input: DiscoveryReviewInput) => void;
}>;

export function ReviewChallenges({ context, pending, blockingTargetIds = new Set(), onBlockerRef, onMutate }: ReviewChallengesProps) {
  const visible = context.challenges.filter((challenge) => challenge.status !== "resolved");
  if (visible.length === 0) return null;
  return (
    <section className="review-challenges">
      <header><span className="eyebrow">Risks and trade-offs</span><h2>Decisions worth making explicit</h2><p>These tensions can change product boundaries or architecture.</p></header>
      {visible.map((challenge) => {
        const targetId = `review-challenge-${challenge.id}`;
        return <article data-blocking={blockingTargetIds.has(targetId)} data-severity={challenge.severity} id={targetId} key={challenge.id} ref={(element) => onBlockerRef?.(targetId, element)} tabIndex={-1}>
          <div><strong>{challenge.title}</strong><small>{severityLabel(challenge.severity)} · {statusLabel(challenge.status)}</small></div>
          <p><b>Why it matters:</b> {challenge.description}</p>
          <p><b>Affected areas:</b> {challenge.category.replaceAll("_", " ")}</p>
          <p><b>Recommended action:</b> Clarify the boundary, accept the risk, or resolve the underlying choice.</p>
          {challenge.status === "open" ? <div><Button disabled={pending} onClick={() => onMutate({ action: "resolve_challenge", challengeId: challenge.id })} type="button">Resolve challenge</Button><Button disabled={pending} onClick={() => onMutate({ action: "acknowledge_challenge", challengeId: challenge.id })} type="button" variant="secondary">Acknowledge</Button><Button disabled={pending} onClick={() => onMutate({ action: "accept_challenge_risk", challengeId: challenge.id })} type="button" variant="outline">Accept risk</Button></div> : null}
        </article>;
      })}
    </section>
  );
}

function severityLabel(value: ProductChallenge["severity"]): string {
  return { critical: "Architecture blocker", material: "Important decision", advisory: "Useful consideration" }[value];
}

function statusLabel(value: ProductChallenge["status"]): string {
  return { open: "Needs input", acknowledged: "Acknowledged", accepted_risk: "Accepted risk", resolved: "Resolved" }[value];
}
