/* Explicit motion preference. Only "follow device" or "reduce animation"
   are offered; system prefers-reduced-motion always takes precedence.
   SPDX-License-Identifier: AGPL-3.0-or-later */
(() => {
  const storageKey = "megan-trip:motion-v1";
  const allowed = new Set(["system", "reduce"]);
  let preference = "system";
  try {
    const saved = localStorage.getItem(storageKey);
    if (allowed.has(saved)) preference = saved;
  } catch { /* private browsing may forbid localStorage */ }

  function apply() {
    document.documentElement.dataset.motion = preference;
  }
  apply();

  window.MeganMotion = Object.freeze({
    get: () => preference,
    isReduced: () => preference === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    set(next) {
      if (!allowed.has(next)) return false;
      preference = next;
      try { localStorage.setItem(storageKey, preference); } catch { /* optional persistence */ }
      apply();
      window.dispatchEvent(new CustomEvent("megan-motion-change", { detail: { preference } }));
      return true;
    },
  });
})();
