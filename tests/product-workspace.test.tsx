import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArchitectureReveal, ARCHITECTURE_REVEAL_STAGES } from "@/components/discovery/ArchitectureReveal";
import { LivingProductGraph } from "@/components/discovery/LivingProductGraph";
import { buildProductGraph } from "@/lib/discovery/engine";

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("Phase 3B workspace interactions", () => {
  it("lets keyboard users select a graph node and read its detail", () => {
    const now = "2026-07-18T00:00:00.000Z";
    const graph = buildProductGraph([{ id: "fact-users", category: "target_users", label: "Target users", value: "Independent designers", status: "confirmed", confidence: 1, sourceMessageIds: [], createdAt: now, updatedAt: now, manuallyEdited: false }], []);
    render(<LivingProductGraph graph={graph} />);
    const svgNode = screen.getByRole("button", { name: /Target users: Independent designers/ });
    fireEvent.keyDown(svgNode, { key: "Enter" });
    expect(screen.getAllByText("Independent designers").length).toBeGreaterThan(0);
    expect(screen.getByText("Rooted in discovery")).toBeInTheDocument();
  });

  it("makes the architecture reveal immediate for reduced-motion users", () => {
    vi.useFakeTimers(); const onComplete = vi.fn();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<ArchitectureReveal onComplete={onComplete} />);
    act(() => vi.runAllTimers());
    expect(onComplete).toHaveBeenCalledOnce();
    expect(ARCHITECTURE_REVEAL_STAGES).toHaveLength(8);
  });
});
