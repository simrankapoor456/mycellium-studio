import { readFile } from "node:fs/promises";

import { expect, test, type Download, type Page } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const projectId = process.env.E2E_PROJECT_ID;
const emptyProjectId = process.env.E2E_EMPTY_PROJECT_ID;
const fallbackProjectId = process.env.E2E_FALLBACK_PROJECT_ID;
const canAuthenticate = Boolean(email && password);

test.describe("Product Blueprint exports", () => {
  test.skip(!canAuthenticate, "Set E2E_EMAIL and E2E_PASSWORD for authenticated export checks.");

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("exports the latest saved edit in Markdown, JSON, and CSV after refresh", async ({ page }) => {
    test.skip(!projectId, "Set E2E_PROJECT_ID to a project with a generated blueprint.");
    const editedTitle = `Export regression ${Date.now()}`;

    await page.goto(`/projects/${projectId}`);
    await expect(page.getByRole("link", { name: "Export" })).toBeVisible();
    await page.getByRole("button", { name: "Structured document" }).click();
    await page.getByText("Edit", { exact: true }).first().click();
    await page.locator('input[name="title"]').first().fill(editedTitle);
    const saveResponse = page.waitForResponse((response) => response.url().includes(`/api/projects/${projectId}/blueprint`) && response.request().method() === "PATCH");
    await page.getByRole("button", { name: "Save changes" }).first().click();
    await expect((await saveResponse).ok()).toBeTruthy();

    await page.getByRole("link", { name: "Export" }).first().click();
    await expect(page.getByRole("heading", { name: "Take the blueprint with you" })).toBeVisible();

    const markdown = await downloadText(page, "Markdown");
    expect(markdown).toContain(editedTitle);
    await expect(page.getByText(/Markdown download ready/i)).toBeVisible();

    await page.reload();
    const json = await downloadText(page, "JSON");
    const csv = await downloadText(page, "CSV");
    expect(json).toContain(editedTitle);
    expect(csv).toContain(editedTitle);
  });

  test("explains the locked export state before a blueprint exists", async ({ page }) => {
    test.skip(!emptyProjectId, "Set E2E_EMPTY_PROJECT_ID to a project without a blueprint.");
    await page.goto(`/projects/${emptyProjectId}/export`);
    await expect(page.getByRole("link", { name: /Export/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Exports unlock with your first Product Blueprint" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Markdown/ })).toBeDisabled();
  });

  test("keeps every export format visible on mobile", async ({ page }) => {
    test.skip(!projectId, "Set E2E_PROJECT_ID to a project with a generated blueprint.");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/projects/${projectId}/export`);
    await expect(page.getByRole("link", { name: "Export" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Markdown/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /JSON/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /CSV/ })).toBeVisible();
  });

  test("exposes exports for a fallback-generated blueprint", async ({ page }) => {
    test.skip(!fallbackProjectId, "Set E2E_FALLBACK_PROJECT_ID to a fallback-generated blueprint.");
    await page.goto(`/projects/${fallbackProjectId}`);
    await expect(page.getByText("Reliable mode").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Export" })).toBeVisible();
  });
});

async function signIn(page: Page) {
  await page.goto("/login");

  if (!page.url().includes("/login")) {
    return;
  }

  await page.getByLabel("Email").fill(email ?? "");
  await page.getByLabel("Password").fill(password ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard/);
}

async function downloadText(page: Page, label: string): Promise<string> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: new RegExp(label, "i") }).click(),
  ]);
  return readDownload(download);
}

async function readDownload(download: Download): Promise<string> {
  const path = await download.path();

  if (!path) {
    throw new Error("The browser did not expose the downloaded file.");
  }

  return readFile(path, "utf8");
}
