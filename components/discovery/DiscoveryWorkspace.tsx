"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { LivingProductGraph } from "@/components/discovery/LivingProductGraph";
import { ReadinessRoots } from "@/components/discovery/ReadinessRoots";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import {
  DiscoveryTurnResponseSchema,
  type DiscoveryContext,
  type DiscoveryTurnResponse,
  type ReadinessAssessment,
} from "@/lib/domain/discovery/schemas";
import { MYCELLIUM_COPY } from "@/lib/voice/mycellium";

type Message = Readonly<{ id: string; role: string; content: string }>;

type DiscoveryWorkspaceProps = Readonly<{
  blueprintAvailable: boolean;
  initialContext: DiscoveryContext;
  initialMessages: Message[];
  initialReadiness: ReadinessAssessment;
  projectId: string;
  projectName: string;
}>;

export function DiscoveryWorkspace({ blueprintAvailable, initialContext, initialMessages, initialReadiness, projectId, projectName }: DiscoveryWorkspaceProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [context, setContext] = useState(initialContext);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [mobilePanel, setMobilePanel] = useState<"conversation" | "graph">("conversation");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [lastChange, setLastChange] = useState<DiscoveryTurnResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") ?? "").trim();

    if (!message || pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${projectId}/discovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: crypto.randomUUID(), message }),
      });
      const responseBody: unknown = await response.json();

      if (!response.ok) {
        throw new Error(readErrorMessage(responseBody, "Discovery could not continue."));
      }

      const payload = DiscoveryTurnResponseSchema.parse(responseBody);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "user", content: message },
        { id: crypto.randomUUID(), role: "assistant", content: `${payload.assistantMessage}\n\n${payload.assistantQuestion}` },
      ]);
      setContext(payload.context);
      setReadiness(payload.readinessAssessment);
      setLastChange(payload);
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Discovery could not continue.");
    } finally {
      setPending(false);
    }
  }

  const mode = lastChange?.discoveryMode ?? "fallback";

  return (
    <main className="discovery-shell">
      <header className="discovery-shell__header">
        <div><Link href={`/projects/${projectId}`}>← {projectName}</Link><span className="eyebrow">Product discovery</span><h1>Let’s find the product worth building.</h1></div>
        <div className="discovery-shell__mode"><span>{MYCELLIUM_COPY.mode[mode]}</span><strong>{mode === "ai" ? "Mycellium Product Architect" : MYCELLIUM_COPY.mode.fallbackDetail}</strong></div>
      </header>
      <ProjectWorkspaceNav active="discovery" blueprintAvailable={blueprintAvailable} projectId={projectId} />
      <div aria-label="Discovery workspace panels" className="discovery-mobile-tabs" role="tablist">
        <button aria-selected={mobilePanel === "conversation"} onClick={() => setMobilePanel("conversation")} role="tab">Conversation</button>
        <button aria-selected={mobilePanel === "graph"} onClick={() => setMobilePanel("graph")} role="tab">Product graph</button>
      </div>
      <div className="discovery-layout">
        <section aria-label="Discovery conversation" className="discovery-conversation" data-mobile-active={mobilePanel === "conversation"}>
          <ReadinessRoots readiness={readiness} />
          <div aria-live="polite" className="discovery-messages">
            {messages.length === 0 ? <article data-role="assistant"><span>Mycellium</span><p>{MYCELLIUM_COPY.emptyStates.discovery}</p><p>{readiness.recommendedNextQuestion}</p></article> : messages.map((message) => <article data-role={message.role} key={message.id}><span>{message.role === "user" ? "You" : "Mycellium"}</span>{message.content.split("\n").filter(Boolean).map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}</article>)}
          </div>
          {lastChange ? <section aria-label="Latest understanding changes" className="discovery-change-summary"><div><strong>What became clearer</strong>{lastChange.extractedFacts.length ? lastChange.extractedFacts.map((fact) => <span key={fact.id}>{fact.label}: {fact.value}</span>) : <span>No new product decision yet</span>}</div><div><strong>Still needs clarity</strong>{lastChange.unresolvedItems.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div></section> : null}
          <form className="discovery-composer" onSubmit={handleSubmit}><label htmlFor="discovery-message">Your answer</label><textarea disabled={pending} id="discovery-message" maxLength={4000} name="message" placeholder="Say what you know. ‘Undecided’ is a useful answer too." required rows={4} /><div><span>{error ? <span role="alert">{error}</span> : "One question, chosen for what matters next."}</span><button disabled={pending} type="submit">{pending ? "Thinking it through" : "Share answer"}</button></div></form>
          {readiness.status !== "discovering" ? <Link className="discovery-review-link" href={`/projects/${projectId}/review`}>I think I understand it — review the foundation →</Link> : null}
        </section>
        <div className="discovery-graph-panel" data-mobile-active={mobilePanel === "graph"}><LivingProductGraph graph={context.graph} /></div>
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
