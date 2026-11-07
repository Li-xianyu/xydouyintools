(function registerLiquidGlassModule(global) {
  const app = global.XYDYExtension;
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Gradient displacement and RGB separation adapted from the local newtab liquid-glass helper.
  // References: https://github.com/rizroze/liquid-glass and https://aave.com/design/building-glass-for-the-web
  app.registerContentModule({
    id: "liquid-glass",
    create: function createLiquidGlassModule(context) {
      const surfaces = new Map();
      const materialSelector = app.constants.SELECTORS.liquidGlassSurfaces.join(",");
      let host = null;
      let definitions = null;
      let observer = null;
      let resizeObserver = null;
      let scheduled = false;
      let serial = 0;
      let running = false;

      function svgNode(name, attributes) {
        const element = document.createElementNS(SVG_NS, name);
        Object.entries(attributes || {}).forEach(([key, value]) => element.setAttribute(key, value));
        return element;
      }

      function ensureDefinitions() {
        if (host) return;
        host = svgNode("svg", { width: 0, height: 0, "aria-hidden": "true", id: "xydy-liquid-definitions" });
        host.style.cssText = "position:absolute;pointer-events:none;overflow:hidden;";
        definitions = svgNode("defs");
        host.appendChild(definitions);
        document.documentElement.appendChild(host);
      }

      function makeMap(width, height, radius) {
        const ratio = Math.min(1, 768 / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        const drawing = canvas.getContext("2d");
        if (!drawing) throw new Error("Canvas unavailable");
        const w = canvas.width;
        const h = canvas.height;
        const horizontal = drawing.createLinearGradient(0, 0, w, 0);
        horizontal.addColorStop(0, "rgb(0,0,0)");
        horizontal.addColorStop(1, "rgb(255,0,0)");
        drawing.fillStyle = horizontal;
        drawing.fillRect(0, 0, w, h);
        const vertical = drawing.createLinearGradient(0, 0, 0, h);
        vertical.addColorStop(0, "rgb(0,0,0)");
        vertical.addColorStop(1, "rgb(0,0,255)");
        drawing.globalCompositeOperation = "difference";
        drawing.fillStyle = vertical;
        drawing.fillRect(0, 0, w, h);
        drawing.globalCompositeOperation = "source-over";
        const inset = Math.min(w, h) * 0.08;
        drawing.filter = "blur(" + Math.max(2, 9 * ratio) + "px)";
        drawing.fillStyle = "rgba(128,128,128,0.98)";
        drawing.beginPath();
        drawing.roundRect(inset, inset, w - inset * 2, h - inset * 2, Math.max(2, radius * ratio - inset));
        drawing.fill();
        return canvas.toDataURL();
      }

      function createFilter() {
        ensureDefinitions();
        const id = "xydy-liquid-filter-" + (++serial);
        const filter = svgNode("filter", {
          id, x: 0, y: 0, width: "100%", height: "100%", "color-interpolation-filters": "sRGB"
        });
        const map = svgNode("feImage", { x: 0, y: 0, result: "map", preserveAspectRatio: "none" });
        filter.appendChild(map);
        const channels = [
          "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
          "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
          "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
        ];
        channels.forEach((values, index) => {
          filter.appendChild(svgNode("feDisplacementMap", {
            in: "SourceGraphic", in2: "map", scale: -40 + index * 3,
            xChannelSelector: "R", yChannelSelector: "B", result: "displaced" + index
          }));
          filter.appendChild(svgNode("feColorMatrix", {
            in: "displaced" + index, type: "matrix", values, result: "channel" + index
          }));
        });
        filter.appendChild(svgNode("feBlend", { in: "channel0", in2: "channel1", mode: "screen", result: "redGreen" }));
        filter.appendChild(svgNode("feBlend", { in: "redGreen", in2: "channel2", mode: "screen" }));
        definitions.appendChild(filter);
        return { id, filter, map, geometry: "" };
      }

      function release(element) {
        const instance = surfaces.get(element);
        if (!instance) return;
        resizeObserver.unobserve(element);
        instance.filter.remove();
        element.classList.remove("xydy-liquid-surface");
        element.style.removeProperty("--xydy-liquid-backdrop");
        surfaces.delete(element);
      }

      function refresh(element, instance) {
        const width = element.offsetWidth || 256;
        const height = element.offsetHeight || 160;
        const rawRadius = getComputedStyle(element).borderTopLeftRadius;
        const radius = rawRadius.endsWith("%") ? parseFloat(rawRadius) / 100 * Math.min(width, height) : parseFloat(rawRadius) || 0;
        const geometry = [width, height, radius].join(":");
        if (geometry === instance.geometry) return;
        instance.map.setAttribute("href", makeMap(width, height, radius));
        instance.map.setAttribute("width", width);
        instance.map.setAttribute("height", height);
        instance.geometry = geometry;
      }

      function sync() {
        scheduled = false;
        if (!running) return;
        const candidates = app.utils.queryAll(materialSelector);
        const targets = candidates.filter(element => !candidates.some(parent => parent !== element &&
          !parent.classList.contains("xgplayer-controls") && parent.contains(element)));
        surfaces.forEach((instance, element) => {
          if (!targets.includes(element)) release(element);
        });
        targets.forEach((element) => {
          let instance = surfaces.get(element);
          try {
            if (!instance) {
              instance = createFilter();
              surfaces.set(element, instance);
              resizeObserver.observe(element);
            }
            if (!element.classList.contains("xydy-liquid-surface")) {
              element.classList.add("xydy-liquid-surface");
            }
            const backdrop = "url(#" + instance.id + ") blur(2px) saturate(1.35)";
            if (element.style.getPropertyValue("--xydy-liquid-backdrop") !== backdrop) {
              element.style.setProperty("--xydy-liquid-backdrop", backdrop);
            }
            refresh(element, instance);
          } catch (error) {
            release(element);
            context.log("liquid-glass", "液态玻璃回退为磨砂", String(error));
          }
        });
      }

      function schedule() {
        if (!running || scheduled) return;
        scheduled = true;
        queueMicrotask(sync);
      }

      function affectsSurfaces(mutation) {
        if (host && host.contains(mutation.target)) return false;
        const relevant = element => element instanceof Element && element !== host &&
          (surfaces.has(element) || element.matches(materialSelector) ||
            [...surfaces.keys()].some(surface => element.contains(surface)) ||
            (element.children.length > 0 && element.querySelector(materialSelector)));
        if (mutation.type === "attributes") return relevant(mutation.target);
        return [...mutation.addedNodes, ...mutation.removedNodes].some(relevant);
      }

      function stop() {
        running = false;
        if (observer) observer.disconnect();
        observer = null;
        scheduled = false;
        surfaces.forEach((instance, element) => release(element));
        if (resizeObserver) resizeObserver.disconnect();
        resizeObserver = null;
        window.removeEventListener("resize", schedule);
        document.removeEventListener("scroll", schedule, true);
        if (host) host.remove();
        host = null;
        definitions = null;
        document.documentElement.dataset.xydyLiquidGlass = "off";
      }

      function apply(settings) {
        const enabled = settings.features.styles && settings.features.liquidGlass &&
          location.host === "www.douyin.com" &&
          app.utils.isImmersiveVideoPage() && !new URLSearchParams(location.search).has("modal_id") &&
          CSS.supports("backdrop-filter", "url(#xydy-liquid)") && typeof ResizeObserver !== "undefined";
        if (!enabled) {
          stop();
          return;
        }
        document.documentElement.dataset.xydyLiquidGlass = "on";
        if (running) return;
        running = true;
        resizeObserver = new ResizeObserver((entries) => {
          entries.forEach(({ target }) => {
            const instance = surfaces.get(target);
            if (!instance || !running) return;
            try {
              refresh(target, instance);
            } catch (error) {
              release(target);
              context.log("liquid-glass", "液态玻璃尺寸更新失败", String(error));
            }
          });
        });
        observer = new MutationObserver((mutations) => {
          if (mutations.some(affectsSurfaces)) schedule();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "data-material"] });
        window.addEventListener("resize", schedule, { passive: true });
        document.addEventListener("scroll", schedule, { passive: true, capture: true });
        sync();
      }

      return { init: function init() { apply(context.getSettings()); }, onSettingsChange: apply, destroy: stop };
    }
  });
})(globalThis);
