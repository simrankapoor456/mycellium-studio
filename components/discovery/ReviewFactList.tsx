"use client";

import { FormEvent, useState } from "react";

import type { DiscoveryContext, DiscoveryFact, DiscoveryReviewInput, FactCategory } from "@/lib/domain/discovery/schemas";

type ReviewFactListProps = Readonly<{
  context: DiscoveryContext;
  pending: boolean;
  blockingTargetIds?: ReadonlySet<string>;
  onBlockerRef?: (targetId: string, element: HTMLElement | null) => void;
  onMutate: (input: DiscoveryReviewInput) => void;
}>;

const SECTIONS: ReadonlyArray<Readonly<{ title: string; description: string; categories: readonly FactCategory[] }>> = [
  { title: "Product direction", description: "The problem, primary outcome, and reason this product should exist.", categories: ["problem", "use_cases", "business_objective", "product_type", "success_metrics"] },
  { title: "People and use cases", description: "Who this serves and what they need to accomplish.", categories: ["target_users"] },
  { title: "Product boundaries", description: "What belongs in the first version, what waits, and what shapes the work.", categories: ["included_scope", "excluded_scope", "constraints", "unknowns"] },
  { title: "Evidence and assumptions", description: "What is confirmed, what is inferred, and where more clarity is useful.", categories: ["assumptions", "dependencies"] },
  { title: "Feasibility", description: "Capabilities, quality expectations, and technical boundaries.", categories: ["functional_requirements", "non_functional_requirements", "technical_preferences", "architecture_decisions"] },
  { title: "Risks and trade-offs", description: "Known risks that should stay visible as architecture takes shape.", categories: ["risks"] },
];

export function ReviewFactList({ context, pending, blockingTargetIds = new Set(), onBlockerRef, onMutate }: ReviewFactListProps) {
  const facts = context.facts.filter((fact) => fact.deletedAt === null);
  return (
    <div className="review-narrative">
      {SECTIONS.map((section) => {
        const sectionFacts = facts.filter((fact) => section.categories.includes(fact.category));
        if (sectionFacts.length === 0) return null;
        return (
          <section className="review-story" key={section.title}>
            <header><span className="eyebrow">Foundation</span><h2>{section.title}</h2><p>{section.description}</p></header>
            <div className="review-story__items">
              {sectionFacts.map((fact) => <ReviewFact acceptedUnknown={context.acceptedUnknownFactIds.includes(fact.id)} blocking={blockingTargetIds.has(`review-fact-${fact.id}`)} fact={fact} key={fact.id} onBlockerRef={onBlockerRef} onMutate={onMutate} pending={pending} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ReviewFact({ acceptedUnknown, blocking, fact, onBlockerRef, onMutate, pending }: Readonly<{ acceptedUnknown: boolean; blocking: boolean; fact: DiscoveryFact; onBlockerRef?: ReviewFactListProps["onBlockerRef"]; onMutate: ReviewFactListProps["onMutate"]; pending: boolean }>) {
  const [editing, setEditing] = useState(false);
  const targetId = `review-fact-${fact.id}`;
  return (
    <article className="review-fact" data-blocking={blocking} id={targetId} ref={(element) => onBlockerRef?.(targetId, element)} tabIndex={-1}>
      {!editing ? <>
        <div className="review-fact__heading"><div><span>{humanize(fact.category)}</span><strong>{fact.label}</strong></div><span className="review-state" data-state={fact.status}>{statusLabel(fact.status)}</span></div>
        <p>{fact.value}</p>
        <footer><small>{fact.sourceMessageIds.length > 0 ? `Rooted in ${fact.sourceMessageIds.length} discovery ${fact.sourceMessageIds.length === 1 ? "answer" : "answers"}` : "Rooted in your starting material"}</small><button onClick={() => setEditing(true)} type="button">Edit</button></footer>
      </> : <form onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const status = String(data.get("status"));
        if (!isFactStatus(status)) return;
        onMutate({ action: "edit_fact", factId: fact.id, value: String(data.get("value")), status });
        setEditing(false);
      }}>
        <label>Statement<textarea autoFocus defaultValue={fact.value} name="value" required rows={4} /></label>
        <label>State<select defaultValue={fact.status} name="status"><option value="confirmed">Known</option><option value="inferred">Working assumption</option><option value="unknown">Still unknown</option><option value="rejected">Outside the plan</option></select></label>
        <div><button disabled={pending} type="submit">Save</button><button onClick={() => setEditing(false)} type="button">Cancel</button></div>
      </form>}
      <details className="review-fact__menu"><summary>More actions</summary><div>
        {fact.status !== "confirmed" ? <button disabled={pending} onClick={() => onMutate({ action: "confirm_fact", factId: fact.id })} type="button">Confirm as known</button> : null}
        {fact.status !== "unknown" ? <button disabled={pending} onClick={() => onMutate({ action: "mark_unknown", factId: fact.id })} type="button">Mark still unknown</button> : null}
        {fact.status === "unknown" && !acceptedUnknown ? <button disabled={pending} onClick={() => onMutate({ action: "accept_unknown", factId: fact.id })} type="button">Plan around this unknown</button> : null}
        <button disabled={pending} onClick={() => onMutate({ action: "reject_assumption", factId: fact.id })} type="button">Move outside the plan</button>
        <button className="danger" disabled={pending} onClick={() => onMutate({ action: "delete_fact", factId: fact.id })} type="button">Remove statement</button>
      </div></details>
    </article>
  );
}

function humanize(value: string): string { return value.replaceAll("_", " "); }
function statusLabel(value: DiscoveryFact["status"]): string { return { confirmed: "Confirmed", inferred: "Inferred", unknown: "Unresolved", rejected: "Outside scope" }[value]; }
function isFactStatus(value: string): value is DiscoveryFact["status"] { return ["confirmed", "inferred", "unknown", "rejected"].includes(value); }
