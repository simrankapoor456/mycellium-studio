"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { ArchitectureReveal } from "@/components/discovery/ArchitectureReveal";
import { FoundationDecisionGroups } from "@/components/discovery/FoundationDecisionGroups";
import { FoundationMap } from "@/components/discovery/FoundationMap";
import { GenerationWorkspace } from "@/components/discovery/GenerationWorkspace";
import { ReviewChallenges } from "@/components/discovery/ReviewChallenges";
import { ReviewContradictions } from "@/components/discovery/ReviewContradictions";
import { ReviewFactList } from "@/components/discovery/ReviewFactList";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { Button, ButtonLink } from "@/components/ui/Button";
import { BlueprintGenerationResponseSchema, type BlueprintGenerationResponse } from "@/lib/domain/blueprint/schemas";
import { BLUEPRINT_INTERRUPTED_MESSAGE, readJsonResponseSafely, readTypedApiError } from "@/lib/errors/response";
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
  const [mutationFeedback, setMutationFeedback] = useState<Readonly<{ targetId: string; status: "success" | "error"; message: string }> | null>(null);
  const blockerElements = useRef(new Map<string, HTMLElement>());
  const generationRequestId = useRef<string | null>(null);
  const generationInFlight = useRef(false);

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
    const targetId = mutationTargetId(payload);
    setPending(true); setError(""); setApprovalDetails(null); setMutationFeedback(null);
    let requestFailure = "";
    try {
      const response = await fetch(`/api/projects/${projectId}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const parsedResponse = await readJsonResponseSafely(response);
      if (!parsedResponse.ok) {
        requestFailure = "That review change could not be saved. Your edit is still here. Retry.";
        throw new Error("Handled review response failure");
      }
      const body = parsedResponse.body;
      if (!response.ok) {
        if (response.status === 401) { const message = "Your session expired. Sign in again, then retry. Your review edit is still here."; setError(message); setMutationFeedback(targetId ? { targetId, status: "error", message } : null); return; }
        if (response.status === 403) { const message = "You do not have permission to change this foundation."; setError(message); setMutationFeedback(targetId ? { targetId, status: "error", message } : null); return; }
        const failure = readReviewFailure(body);
        setError(failure.error);
        setMutationFeedback(targetId ? { targetId, status: "error", message: failure.error } : null);
        if (failure.details) { setApprovalDetails(failure.details); focusFirstBlocker(failure.details); }
        return;
      }
      const result = DiscoveryReviewResponseSchema.parse(body);
      setContext(result.context); setReadiness(result.readiness); setApproved(result.approved);
      setMutationFeedback(targetId ? { targetId, status: "success", message: mutationSuccessMessage(payload) } : null);
      if (targetId) window.requestAnimationFrame(() => blockerElements.current.get(targetId)?.focus({ preventScroll: true }));
    } catch (caught) {
      requestFailure = caught instanceof TypeError
        ? "Could not reach the server. Your review edit is still here. Check your connection and retry."
        : "That review change could not be saved. Your edit is still here. Retry.";
      setError(requestFailure);
      setMutationFeedback(targetId ? { targetId, status: "error", message: requestFailure } : null);
    } finally { setPending(false); }
  }

  async function handleArchitect() {
    if (generationInFlight.current) return;
    generationInFlight.current = true;
    generationRequestId.current ??= crypto.randomUUID();
    setGenerationState("requested"); setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/blueprint`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: generationRequestId.current }) });
      const parsedResponse = await readJsonResponseSafely(response);
      if (!parsedResponse.ok) {
        setError(parsedResponse.error.message);
        setGenerationState("failed");
        return;
      }
      if (!response.ok) {
        setError(readTypedApiError(parsedResponse.body).message);
        setGenerationState("failed");
        return;
      }
      const parsedResult = BlueprintGenerationResponseSchema.safeParse(parsedResponse.body);
      if (!parsedResult.success) {
        setError(BLUEPRINT_INTERRUPTED_MESSAGE);
        setGenerationState("failed");
        return;
      }
      const result = parsedResult.data;
      setGenerationResult(result); setHasBlueprint(true); setGenerationState("revealing");
    } catch {
      setError(BLUEPRINT_INTERRUPTED_MESSAGE);
      setGenerationState("failed");
    } finally {
      generationInFlight.current = false;
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
      <header className="review-workspace__hero"><Link href={`/projects/${projectId}/discover`}>← {projectName} discovery</Link><span className="eyebrow">Foundation review</span><h1>Review the product foundation.</h1><p>Keep what is true, reshape what is not, and make every remaining uncertainty intentional.</p></header>
      <ProjectWorkspaceNav active="review" blueprintAvailable={hasBlueprint} discoveryStarted foundationApproved={approved} projectId={projectId} />
      {error ? <ApprovalNotice details={approvalDetails} error={error} /> : null}
      <FoundationDecisionGroups context={context} readiness={readiness} />
      <FoundationMap blockingTargetIds={blockingIds} context={context} onBlockerRef={registerBlocker} readiness={readiness} />
      <ReviewFactList blockingTargetIds={blockingIds} context={context} feedback={mutationFeedback} onBlockerRef={registerBlocker} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <ReviewContradictions blockingTargetIds={blockingIds} context={context} onBlockerRef={registerBlocker} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <ReviewChallenges blockingTargetIds={blockingIds} context={context} onBlockerRef={registerBlocker} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <footer className="review-approval"><div><span className="eyebrow">Foundation readiness</span><strong>{approved ? MYCELLIUM_COPY.review.approvedTitle : MYCELLIUM_COPY.review.pendingTitle}</strong><p>{approved ? MYCELLIUM_COPY.review.approvedDetail : MYCELLIUM_COPY.review.pendingDetail}</p></div>{approved ? <Button onClick={() => void handleArchitect()} type="button">Architect my product</Button> : <Button disabled={pending} loading={pending} onClick={() => void handleMutation({ action: "approve" })} type="button">Approve this foundation</Button>}</footer>
      {hasBlueprint ? <ButtonLink className="review-export-link" href={`/projects/${projectId}/export`} variant="secondary">Export the current Product Blueprint <span aria-hidden="true">→</span></ButtonLink> : <p className="review-export-locked">{MYCELLIUM_COPY.export.lockedDescription}</p>}
    </main>
  );
}

function mutationTargetId(input: DiscoveryReviewInput): string | null {
  if ("factId" in input) return `review-fact-${input.factId}`;
  if ("contradictionId" in input) return `review-contradiction-${input.contradictionId}`;
  if ("challengeId" in input) return `review-challenge-${input.challengeId}`;
  return null;
}

function mutationSuccessMessage(input: DiscoveryReviewInput): string {
  if (input.action === "edit_fact") return "Fact changes saved.";
  if (input.action === "confirm_fact") return "Fact confirmed.";
  if (input.action === "mark_unknown") return "Fact kept as an explicit unknown.";
  if (input.action === "accept_unknown") return "Unknown accepted as a documented assumption.";
  if (input.action === "reject_assumption") return "Fact rejected from the foundation.";
  if (input.action === "delete_fact") return "Fact removed.";
  if (input.action === "resolve_contradiction") return "Contradiction resolved.";
  if (input.action === "accept_challenge_risk") return "Challenge accepted with its risk visible.";
  if (input.action === "acknowledge_challenge") return "Challenge acknowledged.";
  if (input.action === "resolve_challenge") return "Challenge resolved.";
  return "Foundation updated.";
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
  if (typeof input === "object" && input !== null && "error" in input && typeof input.error === "string") {
    return input.error;
  }
  return readTypedApiError(input, fallback).message;
}
