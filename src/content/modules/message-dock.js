(function registerMessageDockModule(global) {
  const app = global.XYDYExtension;

  app.registerContentModule({
    id: "message-dock",
    create: function createMessageDock(context) {
      const selectors = app.constants.SELECTORS;
      const animations = new Set();
      let phase = "expanded";
      let panel = null;
      let host = null;
      let orb = null;
      let observer = null;
      let frame = null;
      let fadeTimer = null;
      let generation = 0;
      let edgeNear = false;
      let dockY = 0;
      let suppressUntil = 0;
      let bound = false;

      function enabled() {
        return context.getSettings().features.styles && location.host === "www.douyin.com" &&
          app.utils.isImmersiveVideoPage() && !new URLSearchParams(location.search).has("modal_id");
      }

      function consume(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      function reset() {
        generation++;
        animations.forEach(animation => animation.cancel());
        animations.clear();
        clearTimeout(fadeTimer);
        fadeTimer = null;
        if (host) host.classList.remove("xydy-message-minimized");
        if (orb) orb.remove();
        orb = null;
        phase = "expanded";
        suppressUntil = 0;
      }

      function sync() {
        frame = null;
        const current = app.utils.queryFirst(selectors.messagePanel);
        if (current !== panel || (host && !host.isConnected)) {
          reset();
          panel = current;
          host = panel && panel.closest(selectors.messageHost.join(","));
        }
      }

      function scheduleSync() {
        if (frame === null) frame = requestAnimationFrame(sync);
      }

      function geometry(rect) {
        return { left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", height: rect.height + "px" };
      }

      function circle(left, top) {
        return { left: left + "px", top: top + "px", width: "56px", height: "56px" };
      }

      async function animateTo(target, duration, easing) {
        const element = orb;
        if (!element) return;
        const start = geometry(element.getBoundingClientRect());
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const animation = element.animate([start, target], {
          duration: reduced ? 1 : duration, easing, fill: "forwards"
        });
        animations.add(animation);
        try {
          await animation.finished;
          Object.assign(element.style, target);
        } catch (error) {
          return;
        } finally {
          animations.delete(animation);
          animation.cancel();
        }
      }

      function setRevealed(value) {
        if (orb) orb.dataset.revealed = value ? "true" : "false";
      }

      function placeAtEdge() {
        if (!orb) return;
        dockY = Math.max(16, Math.min(dockY, window.innerHeight - 72));
        Object.assign(orb.style, circle(window.innerWidth - 18, dockY));
      }

      async function minimize() {
        if (!host || phase !== "expanded") return;
        const rect = host.getBoundingClientRect();
        if (rect.width < 40 || rect.height < 40) return;
        const token = ++generation;
        phase = "shrinking";
        orb = document.createElement("button");
        orb.id = app.constants.UI_IDS.messageOrb;
        orb.type = "button";
        orb.dataset.phase = phase;
        orb.dataset.revealed = "true";
        orb.setAttribute("aria-label", "展开消息窗口");
        orb.title = "展开消息窗口";
        orb.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M5 5h14v11H9l-4 3V5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
        Object.assign(orb.style, geometry(rect));
        orb.addEventListener("click", restore);
        orb.addEventListener("focus", () => setRevealed(true));
        orb.addEventListener("blur", () => setRevealed(edgeNear));
        document.documentElement.appendChild(orb);
        host.classList.add("xydy-message-minimized");
        dockY = Math.max(16, Math.min(rect.top + rect.height / 2 - 28, window.innerHeight - 72));
        await animateTo({ ...circle(rect.left + rect.width / 2 - 28, dockY), borderRadius: "28px" }, 420, "cubic-bezier(.22,1,.36,1)");
        if (generation !== token) return;
        phase = "moving";
        orb.dataset.phase = phase;
        await animateTo(circle(window.innerWidth - 18, dockY), 560, "cubic-bezier(.16,1,.3,1)");
        if (generation !== token) return;
        phase = "docked";
        orb.dataset.phase = phase;
        fadeTimer = setTimeout(() => setRevealed(edgeNear || document.activeElement === orb), 900);
      }

      async function restore() {
        if (!orb || phase !== "docked" || !host || !panel || !panel.isConnected) return;
        const token = ++generation;
        clearTimeout(fadeTimer);
        phase = "restoring";
        orb.dataset.phase = phase;
        setRevealed(true);
        const rect = host.getBoundingClientRect();
        await animateTo(circle(rect.left + rect.width / 2 - 28, rect.top + rect.height / 2 - 28), 400, "cubic-bezier(.22,1,.36,1)");
        if (generation !== token) return;
        await animateTo({ ...geometry(rect), borderRadius: "18px" }, 440, "cubic-bezier(.22,1,.36,1)");
        if (generation !== token) return;
        host.classList.remove("xydy-message-minimized");
        orb.remove();
        orb = null;
        phase = "expanded";
      }

      function handlePress(event) {
        suppressUntil = 0;
        if (!event.isTrusted || !enabled()) return;
        sync();
        if (!panel || !host || (orb && orb.contains(event.target))) return;
        const trigger = event.target instanceof Element && event.target.closest(selectors.messageTrigger.join(","));
        if (phase === "docked" && trigger) {
          suppressUntil = Date.now() + 1500;
          consume(event);
          restore();
          return;
        }
        if (phase !== "expanded" || host.contains(event.target)) return;
        suppressUntil = Date.now() + 1500;
        consume(event);
        minimize();
      }

      function handleFollowup(event) {
        if (!event.isTrusted || Date.now() >= suppressUntil) return;
        if (event.type === "click" && event.detail === 0) return;
        consume(event);
        if (["click", "auxclick", "contextmenu", "pointercancel"].includes(event.type)) suppressUntil = 0;
      }

      function handleMove(event) {
        edgeNear = event.clientX >= window.innerWidth - 80;
        if (phase === "docked") {
          clearTimeout(fadeTimer);
          setRevealed(edgeNear || document.activeElement === orb);
        }
      }

      function handleLeave() {
        edgeNear = false;
        if (phase === "docked") setRevealed(document.activeElement === orb);
      }

      function handleResize() {
        if (phase === "docked") placeAtEdge();
        else if (phase !== "expanded") reset();
      }

      function stop() {
        if (observer) observer.disconnect();
        observer = null;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        window.removeEventListener("pointerdown", handlePress, true);
        ["pointerup", "pointercancel", "mousedown", "mouseup", "click", "auxclick", "contextmenu"].forEach(type => window.removeEventListener(type, handleFollowup, true));
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("pointerleave", handleLeave);
        reset();
        panel = null;
        host = null;
        bound = false;
      }

      function apply() {
        if (!enabled()) {
          stop();
          return;
        }
        if (bound) return;
        bound = true;
        window.addEventListener("pointerdown", handlePress, true);
        ["pointerup", "pointercancel", "mousedown", "mouseup", "click", "auxclick", "contextmenu"].forEach(type => window.addEventListener(type, handleFollowup, true));
        window.addEventListener("pointermove", handleMove, { passive: true });
        window.addEventListener("resize", handleResize, { passive: true });
        document.addEventListener("pointerleave", handleLeave, { passive: true });
        observer = new MutationObserver(scheduleSync);
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
        sync();
      }

      return { init: apply, onSettingsChange: apply, destroy: stop };
    }
  });
})(globalThis);
