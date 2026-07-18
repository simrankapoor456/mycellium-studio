import { FormEvent } from "react";

import type { DiscoveryContext, DiscoveryReviewInput } from "@/lib/domain/discovery/schemas";

type ReviewFactListProps = Readonly<{
  context: DiscoveryContext;
  pending: boolean;
  onMutate: (input: DiscoveryReviewInput) => void;
}>;

export function ReviewFactList({ context, pending, onMutate }: ReviewFactListProps) {
  return (
    <section className="review-facts">
      <div className="section-intro"><div><span className="eyebrow">What I heard</span><h2>Your product foundation</h2></div><span>{context.facts.length} rooted details</span></div>
      {context.facts.map((fact) => (
        <form key={fact.id} onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const status = String(data.get("status"));

          if (!isFactStatus(status)) {
            return;
          }

          onMutate({ action: "edit_fact", factId: fact.id, value: String(data.get("value")), status });
        }}>
          <div><span>{fact.category.replaceAll("_", " ")}</span><strong>{fact.label}</strong><small>{fact.sourceMessageIds.length ? `Rooted in ${fact.sourceMessageIds.length} discovery ${fact.sourceMessageIds.length === 1 ? "answer" : "answers"}` : "Rooted in your starting context"}</small></div>
          <textarea defaultValue={fact.value} name="value" rows={2} />
          <select aria-label={`Confidence for ${fact.label}`} defaultValue={fact.status} name="status"><option value="confirmed">Known</option><option value="inferred">Working assumption</option><option value="unknown">Still unknown</option><option value="rejected">Not part of the plan</option></select>
          <button disabled={pending} type="submit">Save change</button>
          {fact.status === "inferred" ? <button disabled={pending} onClick={() => onMutate({ action: "reject_assumption", factId: fact.id })} type="button">Remove assumption</button> : null}
          {fact.status === "unknown" && !context.acceptedUnknownFactIds.includes(fact.id) ? <button disabled={pending} onClick={() => onMutate({ action: "accept_unknown", factId: fact.id })} type="button">Plan around this unknown</button> : null}
        </form>
      ))}
    </section>
  );
}

function isFactStatus(value: string): value is "confirmed" | "inferred" | "unknown" | "rejected" {
  return ["confirmed", "inferred", "unknown", "rejected"].includes(value);
}
