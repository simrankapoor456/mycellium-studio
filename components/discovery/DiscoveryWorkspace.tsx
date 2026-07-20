"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useState } from "react";

import { LivingProductGraph } from "@/components/discovery/LivingProductGraph";
import { ReadinessRoots } from "@/components/discovery/ReadinessRoots";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { Button, ButtonLink } from "@/components/ui/Button";
import { getNextDiscoveryPrompt } from "@/lib/discovery/questions";
import {
  DiscoveryReviewResponseSchema,
  DiscoveryTurnResponseSchema,
  type DiscoveryContext,
  type DiscoveryReviewInput,
  type DiscoveryTurnResponse,
  type ReadinessAssessment,
} from "@/lib/domain/discovery/schemas";
import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

type Message = Readonly<{ id: string; role: string; content: string }>;
type TurnAction = "answer" | "mark_unknown" | "ask_later";

type DiscoveryWorkspaceProps = Readonly<{
  blueprintAvailable: boolean;
  foundationApproved?: boolean;
  initialContext: DiscoveryContext;
  initialMessages: Message[];
  initialReadiness: ReadinessAssessment;
  initialEngineState?: "ai_enhanced" | "reliable" | "ai_unavailable_reliable";
  downstreamItems?: Readonly<Record<string, readonly string[]>>;
  projectId: string;
  projectName: string;
}>;

export function DiscoveryWorkspace({ blueprintAvailable, foundationApproved = false, initialContext, initialMessages, initialReadiness, initialEngineState = "reliable", downstreamItems = {}, projectId, projectName }: DiscoveryWorkspaceProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [context, setContext] = useState(initialContext);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [mobilePanel, setMobilePanel] = useState<"conversation" | "graph">("conversation");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [lastChange, setLastChange] = useState<DiscoveryTurnResponse | null>(null);
  const [lastReadinessDelta, setLastReadinessDelta] = useState(0);
  const [engineState, setEngineState] = useState(initialEngineState);
  const prompt = getNextDiscoveryPrompt(context);

  async function submitTurn(action: TurnAction) {
    const message = draft.trim();
    if (action === "answer" && !message) {
      setError("Add an answer, or choose Mark unknown or Ask later.");
      window.requestAnimationFrame(() => document.getElementById("discovery-message")?.focus());
      return;
    }
    if (pending) return;

    setPending(true);
    setError("");
    let requestFailure = "";

    try {
      const requestId = crypto.randomUUID();
      const response = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "answer" ? { requestId, action, message } : { requestId, action }),
      });
      const responseBody: unknown = await response.json();

      if (!response.ok) {
        requestFailure = response.status === 401
          ? "Your session expired. Sign in again, then retry. Your answer is still here."
          : response.status === 403
            ? "You do not have permission to update this discovery. Your answer is still here."
            : readErrorMessage(responseBody, "Discovery could not continue. Your answer is still here. Retry.");
        throw new Error("Handled discovery failure");
      }

      const payload = DiscoveryTurnResponseSchema.parse(responseBody);
      const userContent = action === "answer"
        ? message
        : action === "mark_unknown"
          ? "Marked this decision as unknown."
          : "Deferred this decision for Foundation Review.";
      setMessages((current) => [
        ...current,
        { id: requestId, role: "user", content: userContent },
        { id: crypto.randomUUID(), role: "assistant", content: payload.assistantMessage },
      ]);
      setContext(payload.context);
      setLastReadinessDelta(payload.readinessAssessment.score - readiness.score);
      setReadiness(payload.readinessAssessment);
      setLastChange(payload);
      setEngineState(payload.engineState);
      if (action === "answer") setDraft("");
    } catch (caught) {
      setError(caught instanceof TypeError ? "Could not reach the server. Your answer is still here. Check your connection and retry." : requestFailure || "Discovery could not continue. Your answer is still here. Retry.");
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitTurn("answer");
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  async function handleGraphMutation(input: DiscoveryReviewInput) {
    if (pending) return;
    setPending(true);
    setError("");
    let requestFailure = "";

    try {
      const response = await fetch(`/api/projects/${projectId}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const body: unknown = await response.json();
      if (!response.ok) {
        requestFailure = response.status === 401
          ? "Your session expired. Sign in again, then retry. Your graph edit is still here."
          : response.status === 403
            ? "You do not have permission to change this product graph."
            : readErrorMessage(body, "That graph change could not be saved. Retry.");
        throw new Error("Handled graph failure");
      }
      const result = DiscoveryReviewResponseSchema.parse(body);
      setContext(result.context);
      setReadiness(result.readiness);
    } catch (caught) {
      setError(caught instanceof TypeError ? "Could not reach the server. Your graph edit is still here. Check your connection and retry." : requestFailure || "That graph change could not be saved. Retry.");
    } finally {
      setPending(false);
    }
  }

  const deferredCount = context.facts.filter((fact) => fact.deletedAt === null && fact.status === "unknown" && context.acceptedUnknownFactIds.includes(fact.id)).length;

  return (
    <main className="discovery-shell">
      <header className="discovery-shell__header">
        <div><Link href={`/projects/${projectId}`}>← {projectName}</Link><span className="eyebrow">Product discovery</span><h1>Find the product worth building.</h1></div>
        <div className="discovery-shell__mode"><span>Intelligence engine</span><strong>{MYCELLIUM_COPY.engineState[engineState]}</strong></div>
      </header>
      <ProjectWorkspaceNav active="discovery" blueprintAvailable={blueprintAvailable} discoveryStarted foundationApproved={foundationApproved} projectId={projectId} />
      <div aria-label="Discovery workspace panels" className="discovery-mobile-tabs" role="tablist">
        <button aria-selected={mobilePanel === "conversation"} onClick={() => setMobilePanel("conversation")} role="tab">Conversation</button>
        <button aria-selected={mobilePanel === "graph"} onClick={() => setMobilePanel("graph")} role="tab">Product graph</button>
      </div>
      <div className="discovery-layout">
        <section aria-label="Discovery conversation" className="discovery-conversation" data-mobile-active={mobilePanel === "conversation"}>
          <ReadinessRoots readiness={readiness} />
          <div aria-live="polite" className="discovery-messages">
            {messages.length === 0 ? <article data-role="assistant"><span>Mycellium</span><p>{MYCELLIUM_COPY.emptyStates.discovery}</p></article> : messages.map((message) => <article data-role={message.role} id={`message-${message.id}`} key={message.id}><span>{message.role === "user" ? "You" : "Mycellium"}</span>{message.content.split("\n").filter(Boolean).map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}</article>)}
          </div>
          {lastChange ? <section aria-label="Latest understanding changes" className="discovery-change-summary">
            <div><strong>What became clearer</strong>{lastChange.extractedFacts.filter((fact) => fact.status !== "unknown").length ? lastChange.extractedFacts.filter((fact) => fact.status !== "unknown").map((fact) => <span key={fact.id}>{fact.label}: {fact.value}</span>) : <span>No confirmed product decision changed.</span>}</div>
            <div><strong>Readiness change</strong><span>{lastReadinessDelta > 0 ? `Improved by ${lastReadinessDelta} calculated ${lastReadinessDelta === 1 ? "point" : "points"}.` : "No calculated readiness change."}</span></div>
            <div><strong>Essential decisions</strong><span>{lastChange.readinessAssessment.criticalGaps.length} remain open.</span></div>
            <div><strong>Recommended refinements</strong><span>{lastChange.readinessAssessment.areasNeedingClarification.length} can still be clarified.</span></div>
            <div><strong>Deferred unknowns</strong><span>{deferredCount} will be carried into review.</span></div>
          </section> : null}
          {prompt ? <section className="discovery-current-question" data-question-id={prompt.id}>
            <span className="eyebrow">Next useful decision</span>
            <h2>{prompt.question}</h2>
            <details><summary>Why this matters</summary><p>{prompt.reason}</p></details>
            <form className="discovery-composer" noValidate onSubmit={handleSubmit}>
              <label htmlFor="discovery-message">Your answer</label>
              <textarea aria-describedby="discovery-message-help discovery-message-status" aria-invalid={Boolean(error)} disabled={pending} id="discovery-message" maxLength={4000} name="message" onChange={(event) => { setDraft(event.currentTarget.value); if (error) setError(""); }} onKeyDown={handleComposerKeyDown} placeholder="Share what is known, or keep the decision open with the actions below." rows={4} value={draft} />
              <span className="discovery-composer__help" id="discovery-message-help">Use Control or Command + Enter to share. Enter adds a new line.</span>
              <div className="discovery-composer__status" id="discovery-message-status">{error ? <span role="alert">{error}</span> : <span>One question, chosen for what matters next.</span>}</div>
              <div className="discovery-composer__actions">
                <div><Button disabled={pending} onClick={() => void submitTurn("mark_unknown")} type="button" variant="outline">Mark unknown</Button><Button disabled={pending} onClick={() => void submitTurn("ask_later")} type="button" variant="quiet">Ask later</Button></div>
                <Button aria-keyshortcuts="Control+Enter Meta+Enter" loading={pending} type="submit">{pending ? "Saving answer" : "Share answer"}<span aria-hidden="true">→</span></Button>
              </div>
            </form>
          </section> : <section className="discovery-review-ready"><span className="eyebrow">Discovery complete for now</span><h2>No materially different priority question remains.</h2><p>Review the current foundation and decide how each open item should be carried forward.</p></section>}
          <div className="discovery-review-action"><ButtonLink href={`/projects/${projectId}/review`} variant="secondary">Review current foundation <span aria-hidden="true">→</span></ButtonLink></div>
        </section>
        <div className="discovery-graph-panel" data-mobile-active={mobilePanel === "graph"}><LivingProductGraph context={context} downstreamItems={downstreamItems} graph={context.graph} messages={messages} onMutate={(input) => void handleGraphMutation(input)} pending={pending} /></div>
      </div>
    </main>
  );
}

function readErrorMessage(input: unknown, fallback: string): string {
  if (typeof input === "object" && input !== null && "error" in input && typeof input.error === "string") return input.error;
  return fallback;
}
