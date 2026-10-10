import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const data = JSON.parse(readFileSync(new URL("trip.json", root), "utf8"));
const days = data.days;

test("石垣島行程日期、時區與每日資料一致", () => {
  assert.equal(data.trip.id, "ishigaki-jerry-2026");
  assert.equal(data.trip.startDate, "2026-09-18");
  assert.equal(data.trip.endDate, "2026-09-22");
  assert.equal(data.trip.timezone, "Asia/Tokyo");
  assert.equal(data.ui.locale, "zh-TW");
  assert.equal(data.ui.defaultView, "trip");
  assert.deepEqual(days.map(day => day.date), [
    "2026-09-18", "2026-09-19", "2026-09-20", "2026-09-21", "2026-09-22"
  ]);
  for (const day of days) {
    assert.ok(day.title && day.items.length > 0);
    assert.ok(day.items.every(item => item.id && item.title));
  }
});

test("重要時間、集合點、班機與來源連結完整", () => {
  const items = days.flatMap(day => day.items);
  const find = id => items.find(item => item.id === id);
  assert.equal(items.length, 30);
  assert.equal(find("d1-meet").start, "04:00");
  assert.equal(find("d1-depart").timezone, "Asia/Taipei");
  assert.equal(find("d1-arrive").timezone, "Asia/Tokyo");
  assert.equal(find("d1-car-window").start, "09:30");
  assert.equal(find("d1-car").start, "10:00");
  assert.equal(find("d1-maru").start, "17:30");
  for (const n of [2,3]) {
    assert.equal(find(`d${n}-gather`).start, "08:10");
    assert.equal(find(`d${n}-boat`).start, "08:30");
    assert.match(find(`d${n}-gather`).mapsUrl,/^https:\/\/maps\.app\.goo\.gl\//);
  }
  assert.equal(find("d5-return-car").start, "07:00");
  assert.equal(find("d5-airport").start, "07:30");
  assert.equal(find("d5-flight").start, "09:25");
  assert.equal(find("d5-arrive").timezone, "Asia/Taipei");
  assert.ok(data.files[0].url.startsWith("https://docs.google.com/document/"));
});

test("9/21 岸潛地點為 5 個待確認候選，沒有偽裝成確定行程", () => {
  const spot = days[3].items.find(item => item.id === "d4-shore");
  assert.equal(spot.start, "TBD");
  assert.equal(spot.decision.options.length, 5);
  assert.equal(spot.decision.resolvedOptionId, undefined);
  assert.match(spot.decision.context, /潛店/);
});

test("清單 ID 唯一、資訊沒有敏感預約碼", () => {
  const allIds = [];
  for (const day of days) for (const item of day.items) allIds.push(item.id);
  for (const group of data.checklists) for (const item of group.items) allIds.push(`${group.id}:${item.id}`);
  assert.equal(new Set(allIds).size, allIds.length);
  assert.equal(data.checklists.flatMap(g => g.items).length, 39);
  assert.equal(data.todos.length, 5);
  const text = JSON.stringify(data);
  assert.ok(!text.includes("247220055"), "租車訂單編號不可寫入公開 trip.json");
  assert.ok(!text.includes("傑瑞、英祥、阿瀚、孟辰"), "不公開同行者完整名單");
});

test("不憑空增加精確位置座標或聲稱已完成未明確的訂位", () => {
  for (const day of days) for (const item of day.items) {
    assert.equal(item.lat, undefined);
    assert.equal(item.lng, undefined);
    if (item.start !== "TBD") assert.match(item.start, /^([01]\d|2[0-3]):[0-5]\d$/);
  }
  assert.match(data.reservations.find(r => r.id === "mario").status, /待確認/);
});

test("站點檔案與來源授權檔案齊備", () => {
  for (const file of ["index.html", ".nojekyll", "app.js", "sw.js", "LICENSE", "NOTICE.md", "trip.json"]) {
    assert.ok(existsSync(new URL(file, root)));
    if (file !== ".nojekyll") assert.ok(readFileSync(new URL(file, root)).length > 0);
  }
});
