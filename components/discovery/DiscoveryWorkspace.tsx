"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { LivingProductGraph } from "@/components/discovery/LivingProductGraph";
import { ReadinessRoots } from "@/components/discovery/ReadinessRoots";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
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
  const [engineState, setEngineState] = useState(initialEngineState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();

    if (!message) {
      setError("Your answer is required.");
      window.requestAnimationFrame(() => document.getElementById("discovery-message")?.focus());
      return;
    }

    if (pending) {
      return;
    }

    setPending(true);
    setError("");
    let requestFailure = "";

    try {
      const requestId = crypto.randomUUID();
      const response = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, message }),
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
      setMessages((current) => [
        ...current,
        { id: requestId, role: "user", content: message },
        { id: crypto.randomUUID(), role: "assistant", content: `${payload.assistantMessage}\n\n${payload.assistantQuestion}\n\nWhy this matters: ${payload.questionReason}` },
      ]);
      setContext(payload.context);
      setReadiness(payload.readinessAssessment);
      setLastChange(payload);
      setEngineState(payload.engineState);
      setDraft("");
    } catch (caught) {
      setError(caught instanceof TypeError ? "Could not reach the server. Your answer is still here. Check your connection and retry." : requestFailure || "Discovery could not continue. Your answer is still here. Retry.");
    } finally {
      setPending(false);
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

  return (
    <main className="discovery-shell">
      <header className="discovery-shell__header">
        <div><Link href={`/projects/${projectId}`}>← {projectName}</Link><span className="eyebrow">Product discovery</span><h1>Let’s find the product worth building.</h1></div>
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
            {messages.length === 0 ? <article data-role="assistant"><span>Mycellium</span><p>{MYCELLIUM_COPY.emptyStates.discovery}</p><p>{readiness.recommendedNextQuestion}</p></article> : messages.map((message) => <article data-role={message.role} id={`message-${message.id}`} key={message.id}><span>{message.role === "user" ? "You" : "Mycellium"}</span>{message.content.split("\n").filter(Boolean).map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}</article>)}
          </div>
          {lastChange ? <section aria-label="Latest understanding changes" className="discovery-change-summary"><div><strong>What became clearer</strong>{lastChange.extractedFacts.length ? lastChange.extractedFacts.map((fact) => <span key={fact.id}>{fact.label}: {fact.value}</span>) : <span>No new product decision yet</span>}</div><div><strong>Still needs clarity</strong>{lastChange.unresolvedItems.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><div><strong>Product challenges</strong>{lastChange.challenges.filter((item) => item.status === "open").slice(0, 3).map((item) => <span key={item.id}>{item.title}: {item.description}</span>)}</div></section> : null}
          <form className="discovery-composer" noValidate onSubmit={handleSubmit}><label htmlFor="discovery-message">Your answer</label><textarea aria-describedby="discovery-message-status" aria-invalid={Boolean(error)} disabled={pending} id="discovery-message" maxLength={4000} name="message" onChange={(event) => { setDraft(event.currentTarget.value); if (error) setError(""); }} placeholder="Say what you know. ‘Undecided’ is a useful answer too." required rows={4} value={draft} /><div><span id="discovery-message-status">{error ? <span role="alert">{error}</span> : "One question, chosen for what matters next."}</span><button disabled={pending} type="submit">{pending ? "Thinking it through" : "Share answer"}</button></div></form>
          {readiness.status !== "discovering" ? <Link className="discovery-review-link" href={`/projects/${projectId}/review`}>I think I understand it. Review the foundation →</Link> : null}
        </section>
        <div className="discovery-graph-panel" data-mobile-active={mobilePanel === "graph"}><LivingProductGraph context={context} downstreamItems={downstreamItems} graph={context.graph} messages={messages} onMutate={(input) => void handleGraphMutation(input)} pending={pending} /></div>
      </div>
    </main>
  );
}

function readErrorMessage(input: unknown, fallback: string): string {
  if (typeof input === "object" && input !== null && "error" in input && typeof input.error === "string") {
    return input.error;
  }

  return fallback;
}
