import { readFileSync } from "node:fs";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FoundationMap } from "@/components/discovery/FoundationMap";
import { ScrollProductNarrative } from "@/components/marketing/ScrollProductNarrative";
import { signatureStoryStages } from "@/lib/marketing/signature-experience";
import { calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";

describe("Living Product Experience", () => {
  it("tells the complete seed-to-Foundation story with static accessible copy", () => {
    render(<ScrollProductNarrative />);

    expect(signatureStoryStages).toHaveLength(9);
    expect(signatureStoryStages.map((stage) => stage.label)).toEqual([
      "Fragmented input", "Signal attraction", "Seed of intent", "Germination", "First root", "Evidence branching",
      "Mycelium connections", "Foundation areas", "Foundation stabilized",
    ]);
    expect(screen.getByRole("list", { name: "Seed to Foundation story" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Foundation stabilized/ })).toBeVisible();
  });

  it("keeps the story progressive, scoped, and reduced-motion aware", () => {
    const story = readFileSync("components/marketing/ScrollProductNarrative.tsx", "utf8");
    const provider = readFileSync("components/marketing/MarketingMotionProvider.tsx", "utf8");
    const protectedLayout = readFileSync("app/(protected)/layout.tsx", "utf8");

    expect(story).toContain("ScrollTrigger.create");
    expect(story).toContain("IntersectionObserver");
    expect(story).toContain("prefers-reduced-motion: no-preference");
    expect(provider).toContain('import("lenis")');
    expect(provider).toContain("syncTouch: false");
    expect(provider).toContain("motionPreference.matches");
    expect(protectedLayout).not.toContain("MarketingMotionProvider");
  });

  it("supports direct and directional keyboard movement through the Foundation Map", () => {
    const context = createInitialDiscoveryContext({
      id: "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2",
      description: "A configurable product system",
      targetUsers: "Workspace owners",
      constraints: null,
    }, "2026-07-20T00:00:00.000Z");

    render(<FoundationMap context={context} readiness={calculateReadiness(context)} />);
    const users = screen.getByRole("button", { name: /Users, emerging/ });
    const problem = screen.getByRole("button", { name: /Problem, unresolved/ });

    users.focus();
    fireEvent.keyDown(users, { key: "ArrowRight" });
    expect(problem).toHaveFocus();
    expect(problem).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Unresolved branch")).toBeVisible();
  });

  it("keeps architecture and editorial workspace changes presentational", () => {
    const reveal = readFileSync("components/discovery/ArchitectureReveal.tsx", "utf8");
    const projectPage = readFileSync("app/(protected)/projects/[id]/page.tsx", "utf8");
    const blueprint = readFileSync("components/blueprint/BlueprintWorkspace.tsx", "utf8");
    const dashboardCard = readFileSync("components/projects/ProjectCard.tsx", "utf8");

    expect(reveal).not.toContain("setInterval");
    expect(reveal).toContain("result?.blueprint");
    expect(projectPage).toContain("blueprint-editorial-layout");
    expect(blueprint).toContain("blueprint-workspace__reading");
    expect(dashboardCard).toContain("project-card__growth");
  });
});
