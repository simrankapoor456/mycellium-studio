import { readFile } from "node:fs/promises";

import { expect, test, type Download, type Page } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(!(email && password), "Set E2E_EMAIL and E2E_PASSWORD for the authenticated workflow.");

test("completes the owner-scoped Mycel Core workflow", async ({ page }) => {
  test.setTimeout(150_000);
  await signIn(page); await page.goto("/projects/new");
  const projectName = `Untitled system ${Date.now()}`;
  await page.getByLabel("Project name").fill(projectName);
  await page.getByLabel("Add everything you already have").fill("Rough notes\nA private tool should keep product decisions connected to delivery work.\nThe first version must support review and portable output.\nOne open question is how much structure to show at once.");
  await page.getByLabel("Product type").selectOption("custom");
  await page.getByLabel("Describe the product type").fill("Spatial planning system");
  await page.getByLabel("Target users").fill("Workspace owners in small product groups");
  await page.getByLabel("Constraints").fill("Keyboard access and private project ownership are required.");
  await page.getByRole("button", { name: "Start this project" }).click();
  await page.getByRole("link", { name: "Begin discovery" }).click();
  const projectId = page.url().match(/\/projects\/([^/]+)/)?.[1];
  expect(projectId).toBeTruthy();

  const answers = ["The business objective is to reduce planning rework.", "The problem is that groups lose time reconciling scattered product decisions.", "Workspace owners need to create and review one grounded blueprint.", "Success means reducing planning rework by half.", "The first release must support review, editing, and portable output."];
  for (const answer of answers) { await page.getByLabel("Your answer").fill(answer); await page.getByRole("button", { name: "Share answer" }).click(); await expect(page.getByRole("button", { name: "Share answer" })).toBeEnabled(); }

  await page.reload(); await expect(page.getByText(answers.at(-1) ?? "")).toBeVisible();
  await page.locator(".living-graph__node").first().click();
  const graphEditor = page.getByLabel("Edit this fact");
  await graphEditor.fill(`${await graphEditor.inputValue()} with a traceable source`);
  await page.getByRole("button", { name: "Save fact" }).click();
  await page.getByRole("link", { name: /review the foundation/i }).click();

  const firstFact = page.locator(".review-fact").first();
  await firstFact.getByRole("button", { name: "Edit" }).click();
  await firstFact.getByLabel("State").selectOption("unknown");
  await firstFact.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "Approve this foundation" }).click();
  await expect(page.getByRole("alert")).toContainText("needs your input");
  await firstFact.getByRole("button", { name: "Edit" }).click();
  await firstFact.getByLabel("State").selectOption("confirmed");
  await firstFact.getByRole("button", { name: "Save" }).click();
  for (const challenge of await page.locator(".review-challenges article").all()) { const acknowledge = challenge.getByRole("button", { name: "Acknowledge" }); if (await acknowledge.isVisible()) await acknowledge.click(); }

  await page.getByRole("button", { name: "Approve this foundation" }).click();
  await page.getByRole("button", { name: "Architect my product" }).click();
  await expect(page.getByRole("heading", { name: /becoming a blueprint/i })).toBeVisible();
  await page.waitForURL(new RegExp(`/projects/${projectId}$`), { timeout: 45_000 });
  await expect(page.getByText(/Mycel Core · (AI enhanced|Reliable mode)/).first()).toBeVisible();

  await page.getByRole("button", { name: "Structured document" }).click();
  await page.getByText("Edit", { exact: true }).first().click();
  const editedTitle = `Grounded requirement ${Date.now()}`;
  await page.locator('input[name="title"]').first().fill(editedTitle);
  await page.getByRole("button", { name: "Save changes" }).first().click();
  await page.reload(); await page.getByRole("button", { name: "Structured document" }).click(); await expect(page.getByText(editedTitle)).toBeVisible();
  await page.getByRole("button", { name: "Run Pressure Test" }).click();
  await expect(page.getByText(/Mycel Core · (AI enhanced|Reliable mode)/).last()).toBeVisible();
  const markdown = await downloadText(page, "Markdown"); const json = await downloadText(page, "JSON"); const csv = await downloadText(page, "CSV");
  expect(markdown).toContain(editedTitle); expect(json).toContain(editedTitle); expect(csv).toContain(editedTitle);
});

async function signIn(page: Page) { await page.goto("/login"); if (!page.url().includes("/login")) return; await page.getByLabel("Email").fill(email ?? ""); await page.getByLabel("Password").fill(password ?? ""); await page.getByRole("button", { name: "Sign in" }).click(); await page.waitForURL(/\/dashboard/); }
async function downloadText(page: Page, label: string): Promise<string> { const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: new RegExp(label, "i") }).last().click()]); return readDownload(download); }
async function readDownload(download: Download): Promise<string> { const path = await download.path(); if (!path) throw new Error("The browser did not expose the downloaded file."); return readFile(path, "utf8"); }
