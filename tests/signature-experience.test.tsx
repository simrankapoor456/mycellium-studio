import { readFileSync } from "node:fs";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProductGraph } from "@/components/marketing/diagrams/ProductGraph";
import { ProductStageExperience } from "@/components/marketing/ProductStageExperience";
import { ScrollProductNarrative } from "@/components/marketing/ScrollProductNarrative";

describe("signature Product Graph", () => {
  it("renders the complete static graph and mobile fallback before enhancement", () => {
    const { container } = render(<ProductGraph activeLevel={0} ariaLabel="Static product graph" />);

    expect(screen.getByRole("img", { name: "Static product graph" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Product graph structure" })).toBeInTheDocument();
    expect(screen.getAllByText("Sprint 01")).toHaveLength(2);
    expect(screen.getAllByText("Delivery sequence")).toHaveLength(2);
    expect(container.querySelector('[data-kind="sprint"]')).toHaveAttribute("data-active", "false");
    expect(container.querySelector('[data-kind="sprint"]')).toHaveAttribute("data-state", "future");
    expect(screen.getByRole("list", { name: "Product graph state key" })).toHaveTextContent("emerging");
  });

  it("lets keyboard and pointer users select every scroll-story chapter", async () => {
    const user = userEvent.setup();
    render(<ScrollProductNarrative />);

    const idea = screen.getByRole("button", { name: /Fragmented input/ });
    const foundation = screen.getByRole("button", { name: /Foundation stabilized/ });

    expect(idea).toHaveAttribute("aria-pressed", "true");
    await user.click(foundation);
    expect(foundation).toHaveAttribute("aria-pressed", "true");
  });
});

describe("signature workflow diagrams", () => {
  it("reveals scope and dependency diagrams in Architect", async () => {
    const user = userEvent.setup();
    render(<ProductStageExperience />);

    await user.click(screen.getByRole("tab", { name: /Architect/ }));

    expect(screen.getByLabelText("Scrollable scope boundary map")).toBeInTheDocument();
    expect(screen.getByLabelText("Scrollable architecture dependency map")).toBeInTheDocument();
  });

  it("reveals hierarchy and sprint diagrams in Execute", () => {
    render(<ProductStageExperience />);

    const discover = screen.getByRole("tab", { name: /Discover/ });
    fireEvent.keyDown(discover, { key: "End" });

    expect(screen.getByRole("tab", { name: /Execute/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("Scrollable epic story and task hierarchy")).toBeInTheDocument();
    expect(screen.getByLabelText("Scrollable sprint allocation timeline")).toBeInTheDocument();
  });

  it("uses IntersectionObserver rather than a scroll listener", () => {
    const source = readFileSync("components/marketing/ScrollProductNarrative.tsx", "utf8");

    expect(source).toContain("IntersectionObserver");
    expect(source).not.toContain('addEventListener("scroll"');
  });
});
