import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlueprintExportPanel } from "@/components/blueprint/BlueprintExportPanel";
import { ReadinessRoots } from "@/components/discovery/ReadinessRoots";
import { ProjectWorkspaceNav } from "@/components/projects/ProjectWorkspaceNav";
import { advanceDiscovery, calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { getReadinessPresentation, MYCELLIUM_COPY } from "@/lib/voice/mycellium";

const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const now = "2026-07-18T00:00:00.000Z";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Mycellium voice", () => {
  it("keeps equivalent state transitions deterministic and specific", () => {
    const messages = Array.from({ length: 8 }, (_, index) => {
      const context = createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now);
      return advanceDiscovery({ context, messageId: `30000000-0000-4000-8000-${String(index).padStart(12, "0")}`, message: "Independent designers are the first users.", mode: "fallback", now }).assistantMessage;
    });

    expect(new Set(messages).size).toBe(1);
    expect(messages[0]).toContain("Business objective is now grounded");
    expect(messages.every((message) => !/input received|critical gaps|readiness assessment|that adds target users/i.test(message))).toBe(true);
  });

  it("turns readiness data into human foundation language", () => {
    let context = createInitialDiscoveryContext({ id: projectId, description: "A focused invoicing assistant", targetUsers: "Independent designers", constraints: null }, now);
    context = advanceDiscovery({ context, messageId: "30000000-0000-4000-8000-000000000010", message: "The problem is that designers lose hours chasing late invoices.", mode: "fallback", now }).context;
    const readiness = calculateReadiness(context);
    const presentation = getReadinessPresentation(readiness);

    render(<ReadinessRoots readiness={readiness} />);
    expect(presentation.title).toBe("Foundation readiness");
    expect(screen.getByText(presentation.title)).toBeInTheDocument();
    expect(screen.getByText(/rooted/i)).toBeInTheDocument();
    expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
  });

  it("calls out contradictions in direct, natural language", () => {
    const empty = createInitialDiscoveryContext({ id: projectId, description: null, targetUsers: null, constraints: null }, now);
    const first = advanceDiscovery({ context: empty, messageId: "30000000-0000-4000-8000-000000000011", message: "The business goal is reducing unpaid invoices.", mode: "fallback", now });
    const second = advanceDiscovery({ context: first.context, messageId: "30000000-0000-4000-8000-000000000012", message: "The business goal is selling accounting subscriptions instead.", mode: "fallback", now });

    expect(second.assistantMessage).toContain("conflicts with an earlier direction");
    expect(second.contradictions[0]?.description).toContain("Two different answers exist");
  });
});

describe("blueprint export access", () => {
  it("keeps Export visible in project navigation before a blueprint exists", () => {
    render(<ProjectWorkspaceNav active="overview" blueprintAvailable={false} projectId={projectId} />);
    const exportLinks = screen.getAllByRole("link", { name: /Export/ });

    expect(exportLinks.some((link) => link.getAttribute("href") === `/projects/${projectId}/export`)).toBe(true);
    expect(exportLinks.every((link) => link.textContent?.includes("Blueprint required"))).toBe(true);
  });

  it("explains the locked state without presenting dead controls", () => {
    render(<BlueprintExportPanel available={false} projectId={projectId} projectName="Invoice roots" />);
    expect(screen.getByRole("heading", { name: MYCELLIUM_COPY.export.lockedTitle })).toBeInTheDocument();
    expect(screen.getByText(MYCELLIUM_COPY.export.lockedDescription)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Markdown/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /JSON/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /CSV/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("Available after blueprint")).toHaveLength(3);
  });

  it("downloads every format and confirms success from the current saved routes", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => new Response(`current saved blueprint from ${String(input)}`, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mycellium-export");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<BlueprintExportPanel available projectId={projectId} projectName="Invoice roots" />);

    for (const label of ["Markdown", "JSON", "CSV"]) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label, "i") }));
      await waitFor(() => expect(screen.getByText(new RegExp(`${label} download ready`, "i"))).toBeInTheDocument());
    }

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      `/api/projects/${projectId}/exports/markdown`,
      `/api/projects/${projectId}/exports/json`,
      `/api/projects/${projectId}/exports/csv`,
    ]);
  });
});
