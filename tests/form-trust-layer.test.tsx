import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { ProjectForm } from "@/components/projects/ProjectForm";
import type { ActionState } from "@/lib/actions/action-state";
import { getProjectFormValues } from "@/lib/domain/project/form-values";
import { getTimezoneOptions } from "@/lib/domain/profile/options";

const push = vi.fn();
const createProject = vi.fn(async (): Promise<ActionState> => ({ status: "error", message: "Unable to create project.", errorKind: "database", retryable: true }));
const updateProfile = vi.fn(async () => ({ status: "success" as const, message: "Profile saved." }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/app/(protected)/projects/actions", () => ({
  createProjectAction: (...args: unknown[]) => createProject(...args as []),
  updateProjectMetadataAction: vi.fn(),
}));
vi.mock("@/app/(protected)/settings/profile/actions", () => ({
  updateProfileAction: (...args: unknown[]) => updateProfile(...args as []),
  changeEmailAction: vi.fn(),
  changePasswordAction: vi.fn(),
}));

beforeEach(() => {
  window.localStorage.clear();
  Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
  push.mockReset();
  createProject.mockClear();
  updateProfile.mockClear();
  Element.prototype.scrollIntoView = vi.fn();
  window.requestAnimationFrame = (callback: FrameRequestCallback) => { callback(0); return 1; };
  window.cancelAnimationFrame = vi.fn();
});

describe("project form trust", () => {
  it("marks only the four starting fields as required", () => {
    const { container } = render(<ProjectForm />);
    const requiredNames = Array.from(container.querySelectorAll<HTMLElement>("[required]")).map((field) => field.getAttribute("name"));
    expect(requiredNames).toEqual(["name", "description", "sprintLength", "teamSize"]);
    expect(screen.getByText("Advanced planning")).toBeVisible();
    expect(screen.getByRole("complementary", { name: "Foundation preview" })).toBeVisible();
  });

  it("focuses the first invalid field and preserves every entered value", async () => {
    const user = userEvent.setup();
    render(<ProjectForm />);
    const name = screen.getByLabelText("Project name");
    await user.type(name, "A careful product");
    await user.click(screen.getByRole("button", { name: "Start this project" }));
    const description = await screen.findByLabelText("Project description");
    expect(description).toHaveFocus();
    expect(description).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Project description is required.")).toBeVisible();
    expect(name).toHaveValue("A careful product");
    expect(createProject).not.toHaveBeenCalled();
  });

  it("restores a local draft without generating product output", async () => {
    const values = { ...getProjectFormValues(), name: "Restored idea", description: "A draft that should survive an unexpected refresh." };
    window.localStorage.setItem("mycellium:project-draft:v1:local", JSON.stringify({ version: 1, values }));
    render(<ProjectForm />);
    expect(await screen.findByDisplayValue("Restored idea")).toBeVisible();
    expect(screen.getByText("Draft restored from this browser.")).toBeVisible();
    expect(screen.getByText(/structural preview, not generated output/i)).toBeVisible();
  });

  it("retains the controlled draft after a failed server action", async () => {
    const user = userEvent.setup();
    render(<ProjectForm />);
    await user.type(screen.getByLabelText("Project name"), "Network-safe idea");
    await user.type(screen.getByLabelText("Project description"), "This description is detailed enough to submit while preserving every field after failure.");
    await user.click(screen.getByRole("button", { name: "Start this project" }));
    expect(await screen.findByText("Unable to create project.")).toBeVisible();
    expect(screen.getByLabelText("Project name")).toHaveValue("Network-safe idea");
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
    expect(createProject).toHaveBeenCalledOnce();
  });

  it("keeps the draft offline without starting a request", async () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
    const user = userEvent.setup();
    render(<ProjectForm />);
    await user.type(screen.getByLabelText("Project name"), "Offline idea");
    await user.type(screen.getByLabelText("Project description"), "This description remains in place while the browser cannot reach the server.");
    await user.click(screen.getByRole("button", { name: "Start this project" }));
    expect(await screen.findByText(/Could not reach the server/)).toBeVisible();
    expect(screen.getByLabelText("Project description")).toHaveValue("This description remains in place while the browser cannot reach the server.");
    expect(createProject).not.toHaveBeenCalled();
  });

  it("retains work and provides sign-in recovery after session expiry", async () => {
    createProject.mockResolvedValueOnce({ status: "error", message: "Your session expired. Your work is still here. Sign in again, then retry.", errorKind: "authentication", retryable: true });
    const user = userEvent.setup();
    render(<ProjectForm />);
    await user.type(screen.getByLabelText("Project name"), "Session-safe idea");
    await user.type(screen.getByLabelText("Project description"), "This description should still be present after the authentication boundary expires.");
    await user.click(screen.getByRole("button", { name: "Start this project" }));
    expect(await screen.findByRole("link", { name: "Sign in again" })).toHaveAttribute("href", "/login");
    expect(screen.getByLabelText("Project name")).toHaveValue("Session-safe idea");
  });

  it("disables duplicate submission while a slow request is pending", async () => {
    let resolveRequest: ((state: ActionState) => void) | undefined;
    createProject.mockImplementationOnce(() => new Promise<ActionState>((resolve) => { resolveRequest = resolve; }));
    const user = userEvent.setup();
    render(<ProjectForm />);
    await user.type(screen.getByLabelText("Project name"), "Patient idea");
    await user.type(screen.getByLabelText("Project description"), "This request remains pending long enough to prove that duplicate submission is blocked.");
    await user.click(screen.getByRole("button", { name: "Start this project" }));
    const pendingButton = await screen.findByRole("button", { name: "Saving your work" });
    expect(pendingButton).toBeDisabled();
    await user.click(pendingButton);
    expect(createProject).toHaveBeenCalledOnce();
    resolveRequest?.({ status: "error", message: "Unable to create project.", errorKind: "database", retryable: true });
    expect(await screen.findByRole("button", { name: "Retry" })).toBeEnabled();
  });

  it("shows Saved before moving to the created project", async () => {
    createProject.mockResolvedValueOnce({ status: "success", message: "Project created.", redirectTo: "/projects/new-id" });
    const user = userEvent.setup();
    render(<ProjectForm />);
    await user.type(screen.getByLabelText("Project name"), "Saved idea");
    await user.type(screen.getByLabelText("Project description"), "A complete starting description that can be saved without losing its visible confirmation.");
    await user.click(screen.getByRole("button", { name: "Start this project" }));
    expect(await screen.findByRole("button", { name: "Saved" })).toBeVisible();
    expect(screen.getByText("All changes saved")).toBeVisible();
  });
});

describe("profile form trust", () => {
  it("provides searchable IANA timezones, optional context, and avatar preview validation", async () => {
    const user = userEvent.setup();
    render(<ProfileSettings profile={{ displayName: "Owner", avatarUrl: "", timezone: "America/Los_Angeles", location: "", email: "owner@example.test", createdAt: "2026-01-15T00:00:00.000Z" }} />);
    expect(getTimezoneOptions()).toContain("America/Los_Angeles");
    expect(screen.getByRole("combobox", { name: "Timezone" })).toHaveValue("America/Los_Angeles");
    expect(screen.getAllByText("Optional", { selector: ".form-field__requirement" }).length).toBeGreaterThan(0);
    const avatar = screen.getByLabelText("Avatar URL");
    await user.type(avatar, "http://example.test/avatar.png");
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    expect(await screen.findByText("Please enter a valid HTTPS image URL.")).toBeVisible();
    expect(avatar).toHaveValue("http://example.test/avatar.png");
    expect(avatar).toHaveFocus();
  });

  it("announces unsaved changes only after editing", () => {
    render(<ProfileSettings profile={{ displayName: "Owner", avatarUrl: "", timezone: "UTC", location: "", email: "owner@example.test", createdAt: "2026-01-15T00:00:00.000Z" }} />);
    expect(screen.getAllByText("All changes saved").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Studio owner" } });
    expect(screen.getByText("Unsaved changes")).toBeVisible();
  });

  it("re-announces repeated successful saves", async () => {
    const user = userEvent.setup();
    render(<ProfileSettings profile={{ displayName: "Owner", avatarUrl: "", timezone: "UTC", location: "", email: "owner@example.test", createdAt: "2026-01-15T00:00:00.000Z" }} />);
    const displayName = screen.getByLabelText("Display name");
    await user.clear(displayName);
    await user.type(displayName, "Studio owner");
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    const firstToast = await screen.findByText("Profile saved.", { selector: ".form-success-toast" });

    await waitFor(() => expect(screen.getByRole("button", { name: "Saved" })).toBeVisible());
    await user.type(displayName, " updated");
    await user.click(screen.getByRole("button", { name: "Save profile" }));
    await waitFor(() => expect(screen.getByText("Profile saved.", { selector: ".form-success-toast" })).not.toBe(firstToast));
    const secondToast = screen.getByText("Profile saved.", { selector: ".form-success-toast" });

    expect(updateProfile).toHaveBeenCalledTimes(2);
    expect(secondToast).not.toBe(firstToast);
  });
});
