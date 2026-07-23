import { readFileSync } from "node:fs";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ScrollProductNarrative } from "@/components/marketing/ScrollProductNarrative";
import { signatureStoryConfig, signatureStoryStages } from "@/lib/marketing/signature-experience";
import { signatureFoundationNodes, signatureGrowthPaths } from "@/lib/marketing/signature-growth";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe("Phase 9A signature growth story", () => {
  it("configures one nine-stage story that stops at Foundation", () => {
    expect(signatureStoryConfig.beatCount).toBe(9);
    expect(signatureStoryStages).toHaveLength(9);
    expect(signatureStoryStages.at(-1)?.id).toBe("foundation");
    expect(signatureStoryStages.map((stage) => stage.id)).not.toEqual(expect.arrayContaining([
      "architecture", "blueprint", "execution", "value", "renewal",
    ]));
  });

  it("renders one story, all accessible stages, and a non-color state legend", () => {
    const { container } = render(<ScrollProductNarrative />);

    expect(container.querySelectorAll("[data-signature-growth]")).toHaveLength(1);
    expect(screen.getByRole("list", { name: "Seed to Foundation story" })).toBeVisible();
    expect(screen.getAllByRole("button", { name: /Stage \d{2}/ })).toHaveLength(9);
    expect(screen.getByRole("list", { name: "Foundation state legend" })).toHaveTextContent(
      "ConfirmedEmergingUnknownBlocked",
    );
  });

  it("moves current-stage semantics forward and backward", async () => {
    const user = userEvent.setup();
    render(<ScrollProductNarrative />);
    const first = screen.getByRole("button", { name: /Fragmented input/ });
    const final = screen.getByRole("button", { name: /Foundation stabilized/ });

    await user.click(final);
    expect(final).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "9");

    await user.click(first);
    expect(first).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  });

  it("uses deterministic parent-child root geometry", () => {
    const ids = new Set(signatureGrowthPaths.map((path) => path.id));
    expect(ids.size).toBe(signatureGrowthPaths.length);
    expect(signatureGrowthPaths[0]).toMatchObject({ id: "primary-root", kind: "primary", parentId: null });
    for (const path of signatureGrowthPaths.slice(1)) {
      expect(path.d).toMatch(/^M\d/);
      expect(path.parentId ? ids.has(path.parentId) : false).toBe(true);
    }
    expect(signatureFoundationNodes.map((node) => node.id)).toEqual([
      "problem", "users", "outcome", "evidence", "scope", "feasibility", "risks",
    ]);
    expect(new Set(signatureFoundationNodes.map((node) => node.state))).toEqual(
      new Set(["confirmed", "emerging", "blocked", "unknown"]),
    );
  });

  it("resolves reduced motion to the complete static Foundation", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<ScrollProductNarrative />);
    await waitFor(() => expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "9"));
    expect(container.querySelector("[data-signature-growth]")).toHaveAttribute("data-active-level", "8");
  });

  it("keeps desktop pinning, mobile fallback, and teardown explicit", () => {
    const story = readFileSync("components/marketing/ScrollProductNarrative.tsx", "utf8");
    const styles = readFileSync("app/phase-8.css", "utf8");

    expect(story).toContain("pin: visual");
    expect(story).toContain("(min-width: 1024px)");
    expect(story).toContain("progressTrigger.kill()");
    expect(story).toContain("pinTrigger.kill()");
    expect(story).toContain("timeline.revert()");
    expect(story).toContain("media.revert()");
    expect(styles).toContain("@media (max-width: 767px)");
    expect(styles).toContain("grid-auto-flow: row");
    expect(styles).toContain("position: relative");
  });

  it("keeps Lenis public-only and protected routes free of the signature story", () => {
    const publicPage = readFileSync("app/page.tsx", "utf8");
    const provider = readFileSync("components/marketing/MarketingMotionProvider.tsx", "utf8");
    const protectedLayout = readFileSync("app/(protected)/layout.tsx", "utf8");

    expect(publicPage).toContain("MarketingMotionProvider");
    expect(publicPage).toContain("ScrollProductNarrative");
    expect(provider).toContain('import("lenis")');
    expect(protectedLayout).not.toContain("MarketingMotionProvider");
    expect(protectedLayout).not.toContain("ScrollProductNarrative");
  });
});
