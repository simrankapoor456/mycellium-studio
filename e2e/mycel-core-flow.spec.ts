import { readFile } from "node:fs/promises";

import { expect, test, type Download, type Page } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const canAuthenticate = Boolean(email && password);

test.skip(!canAuthenticate, "Set E2E_EMAIL and E2E_PASSWORD for the authenticated workflow.");

test("completes the owner-scoped Mycel Core workflow", async ({ page }) => {
  await signIn(page);
  await page.goto("/projects/new");
  const projectName = `Signal Garden ${Date.now()}`;
  await page.getByLabel("Project name").fill(projectName);
  await page.getByLabel("Project description").fill("A private tool that keeps product decisions connected to delivery work.");
  await page.getByLabel("Target users").fill("Product leads at small software teams");
  await page.getByLabel("Constraints").fill("Keyboard access and private project ownership are required.");
  await page.getByRole("button", { name: "Start this project" }).click();
  await page.getByRole("link", { name: "Begin discovery" }).click();

  const answers = [
    "The business objective is to reduce planning rework.",
    "The problem is that teams lose time reconciling scattered product decisions.",
    "Product leads need to create and review one grounded blueprint.",
    "Success means reducing planning time by 50 percent.",
    "The first release must support review, editing, and portable exports.",
  ];
  for (const answer of answers) {
    await page.getByLabel("Your answer").fill(answer);
    await page.getByRole("button", { name: "Share answer" }).click();
    await expect(page.getByRole("button", { name: "Share answer" })).toBeEnabled();
  }

  await page.reload();
  await expect(page.getByText(answers.at(-1) ?? "")).toBeVisible();
  await page.locator(".living-graph__node").first().click();
  const graphEditor = page.getByLabel("Edit this fact");
  await graphEditor.fill(`${await graphEditor.inputValue()} with a traceable source`);
  await page.getByRole("button", { name: "Save fact" }).click();
  await page.getByRole("link", { name: /review the foundation/i }).click();

  for (const challenge of await page.locator(".review-challenges article").all()) {
    const acknowledge = challenge.getByRole("button", { name: "Acknowledge" });
    if (await acknowledge.isVisible()) await acknowledge.click();
  }
  await page.getByRole("button", { name: "Approve this foundation" }).click();
  await page.getByRole("button", { name: "Architect my product" }).click();
  await page.getByRole("button", { name: "Show me the blueprint" }).click();
  await page.getByRole("link", { name: "Open Product Blueprint" }).click();
  await expect(page.getByText(/Mycel Core · (AI enhanced|Reliable mode)/).first()).toBeVisible();

  await page.getByRole("button", { name: "Structured document" }).click();
  await page.getByText("Edit", { exact: true }).first().click();
  const editedTitle = `Grounded requirement ${Date.now()}`;
  await page.locator('input[name="title"]').first().fill(editedTitle);
  await page.getByRole("button", { name: "Save changes" }).first().click();
  await page.reload();
  await page.getByRole("button", { name: "Structured document" }).click();
  await expect(page.getByText(editedTitle)).toBeVisible();

  await page.getByRole("button", { name: "Run Pressure Test" }).click();
  await expect(page.getByText(/Mycel Core · (AI enhanced|Reliable mode)/).last()).toBeVisible();
  const markdown = await downloadText(page, "Markdown");
  const json = await downloadText(page, "JSON");
  const csv = await downloadText(page, "CSV");
  expect(markdown).toContain(editedTitle);
  expect(markdown).toContain("## Pressure Test");
  expect(json).toContain(editedTitle);
  expect(csv).toContain(editedTitle);
});

async function signIn(page: Page) {
  await page.goto("/login");
  if (!page.url().includes("/login")) return;
  await page.getByLabel("Email").fill(email ?? "");
  await page.getByLabel("Password").fill(password ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/dashboard/);
}

async function downloadText(page: Page, label: string): Promise<string> {
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: new RegExp(label, "i") }).last().click()]);
  return readDownload(download);
}

async function readDownload(download: Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error("The browser did not expose the downloaded file.");
  return readFile(path, "utf8");
}
