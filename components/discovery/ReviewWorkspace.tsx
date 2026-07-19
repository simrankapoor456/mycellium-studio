"use client";

import Link from "next/link";
import { useState } from "react";

import { BlueprintCompletion } from "@/components/blueprint/BlueprintCompletion";
import { ArchitectureReveal } from "@/components/discovery/ArchitectureReveal";
import { ReadinessRoots } from "@/components/discovery/ReadinessRoots";
import { ReviewChallenges } from "@/components/discovery/ReviewChallenges";
import { ReviewContradictions } from "@/components/discovery/ReviewContradictions";
import { ReviewFactList } from "@/components/discovery/ReviewFactList";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { BlueprintGenerationResponseSchema } from "@/lib/domain/blueprint/schemas";
import {
  DiscoveryReviewResponseSchema,
  type DiscoveryContext,
  type DiscoveryReviewInput,
  type ReadinessAssessment,
} from "@/lib/domain/discovery/schemas";
import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

type ReviewWorkspaceProps = Readonly<{
  blueprintAvailable: boolean;
  initialContext: DiscoveryContext;
  initialReadiness: ReadinessAssessment;
  initiallyApproved: boolean;
  projectId: string;
  projectName: string;
}>;

export function ReviewWorkspace({ blueprintAvailable, initialContext, initialReadiness, initiallyApproved, projectId, projectName }: ReviewWorkspaceProps) {
  const [context, setContext] = useState(initialContext);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [approved, setApproved] = useState(initiallyApproved);
  const [hasBlueprint, setHasBlueprint] = useState(blueprintAvailable);
  const [pending, setPending] = useState(false);
  const [generationState, setGenerationState] = useState<"idle" | "generating" | "revealing" | "complete">("idle");
  const [error, setError] = useState("");

  async function handleMutation(payload: DiscoveryReviewInput) {
    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const responseBody: unknown = await response.json();

      if (!response.ok) {
        throw new Error(readErrorMessage(responseBody, "That review change could not be saved."));
      }

      const result = DiscoveryReviewResponseSchema.parse(responseBody);
      setContext(result.context);
      setReadiness(result.readiness);
      setApproved(result.approved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That review change could not be saved.");
    } finally {
      setPending(false);
    }
  }

  async function handleArchitect() {
    setGenerationState("generating");
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/blueprint`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: crypto.randomUUID() }) });
      const responseBody: unknown = await response.json();

      if (!response.ok) {
        throw new Error(readErrorMessage(responseBody, MYCELLIUM_COPY.generation.failure));
      }

      BlueprintGenerationResponseSchema.parse(responseBody);
      setHasBlueprint(true);
      setGenerationState("revealing");
    } catch {
      setError(MYCELLIUM_COPY.generation.failure);
      setGenerationState("idle");
    }
  }

  if (generationState === "revealing") {
    return <ArchitectureReveal onComplete={() => setGenerationState("complete")} />;
  }

  if (generationState === "complete") {
    return <BlueprintCompletion projectId={projectId} projectName={projectName} />;
  }

  const generationFailed = Boolean(error) && approved;

  return (
    <main className="review-workspace">
      <header><Link href={`/projects/${projectId}/discover`}>← {projectName} discovery</Link><span className="eyebrow">{MYCELLIUM_COPY.review.eyebrow}</span><h1>{MYCELLIUM_COPY.review.title}</h1><p>{MYCELLIUM_COPY.review.description}</p></header>
      <ProjectWorkspaceNav active="review" blueprintAvailable={hasBlueprint} projectId={projectId} />
      <ReadinessRoots readiness={readiness} />
      {error ? <div className="form-message" role="alert"><strong>We hit a pause.</strong><p>{error}</p>{generationFailed ? <p>{MYCELLIUM_COPY.export.unavailableAfterFailure}</p> : null}</div> : null}
      <ReviewFactList context={context} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <ReviewContradictions context={context} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <ReviewChallenges context={context} onMutate={(input) => void handleMutation(input)} pending={pending} />
      <footer className="review-approval"><div><strong>{approved ? MYCELLIUM_COPY.review.approvedTitle : MYCELLIUM_COPY.review.pendingTitle}</strong><p>{approved ? MYCELLIUM_COPY.review.approvedDetail : MYCELLIUM_COPY.review.pendingDetail}</p></div>{approved ? <button disabled={generationState === "generating"} onClick={() => void handleArchitect()} type="button">{generationState === "generating" ? MYCELLIUM_COPY.generation.active : MYCELLIUM_COPY.generation.idle}</button> : <button disabled={pending} onClick={() => void handleMutation({ action: "approve" })} type="button">Approve this foundation</button>}</footer>
      {hasBlueprint ? <Link className="review-export-link" href={`/projects/${projectId}/export`}>Export the current Product Blueprint →</Link> : <p className="review-export-locked">{MYCELLIUM_COPY.export.lockedDescription}</p>}
    </main>
  );
}

function readErrorMessage(input: unknown, fallback: string): string {
  if (typeof input === "object" && input !== null && "error" in input && typeof input.error === "string") {
    return input.error;
  }

  return fallback;
}
