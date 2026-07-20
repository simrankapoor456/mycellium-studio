import { readFileSync } from "node:fs";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlueprintExportPanel } from "@/components/blueprint/BlueprintExportPanel";
import { DiscoveryWorkspace } from "@/components/discovery/DiscoveryWorkspace";
import { FoundationDecisionGroups } from "@/components/discovery/FoundationDecisionGroups";
import { FoundationMap } from "@/components/discovery/FoundationMap";
import { GraphNodeDetail } from "@/components/discovery/GraphNodeDetail";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { Button } from "@/components/ui/Button";
import { advanceDiscovery, calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { getNextDiscoveryPrompt } from "@/lib/discovery/questions";
import { DiscoveryTurnInputSchema } from "@/lib/domain/discovery/schemas";

const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const now = "2026-07-20T00:00:00.000Z";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Phase 8 discovery controls", () => {
  it("accepts explicit answer, unknown, and deferred actions", () => {
    const requestId = "30000000-0000-4000-8000-000000000001";

    expect(DiscoveryTurnInputSchema.parse({ requestId, action: "answer", message: "A grounded outcome" }).action).toBe("answer");
    expect(DiscoveryTurnInputSchema.parse({ requestId, action: "mark_unknown" }).action).toBe("mark_unknown");
    expect(DiscoveryTurnInputSchema.parse({ requestId, action: "ask_later" }).action).toBe("ask_later");
  });

  it("advances after an explicit unknown without immediately repeating the question", () => {
    const context = createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now);
    const before = getNextDiscoveryPrompt(context);
    const result = advanceDiscovery({
      context,
      controlAction: "mark_unknown",
      message: "",
      messageId: "30000000-0000-4000-8000-000000000002",
      mode: "fallback",
      now,
    });

    expect(before?.id).toBe("category:business_objective");
    expect(result.questionId).not.toBe(before?.id);
    expect(result.context.facts.at(-1)).toMatchObject({ category: "business_objective", status: "unknown" });
    expect(result.context.acceptedUnknownFactIds).not.toContain(result.context.facts.at(-1)?.id);
  });

  it("carries a deferred decision forward explicitly and keeps review reachable", () => {
    const context = createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now);
    const result = advanceDiscovery({
      context,
      controlAction: "ask_later",
      message: "",
      messageId: "30000000-0000-4000-8000-000000000003",
      mode: "fallback",
      now,
    });
    const deferredFact = result.context.facts.at(-1);

    expect(deferredFact).toMatchObject({ category: "business_objective", status: "unknown" });
    expect(result.context.acceptedUnknownFactIds).toContain(deferredFact?.id);

    render(
      <DiscoveryWorkspace
        blueprintAvailable={false}
        initialContext={result.context}
        initialMessages={[]}
        initialReadiness={result.readinessAssessment}
        projectId={projectId}
        projectName="Signal system"
      />,
    );
    expect(screen.getAllByRole("button", { name: "Mark unknown" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Ask later" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Review current foundation/ })).toHaveAttribute("href", `/projects/${projectId}/review`);
  });

  it("preserves an answer when a request fails", async () => {
    const user = userEvent.setup();
    const context = createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "The request could not be saved." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })));

    render(
      <DiscoveryWorkspace
        blueprintAvailable={false}
        initialContext={context}
        initialMessages={[]}
        initialReadiness={calculateReadiness(context)}
        projectId={projectId}
        projectName="Signal system"
      />,
    );
    const answer = screen.getByRole("textbox", { name: "Your answer" });
    await user.type(answer, "The first useful outcome is a clear decision trail.");
    fireEvent.click(screen.getByRole("button", { name: /Share answer/ }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("The request could not be saved."));
    expect(answer).toHaveValue("The first useful outcome is a clear decision trail.");
  });
});

describe("Phase 8 progression and accessibility", () => {
  it("uses semantic contrast tokens and complete button states", () => {
    const styles = readFileSync("app/phase-8.css", "utf8");
    render(<Button loading>Save change</Button>);

    expect(styles).toContain("--action-primary-foreground: #07110d");
    expect(styles).toContain("--action-disabled-foreground: #91a497");
    expect(screen.getByRole("button", { name: "Save change" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save change" })).toHaveAttribute("aria-busy", "true");
  });

  it("separates review decisions and links each open item to resolution", () => {
    const context = createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now);
    const deferred = advanceDiscovery({
      context,
      controlAction: "ask_later",
      message: "",
      messageId: "30000000-0000-4000-8000-000000000004",
      mode: "fallback",
      now,
    });

    render(<FoundationDecisionGroups context={deferred.context} readiness={deferred.readinessAssessment} />);
    for (const label of ["Blocking decisions", "Recommended clarifications", "Deferred unknowns", "Contradictions", "Challenges"]) {
      expect(screen.getByRole("heading", { name: label })).toBeVisible();
    }
    expect(screen.getByRole("link", { name: /Business objective/ })).toHaveAttribute("href", expect.stringMatching(/^#review-fact-/));
  });

  it("uses explicit fact-action hierarchy and confirms removal", () => {
    const onMutate = vi.fn();
    const context = createInitialDiscoveryContext({ id: projectId, description: "A connected decision system", targetUsers: null, constraints: null }, now);
    const node = context.graph.nodes[0];
    expect(node).toBeDefined();
    render(<GraphNodeDetail context={context} downstreamItems={[]} messages={[]} node={node!} onMutate={onMutate} pending={false} />);

    expect(screen.getByRole("button", { name: "Save fact" })).toHaveClass("ui-button--primary");
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveClass("ui-button--primary");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("dialog", { name: "Delete this fact?" })).toBeInTheDocument();
    expect(onMutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delete fact" }));
    expect(onMutate).toHaveBeenCalledWith({ action: "delete_fact", factId: node!.id });
  });

  it("provides keyboard lineage and an ordered text alternative for the living map", () => {
    const context = createInitialDiscoveryContext({ id: projectId, description: "A connected decision system", targetUsers: "Product owners", constraints: null }, now);
    render(<FoundationMap context={context} readiness={calculateReadiness(context)} />);
    const users = screen.getByRole("button", { name: /Users, emerging/ });
    users.focus();
    fireEvent.keyDown(users, { key: "End" });

    expect(screen.getByRole("list", { name: "Foundation map text alternative" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Risks, unresolved/ })).toHaveFocus();
    expect(document.querySelectorAll('.foundation-map__path[data-related="true"]').length).toBeGreaterThan(0);
  });

  it("keeps the journey structural and gives mobile users a native disclosure", () => {
    const styles = readFileSync("app/phase-8.css", "utf8");
    render(<ProjectWorkspaceNav active="discovery" blueprintAvailable={false} projectId={projectId} />);

    expect(styles).toContain("position: sticky");
    expect(screen.getByRole("navigation", { name: "Project journey" })).toBeInTheDocument();
    expect(screen.getByText("View stages").closest("summary")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Discovery/ }).every((link) => link.getAttribute("aria-current") === "step")).toBe(true);
  });

  it("shows export controls only when a persisted blueprint is available", () => {
    const { rerender } = render(<BlueprintExportPanel available={false} projectId={projectId} projectName="Signal system" />);
    expect(screen.queryByRole("button", { name: /Markdown/ })).not.toBeInTheDocument();

    rerender(<BlueprintExportPanel available blueprintMeta={{ version: 3, updatedAt: now }} projectId={projectId} projectName="Signal system" />);
    expect(screen.getByRole("button", { name: /Markdown/ })).toBeEnabled();
    expect(screen.getByText("Version 3")).toBeVisible();
  });
});
