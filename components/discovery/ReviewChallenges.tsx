import type { DiscoveryContext, DiscoveryReviewInput } from "@/lib/domain/discovery/schemas";

type ReviewChallengesProps = Readonly<{
  context: DiscoveryContext;
  pending: boolean;
  onMutate: (input: DiscoveryReviewInput) => void;
}>;

export function ReviewChallenges({ context, pending, onMutate }: ReviewChallengesProps) {
  const visible = context.challenges.filter((challenge) => challenge.status !== "resolved");

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="review-challenges">
      <span className="eyebrow">Product challenges</span><h2>Trade-offs worth making explicit</h2>
      {visible.map((challenge) => (
        <article data-severity={challenge.severity} key={challenge.id}>
          <div><strong>{challenge.title}</strong><small>{challenge.severity} · {challenge.status.replaceAll("_", " ")}</small></div>
          <p>{challenge.description}</p>
          {challenge.status === "open" ? <div><button disabled={pending} onClick={() => onMutate({ action: "acknowledge_challenge", challengeId: challenge.id })} type="button">Acknowledge</button><button disabled={pending} onClick={() => onMutate({ action: "accept_challenge_risk", challengeId: challenge.id })} type="button">Accept as risk</button><button disabled={pending} onClick={() => onMutate({ action: "resolve_challenge", challengeId: challenge.id })} type="button">Mark resolved</button></div> : null}
        </article>
      ))}
    </section>
  );
}
