import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const port=4891;
const base="http://127.0.0.1:"+port+"/";
const trip=JSON.parse(readFileSync(new URL("../trip.json",import.meta.url),"utf8"));
const expectedColors={
 "storybook":"rgb(255, 252, 246)","candy":"rgb(255, 249, 239)",
 "paper-collage":"rgb(250, 243, 228)","naive-city":"rgb(250, 245, 233)",
 "risograph":"rgb(247, 241, 228)","taiwan-poster":"rgb(245, 231, 196)",
 "field-stamp":"rgb(247, 240, 227)",
 "quiet-linocut": "rgb(244, 237, 221)",
 "doodle-memory-grid": "rgb(251, 246, 234)",
 "crayon-journal": "rgb(250, 242, 230)",
 "painterly-editorial": "rgb(244, 247, 241)",
 "geometric-print": "rgb(245, 240, 229)",
 "quiet-acrylic": "rgb(252, 250, 243)"
};
let browser;
const server=spawn(process.execPath,["tests/serve.mjs"],{
  cwd:new URL("../",import.meta.url).pathname,
  env:{...process.env,TRAVEL_LITE_TEST_PORT:String(port)},
  stdio:"ignore",
});
try {
  let ready=false;
  for(let retry=0;retry<100;retry++) {
    try {if((await fetch(base+"trip.json")).ok){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,100));
  }
  assert.ok(ready,"Megan local site server must start");
  assert.equal(trip.days.length,5);
  assert.equal(trip.days.flatMap(day=>day.items).length,30);
  assert.equal(trip.checklists.flatMap(group=>group.items).length,39);
  assert.equal(trip.ui.visualStyle,"storybook");
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},locale:"zh-TW",serviceWorkers:"block"});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.route("https://fonts.googleapis.com/**",r=>r.fulfill({status:200,contentType:"text/css",body:""}));
  await page.route("https://fonts.gstatic.com/**",r=>r.abort());
  await page.goto(base+"#trip/overview",{waitUntil:"domcontentloaded"});
  await page.locator(".trip-overview-day").first().waitFor();
  assert.equal(await page.locator(".trip-overview-day").count(),5);
  const island=await page.locator(".trip-overview-hero")
    .evaluate(el=>getComputedStyle(el,"::after").backgroundImage);
  assert.match(island,/ishigaki-scene.svg/);
  const choose = async (choice) => {
    await page.locator("[data-style-picker-open]").click();
    await page.locator('[data-style-choice="'+choice+'"]').click();
    await page.waitForFunction(()=>!document.getElementById("style-picker-dialog").open);
  };
  await page.locator("[data-view='more']").click();
  assert.equal(await page.locator(".style-option").count(),15);
  assert.ok((await page.locator("#view-root").innerText()).includes("預約與票券"));
  await choose("editorial-dark");
  await page.waitForFunction(()=>state.visualStyle==="editorial"
    && document.documentElement.dataset.theme==="dark");
  await choose("editorial-light");
  await page.waitForFunction(()=>state.visualStyle==="editorial"
    && document.documentElement.dataset.theme==="light");
  console.log("MEGAN_STYLE editorial Light + Dark");
  for(const [style,bg] of Object.entries(expectedColors)){
    await choose(style);
    await page.waitForFunction(name=>{
      const link=document.getElementById(name+"-style");
      return state.visualStyle===name
        && document.documentElement.dataset.theme==="light"
        && link && !link.disabled && !!link.sheet;
    },style,{timeout:15000});
    await page.waitForFunction(color=>
      getComputedStyle(document.body).backgroundColor===color,bg,{timeout:15000});
    assert.equal(await page.locator(".style-option").count(),15);
    console.log("MEGAN_STYLE",style,bg);
  }
  await page.locator("[data-style-picker-open]").click();
  await page.locator("[data-style-reset]").click();
  await page.waitForFunction(()=>!document.getElementById("style-picker-dialog").open);
  await page.waitForFunction(()=>state.visualStyle==="storybook"&&state.styleSource==="trip");
  await page.locator("[data-view='trip']").click();
  assert.equal(await page.locator(".trip-overview-day").count(),5);
  await page.locator('.trip-overview-day[data-trip-day="2026-09-19"]').click();
  const timeline=await page.locator("ol.trip-v2-timeline > li").count();
  assert.ok(timeline>=5);
  assert.ok((await page.locator(".trip-v2-timeline").innerText()).includes("08:10"));
  await page.locator("[data-view='map']").click();
  await page.locator(".map-library-fallback").waitFor({timeout:10000});
  assert.ok((await page.locator(".map-library-fallback").innerText()).includes("尚未標註精確座標"));
  await page.locator("[data-view='check']").click();
  assert.equal(await page.locator("input[data-check-key]").count(),39);
  const desktop = await context.newPage({viewport:{width:1440,height:900}});
  // A separate context is needed for a distinct desktop viewport; the site
  // preference is still per trip and device-scoped.
  await desktop.setViewportSize({width:1440,height:900});
  await desktop.goto(base+"#more",{waitUntil:"domcontentloaded"});
  // Geometry assertions should inspect the stable layout, not the 180ms
  // entrance slide's initial +16px translateX transform.
  await desktop.emulateMedia({reducedMotion:"reduce"});
  await desktop.locator("[data-style-picker-open]").click();
  await desktop.waitForFunction(()=>document.getElementById("style-picker-dialog").open);
  const drawer=await desktop.locator("#style-picker-dialog").evaluate(el=>el.getBoundingClientRect().toJSON());
  assert.ok(drawer.x>800 && drawer.right<=1441);
  await desktop.locator('[data-style-choice="painterly-editorial"]').click();
  await desktop.waitForFunction(()=>state.visualStyle==="painterly-editorial");
  assert.equal(await desktop.locator("#style-picker-dialog").evaluate(el=>el.open),true);
  await desktop.keyboard.press("Escape");
  assert.equal(await desktop.locator("#style-picker-dialog").evaluate(el=>el.open),false);
  await desktop.close();
  assert.deepEqual(errors,[]);
  console.log("MEGAN_FIFTEEN_LOOKS_PASS five days, 30 stops, 39 checklist, island art, map fallback, responsive picker");
  await context.close();
} finally{
 await browser?.close();
 server.kill("SIGTERM");
}
