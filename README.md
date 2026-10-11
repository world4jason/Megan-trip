# 傑瑞團｜石垣島五天四夜（Megan-trip）

以 [Travel-lite-Template](https://github.com/world4jason/Travel-lite-Template) 為基底製作的**手機優先旅遊資訊站**，內容整理自團隊 Google Docs。無須登入、後端或建置步驟；專案部署為公開 GitHub Pages 靜態網站。

- 網站：**https://world4jason.github.io/Megan-trip/**
- 行程：**2026/9/18（五）— 9/22（二）**
- 地點：**日本沖繩縣石垣島**；船潛、租車自駕、景點、吃飯與回程。
- 原始來源：[傑瑞團石垣島行程（動態調整中）](https://docs.google.com/document/d/1in0UFMqSc_ZhXo1bsyK4G2yJ0giDaayiTTjCaoDhE2g/edit)

## 主要功能

| 分頁 | 用途 |
| --- | --- |
| 行程 | 五天總覽、每日活動、待確認事項、原始順序、Google Maps 交接 |
| 時間 | 行程進行中的前一個／目前排定／下一個活動；行程結束後顯示封存狀態 |
| 地圖 | 每天的景點快速選擇與 Google Maps 導航入口 |
| 清單 | 39 項裝備與行李清單、5 項行前核對，進度只存在當前裝置 |
| 資訊 | 航班、租車、住宿、船潛、費用、聯絡資訊與備註 |

支援繁體中文導覽、手機／桌機響應式佈局、**十五種可切換的視覺外觀**（十四套 Style Pack，Editorial 分成淺色與深色）、PWA/離線快取與可分享的行程深層連結。

**地圖限制：**原始文件除了住宿與船潛集合點的 Google Maps 分享連結之外，沒有提供經緯度，因此這版不會杜撰其他精確地點座標。地圖分頁仍保留每日地點清單與「Open in Maps」外開導航；互動地圖上的定位標記待日後核實座標後再補。

## 資料來源與核對狀態

資料為 **2026-10-10** 對原始 Google Docs 的一次性整理快照，**不會與 Google Docs 自動同步**。原始行程仍可調整。修改網站應直接編輯 [`trip.json`](./trip.json) 中的資料、調整 `trip.updatedAt` 與 `trip.revision`，提交到 `main` 即可更新 Pages。

為避免將來源中的不明資訊當作事實，保留下列待核對項目：

1. **9/18 租車時間：**主表 09:30、NIPPON 訂車資訊 10:00。
2. **9/22 IT737：**來源寫 09:25–09:35；日本與台灣有時差，應以電子機票確認兩地當地起降時間。
3. **9/21 鍾乳洞：**門票原文「250$」，未核對幣別或實際票價。
4. **9/21 岸潛：**米原、青之洞窟、Osaki、山原與川平石崎是候選，不代表已決定下水點。請以當地合格潛店的安全評估及最新海況為準。
5. **9/18 MARU 燒肉：**原文寫 17:30、12 位；未明確寫完成訂位。

## 公開資訊與隱私

這是一個 **public GitHub repository**。為避免公開敏感資訊，原文中的租車預約編號與同行者姓名**未發布**。若需自留資訊，可在網站「資訊／更多」中填寫裝置本機的私人備註。**本機備註、清單勾選均不同步、也不會寫回 GitHub。**

## GitHub Pages 部署

站點為原生 HTML/CSS/JavaScript，無 build step：

1. GitHub → Settings → Pages。
2. `Build and deployment` 選 `Deploy from a branch`。
3. 選 `main`、`/ (root)`。
4. 等待 GitHub Pages 顯示已發布的 URL。

`index.html`、`trip.json`、`.nojekyll` 位於 repo root；相對路徑支援 `/Megan-trip/` 專案 Pages 網址。

## 本機驗收

```bash
python3 -m http.server 8000
# 開 http://localhost:8000
node --test tests/trip-data.test.mjs
```

可額外安裝 Playwright 進行跨螢幕布局回歸測試：

```bash
npm install
npm run test:megan-styles
```

## 模板與授權

此專案沿用 `world4jason/Travel-lite-Template` 的 HTML/CSS/JS、資料模型、PWA、測試與相關文件。上游採用 **AGPL-3.0-or-later**，本 repo 保留原本的 [LICENSE](./LICENSE)、[NOTICE.md](./NOTICE.md) 與 [AGENTS.md](./AGENTS.md)。

若要調整行程資料，請參考 [docs/TRIP_SCHEMA.md](./docs/TRIP_SCHEMA.md) 與 [docs/SOURCE_NORMALIZATION.md](./docs/SOURCE_NORMALIZATION.md)。
## 十五種網站外觀／與上游相同的 Style Pack

開啟 [Megan-trip 的「資訊 → 外觀」](https://world4jason.github.io/Megan-trip/#more)，會先看到**目前風格與切換按鈕**，不再攤開 15 張卡片。手機點擊後從底部滑出可捲動 Bottom Sheet，選完會自動關閉；桌機則從右側滑出 Drawer，可連續比較。兩種介面都有 Esc、關閉／完成與鍵盤焦點保護。不必修改程式或網址。選項：

| 外觀 | 實際 Style Pack | 說明 |
| --- | --- | --- |
| Editorial Light | `editorial` + `light` | 原模板淺色編輯風 |
| Editorial Dark | `editorial` + `dark` | 原模板深色編輯風 |
| Storybook | `storybook` | **Megan 預設**：保留石垣島的海灣、燈塔、船、蝠魟與自駕插圖 |
| Candy Geometry | `candy` | 五色柔和圓角貼紙 |
| Paper Collage | `paper-collage` | 層疊紙雕與霧面卡紙陰影 |
| Naive City Sketch | `naive-city` | 歐洲城市速寫、水粉與抖動墨線 |
| Risograph Zine | `risograph` | 靛藍網點與復古印刷 |
| Taiwan Retro Poster | `taiwan-poster` | 深海軍藍、赭黃、朱紅，幾何海報式構圖 |
| Field Stamp | `field-stamp` | 手刻印章、乾墨破線與田野筆記 |
| Quiet Linocut | `quiet-linocut` | 靜謐版刻、撕右邊、小主體大留白 |
| Doodle Memory Grid | `doodle-memory-grid` | 鬆散九宮格、彩鉛手繪圖示 |
| Crayon Journal | `crayon-journal` | 橫向蠟筆記憶小場景 |
| Painterly Editorial | `painterly-editorial` | 柔藍水粉、可見乾筆 |
| Geometric Print | `geometric-print` | 銳利多邊形、無描邊色面 |
| Quiet Acrylic | `quiet-acrylic` | 小主體、極大留白、纖細壓克力線稿 |

**切換只存在此裝置**。同行者不會受到影響；按「跟隨行程預設」即可恢復 Megan 的 Storybook。分享連結的 `?previewStyle=...` 是暫時預覽；你在設定頁選擇後會移除預覽參數，仍保留目前所看的日期／頁面。

### 與 Travel-lite-Template 的一致性

`app.js`、`trip-view.js`、`theme-shell.js`、七種共享風格 CSS 與 SVG 素材均來自同一版本的 [Travel-lite-Template](https://github.com/world4jason/Travel-lite-Template)。這份 Megan-trip 的 `trip.json` 與 PWA 名稱仍是原本的石垣島五天行程；除非更動行程來源，所有航班、租車、船潛、Google Maps 導航與 39 項清單資料均不會因切換風格而修改。

`megan-local.css` **僅在 Storybook 模式**保留石垣島專屬插圖，其餘 Style Pack 使用與原模板同檔案的 CSS/SVG（以 SHA-256 與瀏覽器 computed styles 驗收）。通用插圖只代表旅遊視覺語言，不代表從真實照片重建任何日本或台灣地標。

兩個 Pages 在同一個 `world4jason.github.io` origin，`sw.js` 使用依專案 scope 區分的快取命名，避免更新一邊時清除另一邊的離線快取。

- [Megan-trip：十五種外觀](https://world4jason.github.io/Megan-trip/#more)
- [Travel-lite-Template：十五種外觀](https://world4jason.github.io/Travel-lite-Template/#more)
- [四套新風格的實際截圖](./style-packs/README.md)
- [下一個自然語言提示詞的 E2E 驗收流程](./style-generator/NEXT_PROMPT_E2E.md)

## 每日時間軸、重點標籤與動態效果

- 點選行程頁上方的日期，可看到當天真正連續的**垂直時間軸**。有確定時間的顯示當地時刻；未提供時間的活動顯示「時間未定」，不會當成 00:00。
- 每個停留點可選填 `transportMode`：`flight`（飛機）、`drive`（自駕）、`boat`（搭船）、`walk`（步行）。只有行程來源已說明或團隊已有自駕安排時才填，**不代表實際導航路線或轉乘**。
- `mustGo: true` 會顯示 **★ 必去** 標籤。本次示範標了「平久保崎燈塔、9/19 與 9/20 已付款包船船潛、9/21 川平灣展望台」共 4 個重點。這是**網站編輯選出的精選**，原始 Google Docs 並未標註這些景點為強制行程。更改重點請直接編輯 `trip.json`。
- 插畫會以很小的位移輕飄；選擇不同日期時，當日卡片與時間軸會有一次短暫彈跳。動畫只有 transform/opacity，不影響布局、點擊與資料內容。
- 支援裝置的 `prefers-reduced-motion: reduce` 系統偏好，也可到**資訊 → 動態效果**選擇「跟隨裝置」或「減少動畫」。偏好只記錄在當前瀏覽器，不會修改共享行程或上傳。
- 相關樣式：`storybook-theme.css`；開關：`storybook-motion.js`；時間軸：`trip-view.js`。

驗證：

```bash
npm install
npm run test:trip
npm run test:site
npm run test:megan-styles
# 同時有 Travel-lite-Template 及 Megan-trip 本機副本時：
# 在 Travel-lite-Template 目錄
MEGAN_LOCAL_REPO=../Megan-trip npm run test:style-parity
```


## 第二批提示詞：風格去重與共用實作

第二批收到八段照片轉海報提示詞，[風格去重紀錄](./style-generator/batches/2026-10-11-editorial-posters.md)將兩段 RISO 納回既有 Risograph，另外六段新增 Style Pack。**沒有新增上下各半的原始照片面板、固定英文詩句、虛構地點／年份，也未修改原始五天三十個行程項目。**

新 Style Pack 與上游採用相同 CSS／SVG／Manifest，Megan 原本專屬的 `megan-local.css` 僅在 Storybook 生效；風格只保存在旅客本機的 per-trip 設定。另附手機／桌機的實際 Megan 預覽與跨站 SHA-256＋瀏覽器 computed-style 驗收。
