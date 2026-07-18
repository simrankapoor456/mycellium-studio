import { describe, expect, it } from "vitest";

import { advanceDiscovery, applyDiscoveryReview, boundConversationContext, calculateReadiness, canApproveDiscovery, createInitialDiscoveryContext } from "@/lib/discovery/engine";

const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const now = "2026-07-18T00:00:00.000Z";
const messageId = (index: number) => `10000000-0000-4000-8000-${String(index).padStart(12, "0")}`;

function emptyContext() { return createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now); }

describe("adaptive deterministic discovery", () => {
  it("extracts supported facts and chooses the highest-value missing area", () => {
    const result = advanceDiscovery({ context: emptyContext(), messageId: messageId(1), message: "I want to build an invoicing tool for independent freelance designers.", mode: "fallback", now });
    expect(result.extractedFacts.map((fact) => fact.category)).toEqual(expect.arrayContaining(["business_objective", "target_users", "use_cases"]));
    expect(result.readinessAssessment.recommendedNextQuestion).toMatch(/painful situation/i);
    expect(result.discoveryMode).toBe("fallback");
  });

  it("keeps explicit uncertainty visible instead of inventing a fact", () => {
    const result = advanceDiscovery({ context: emptyContext(), messageId: messageId(2), message: "Undecided", mode: "fallback", now });
    expect(result.extractedFacts[0]).toMatchObject({ category: "business_objective", status: "unknown" });
    expect(result.readinessAssessment.explicitlyUnknownFields).toContain("business_objective");
  });

  it("detects competing answers and creates a prominent graph relationship", () => {
    const first = advanceDiscovery({ context: emptyContext(), messageId: messageId(3), message: "The business goal is to reduce unpaid invoices.", mode: "fallback", now });
    const second = advanceDiscovery({ context: first.context, messageId: messageId(4), message: "The business goal is to sell bookkeeping subscriptions instead.", mode: "fallback", now: "2026-07-18T00:01:00.000Z" });
    expect(second.contradictions).toHaveLength(1);
    expect(second.context.graph.edges.some((edge) => edge.kind === "contradicts")).toBe(true);
  });

  it("reports graph additions for each new supported fact", () => {
    const result = advanceDiscovery({ context: emptyContext(), messageId: messageId(5), message: "Consultants need to create and send invoices.", mode: "fallback", now });
    expect(result.graphChanges.addedNodes.length).toBeGreaterThan(0);
    expect(result.graphChanges.addedEdges.length).toBeGreaterThan(0);
  });

  it("accepts an explicit unknown during review and records manual fact edits", () => {
    const result = advanceDiscovery({ context: emptyContext(), messageId: messageId(6), message: "Not sure", mode: "fallback", now });
    const fact = result.context.facts[0]!;
    const accepted = applyDiscoveryReview(result.context, { action: "accept_unknown", factId: fact.id }, "2026-07-18T00:02:00.000Z");
    const edited = applyDiscoveryReview(accepted, { action: "edit_fact", factId: fact.id, value: "Reduce invoice admin time", status: "confirmed" }, "2026-07-18T00:03:00.000Z");
    expect(accepted.acceptedUnknownFactIds).toContain(fact.id);
    expect(edited.facts[0]).toMatchObject({ value: "Reduce invoice admin time", status: "confirmed", manuallyEdited: true });
  });

  it("bounds provider context by message count and total characters", () => {
    const messages = Array.from({ length: 20 }, (_, index) => ({ content: `${index}-${"x".repeat(100)}` }));
    const bounded = boundConversationContext(messages, 5, 350);
    expect(bounded).toHaveLength(3);
    expect(bounded.at(-1)?.content.startsWith("19-")).toBe(true);
    expect(bounded.reduce((total, item) => total + item.content.length, 0)).toBeLessThanOrEqual(350);
  });

  it("moves readiness from discovery toward review as critical areas root", () => {
    let context = emptyContext();
    const answers = ["The business goal is reducing invoice administration.", "The problem is that freelancers waste hours chasing payment.", "Independent designers are the first users.", "They need to create, send, and track invoices.", "Success means reducing admin time by half."];
    answers.forEach((message, index) => { context = advanceDiscovery({ context, messageId: messageId(20 + index), message, mode: "fallback", now: `2026-07-18T00:0${index}:00.000Z` }).context; });
    const readiness = calculateReadiness(context);
    expect(readiness.score).toBeGreaterThanOrEqual(55);
    expect(["needs_review", "ready"]).toContain(readiness.status);
    expect(canApproveDiscovery(context)).toBe(true);
  });
});
