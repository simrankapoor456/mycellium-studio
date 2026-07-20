import { readFileSync } from "node:fs";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SplitText from "@/components/react-bits/SplitText";
import { FaqSection, faqItems } from "@/components/marketing/FaqSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { TrustSection } from "@/components/marketing/TrustSection";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { getAuthHref, getSafeReturnPath } from "@/lib/auth/return-path";
import { PROJECT_CREATION_PATH, PROJECT_START_HREF } from "@/lib/marketing/links";

vi.mock("@/app/(protected)/settings/profile/actions", () => ({
  updateProfileAction: vi.fn(),
  changeEmailAction: vi.fn(),
  changePasswordAction: vi.fn(),
}));

describe("Phase 7.2 route trust", () => {
  it("keeps project creation intent through a validated authentication return path", () => {
    expect(PROJECT_CREATION_PATH).toBe("/projects/new");
    expect(PROJECT_START_HREF).toBe("/signup?next=%2Fprojects%2Fnew");
    expect(getAuthHref("/login", PROJECT_CREATION_PATH)).toBe("/login?next=%2Fprojects%2Fnew");
    expect(getSafeReturnPath("https://example.test/projects/new")).toBe("/dashboard");
    expect(getSafeReturnPath("//example.test/projects/new")).toBe("/dashboard");
    expect(getSafeReturnPath("/projects/9dfbf55d-c186-49d9-a99d-e4dde284fa41/review")).toContain("/review");
  });

  it("keeps navigation, footer anchors, and the logo destination explicit", () => {
    render(<><MarketingHeader /><MarketingFooter /></>);
    expect(screen.getAllByRole("link", { name: "Mycellium Studio home" })[0]).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("link", { name: "Product" })[0]).toHaveAttribute("href", "#product");
    expect(screen.getAllByRole("link", { name: "FAQ" }).at(-1)).toHaveAttribute("href", "#faq");
    expect(screen.getByRole("link", { name: "Start your project" })).toHaveAttribute("href", PROJECT_START_HREF);
  });

  it("ships branded not-found and route-error recovery surfaces", () => {
    const notFound = readFileSync("app/not-found.tsx", "utf8");
    const routeError = readFileSync("app/error.tsx", "utf8");
    expect(notFound).toContain("getCurrentUser");
    expect(notFound).toContain("Return to projects");
    expect(routeError).toContain("Try again");
    expect(routeError).not.toContain("error.message");
  });
});

describe("Phase 7.2 public trust and motion", () => {
  it("states provider, ownership, upload, collaboration, and export limits accurately", () => {
    render(<FaqSection />);
    expect(faqItems).toHaveLength(12);
    expect(screen.getByText(/may enhance interpretation and generation/)).toBeInTheDocument();
    expect(screen.getByText(/File upload is not supported/)).toBeInTheDocument();
    expect(screen.getByText(/shared ownership, collaboration/)).toBeInTheDocument();
    expect(screen.getByText(/No external integrations/)).toBeInTheDocument();
  });

  it("frames human review as capability rules rather than live project status", () => {
    render(<TrustSection />);
    expect(screen.getByText("Capability rules")).toBeInTheDocument();
    expect(screen.getByText(/not a live project status/)).toBeInTheDocument();
    expect(screen.getByText("Architect the product")).toBeInTheDocument();
    expect(screen.queryByText("Blueprint approved")).not.toBeInTheDocument();
  });

  it("renders split text as complete readable content before motion enhancement", () => {
    render(<SplitText tag="h2" text="A complete readable transition" />);
    expect(screen.getByRole("heading", { name: "A complete readable transition" })).toBeVisible();
    const source = readFileSync("components/react-bits/SplitText.tsx", "utf8");
    expect(source).toContain("prefers-reduced-motion: no-preference");
    expect(source).toContain("split.revert()");
  });

  it("keeps Lenis dormant outside the component tree", () => {
    expect(readFileSync("app/layout.tsx", "utf8")).not.toContain("Lenis");
    expect(readFileSync("app/(protected)/layout.tsx", "utf8")).not.toContain("Lenis");
  });
});

describe("Phase 7.2 profile structure", () => {
  it("keeps independent save boundaries and truthful account guidance", () => {
    render(<ProfileSettings profile={{
      displayName: "",
      avatarUrl: "",
      timezone: "UTC",
      location: "",
      email: "owner@example.test",
      createdAt: "2026-01-15T00:00:00.000Z",
    }} />);
    expect(screen.getByRole("button", { name: "Save profile" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Request email change" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Change password" })).toBeEnabled();
    expect(screen.getByText(/Self-service removal is not enabled/)).toBeInTheDocument();
    expect(screen.getByLabelText("Initials: OE")).toBeInTheDocument();
  });
});
