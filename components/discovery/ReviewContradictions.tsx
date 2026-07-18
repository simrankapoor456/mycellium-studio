import { FormEvent } from "react";

import type { DiscoveryContext, DiscoveryReviewInput } from "@/lib/domain/discovery/schemas";

type ReviewContradictionsProps = Readonly<{
  context: DiscoveryContext;
  pending: boolean;
  onMutate: (input: DiscoveryReviewInput) => void;
}>;

export function ReviewContradictions({ context, pending, onMutate }: ReviewContradictionsProps) {
  const openContradictions = context.contradictions.filter((item) => item.status === "open");

  if (openContradictions.length === 0) {
    return null;
  }

  return (
    <section className="review-contradictions">
      <span className="eyebrow">A decision is pulling in two directions</span>
      <h2>{openContradictions.length === 1 ? "One contradiction needs your call" : `${openContradictions.length} contradictions need your call`}</h2>
      {openContradictions.map((item) => (
        <form key={item.id} onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          onMutate({ action: "resolve_contradiction", contradictionId: item.id, resolution: String(data.get("resolution")), confirmedFactId: String(data.get("confirmedFactId")) });
        }}>
          <strong>{item.description}</strong>
          <select aria-label="Answer to keep" name="confirmedFactId">{item.factIds.map((id) => { const fact = context.facts.find((candidate) => candidate.id === id); return <option key={id} value={id}>{fact?.value ?? id}</option>; })}</select>
          <input name="resolution" placeholder="Why this is the direction to keep" required />
          <button disabled={pending} type="submit">Keep this direction</button>
        </form>
      ))}
    </section>
  );
}
