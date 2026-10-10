import { test, expect } from "@playwright/test";

// Against the real five-day Ishigaki trip, not the generated 32-day fixture.
test.use({ viewport: { width: 390, height: 844 }, locale: "zh-TW" });

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", route =>
    route.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.route("https://fonts.gstatic.com/**", route => route.abort());
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".trip-overview-day")).toHaveCount(5);
});

test("continuous semantic timeline keeps times and floating stops, with explicit transport and curated badges", async ({ page }) => {
  await page.locator('.trip-overview-day[data-trip-day="2026-09-18"]').click();
  const stops = page.locator("ol.trip-v2-timeline > li.trip-stop-wrap");
  await expect(stops).toHaveCount(11);
  await expect(page.getByRole("heading", { name: "每日時間軸" })).toBeVisible();
  await expect(stops.first().locator("time")).toHaveText("04:00");
  await expect(stops.locator(".timeline-time--floating").first()).toHaveText("時間未定");
  await expect(stops.locator(".transport-tag--flight")).toHaveCount(2);
  await expect(stops.locator(".transport-tag--drive")).toHaveCount(3);
  await expect(stops.locator(".must-go-tag")).toHaveCount(1);
  await expect(stops.locator(".trip-must-go h3")).toContainText("平久保崎燈塔");
  const guide = await page.locator("ol.trip-v2-timeline").evaluate((element) => ({
    position: getComputedStyle(element).position,
    line: getComputedStyle(element, "::before").backgroundColor,
    marker: getComputedStyle(element.children[0], "::before").content,
  }));
  expect(guide.position).toBe("relative");
  expect(guide.line).toBe("rgb(62, 58, 57)");
  expect(guide.marker).not.toBe("none");
  await page.locator('.trip-v2-tabs [data-trip-day="2026-09-19"]').click();
  await expect(page.locator("ol.trip-v2-timeline > li")).toHaveCount(6);
  await expect(page.locator(".transport-tag--boat")).toHaveCount(1);
  await expect(page.locator(".trip-must-go h3")).toContainText("包船船潛");
  await page.locator('.trip-v2-tabs [data-trip-day="2026-09-20"]').click();
  await expect(page.locator(".trip-must-go")).toHaveCount(1);
  await page.locator('.trip-v2-tabs [data-trip-day="2026-09-21"]').click();
  await expect(page.locator(".trip-must-go .item-heading h3")).toContainText("Kabira");
  await expect(page.locator(".trip-v2-timeline .timeline-time--floating")).toHaveCount(4);
  await page.locator('.trip-v2-tabs [data-trip-day="2026-09-22"]').click();
  await expect(page.locator(".trip-must-go")).toHaveCount(0);
});

test("date switching plays a one-off spring; illustration gently floats without modifying layout", async ({ page }) => {
  const scene = page.locator(".trip-overview-hero");
  const name = await scene.evaluate(node => getComputedStyle(node, "::after").animationName);
  expect(name).toContain("storybook-float");

  await page.locator('.trip-overview-day[data-trip-day="2026-09-18"]').click();
  await expect(page.locator(".trip-day-view.day-switch-enter")).toBeVisible();
  const motion = await page.locator(".day-summary").evaluate(node => getComputedStyle(node).animationName);
  expect(motion).toBe("storybook-day-spring");

  await page.locator('.trip-v2-tabs [data-trip-day="2026-09-19"]').click();
  await expect(page.locator(".trip-day-view.day-switch-enter")).toBeVisible();
  await expect(page.locator(".day-summary h2")).toContainText("船潛第一天");

  await page.locator('.trip-v2-tabs [data-trip-day="2026-09-19"]').click();
  await expect(page.locator(".trip-day-view.day-switch-enter")).toHaveCount(0);
  const repeat = await page.locator(".day-summary").evaluate(node => getComputedStyle(node).animationName);
  expect(repeat).toBe("none");
});

test("prefers-reduced-motion disables float and spring even with the site's system setting", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".trip-overview-day")).toHaveCount(5);
  await expect(page.locator("html")).toHaveAttribute("data-motion", "system");
  const scene = await page.locator(".trip-overview-hero").evaluate(node => getComputedStyle(node, "::after").animationName);
  expect(scene).toBe("none");

  await page.locator('.trip-overview-day[data-trip-day="2026-09-18"]').click();
  await expect(page.locator(".trip-day-view.day-switch-enter")).toHaveCount(1);
  const spring = await page.locator(".day-summary").evaluate(node => getComputedStyle(node).animationName);
  expect(spring).toBe("none");
});

test("manual Reduce animation is saved on this device; Follow device restores the system preference", async ({ page }) => {
  await page.locator('.bottom-nav [data-view="more"]').click();
  const reduced = page.getByRole("button", { name: "減少動畫" });
  const automatic = page.getByRole("button", { name: "跟隨裝置" });
  await expect(automatic).toHaveAttribute("aria-pressed", "true");
  await reduced.click();
  await expect(reduced).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");

  await page.reload({ waitUntil: "load" });
  await page.locator('.bottom-nav [data-view="more"]').click();
  await expect(page.locator('[data-motion-choice="reduce"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('.bottom-nav [data-view="trip"]').click();
  await expect.poll(() => page.locator(".trip-overview-hero")
    .evaluate(node => getComputedStyle(node, "::after").animationName)).toBe("none");

  await page.locator('.bottom-nav [data-view="more"]').click();
  await page.locator('[data-motion-choice="system"]').click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "system");
  await page.locator('.bottom-nav [data-view="trip"]').click();
  await expect.poll(() => page.locator(".trip-overview-hero")
    .evaluate(node => getComputedStyle(node, "::after").animationName)).toContain("storybook-float");
});

test("timeline controls remain reachable without horizontal scrolling on phone, tablet and desktop", async ({ page }) => {
  for (const width of [320, 375, 430, 820, 1100, 1600]) {
    await page.setViewportSize({ width, height: width >= 900 ? 900 : width <= 320 ? 568 : 844 });
    await page.locator('.bottom-nav [data-view="trip"]').click();
    if (await page.locator(".trip-overview-day").count() === 0) {
      if (width >= 900) await page.locator("[data-shell-overview]").click();
      else await page.locator('.trip-v2-tabs [data-trip-mode="overview"]').click();
    }
    await page.locator('.trip-overview-day[data-trip-day="2026-09-21"]').click();
    await expect(page.locator(".trip-timeline-heading")).toBeVisible();
    const bounds = await page.evaluate(() => ({
      width: innerWidth,
      document: document.documentElement.scrollWidth,
      cards: Array.from(document.querySelectorAll("ol.trip-v2-timeline > li > article")).map(x => {
        const r = x.getBoundingClientRect(); return [r.left, r.right];
      }),
    }));
    expect(bounds.document, `page overflow width=${width}`).toBeLessThanOrEqual(bounds.width + 2);
    expect(bounds.cards.every(([left, right]) => left >= -1 && right <= bounds.width + 1),
      `card outside width=${width}`).toBeTruthy();
  }
});
