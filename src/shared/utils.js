(function bootstrapUtils(global) {
  const app = global.XYDYExtension = global.XYDYExtension || {};
  const constants = app.constants;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeDeep(base, patch) {
    if (Array.isArray(base)) {
      return Array.isArray(patch) ? patch.slice() : base.slice();
    }

    if (!base || typeof base !== "object") {
      return patch === undefined ? base : patch;
    }

    const output = {};
    const keys = new Set(Object.keys(base).concat(Object.keys(patch || {})));
    keys.forEach((key) => {
      const baseValue = base[key];
      const patchValue = patch ? patch[key] : undefined;

      if (patchValue === undefined) {
        output[key] = Array.isArray(baseValue) ? baseValue.slice() : (baseValue && typeof baseValue === "object" ? mergeDeep(baseValue, {}) : baseValue);
        return;
      }

      if (Array.isArray(baseValue)) {
        output[key] = Array.isArray(patchValue) ? patchValue.slice() : baseValue.slice();
        return;
      }

      if (baseValue && typeof baseValue === "object" && patchValue && typeof patchValue === "object" && !Array.isArray(patchValue)) {
        output[key] = mergeDeep(baseValue, patchValue);
        return;
      }

      output[key] = patchValue;
    });

    return output;
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function queryFirst(selectors, root) {
    const scope = root || document;
    const list = Array.isArray(selectors) ? selectors : [selectors];

    for (const selector of list) {
      const hit = scope.querySelector(selector);
      if (hit) {
        return hit;
      }
    }

    return null;
  }

  function queryAll(selectors, root) {
    const scope = root || document;
    const list = Array.isArray(selectors) ? selectors : [selectors];
    const seen = new Set();
    const hits = [];

    list.forEach((selector) => {
      scope.querySelectorAll(selector).forEach((node) => {
        if (!seen.has(node)) {
          seen.add(node);
          hits.push(node);
        }
      });
    });

    return hits;
  }

  function isVisible(element) {
    if (!element) {
      return false;
    }

    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 5 || rect.height < 5) {
      return false;
    }

    return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
  }

  function pickBestVisible(selectors) {
    const elements = queryAll(selectors);
    let best = null;
    let bestScore = -Infinity;

    elements.forEach((element) => {
      if (!isVisible(element)) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const area = rect.width * rect.height;
      const score = (area * 0.001) + ((window.innerHeight - rect.bottom) * 0.5) + ((window.innerWidth - rect.left) * 0.05);

      if (score > bestScore) {
        best = element;
        bestScore = score;
      }
    });

    return best;
  }

  function createElementFromHTML(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    return wrapper.firstElementChild;
  }

  function ensureToastHost() {
    let host = document.getElementById(constants.UI_IDS.toastHost);
    if (host) {
      return host;
    }

    host = document.createElement("div");
    host.id = constants.UI_IDS.toastHost;

    const mount = document.body || document.documentElement;
    mount.appendChild(host);
    return host;
  }

  function showToast(message, options) {
    const opts = Object.assign({
      type: "info",
      duration: constants.DEFAULT_SETTINGS.ui.blockNoticeMs
    }, options || {});

    const host = ensureToastHost();
    const toast = document.createElement("div");
    toast.className = "xydy-toast xydy-toast-" + opts.type;
    toast.textContent = message;
    host.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 200);
    }, opts.duration);
  }

  function dispatchSyntheticKey(type, key, repeat) {
    const code = key.length === 1 ? "Key" + key.toUpperCase() : key;
    const normalizedKey = key.length === 1 ? key : key;
    const keyCode = key.length === 1 ? key.toUpperCase().charCodeAt(0) : (key === "ArrowDown" ? 40 : 0);

    const event = new KeyboardEvent(type, {
      key: normalizedKey,
      code,
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      repeat: Boolean(repeat)
    });

    document.dispatchEvent(event);
  }

  function tapSyntheticKey(key) {
    dispatchSyntheticKey("keydown", key, false);
    dispatchSyntheticKey("keyup", key, false);
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isImmersiveVideoPage() {
    const path = window.location.pathname;
    const allowedPaths = [
      "/",
      "/recommend",
      "/video"
    ];
    if (allowedPaths.some(p => path === p || path.startsWith(p + "/"))) {
      return !new URLSearchParams(window.location.search).has("modal_id");
    }
    return false;
  }

  function isModalVideoPage() {
    return new URLSearchParams(window.location.search).has("modal_id");
  }

  app.utils = {
    clone,
    mergeDeep,
    normalizeText,
    sleep,
    queryFirst,
    queryAll,
    isVisible,
    pickBestVisible,
    createElementFromHTML,
    showToast,
    isModalVideoPage,
    dispatchSyntheticKey,
    tapSyntheticKey,
    isPlainObject,
    isImmersiveVideoPage
  };
})(globalThis);
