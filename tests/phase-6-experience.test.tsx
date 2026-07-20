import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FoundationMap } from "@/components/discovery/FoundationMap";
import { GenerationWorkspace } from "@/components/discovery/GenerationWorkspace";
import { ReviewWorkspace } from "@/components/discovery/ReviewWorkspace";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { PasswordChangeInputSchema, ProfileUpdateInputSchema } from "@/lib/domain/profile/schemas";
import { ProjectCreateInputSchema } from "@/lib/domain/project/schemas";

const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const now = "2026-07-19T00:00:00.000Z";
const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); push.mockReset(); });

describe("Phase 6 foundation experience", () => {
  it("shows typed approval blockers and focuses the first useful target", async () => {
    const context = createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now);
    const readiness = calculateReadiness(context);
    const details = { total: 1, summary: "One decision still needs your input before Mycel Core can architect the product.", counts: { missingFoundation: 1, unknowns: 0, contradictions: 0, challenges: 0 }, blockers: [{ id: "gap-target_users", kind: "missing_foundation", label: "Target users need clarity", detail: "Add or confirm this part of the product foundation in discovery.", targetId: "foundation-area-users" }] };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: details.summary, decision: "requires_clarification", details }), { status: 409, headers: { "Content-Type": "application/json" } })));
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    Element.prototype.scrollIntoView = vi.fn();
    render(<ReviewWorkspace blueprintAvailable={false} initialContext={context} initialReadiness={readiness} initiallyApproved={false} projectId={projectId} projectName="Untitled system" />);
    fireEvent.click(screen.getByRole("button", { name: "Approve this foundation" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("One decision still needs your input");
    expect(screen.getByRole("link", { name: /Target users need clarity/ })).toHaveAttribute("href", "#foundation-area-users");
    await waitFor(() => expect(document.activeElement).toBe(document.getElementById("foundation-area-users")));
  });

  it("derives accessible Foundation Map states from current context", () => {
    const context = createInitialDiscoveryContext({ id: projectId, description: "A configurable product system", targetUsers: "Workspace owners", constraints: null }, now);
    render(<FoundationMap context={context} readiness={calculateReadiness(context)} />);
    expect(screen.getByRole("button", { name: /Users/ })).toHaveAttribute("data-state", "emerging");
    expect(screen.getByText("See where the product is rooted.")).toBeVisible();
  });

  it("keeps generation status prominent and recoverable", () => {
    const retry = vi.fn(); const back = vi.fn();
    const { rerender } = render(<GenerationWorkspace error="" onRetry={retry} onReturn={back} />);
    expect(screen.getByRole("heading", { name: /becoming a blueprint/ })).toBeVisible();
    expect(screen.getByText("Grounding the product understanding").closest("li")).toHaveAttribute("data-state", "active");
    rerender(<GenerationWorkspace error="The blueprint could not be saved." onRetry={retry} onReturn={back} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry blueprint generation" }));
    fireEvent.click(screen.getByRole("button", { name: "Return to foundation review" }));
    expect(retry).toHaveBeenCalledOnce(); expect(back).toHaveBeenCalledOnce();
  });
});

describe("Phase 6 inputs and navigation", () => {
  const baseInput = { name: "Untitled system", description: "Loose notes", projectType: "custom", targetUsers: "Workspace owners", teamSize: 2, sprintLength: "2-weeks", capacity: 20, planningDepth: "balanced", constraints: "" };
  it("keeps custom product detail optional and trims it when present", () => {
    expect(ProjectCreateInputSchema.safeParse(baseInput).success).toBe(true);
    expect(ProjectCreateInputSchema.parse({ ...baseInput, customProjectType: "  Spatial tool  " }).customProjectType).toBe("Spatial tool");
  });

  it("keeps unavailable journey stages descriptive and Export reachable", () => {
    render(<ProjectWorkspaceNav active="overview" blueprintAvailable={false} projectId={projectId} />);
    expect(screen.getByText("Approve the foundation first").closest("span")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: /Export/ })).toHaveAttribute("href", `/projects/${projectId}/export`);
  });

  it("validates profile fields without privileged account access", () => {
    expect(ProfileUpdateInputSchema.safeParse({ displayName: "Owner", avatarUrl: "not a url", timezone: "UTC", location: "" }).success).toBe(false);
    expect(PasswordChangeInputSchema.safeParse({ password: "a secure phrase", passwordConfirmation: "different phrase" }).success).toBe(false);
  });

  it("keeps the final action label visible", () => {
    render(<FinalCtaSection />);
    expect(screen.getByRole("link", { name: "Start your project" })).toBeVisible();
  });
});
