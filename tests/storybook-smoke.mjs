import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = Number(process.env.MEGAN_STORYBOOK_TEST_PORT) || 4428;
const BASE = `http://127.0.0.1:${PORT}/`;
const project = new URL("../", import.meta.url).pathname;
const screenshots = join(tmpdir(), "megan-trip-storybook-screens");
mkdirSync(screenshots, { recursive: true });
const server = spawn(process.execPath, ["tests/serve.mjs"], {
  cwd: project, env: { ...process.env, TRAVEL_LITE_TEST_PORT: String(PORT) },
  stdio: "ignore",
});
let browser;
async function waitServer() {
  for (let n = 0; n < 70; n++) {
    try { if ((await fetch(BASE)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Local server not ready");
}
function safeWidth(page) {
  return page.evaluate(() => ({
    viewport: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
}
try {
  await waitServer();
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "zh-TW", timezoneId: "Asia/Tokyo", serviceWorkers: "block",
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem("storybook-test:legacy", "dark"));
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.locator(".trip-overview-view").waitFor({ timeout: 10000 });
  const truth = await page.evaluate(() => {
    const hero = document.querySelector(".trip-overview-day");
    const style = getComputedStyle(hero);
    return {
      theme: document.documentElement.dataset.theme,
      body: getComputedStyle(document.body).backgroundColor,
      gradient: getComputedStyle(document.body).backgroundImage,
      font: getComputedStyle(document.body).fontFamily,
      border: style.borderTopWidth,
      image: getComputedStyle(hero,"::after").backgroundImage,
      themeControls: document.querySelectorAll("button[data-theme], .quick-theme-toggle").length,
    };
  });
  assert.equal(truth.theme, "light", JSON.stringify(truth));
  assert.equal(truth.body, "rgb(255, 252, 246)");
  assert.equal(truth.gradient, "none");
  assert.equal(truth.border, "3px");
  assert.match(truth.font, /Huninn/i);
  assert.match(truth.image, /car\.svg/);
  assert.equal(truth.themeControls, 0);
  assert.equal(await page.locator(".trip-overview-day").count(), 5);
  await page.screenshot({ path: `${screenshots}/mobile-overview.png`, fullPage: true });

  await page.locator(".trip-overview-day").nth(3).click();
  await page.locator(".trip-day-view").waitFor();
  assert.ok((await page.locator(".day-summary").innerText()).includes("川平灣"));
  await page.waitForFunction(() => document.querySelector(".day-summary")?.dataset.storybookDay === "2026-09-21");
  assert.ok(await page.locator(".trip-v2-item[data-storybook-kind]").count() >= 4);
  await page.screenshot({ path: `${screenshots}/mobile-day4.png`, fullPage: true });

  await page.locator(".bottom-nav [data-view='check']").click();
  assert.equal(await page.locator("input[data-check-key]").count(), 39);
  await page.locator("label:has(input[data-check-key])").first().click();
  await page.waitForFunction(async () =>
    (await TravelLiteStorage.get("ishigaki-jerry-2026:checks"))?.["documents:passport"] === true
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("input[data-check-key]").first().waitFor({ timeout: 10000 });
  assert.equal(await page.locator("input[data-check-key]").first().isChecked(), true);
  await page.locator("label:has(input[data-check-key])").first().click();
  await page.screenshot({ path: `${screenshots}/mobile-check.png`, fullPage: true });

  await page.locator(".bottom-nav [data-view='map']").click();
  await page.locator(".map-panel").waitFor();
  await page.screenshot({ path: `${screenshots}/mobile-map.png`, fullPage: true });

  await page.locator(".bottom-nav [data-view='more']").click();
  assert.ok((await page.locator("#view-root").innerText()).includes("預約與票券"));
  assert.equal(await page.locator("button[data-theme]").count(), 0);
  await page.screenshot({ path: `${screenshots}/mobile-more.png`, fullPage: true });

  for (const width of [320, 360, 390, 430, 820, 1100, 1600]) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : width < 900 ? 844 : 900 });
    for (const view of ["trip","check","more"]) {
      await page.locator(`.bottom-nav [data-view='${view}']`).click();
      await page.waitForTimeout(80);
      const found = await safeWidth(page);
      assert.ok(found.scroll <= found.viewport + 2, `${width} ${view} overflows: ${JSON.stringify(found)}`);
    }
    if (width === 1600) {
      await page.locator(".bottom-nav [data-view='trip']").click();
      await page.locator(".trip-overview-view").waitFor();
      await page.screenshot({ path: `${screenshots}/desktop-overview.png`, fullPage: true });
    }
  }
  assert.deepEqual(errors, []);
  console.log("STORYBOOK_SMOKE_PASS", JSON.stringify(truth));
  console.log("Checked responsive widths 320,360,390,430,820,1100,1600 and all main views.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
