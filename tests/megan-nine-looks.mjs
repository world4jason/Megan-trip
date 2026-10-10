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
 "field-stamp":"rgb(247, 240, 227)"
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
  await page.locator("[data-view='more']").click();
  assert.equal(await page.locator(".style-option").count(),9);
  assert.ok((await page.locator("#view-root").innerText()).includes("預約與票券"));
  await page.locator('[data-style-choice="editorial-dark"]').click();
  await page.waitForFunction(()=>state.visualStyle==="editorial"
    && document.documentElement.dataset.theme==="dark");
  await page.locator('[data-style-choice="editorial-light"]').click();
  await page.waitForFunction(()=>state.visualStyle==="editorial"
    && document.documentElement.dataset.theme==="light");
  console.log("MEGAN_STYLE editorial Light + Dark");
  for(const [style,bg] of Object.entries(expectedColors)){
    await page.locator('[data-style-choice="'+style+'"]').click();
    await page.waitForFunction(name=>{
      const link=document.getElementById(name+"-style");
      return state.visualStyle===name
        && document.documentElement.dataset.theme==="light"
        && link && !link.disabled && !!link.sheet;
    },style,{timeout:15000});
    await page.waitForFunction(color=>
      getComputedStyle(document.body).backgroundColor===color,bg,{timeout:15000});
    assert.equal(await page.locator(".style-option").count(),9);
    console.log("MEGAN_STYLE",style,bg);
  }
  await page.locator("[data-style-reset]").click();
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
  assert.deepEqual(errors,[]);
  console.log("MEGAN_NINE_LOOKS_PASS five days, 30 stops, 39 checklist, island art, map fallback");
  await context.close();
} finally{
 await browser?.close();
 server.kill("SIGTERM");
}
