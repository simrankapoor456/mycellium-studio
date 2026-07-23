import { expect, test } from "@playwright/test";

test.describe("Phase 9A signature growth", () => {
  test("scrubs forward and backward through one deterministic desktop story", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/", { waitUntil: "networkidle" });

    const story = page.locator("#how-it-works");
    const first = page.getByRole("button", { name: /Fragmented input/ });
    const root = page.getByRole("button", { name: /First root/ });
    const final = page.getByRole("button", { name: /Foundation stabilized/ });

    await expect(story.locator("[data-signature-growth]")).toHaveCount(1);
    await root.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expect(root).toHaveAttribute("aria-current", "step");
    await expect(story.locator(".scroll-story__visual")).toHaveCSS("position", "fixed");
    await final.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expect(final).toHaveAttribute("aria-current", "step");
    await expect(story.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "9");
    await first.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await expect(first).toHaveAttribute("aria-current", "step");
    await expect(story.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  for (const width of [375, 768, 1440] as const) {
    test(`captures the complete Foundation composition at ${width}px`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: width === 375 ? 812 : 960 });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.locator("#how-it-works").scrollIntoViewIfNeeded();

      const story = page.locator("#how-it-works");
      await expect(story.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "9");
      await expect(story.getByRole("list", { name: "Foundation state legend" })).toContainText("Blocked");
      if (width === 375) {
        await expect(story.locator(".scroll-story__visual")).toHaveCSS("position", "relative");
        await expect(story.locator(".scroll-story__chapters")).toHaveCSS("grid-auto-flow", "row");
      }

      await story.screenshot({ path: `output/playwright/phase-9a/signature-foundation-${width}.png` });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
