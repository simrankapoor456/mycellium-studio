import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { POST, maxDuration } from "@/app/api/projects/[id]/blueprint/route";
import { ReviewWorkspace } from "@/components/discovery/ReviewWorkspace";
import { generateDeterministicBlueprint } from "@/lib/blueprint/generate";
import { calculateReadiness, createInitialDiscoveryContext } from "@/lib/discovery/engine";
import { ProjectOutputSchema } from "@/lib/domain/project/schemas";
import {
  BLUEPRINT_INTERRUPTED_MESSAGE,
  readJsonResponseSafely,
  readTypedApiError,
} from "@/lib/errors/response";
import { ProviderTimeoutError, withProviderTimeout } from "@/lib/mycel-core/ai/timeout";
import { isUnavailableBlueprintRequestLedger } from "@/lib/mycel-core/execution/persistence";

const routeMocks = vi.hoisted(() => ({
  edit: vi.fn(),
  generation: vi.fn(),
}));

vi.mock("@/lib/mycel-core/orchestration", () => ({
  orchestrateBlueprintEdit: routeMocks.edit,
  orchestrateBlueprintGeneration: routeMocks.generation,
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

const projectId = "42ad2ff0-4835-47d1-b3fe-d6c1f58863a2";
const requestId = "30000000-0000-4000-8000-000000000031";
const now = "2026-07-20T20:00:00.000Z";
const context = createInitialDiscoveryContext({
  id: projectId,
  description: "A focused planning workspace",
  targetUsers: "Product owners",
  constraints: "Private project context",
}, now);
const project = ProjectOutputSchema.parse({
  id: projectId,
  user_id: "2d9065fe-829c-4c6c-b867-7663f43e8740",
  name: "Signal Garden",
  description: "A focused planning workspace",
  project_type: "web-app",
  target_users: "Product owners",
  team_size: 2,
  sprint_length: "2-weeks",
  capacity: 20,
  planning_depth: "balanced",
  constraints: "Private project context",
  status: "ready",
  discovery_context: null,
  readiness_state: null,
  plan: null,
  plan_schema_version: null,
  generation_source: null,
  created_at: now,
  updated_at: now,
});
const blueprint = generateDeterministicBlueprint(project, context, now);
const successBody = { blueprint, generationSource: "fallback", engineState: "reliable" };

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("safe blueprint response parsing", () => {
  it("reads a successful JSON response", async () => {
    await expect(readJsonResponseSafely(new Response(JSON.stringify(successBody), { status: 200 })))
      .resolves.toEqual({ ok: true, body: successBody });
  });

  it.each([
    ["empty 500", new Response(null, { status: 500 }), "EMPTY_RESPONSE"],
    ["invalid JSON", new Response("{partial", { status: 500 }), "INVALID_JSON"],
    ["HTML platform response", new Response("<!doctype html><title>Failure</title>", { status: 500 }), "NON_JSON_RESPONSE"],
    ["no-content response", new Response(null, { status: 204 }), "EMPTY_RESPONSE"],
  ])("handles %s without exposing parser details", async (_label, response, code) => {
    const result = await readJsonResponseSafely(response);
    expect(result).toMatchObject({ ok: false, error: { code, message: BLUEPRINT_INTERRUPTED_MESSAGE, retryable: true } });
    expect(JSON.stringify(result)).not.toContain("Unexpected end of JSON input");
  });

  it("handles an aborted response body", async () => {
    const response = { status: 500, text: vi.fn(async () => { throw new DOMException("aborted", "AbortError"); }) };
    await expect(readJsonResponseSafely(response)).resolves.toMatchObject({ ok: false, error: { code: "RESPONSE_ABORTED" } });
  });

  it("reads a typed retryable API error", () => {
    expect(readTypedApiError({ error: { code: "GENERATION_TIMEOUT", message: "Generation did not complete in time.", retryable: true } }))
      .toEqual({ code: "GENERATION_TIMEOUT", message: "Generation did not complete in time.", retryable: true });
  });
});

describe("blueprint API failure contract", () => {
  it("uses a supported 60-second function duration and returns successful JSON", async () => {
    routeMocks.generation.mockResolvedValueOnce({ ok: true, status: 200, data: successBody });
    const response = await POST(blueprintRequest(), { params: Promise.resolve({ id: projectId }) });
    expect(maxDuration).toBe(60);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(successBody);
  });

  it("returns typed JSON when orchestration fails before producing an outcome", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    routeMocks.generation.mockRejectedValueOnce({ code: "PGRST205" });
    const response = await POST(blueprintRequest(), { params: Promise.resolve({ id: projectId }) });
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: { code: "GENERATION_INTERRUPTED", message: BLUEPRINT_INTERRUPTED_MESSAGE, retryable: true },
    });
  });

  it("keeps controlled failures typed and retryable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    routeMocks.generation.mockResolvedValueOnce({ ok: false, status: 500, error: "The blueprint could not be saved.", decision: "denied" });
    const response = await POST(blueprintRequest(), { params: Promise.resolve({ id: projectId }) });
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "GENERATION_FAILED", message: "The blueprint could not be saved.", retryable: true },
      decision: "denied",
    });
  });
});

describe("blueprint generation recovery", () => {
  it.each([
    ["empty response", () => new Response(null, { status: 500 })],
    ["invalid JSON", () => new Response("{partial", { status: 500 })],
    ["HTML response", () => new Response("<html><body>Unavailable</body></html>", { status: 500 })],
  ])("shows a stable retry state for an %s", async (_label, responseFactory) => {
    vi.stubGlobal("fetch", vi.fn(async () => responseFactory()));
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Architect my product" }));
    expect(await screen.findByRole("button", { name: "Retry blueprint generation" })).toBeVisible();
    expect(screen.getByText(BLUEPRINT_INTERRUPTED_MESSAGE)).toBeVisible();
    expect(screen.queryByText(/Unexpected end of JSON input/)).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Blueprint generation status" })).toHaveTextContent("Interrupted / Retry");
  });

  it("handles an aborted request without losing the saved foundation", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new DOMException("aborted", "AbortError"); }));
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Architect my product" }));
    expect(await screen.findByText(BLUEPRINT_INTERRUPTED_MESSAGE)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Return to foundation review" }));
    expect(screen.getByRole("heading", { name: "Review the product foundation." })).toBeVisible();
    expect(screen.getAllByText("A focused planning workspace").length).toBeGreaterThan(0);
  });

  it("reuses the request lineage on retry and accepts a persisted result", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(successBody), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Architect my product" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retry blueprint generation" }));
    expect(await screen.findByText("Completed / Architecture formed")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const first = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { requestId: string };
    const second = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)) as { requestId: string };
    expect(second.requestId).toBe(first.requestId);
  });

  it("times provider work out before the function deadline", async () => {
    vi.useFakeTimers();
    const pending = withProviderTimeout(async () => new Promise<never>(() => undefined), 25);
    const rejection = expect(pending).rejects.toBeInstanceOf(ProviderTimeoutError);
    await vi.advanceTimersByTimeAsync(25);
    await rejection;
  });

  it("degrades only the blueprint request ledger when its existing table is unavailable", () => {
    expect(isUnavailableBlueprintRequestLedger({ code: "PGRST205" }, "blueprint_generation")).toBe(true);
    expect(isUnavailableBlueprintRequestLedger({ code: "PGRST205" }, "pressure_test")).toBe(false);
    expect(isUnavailableBlueprintRequestLedger({ code: "42501" }, "blueprint_generation")).toBe(false);
  });
});

function blueprintRequest() {
  return new Request(`http://localhost/api/projects/${projectId}/blueprint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId }),
  });
}

function renderWorkspace() {
  render(
    <ReviewWorkspace
      blueprintAvailable={false}
      initialContext={context}
      initialReadiness={calculateReadiness(context)}
      initiallyApproved
      projectId={projectId}
      projectName="Signal Garden"
    />,
  );
}
