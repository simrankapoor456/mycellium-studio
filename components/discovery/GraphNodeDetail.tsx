"use client";

import { FormEvent, useId, useRef } from "react";

import { Button } from "@/components/ui/Button";
import type { DiscoveryContext, DiscoveryReviewInput, ProductGraph } from "@/lib/domain/discovery/schemas";

type GraphNodeDetailProps = Readonly<{
  context: DiscoveryContext;
  downstreamItems: readonly string[];
  messages: readonly Readonly<{ id: string; content: string }>[];
  node: ProductGraph["nodes"][number];
  pending: boolean;
  onMutate: (input: DiscoveryReviewInput) => void;
}>;

export function GraphNodeDetail({ context, downstreamItems, messages, node, pending, onMutate }: GraphNodeDetailProps) {
  const fact = context.facts.find((item) => item.id === node.id);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const deleteTitleId = useId();
  const deleteDescriptionId = useId();

  if (!fact) {
    return null;
  }

  const relatedIds = context.graph.edges.flatMap((edge) => {
    if (edge.source === node.id) return [edge.target];
    if (edge.target === node.id) return [edge.source];
    return [];
  });
  const relatedFacts = context.facts.filter((item) => relatedIds.includes(item.id) && item.deletedAt === null);
  const contradictions = context.contradictions.filter((item) => item.factIds.includes(fact.id));
  const challenges = context.challenges.filter((item) => item.sourceFactIds.includes(fact.id));
  const sourceMessages = messages.filter((message) => fact.sourceMessageIds.includes(message.id));
  const factId = fact.id;
  const factStatus = fact.status;

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("value") ?? "").trim();
    if (value) onMutate({ action: "edit_fact", factId, value, status: factStatus });
  }

  return (
    <aside aria-live="polite" className="living-graph__detail">
      <span>{fact.category.replaceAll("_", " ")}</span><h3>{fact.label}</h3><p>{fact.value}</p>
      <dl className="living-graph__metadata">
        <div><dt>State</dt><dd>{node.state.replaceAll("_", " ")}</dd></div>
        <div><dt>Confidence</dt><dd>{Math.round(fact.confidence * 100)}%</dd></div>
        <div><dt>Lineage</dt><dd>{fact.manuallyEdited ? "Manually edited" : "From product context"}</dd></div>
        <div><dt>Related facts</dt><dd>{relatedFacts.map((item) => item.label).join(", ") || "None yet"}</dd></div>
        <div><dt>Downstream blueprint items</dt><dd>{downstreamItems.join(", ") || "None yet"}</dd></div>
      </dl>
      {sourceMessages.map((message) => <a href={`#message-${message.id}`} key={message.id}>Jump to source: {message.content.slice(0, 80)}</a>)}
      <form className="living-graph__edit" onSubmit={handleEdit}><label htmlFor={`graph-value-${fact.id}`}>Edit this fact</label><textarea defaultValue={fact.value} id={`graph-value-${fact.id}`} name="value" required rows={3} /><Button disabled={pending} type="submit">Save fact</Button></form>
      <div className="living-graph__actions">
        <Button disabled={pending} onClick={() => onMutate({ action: "confirm_fact", factId: fact.id })} type="button">Confirm</Button>
        <Button disabled={pending} onClick={() => onMutate({ action: "mark_unknown", factId: fact.id })} type="button" variant="outline">Mark unknown</Button>
        <Button disabled={pending} onClick={() => onMutate({ action: "reject_assumption", factId: fact.id })} type="button" variant="quiet">Reject</Button>
        <Button disabled={pending} onClick={() => deleteDialog.current?.showModal()} type="button" variant="destructive">Delete</Button>
      </div>
      {contradictions.map((contradiction) => (
        <form className="living-graph__resolution" key={contradiction.id} onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          onMutate({ action: "resolve_contradiction", contradictionId: contradiction.id, resolution: String(data.get("resolution")), confirmedFactId: String(data.get("confirmedFactId")) });
        }}>
          <strong>{contradiction.description}</strong>
          <select aria-label="Direction to keep" name="confirmedFactId">{contradiction.factIds.map((id) => <option key={id} value={id}>{context.facts.find((item) => item.id === id)?.value ?? id}</option>)}</select>
          <input name="resolution" placeholder="Why this direction wins" required /><Button disabled={pending} type="submit">Resolve</Button>
        </form>
      ))}
      {challenges.map((challenge) => (
        <section className="living-graph__challenge" key={challenge.id}>
          <strong>{challenge.title}</strong><p>{challenge.description}</p><small>{challenge.severity} · {challenge.status.replaceAll("_", " ")}</small>
          {challenge.status === "open" ? <div><Button disabled={pending} onClick={() => onMutate({ action: "acknowledge_challenge", challengeId: challenge.id })} type="button" variant="secondary">Acknowledge</Button><Button disabled={pending} onClick={() => onMutate({ action: "accept_challenge_risk", challengeId: challenge.id })} type="button" variant="outline">Accept risk</Button></div> : null}
        </section>
      ))}
      <dialog aria-describedby={deleteDescriptionId} aria-labelledby={deleteTitleId} className="dialog-backdrop ui-dialog" ref={deleteDialog}>
        <div className="ui-dialog__content">
          <h2 id={deleteTitleId}>Delete this fact?</h2>
          <p id={deleteDescriptionId}>This removes the fact from the active foundation after you confirm.</p>
          <div><Button onClick={() => deleteDialog.current?.close()} type="button" variant="secondary">Cancel</Button><Button onClick={() => { deleteDialog.current?.close(); onMutate({ action: "delete_fact", factId: fact.id }); }} type="button" variant="destructive">Delete fact</Button></div>
        </div>
      </dialog>
    </aside>
  );
}
