import { expect, test } from "@playwright/test";

const widths = [375, 768, 1024, 1440] as const;

test("keeps the public experience responsive and keyboard reachable", async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /start your project/i }).first()).toBeVisible();

    const pageBounds = await page.locator("body").boundingBox();
    expect(pageBounds?.x).toBeGreaterThanOrEqual(0);
    expect(pageBounds?.width).toBeLessThanOrEqual(width);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    await page.screenshot({ fullPage: true, path: testInfo.outputPath(`landing-${width}.png`) });
  }
});
