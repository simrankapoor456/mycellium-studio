import { FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import type { DiscoveryContext, DiscoveryReviewInput } from "@/lib/domain/discovery/schemas";

type Props = Readonly<{ context: DiscoveryContext; pending: boolean; blockingTargetIds?: ReadonlySet<string>; onBlockerRef?: (targetId: string, element: HTMLElement | null) => void; onMutate: (input: DiscoveryReviewInput) => void }>;

export function ReviewContradictions({ context, pending, blockingTargetIds = new Set(), onBlockerRef, onMutate }: Props) {
  const items = context.contradictions.filter((item) => item.status === "open");
  if (items.length === 0) return null;
  return <section className="review-contradictions"><header><span className="eyebrow">Evidence and assumptions</span><h2>{items.length === 1 ? "One direction needs your call" : `${items.length} directions need your call`}</h2></header>{items.map((item) => {
    const targetId = `review-contradiction-${item.id}`;
    return <form data-blocking={blockingTargetIds.has(targetId)} id={targetId} key={item.id} ref={(element) => onBlockerRef?.(targetId, element)} tabIndex={-1} onSubmit={(event: FormEvent<HTMLFormElement>) => {
      event.preventDefault(); const data = new FormData(event.currentTarget);
      onMutate({ action: "resolve_contradiction", contradictionId: item.id, resolution: String(data.get("resolution")), confirmedFactId: String(data.get("confirmedFactId")) });
    }}><strong>{item.description}</strong><label>Direction to keep<select name="confirmedFactId">{item.factIds.map((id) => { const fact = context.facts.find((candidate) => candidate.id === id); return <option key={id} value={id}>{fact?.value ?? "Available direction"}</option>; })}</select></label><label>Reason<input name="resolution" placeholder="Why this direction fits the product" required /></label><Button disabled={pending} type="submit">Keep this direction</Button></form>;
  })}</section>;
}
