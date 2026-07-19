"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { ArchitectureReveal } from "@/components/discovery/ArchitectureReveal";
import { FoundationMap } from "@/components/discovery/FoundationMap";
import { GenerationWorkspace } from "@/components/discovery/GenerationWorkspace";
import { ReviewChallenges } from "@/components/discovery/ReviewChallenges";
import { ReviewContradictions } from "@/components/discovery/ReviewContradictions";
import { ReviewFactList } from "@/components/discovery/ReviewFactList";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { BlueprintGenerationResponseSchema, type BlueprintGenerationResponse } from "@/lib/domain/blueprint/schemas";
import {
  DiscoveryReviewResponseSchema,
  FoundationApprovalDetailsSchema,
  type DiscoveryContext,
  type DiscoveryReviewInput,
  type FoundationApprovalDetails,
  type ReadinessAssessment,
} from "@/lib/domain/discovery/schemas";
import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

type Props = Readonly<{ blueprintAvailable: boolean; initialContext: DiscoveryContext; initialReadiness: ReadinessAssessment; initiallyApproved: boolean; projectId: string; projectName: string }>;
type GenerationState = "idle" | "requested" | "failed" | "revealing";

export function ReviewWorkspace({ blueprintAvailable, initialContext, initialReadiness, initiallyApproved, projectId, projectName }: Props) {
  const router = useRouter();
  const [context, setContext] = useState(initialContext);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [approved, setApproved] = useState(initiallyApproved);
  const [hasBlueprint, setHasBlueprint] = useState(blueprintAvailable);
  const [pending, setPending] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [generationResult, setGenerationResult] = useState<BlueprintGenerationResponse | null>(null);
  const [error, setError] = useState("");
  const [approvalDetails, setApprovalDetails] = useState<FoundationApprovalDetails | null>(null);
  const blockerElements = useRef(new Map<string, HTMLElement>());
  const generationRequestId = useRef<string | null>(null);

  const registerBlocker = useCallback((targetId: string, element: HTMLElement | null) => {
    if (element) blockerElements.current.set(targetId, element);
    else blockerElements.current.delete(targetId);
  }, []);

  function focusFirstBlocker(details: FoundationApprovalDetails) {
    window.requestAnimationFrame(() => {
      const first = details.blockers.map((blocker) => blockerElements.current.get(blocker.targetId)).find(Boolean);
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      first?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      first?.focus({ preventScroll: true });
    });
  }

  async function handleMutation(payload: DiscoveryReviewInput) {
    setPending(true); setError(""); setApprovalDetails(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body: unknown = await response.json();
      if (!response.ok) {
        const failure = readReviewFailure(body);
        setError(failure.error);
        if (failure.details) { setApprovalDetails(failure.details); focusFirstBlocker(failure.details); }
        return;
      }
      const result = DiscoveryReviewResponseSchema.parse(body);
      setContext(result.context); setReadiness(result.readiness); setApproved(result.approved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That review change could not be saved.");
    } finally { setPending(false); }
  }

  async function handleArchitect() {
    generationRequestId.current ??= crypto.randomUUID();
    setGenerationState("requested"); setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/blueprint`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: generationRequestId.current }) });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(readErrorMessage(body, MYCELLIUM_COPY.generation.failure));
      const result = BlueprintGenerationResponseSchema.parse(body);
      setGenerationResult(result); setHasBlueprint(true); setGenerationState("revealing");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : MYCELLIUM_COPY.generation.failure);
      setGenerationState("failed");
    }
  }

  if (generationState === "requested" || generationState === "failed") {
    return <GenerationWorkspace error={generationState === "failed" ? error : ""} onRetry={() => void handleArchitect()} onReturn={() => { setError(""); setGenerationState("idle"); }} />;
  }
  if (generationState === "revealing" && generationResult) {
    return <ArchitectureReveal result={generationResult} onComplete={() => { router.push(`/projects/${projectId}`); router.refresh(); }} />;
  }

  const blockingIds = new Set(approvalDetails?.blockers.map((blocker) => blocker.targetId) ?? []);
  return (
    <main className="review-workspace">
      <header className="review-workspace__hero"><Link href={`/projects/${projectId}/discover`}>← {projectName} discovery</Link><span className="eyebrow">Foundation review</span><h1>Mycel Core has been listening.</h1><p>Here is the product foundation it understands. Keep what is true, reshape what is not, and make uncertainty intentional.</p></header>
      <ProjectWorkspaceNav active="review" blueprintAvailable={hasBlueprint} discoveryStarted foundationApproved={approved} projectId={projectId} />
      {error ? <ApprovalNotice details={approvalDetails} error={error} /> : null}
      <FoundationMap blockingTargetIds={blockingIds} context={context} onBlockerRef={registerBlocker} readiness={readiness} />
      <ReviewFactList blockingTargetIds={blockingIds} context={context} onBlockerRef={registerBlocker} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <ReviewContradictions blockingTargetIds={blockingIds} context={context} onBlockerRef={registerBlocker} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <ReviewChallenges blockingTargetIds={blockingIds} context={context} onBlockerRef={registerBlocker} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <footer className="review-approval"><div><span className="eyebrow">Foundation readiness</span><strong>{approved ? MYCELLIUM_COPY.review.approvedTitle : MYCELLIUM_COPY.review.pendingTitle}</strong><p>{approved ? MYCELLIUM_COPY.review.approvedDetail : MYCELLIUM_COPY.review.pendingDetail}</p></div>{approved ? <button onClick={() => void handleArchitect()} type="button">Architect my product</button> : <button disabled={pending} onClick={() => void handleMutation({ action: "approve" })} type="button">Approve this foundation</button>}</footer>
      {hasBlueprint ? <Link className="review-export-link" href={`/projects/${projectId}/export`}>Export the current Product Blueprint →</Link> : <p className="review-export-locked">{MYCELLIUM_COPY.export.lockedDescription}</p>}
    </main>
  );
}

function ApprovalNotice({ details, error }: Readonly<{ details: FoundationApprovalDetails | null; error: string }>) {
  return <section aria-atomic="true" aria-live="assertive" className="approval-notice" role="alert" tabIndex={-1}><span className="eyebrow">Your input is needed</span><h2>{details?.summary ?? "The foundation could not be updated yet."}</h2><p>{error}</p>{details ? <><dl><div><dt>Missing areas</dt><dd>{details.counts.missingFoundation}</dd></div><div><dt>Open unknowns</dt><dd>{details.counts.unknowns}</dd></div><div><dt>Contradictions</dt><dd>{details.counts.contradictions}</dd></div><div><dt>Challenges</dt><dd>{details.counts.challenges}</dd></div></dl><ul>{details.blockers.map((blocker) => <li key={blocker.id}><a href={`#${blocker.targetId}`}>{blocker.label}: {blocker.detail}</a></li>)}</ul></> : null}</section>;
}

function readReviewFailure(input: unknown): Readonly<{ error: string; details: FoundationApprovalDetails | null }> {
  const error = readErrorMessage(input, "That review change could not be saved.");
  if (typeof input !== "object" || input === null || !("details" in input)) return { error, details: null };
  const parsed = FoundationApprovalDetailsSchema.safeParse(input.details);
  return { error, details: parsed.success ? parsed.data : null };
}

function readErrorMessage(input: unknown, fallback: string): string {
  return typeof input === "object" && input !== null && "error" in input && typeof input.error === "string" ? input.error : fallback;
}
