"use client";

import { FormEvent, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import type { DiscoveryContext, DiscoveryFact, DiscoveryReviewInput, FactCategory } from "@/lib/domain/discovery/schemas";

type MutationFeedback = Readonly<{ targetId: string; status: "success" | "error"; message: string }>;

type ReviewFactListProps = Readonly<{
  context: DiscoveryContext;
  pending: boolean;
  blockingTargetIds?: ReadonlySet<string>;
  feedback?: MutationFeedback | null;
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

export function ReviewFactList({ context, pending, blockingTargetIds = new Set(), feedback = null, onBlockerRef, onMutate }: ReviewFactListProps) {
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
              {sectionFacts.map((fact) => {
                const targetId = `review-fact-${fact.id}`;
                return <ReviewFact acceptedUnknown={context.acceptedUnknownFactIds.includes(fact.id)} blocking={blockingTargetIds.has(targetId)} fact={fact} feedback={feedback?.targetId === targetId ? feedback : null} key={`${fact.id}:${fact.status}:${fact.value}`} onBlockerRef={onBlockerRef} onMutate={onMutate} pending={pending} />;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ReviewFact({ acceptedUnknown, blocking, fact, feedback, onBlockerRef, onMutate, pending }: Readonly<{ acceptedUnknown: boolean; blocking: boolean; fact: DiscoveryFact; feedback: MutationFeedback | null; onBlockerRef?: ReviewFactListProps["onBlockerRef"]; onMutate: ReviewFactListProps["onMutate"]; pending: boolean }>) {
  const [editing, setEditing] = useState(false);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const deleteTitleId = useId();
  const deleteDescriptionId = useId();
  const targetId = `review-fact-${fact.id}`;

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const status = String(data.get("status"));
    if (!isFactStatus(status)) return;
    onMutate({ action: "edit_fact", factId: fact.id, value: String(data.get("value")), status });
  }

  return (
    <article className="review-fact" data-blocking={blocking} id={targetId} ref={(element) => onBlockerRef?.(targetId, element)} tabIndex={-1}>
      {!editing ? <>
        <div className="review-fact__heading"><div><span>{humanize(fact.category)}</span><strong>{fact.label}</strong></div><span className="review-state" data-state={fact.status}>{statusLabel(fact.status)}</span></div>
        <p>{fact.value}</p>
        <small className="review-fact__source">{fact.sourceMessageIds.length > 0 ? `Rooted in ${fact.sourceMessageIds.length} discovery ${fact.sourceMessageIds.length === 1 ? "answer" : "answers"}` : "Rooted in your starting material"}</small>
        <div className="review-fact__actions">
          <Button disabled={pending} onClick={() => setEditing(true)} type="button" variant="outline">Edit fact</Button>
          {fact.status !== "confirmed" ? <Button disabled={pending} onClick={() => onMutate({ action: "confirm_fact", factId: fact.id })} type="button">Confirm fact</Button> : null}
          {fact.status !== "unknown" ? <Button disabled={pending} onClick={() => onMutate({ action: "mark_unknown", factId: fact.id })} type="button" variant="secondary">Keep unknown</Button> : null}
          {fact.status === "unknown" && !acceptedUnknown ? <Button disabled={pending} onClick={() => onMutate({ action: "accept_unknown", factId: fact.id })} type="button" variant="success">Confirm assumption</Button> : null}
          <Button disabled={pending} onClick={() => onMutate({ action: "reject_assumption", factId: fact.id })} type="button" variant="quiet">Reject from foundation</Button>
          <Button disabled={pending} onClick={() => deleteDialog.current?.showModal()} type="button" variant="destructive">Delete fact</Button>
        </div>
      </> : <form className="review-fact__editor" onSubmit={handleEdit}>
        <label>Statement<textarea autoFocus defaultValue={fact.value} name="value" required rows={4} /></label>
        <label>State<select defaultValue={fact.status} name="status"><option value="confirmed">Known</option><option value="inferred">Working assumption</option><option value="unknown">Still unknown</option><option value="rejected">Outside the foundation</option></select></label>
        <div><Button disabled={pending} type="submit">Save changes</Button><Button disabled={pending} onClick={() => setEditing(false)} type="button" variant="secondary">Cancel</Button></div>
      </form>}
      <p aria-live="polite" className="review-fact__feedback" data-status={feedback?.status} role={feedback?.status === "error" ? "alert" : "status"}>{feedback?.message ?? ""}</p>
      <dialog aria-describedby={deleteDescriptionId} aria-labelledby={deleteTitleId} className="dialog-backdrop ui-dialog" ref={deleteDialog}>
        <div className="ui-dialog__content">
          <h2 id={deleteTitleId}>Delete this fact?</h2>
          <p id={deleteDescriptionId}>This removes the fact from the active foundation. The change is saved only after you confirm.</p>
          <div><Button onClick={() => deleteDialog.current?.close()} type="button" variant="secondary">Cancel</Button><Button onClick={() => { deleteDialog.current?.close(); onMutate({ action: "delete_fact", factId: fact.id }); }} type="button" variant="destructive">Delete fact</Button></div>
        </div>
      </dialog>
    </article>
  );
}

function humanize(value: string): string { return value.replaceAll("_", " "); }
function statusLabel(value: DiscoveryFact["status"]): string { return { confirmed: "Confirmed", inferred: "Assumption", unknown: "Unknown", rejected: "Rejected" }[value]; }
function isFactStatus(value: string): value is DiscoveryFact["status"] { return ["confirmed", "inferred", "unknown", "rejected"].includes(value); }
