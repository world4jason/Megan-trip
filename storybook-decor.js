/* Lightweight storybook decorations for already-rendered itinerary items.
   No itinerary edits, no injected controls, and no remote images.
   SPDX-License-Identifier: AGPL-3.0-or-later */
(() => {
  const root = document.querySelector("#view-root");
  if (!root) return;
  let scheduled = false;

  function kind(text) {
    const name = String(text || "").toLowerCase();
    if (/燈塔|lighthouse/.test(name)) return "lighthouse";
    if (/租車|還車|取車|自駕|nippon/.test(name)) return "car";
    if (/航班|機場|飛機|it73|tpe|isg|桃園/.test(name)) return "flight";
    if (/船潛|出船|包船|船家/.test(name)) return "boat";
    if (/manta|岸潛|米原海灘|青之洞窟|osaki/.test(name)) return "manta";
    if (/冰店|霜淇淋|mirumiru|冰品|咖啡|餐|燒肉|cafe|beef|居酒屋/.test(name)) return "food";
    if (/住宿|旅館|hotel|入住/.test(name)) return "hotel";
    return "bay";
  }

  function decorate() {
    scheduled = false;
    const heading = root.querySelector(".trip-day-view > .day-summary");
    const activeDay = root.querySelector(".trip-v2-tabs [data-trip-day].active")?.dataset.tripDay;
    if (heading && activeDay && heading.dataset.storybookDay !== activeDay) {
      heading.dataset.storybookDay = activeDay;
    }
    root.querySelectorAll(".trip-v2-item").forEach((card) => {
      const type = card.querySelector(".type-pill")?.textContent || "";
      const title = card.querySelector(".item-heading h3")?.textContent || "";
      const selectedKind = kind(type + " " + title);
      if (card.dataset.storybookKind !== selectedKind) card.dataset.storybookKind = selectedKind;
    });
  }

  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(decorate);
    }
  }

  // The template recreates its view DOM during navigation. Attribute changes
  // made here are intentionally not observed, preventing observation loops.
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener("travel-lite-ready", schedule);
  schedule();
})();
