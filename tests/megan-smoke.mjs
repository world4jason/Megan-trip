import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const port = 4329;
const server = spawn(process.execPath, ["tests/serve.mjs"], {
  cwd: new URL("../", import.meta.url).pathname,
  env: { ...process.env, TRAVEL_LITE_TEST_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
let browser;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function ready() {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/trip.json`); if (r.ok) return; }
    catch {}
    await sleep(100);
  }
  throw new Error("Local site did not start");
}
try {
  await ready();
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, locale: "zh-TW",
    timezoneId: "Asia/Tokyo", serviceWorkers: "block",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.locator(".trip-overview-view").waitFor({ timeout: 12000 });
  assert.equal(await page.locator(".trip-overview-day").count(), 5);
  assert.equal(await page.locator("#trip-title").innerText(), "傑瑞團｜石垣島");
  assert.ok((await page.locator(".trip-overview-hero").innerText()).includes("30"));
  await page.screenshot({ path: "/tmp/megan-trip-build-20261010/megan-mobile-overview.png", fullPage: true });

  await page.locator("button.trip-overview-day[data-trip-day='2026-09-19']").click();
  assert.ok((await page.locator(".trip-day-view .day-summary").innerText()).includes("船潛第一天"));
  assert.ok((await page.locator(".trip-v2-timeline").innerText()).includes("08:10"));
  assert.ok((await page.locator(".trip-v2-timeline").innerText()).includes("ALOALO"));
  const narrow = await page.evaluate(() => ({
    contentWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
  }));
  assert.ok(narrow.contentWidth <= narrow.viewportWidth + 2, JSON.stringify(narrow));
  await page.screenshot({ path: "/tmp/megan-trip-build-20261010/megan-mobile-day2.png", fullPage: true });

  await page.locator("button[data-view='check']").click();
  await page.locator("label:has(input[data-check-key])").first().click();
  assert.equal(await page.locator("input[data-check-key]").count(), 39);
  assert.equal(await page.locator("input[data-check-key]").first().isChecked(), true);
  await page.waitForFunction(async () => {
    const checks = await TravelLiteStorage.get("ishigaki-jerry-2026:checks");
    return checks?.["documents:passport"] === true;
  }, null, { timeout: 5000 });
  await page.reload();
  await page.locator("input[data-check-key]").first().waitFor();
  assert.equal(await page.locator("input[data-check-key]").first().isChecked(), true);
  await page.locator("label:has(input[data-check-key])").first().click();

  await page.locator("button[data-view='map']").click();
  await page.locator("button[data-runtime-map-date='2026-09-19']").click();
  await page.locator(".map-library-fallback").waitFor({ timeout: 10000 });
  assert.ok((await page.locator(".map-library-fallback").innerText()).includes("尚未標註精確座標"));
  assert.ok(await page.locator(".map-panel a[href*='google.com/maps/'], .map-panel a[href*='maps.app.goo.gl']").count() > 0);

  await page.locator("button[data-view='more']").click();
  assert.ok((await page.locator("#view-root").innerText()).includes("預約與票券"));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("button[data-view='trip']").click();
  await page.screenshot({ path: "/tmp/megan-trip-build-20261010/megan-desktop-overview.png", fullPage: true });
  const wide = await page.evaluate(() => ({
    contentWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
  }));
  assert.ok(wide.contentWidth <= wide.viewportWidth + 2, JSON.stringify(wide));
  assert.deepEqual(errors, []);
  console.log("SITE_SMOKE_OK 5 days / 30 items / map handoff / checklists persisted / mobile+desktop");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
