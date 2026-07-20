import { readFileSync } from "node:fs";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FaqSection } from "@/components/marketing/FaqSection";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ProductStageExperience } from "@/components/marketing/ProductStageExperience";

vi.mock("@/app/(auth)/actions", () => ({
  loginAction: async () => ({ status: "idle", message: "" }),
  signupAction: async () => ({ status: "idle", message: "" }),
}));

describe("Mycellium brand and navigation", () => {
  it("renders the brand mark and home link", () => {
    render(<BrandLogo />);
    const link = screen.getByRole("link", { name: "Mycellium Studio home" });

    expect(link).toHaveAttribute("href", "/");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("provides every required landing navigation target", () => {
    render(<MarketingHeader />);

    expect(screen.getAllByRole("link", { name: "Product" })[0]).toHaveAttribute("href", "#product");
    expect(screen.getAllByRole("link", { name: "How it works" })[0]).toHaveAttribute("href", "#how-it-works");
    expect(screen.getAllByRole("link", { name: "Philosophy" })[0]).toHaveAttribute("href", "#philosophy");
    expect(screen.getAllByRole("link", { name: "Pricing" })[0]).toHaveAttribute("href", "#pricing");
    expect(screen.getAllByRole("link", { name: "FAQ" })[0]).toHaveAttribute("href", "#faq");
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute("href", "/signup");
  });
});

describe("interactive product experience", () => {
  it("switches stages with pointer and keyboard controls", async () => {
    const user = userEvent.setup();
    render(<ProductStageExperience />);

    const discover = screen.getByRole("tab", { name: /Discover/ });
    const architect = screen.getByRole("tab", { name: /Architect/ });

    expect(discover).toHaveAttribute("aria-selected", "true");
    await user.click(architect);
    expect(architect).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Scope and decision map")).toBeInTheDocument();

    fireEvent.keyDown(architect, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: /Execute/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Epics, stories, tasks, sprints")).toBeInTheDocument();
  });

  it("uses native FAQ disclosure behavior", async () => {
    const user = userEvent.setup();
    render(<FaqSection />);

    const summary = screen.getByText("What is Mycellium Studio?");
    const disclosure = summary.closest("details");

    expect(disclosure).not.toHaveAttribute("open");
    await user.click(summary);
    expect(disclosure).toHaveAttribute("open");
  });

  it("keeps available and future pricing actions honest", () => {
    render(<PricingSection />);

    expect(screen.getByRole("link", { name: "Start free" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("button", { name: "Coming soon" })).toBeDisabled();
  });

  it("defines a reduced-motion fallback", () => {
    const styles = readFileSync("app/globals.css", "utf8");

    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(".root-path");
    expect(styles).toContain("animation: none");
    expect(styles).toContain(".signature-hero-graph__light");
    expect(styles).toContain("transition-duration: 0.01ms");
  });
});

describe("authentication form integrity", () => {
  it("keeps login fields labeled and linked to signup", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/signup");
  });

  it("keeps signup fields labeled without fake social authentication", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("Name")).toHaveAttribute("autocomplete", "name");
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2);
    expect(screen.queryByText(/Google|GitHub|Facebook/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });
});
