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

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    await page.screenshot({ fullPage: true, path: testInfo.outputPath(`landing-${width}.png`) });
  }
});

test("keeps public navigation and calls to action functional", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  for (const [label, target] of [
    ["Product", "#product"],
    ["How it works", "#how-it-works"],
    ["Philosophy", "#philosophy"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"],
  ] as const) {
    await expect(page.getByRole("link", { name: label }).first()).toHaveAttribute("href", target);
    await expect(page.locator(target)).toHaveCount(1);
  }

  await expect(page.getByRole("link", { name: /Start your project/ }).first()).toHaveAttribute("href", "/signup?next=%2Fprojects%2Fnew");
  await expect(page.getByRole("link", { name: "See how it works" })).toHaveAttribute("href", "#how-it-works");
  await expect(page.getByRole("link", { name: "Log in" }).first()).toHaveAttribute("href", "/login");
  await expect(page.getByRole("link", { name: "Start your project" }).first()).toHaveAttribute("href", "/signup?next=%2Fprojects%2Fnew");

  await page.getByRole("link", { name: "How it works" }).first().click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(page.locator("#how-it-works")).toBeInViewport();

  await page.getByRole("link", { name: "Start your project" }).first().click();
  await expect(page).toHaveURL(/\/signup\?next=%2Fprojects%2Fnew$/);
  await expect(page.getByRole("heading", { name: /Give the first project a foundation/ })).toBeVisible();
});

test("provides a useful not-found recovery route", async ({ page }) => {
  const response = await page.goto("/a-route-that-does-not-exist", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This path does not connect." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
});

test("makes the mobile menu operable and reduced motion immediate", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "networkidle" });

  const trigger = page.getByRole("button", { name: "Open navigation" });
  await expect(trigger).toBeVisible();
  await trigger.press("Enter");
  await expect(page.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
  const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNavigation).toBeVisible();

  const animationName = await page.locator(".brand-mark--animated .brand-mark__spark").first().evaluate(
    (node) => getComputedStyle(node).animationName,
  );
  expect(animationName).toBe("none");

  await mobileNavigation.getByRole("link", { name: "FAQ" }).click();
  await expect(page).toHaveURL(/#faq$/);
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
});

test("keeps the public page usable at two-times zoom", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Start your project/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
});
