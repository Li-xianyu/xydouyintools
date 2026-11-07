(function registerSilentMenuModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;
  const labels = app.constants.SILENT_MENU_LABELS;

  app.registerContentModule({
    id: "silent-menu",
    create: function createSilentMenuModule(context) {
      let lastMouseX = Math.floor(window.innerWidth * 0.5);
      let lastMouseY = Math.floor(window.innerHeight * 0.5);
      let running = false;
      let disposed = false;

      function findMenuItemByText(text) {
        return utils.queryAll(selectors.silentMenuItems).find((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && utils.normalizeText(node.textContent) === text;
        }) || null;
      }

      function waitMenuItem(text, canContinue, timeoutMs) {
        return new Promise((resolve) => {
          let observer = null;
          let timer = null;
          const deadline = Date.now() + timeoutMs;
          function finish(value) {
            if (observer) observer.disconnect();
            clearInterval(timer);
            resolve(value);
          }
          function check() {
            if (disposed || !canContinue()) return finish(null);
            const item = findMenuItemByText(text);
            if (item || Date.now() >= deadline) finish(item);
          }
          observer = new MutationObserver(check);
          observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
          timer = setInterval(check, 50);
          check();
        });
      }

      function triggerRightClick(slide) {
        const rect = slide && slide.getBoundingClientRect();
        const x = rect ? Math.max(1, Math.min(window.innerWidth - 1, rect.left + rect.width * 0.45)) : lastMouseX;
        const y = rect ? Math.max(1, Math.min(window.innerHeight - 1, rect.top + rect.height * 0.45)) : lastMouseY;
        const target = document.elementFromPoint(x, y);
        if (!target || (slide && !slide.contains(target))) return false;
        target.dispatchEvent(new MouseEvent("contextmenu", {
          bubbles: true, cancelable: true, view: window, button: 2, buttons: 2, clientX: x, clientY: y
        }));
        return true;
      }

      function closeMenu() {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }

      async function runSilentBlock(options) {
        if (running || disposed) return false;
        const slide = options && options.slide;
        const canContinue = options && options.canContinue || (() => true);
        if (!canContinue() || utils.queryAll(selectors.silentMenuMask).some(node => node.getBoundingClientRect().width > 0)) return false;
        running = true;
        document.documentElement.classList.add("xydy-silent-menu");
        try {
          if (!triggerRightClick(slide)) return false;
          const dislikeItem = await waitMenuItem(labels.dislike, canContinue, 900);
          if (!dislikeItem || !canContinue()) return false;
          dislikeItem.click();
          const noLiveItem = await waitMenuItem(labels.noLive, canContinue, 900);
          if (!noLiveItem || !canContinue()) return false;
          noLiveItem.click();
          return true;
        } catch (error) {
          context.log("silent-menu", "不想看直播菜单操作失败", String(error));
          return false;
        } finally {
          closeMenu();
          await utils.sleep(180);
          document.documentElement.classList.remove("xydy-silent-menu");
          running = false;
        }
      }

      function trackMouse(event) {
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }

      function onKeyDown(event) {
        if (!event.altKey || event.ctrlKey || event.shiftKey || event.repeat || event.metaKey) return;
        if ((event.key || "").toLowerCase() !== "f") return;
        event.preventDefault();
        event.stopPropagation();
        runSilentBlock();
      }

      const api = { blockLive: runSilentBlock, isRunning: () => running };
      app.silentMenu = api;
      document.addEventListener("mousemove", trackMouse, true);
      document.addEventListener("keydown", onKeyDown, true);

      return {
        destroy() {
          disposed = true;
          document.removeEventListener("mousemove", trackMouse, true);
          document.removeEventListener("keydown", onKeyDown, true);
          if (app.silentMenu === api) delete app.silentMenu;
        }
      };
    }
  });
})(globalThis);
