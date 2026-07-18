"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { LivingProductGraph } from "@/components/discovery/LivingProductGraph";
import { ReadinessRoots } from "@/components/discovery/ReadinessRoots";
import type { DiscoveryContext, DiscoveryTurnResponse, ReadinessAssessment } from "@/lib/domain/discovery/schemas";

type Message = { id: string; role: string; content: string };

export function DiscoveryWorkspace({ projectId, projectName, initialMessages, initialContext, initialReadiness }: { projectId: string; projectName: string; initialMessages: Message[]; initialContext: DiscoveryContext; initialReadiness: ReadinessAssessment }) {
  const [messages, setMessages] = useState(initialMessages);
  const [context, setContext] = useState(initialContext);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [mobilePanel, setMobilePanel] = useState<"conversation" | "graph">("conversation");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [lastChange, setLastChange] = useState<DiscoveryTurnResponse | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = String(formData.get("message") ?? "").trim();
    if (!message || pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/discovery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: crypto.randomUUID(), message }) });
      const payload = await response.json() as DiscoveryTurnResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Discovery could not continue.");
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content: message }, { id: crypto.randomUUID(), role: "assistant", content: `${payload.assistantMessage}\n\n${payload.assistantQuestion}` }]);
      setContext(payload.context); setReadiness(payload.readinessAssessment); setLastChange(payload); form.reset();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Discovery could not continue."); }
    finally { setPending(false); }
  }

  return (
    <main className="discovery-shell">
      <header className="discovery-shell__header"><div><Link href={`/projects/${projectId}`}>← {projectName}</Link><h1>Discovery workspace</h1></div><div className="discovery-shell__mode"><span>Mode</span><strong>{lastChange?.discoveryMode ?? "fallback ready"}</strong></div></header>
      <div className="discovery-mobile-tabs" role="tablist" aria-label="Discovery workspace panels"><button aria-selected={mobilePanel === "conversation"} onClick={() => setMobilePanel("conversation")} role="tab">Conversation</button><button aria-selected={mobilePanel === "graph"} onClick={() => setMobilePanel("graph")} role="tab">Product graph</button></div>
      <div className="discovery-layout">
        <section className="discovery-conversation" data-mobile-active={mobilePanel === "conversation"} aria-label="Discovery conversation">
          <ReadinessRoots readiness={readiness} />
          <div className="discovery-messages" aria-live="polite">{messages.length === 0 ? <article data-role="assistant"><span>Mycellium</span><p>{readiness.recommendedNextQuestion}</p></article> : messages.map((message) => <article data-role={message.role} key={message.id}><span>{message.role === "user" ? "You" : "Mycellium"}</span>{message.content.split("\n").filter(Boolean).map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}</article>)}</div>
          {lastChange ? <section className="discovery-change-summary" aria-label="Latest understanding changes"><div><strong>Added</strong>{lastChange.extractedFacts.length ? lastChange.extractedFacts.map((fact) => <span key={fact.id}>{fact.label}: {fact.value}</span>) : <span>No new fact yet</span>}</div><div><strong>Still unclear</strong>{lastChange.unresolvedItems.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div></section> : null}
          <form className="discovery-composer" onSubmit={submit}><label htmlFor="discovery-message">Your answer</label><textarea disabled={pending} id="discovery-message" maxLength={4000} name="message" placeholder="Share what you know, or say unknown, undecided, or not applicable." required rows={4} /><div><span>{error ? <span role="alert">{error}</span> : "One high-value question at a time."}</span><button disabled={pending} type="submit">{pending ? "Growing understanding" : "Send answer"}</button></div></form>
          {readiness.status !== "discovering" ? <Link className="discovery-review-link" href={`/projects/${projectId}/review`}>Review structured understanding →</Link> : null}
        </section>
        <div className="discovery-graph-panel" data-mobile-active={mobilePanel === "graph"}><LivingProductGraph graph={context.graph} /></div>
      </div>
    </main>
  );
}
