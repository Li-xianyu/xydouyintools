(function registerSidebarModule(global) {
  const app = global.XYDYExtension;
  const constants = app.constants;
  const utils = app.utils;
  const selectors = constants.SELECTORS;

  app.registerContentModule({
    id: "sidebar",
    create: function createSidebarModule(context) {
      let sidebarElement = null;
      let hideTimer = null;
      let isLocked = false;
      let bound = false;
      let insideSidebar = false;
      let rafId = null;
      let lastX = 0;
      let lastY = 0;
      let pointerDownInSidebar = false;

      function isEnabled() {
        return Boolean(context.getSettings().features.sidebar) &&
               utils.isImmersiveVideoPage();
      }

      function getSidebarSettings() {
        return context.getSettings().sidebar;
      }

      function resolveSidebar() {
        sidebarElement = utils.queryFirst(selectors.sidebar);
        return sidebarElement;
      }

      function isMouseInsideSidebar(x, y) {
        const el = resolveSidebar();
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        let left = rect.left;
        if (!document.documentElement.classList.contains("xydy-sidebar-hidden")) {
          const transform = getComputedStyle(el).transform;
          if (transform !== "none") left -= new DOMMatrixReadOnly(transform).m41;
        }
        return x >= left - 8 && x <= left + rect.width + 8 &&
          y >= rect.top - 8 && y <= rect.bottom + 8;
      }

      function setVisible(hidden) {
        if (!document.documentElement) return;
        document.documentElement.classList.toggle("xydy-sidebar-hidden", Boolean(hidden));
        if (!hidden) {
          insideSidebar = true;
        }
      }

      function scheduleHide(delay) {
        if (hideTimer) clearTimeout(hideTimer);
        if (isLocked) return;
        hideTimer = setTimeout(() => {
          hideTimer = null;
          const el = resolveSidebar();
          const focused = el && el.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
          insideSidebar = pointerDownInSidebar || focused ||
            lastX <= getSidebarSettings().hoverWidth || isMouseInsideSidebar(lastX, lastY);
          if (!insideSidebar) {
            setVisible(true);
          }
        }, delay);
      }

      function cancelHide() {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
      }

      function onPointerMove(x, y) {
        if (!isEnabled()) return;
        const ss = getSidebarSettings();
        if (ss.locked || isLocked) return;

        const inSidebar = isMouseInsideSidebar(x, y);
        const inTrigger = x <= ss.hoverWidth;

        if (inSidebar || inTrigger || pointerDownInSidebar) {
          insideSidebar = true;
          cancelHide();
          setVisible(false);
        } else {
          insideSidebar = false;
          if (hideTimer === null) {
            scheduleHide(ss.hoverDelay);
          }
        }
      }

      function handlePointerMove(event) {
        lastX = event.clientX;
        lastY = event.clientY;
        if (event.buttons === 0) pointerDownInSidebar = false;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          onPointerMove(lastX, lastY);
        });
      }

      function bindHover() {
        if (bound) return;
        bound = true;
        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.addEventListener("pointerdown", handleSidebarPointerDown, { passive: true });
        document.addEventListener("pointerup", handleSidebarPointerEnd, { passive: true });
        document.addEventListener("pointercancel", handleSidebarPointerEnd, { passive: true });
      }

      function handleSidebarPointerDown(event) {
        const el = resolveSidebar();
        pointerDownInSidebar = Boolean(el && el.contains(event.target));
        if (pointerDownInSidebar) cancelHide();
      }

      function handleSidebarPointerEnd(event) {
        if (!pointerDownInSidebar) return;
        pointerDownInSidebar = false;
        lastX = event.clientX;
        lastY = event.clientY;
        onPointerMove(lastX, lastY);
      }

      function unbindHover() {
        if (!bound) return;
        bound = false;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerdown", handleSidebarPointerDown);
        document.removeEventListener("pointerup", handleSidebarPointerEnd);
        document.removeEventListener("pointercancel", handleSidebarPointerEnd);
        pointerDownInSidebar = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        cancelHide();
      }

      function toggleLock() {
        isLocked = !isLocked;
        if (isLocked) {
          setVisible(true);
        } else {
          const ss = getSidebarSettings();
          if (!ss.hideRequested) {
            setVisible(false);
          }
        }
      }

      function handleHotkey(event) {
        if (!isEnabled()) return;
        if (event.altKey && event.key === "1") {
          event.preventDefault();
          event.stopPropagation();
          toggleLock();
        }
      }

      function notifySwiperAndPlayer() {
        requestAnimationFrame(function () {
          window.dispatchEvent(new Event("resize"));
          var sc = document.querySelector(".parent-route-container");
          if (sc) {
            var st = sc.scrollTop;
            sc.scrollTop = st + 1;
            requestAnimationFrame(function () {
              sc.scrollTop = st;
            });
          }
        });
      }

      function apply(settings) {
        const enabled = isEnabled();

        if (enabled) {
          resolveSidebar();
          const ss = settings.sidebar;
          isLocked = false;

          if (ss.locked) {
            isLocked = true;
            setVisible(true);
          } else if (ss.hideRequested) {
            setVisible(true);
          } else {
            setVisible(false);
          }

          bindHover();
          document.addEventListener("keydown", handleHotkey, true);

          notifySwiperAndPlayer();
          setTimeout(notifySwiperAndPlayer, 500);
        } else {
          unbindHover();
          document.removeEventListener("keydown", handleHotkey, true);
          setVisible(false);
          isLocked = false;
        }
      }

      return {
        init: function init() {
          apply(context.getSettings());
        },
        onSettingsChange: function onSettingsChange(nextSettings) {
          apply(nextSettings);
        },
        destroy: function destroy() {
          unbindHover();
          document.removeEventListener("keydown", handleHotkey, true);
          setVisible(false);
          isLocked = false;
        }
      };
    }
  });
})(globalThis);
