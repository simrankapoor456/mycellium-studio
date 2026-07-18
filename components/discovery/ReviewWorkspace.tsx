"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";

import { ArchitectureReveal } from "@/components/discovery/ArchitectureReveal";
import { ReadinessRoots } from "@/components/discovery/ReadinessRoots";
import type { DiscoveryContext, DiscoveryReviewInput, ReadinessAssessment } from "@/lib/domain/discovery/schemas";

export function ReviewWorkspace({ projectId, projectName, initialContext, initialReadiness, initiallyApproved }: { projectId: string; projectName: string; initialContext: DiscoveryContext; initialReadiness: ReadinessAssessment; initiallyApproved: boolean }) {
  const router = useRouter();
  const [context, setContext] = useState(initialContext);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [approved, setApproved] = useState(initiallyApproved);
  const [pending, setPending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [error, setError] = useState("");
  const completeReveal = useCallback(() => router.push(`/projects/${projectId}`), [projectId, router]);

  async function mutate(payload: DiscoveryReviewInput) {
    setPending(true); setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { context: DiscoveryContext; readiness: ReadinessAssessment; approved: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "Review could not be saved.");
      setContext(result.context); setReadiness(result.readiness); setApproved(result.approved);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Review could not be saved."); }
    finally { setPending(false); }
  }

  async function architect() {
    setGenerating(true); setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/blueprint`, { method: "POST" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "The blueprint could not be generated.");
      setRevealing(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The blueprint could not be generated."); setGenerating(false); }
  }

  if (revealing) return <ArchitectureReveal onComplete={completeReveal} />;

  return <main className="review-workspace"><header><Link href={`/projects/${projectId}/discover`}>← {projectName} discovery</Link><span className="eyebrow">Requirements review</span><h1>Approve what Mycellium understands.</h1><p>Inspect every fact, make assumptions explicit, and resolve contradictions before architecture begins.</p></header><ReadinessRoots readiness={readiness} />
    {error ? <p className="form-message" role="alert">{error}</p> : null}
    <section className="review-facts"><div className="section-intro"><h2>Structured understanding</h2><span>{context.facts.length} facts</span></div>{context.facts.map((fact) => <form key={fact.id} onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutate({ action: "edit_fact", factId: fact.id, value: String(data.get("value")), status: String(data.get("status")) as "confirmed" | "inferred" | "unknown" | "rejected" }); }}><div><span>{fact.category.replaceAll("_", " ")}</span><strong>{fact.label}</strong><small>Sources: {fact.sourceMessageIds.length || "project seed"}</small></div><textarea defaultValue={fact.value} name="value" rows={2} /><select defaultValue={fact.status} name="status" aria-label={`Status for ${fact.label}`}><option value="confirmed">Confirmed</option><option value="inferred">Inferred assumption</option><option value="unknown">Unknown</option><option value="rejected">Rejected</option></select><button disabled={pending} type="submit">Save</button>{fact.status === "inferred" ? <button disabled={pending} onClick={() => void mutate({ action: "reject_assumption", factId: fact.id })} type="button">Reject</button> : null}{fact.status === "unknown" && !context.acceptedUnknownFactIds.includes(fact.id) ? <button disabled={pending} onClick={() => void mutate({ action: "accept_unknown", factId: fact.id })} type="button">Accept unknown</button> : null}</form>)}</section>
    {context.contradictions.filter((item) => item.status === "open").length ? <section className="review-contradictions"><h2>Contradictions to resolve</h2>{context.contradictions.filter((item) => item.status === "open").map((item) => <form key={item.id} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void mutate({ action: "resolve_contradiction", contradictionId: item.id, resolution: String(data.get("resolution")), confirmedFactId: String(data.get("confirmedFactId")) }); }}><strong>{item.description}</strong><select name="confirmedFactId" aria-label="Answer to keep">{item.factIds.map((id) => { const fact = context.facts.find((candidate) => candidate.id === id); return <option key={id} value={id}>{fact?.value ?? id}</option>; })}</select><input name="resolution" placeholder="Why this answer is now authoritative" required /><button disabled={pending} type="submit">Resolve</button></form>)}</section> : null}
    <footer className="review-approval"><div><strong>{approved ? "Context approved" : "Human approval required"}</strong><p>{approved ? "The approved snapshot is ready for architecture." : "Approval persists the exact context used for generation."}</p></div>{approved ? <button disabled={generating} onClick={() => void architect()} type="button">{generating ? "Architecting product" : "Architect my product"}</button> : <button disabled={pending} onClick={() => void mutate({ action: "approve" })} type="button">Approve context</button>}</footer>
  </main>;
}
