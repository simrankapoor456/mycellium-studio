import { readFileSync } from "node:fs";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BrandMark } from "@/components/brand/BrandMark";
import { LandingHero } from "@/components/marketing/LandingHero";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { WorkspaceNavigation } from "@/components/shell/WorkspaceNavigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/app/(protected)/actions", () => ({ logoutAction: vi.fn() }));

describe("Phase 7.1 public identity", () => {
  it("gives the production logo a concise accessible name", () => {
    render(<BrandMark animated label="Mycellium Studio living network" />);
    expect(screen.getByRole("img", { name: "Mycellium Studio living network" })).toHaveClass("brand-mark--animated");
  });

  it("keeps the primary and secondary landing actions visible by name", () => {
    render(<LandingHero />);
    expect(screen.getByRole("link", { name: /Start your project/ })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", "#how-it-works");
  });

  it("opens and closes the mobile navigation without removing destinations", async () => {
    const user = userEvent.setup();
    render(<MarketingHeader />);

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    const mobileNavigation = screen.getByRole("navigation", { name: "Mobile navigation" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(mobileNavigation).toHaveAttribute("data-open", "false");

    await user.click(trigger);
    expect(screen.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
    expect(mobileNavigation).toHaveAttribute("data-open", "true");

    await user.click(screen.getAllByRole("link", { name: "Product" }).at(-1)!);
    expect(mobileNavigation).toHaveAttribute("data-open", "false");
  });

  it("keeps every public navigation anchor backed by a landing section", () => {
    const page = readFileSync("app/page.tsx", "utf8");
    const components = [
      readFileSync("components/marketing/JourneySection.tsx", "utf8"),
      readFileSync("components/marketing/ScrollProductNarrative.tsx", "utf8"),
      readFileSync("components/marketing/PhilosophySection.tsx", "utf8"),
      readFileSync("components/marketing/PricingSection.tsx", "utf8"),
      readFileSync("components/marketing/FaqSection.tsx", "utf8"),
    ].join("\n");

    expect(page).toContain("<JourneySection />");
    for (const id of ["product", "how-it-works", "philosophy", "pricing", "faq"]) {
      expect(components).toContain(`id=\"${id}\"`);
    }
  });

  it("renders the complete mark immediately for reduced motion", () => {
    const styles = readFileSync("app/phase-7-1.css", "utf8");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(".brand-mark--animated :is(.brand-mark__spark");
    expect(styles).toContain(".brand-mark__grow");
    expect(styles).toContain("animation: none !important");
    expect(styles).toContain("opacity: 1");
  });

  it("keeps the current workspace route and profile access discoverable", () => {
    render(<WorkspaceNavigation email="owner@example.test" />);

    const navigation = screen.getByRole("navigation", { name: "Workspace navigation" });
    expect(within(navigation).getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    expect(within(navigation).getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/settings/profile");
    expect(screen.getByText("owner@example.test")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Sign out" })).not.toHaveLength(0);
  });
});
