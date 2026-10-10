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

支援繁體中文導覽、手機／桌機響應式佈局、固定淺色繪本主題、PWA/離線快取與可分享的行程深層連結。

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
npm run test:mobile
```

## 模板與授權

此專案沿用 `world4jason/Travel-lite-Template` 的 HTML/CSS/JS、資料模型、PWA、測試與相關文件。上游採用 **AGPL-3.0-or-later**，本 repo 保留原本的 [LICENSE](./LICENSE)、[NOTICE.md](./NOTICE.md) 與 [AGENTS.md](./AGENTS.md)。

若要調整行程資料，請參考 [docs/TRIP_SCHEMA.md](./docs/TRIP_SCHEMA.md) 與 [docs/SOURCE_NORMALIZATION.md](./docs/SOURCE_NORMALIZATION.md)。
## 日系繪本風樣式

這個專案使用固定的**淺色**主題：和紙白 `#FFFCF6`、墨灰 `#3E3A39` 的 3px 卡片框線、珊瑚粉／山吹黃／水色／若竹綠平塗色塊，並使用 Google Fonts **Huninn**（網路不可用時自動回退到系統字體）。

- `storybook-theme.css`：最後載入的視覺覆蓋層，維持原本排版功能，無漸層與陰影。
- `storybook-decor.js`：只標記已呈現的行程節點，讓 CSS 指派插圖；不修改行程資料、導航或清單儲存。
- `assets/*.svg`：原創手繪風 SVG（石垣島灣景、燈塔、船潛小船、飛機、汽車、霜淇淋、蝠魟等）。
- `app.js`：固定亮色並移除深色模式切換，避免使用者以前存的 dark mode 影響畫面。
- `sw.js`：更新 PWA cache key，將新主題與 SVG 預載供離線使用。

```bash
npm ci
npm run test:storybook
```

樣式更新不會更動 `trip.json`、原有預約資料、清單勾選或本機備註內容。
