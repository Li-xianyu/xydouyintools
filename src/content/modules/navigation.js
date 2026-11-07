(function registerNavigationModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;

  app.registerContentModule({
    id: "navigation",
    create: function createNavigationModule(context) {
      let header = null;
      let lastMouseY = 9999;
      let lastUrlPath = window.location.pathname + window.location.search;
      let pointerInsideHeader = false;
      let pointerDownInHeader = false;
      let focusInsideHeader = false;
      let interactionUntil = 0;
      let hideTimer = null;
      let showTimer = null;
      let inactivityTimer = null;
      let observer = null;
      let bound = false;
      let searchShell = null;
      let searchInput = null;
      let searchButton = null;
      let searchButtonExpanded = null;
      let searchCloseTimer = null;
      let searchPointerDown = false;
      const searchListeners = [];

      function syncHeaderActions() {
        const id = app.constants.UI_IDS.headerActionsBackground;
        const previous = document.getElementById(id);
        const menu = header && utils.queryFirst(selectors.headerMenu, header);
        if (!canRun(context.getSettings()) || !menu) {
          if (previous) previous.remove();
          return;
        }
        if (previous && previous.parentElement === menu) return;
        if (previous) previous.remove();
        const background = document.createElement("div");
        background.id = id;
        background.setAttribute("aria-hidden", "true");
        menu.prepend(background);
      }

      function isSearchArea(target) {
        return target instanceof Element && Boolean(
          searchShell && searchShell.contains(target) || target.closest(selectors.headerSearchPopup.join(","))
        );
      }

      function syncSearchBackground() {
        const id = app.constants.UI_IDS.headerSearchBackground;
        const previous = document.getElementById(id);
        const form = searchShell && utils.queryFirst(selectors.headerSearchForm, searchShell);
        if (!form) {
          if (previous) previous.remove();
          return;
        }
        if (previous && previous.parentElement === form) return;
        if (previous) previous.remove();
        const background = document.createElement("div");
        background.id = id;
        background.setAttribute("aria-hidden", "true");
        form.prepend(background);
      }

      function setSearchExpanded(expanded) {
        if (!searchShell) return;
        clearTimeout(searchCloseTimer);
        searchCloseTimer = null;
        const state = expanded ? "expanded" : "collapsed";
        if (searchShell.dataset.xydySearch === state) return;
        searchShell.dataset.xydySearch = state;
        if (searchButton) searchButton.setAttribute("aria-expanded", String(expanded));
        if (expanded) {
          showHeader();
          markHeaderInteraction(450);
        } else {
          markHeaderInteraction(400);
          maybeHideHeaderSoon(430);
        }
      }

      function scheduleSearchClose() {
        clearTimeout(searchCloseTimer);
        searchCloseTimer = setTimeout(() => {
          searchCloseTimer = null;
          if (!searchPointerDown && searchShell && !searchShell.contains(document.activeElement)) {
            setSearchExpanded(false);
          }
        }, 160);
      }

      function resetSearch() {
        clearTimeout(searchCloseTimer);
        searchCloseTimer = null;
        searchPointerDown = false;
        document.getElementById(app.constants.UI_IDS.headerSearchBackground)?.remove();
        if (searchShell) {
          searchShell.classList.remove("xydy-search-shell");
          delete searchShell.dataset.xydySearch;
        }
        if (searchButton) {
          if (searchButtonExpanded === null) searchButton.removeAttribute("aria-expanded");
          else searchButton.setAttribute("aria-expanded", searchButtonExpanded);
        }
        searchShell = null;
        searchInput = null;
        searchButton = null;
      }

      function syncSearch() {
        if (!canRun(context.getSettings()) || !header) {
          resetSearch();
          return;
        }
        const input = utils.queryFirst(selectors.headerSearchInput, header);
        const shell = input && input.closest(selectors.headerSearchShell.join(","));
        if (input === searchInput && shell === searchShell) {
          syncSearchBackground();
          return;
        }
        resetSearch();
        if (!shell) return;
        searchShell = shell;
        searchInput = input;
        searchButton = utils.queryFirst(selectors.headerSearchButton, shell);
        searchButtonExpanded = searchButton ? searchButton.getAttribute("aria-expanded") : null;
        shell.classList.add("xydy-search-shell");
        shell.dataset.xydySearch = shell.contains(document.activeElement) ? "expanded" : "collapsed";
        if (searchButton) searchButton.setAttribute("aria-expanded", String(shell.dataset.xydySearch === "expanded"));
        syncSearchBackground();
      }

      function bindSearchListeners() {
        function listen(type, handler) {
          document.addEventListener(type, handler, true);
          searchListeners.push(() => document.removeEventListener(type, handler, true));
        }
        listen("click", (event) => {
          if (!canRun(context.getSettings()) || !searchShell ||
              !searchShell.contains(event.target) || searchShell.dataset.xydySearch !== "collapsed") return;
          event.preventDefault();
          event.stopImmediatePropagation();
          setSearchExpanded(true);
          searchInput.focus({ preventScroll: true });
        });
        listen("pointerdown", (event) => {
          if (!canRun(context.getSettings()) || !searchShell) return;
          searchPointerDown = isSearchArea(event.target);
          if (searchPointerDown) clearTimeout(searchCloseTimer);
          else if (searchShell.dataset.xydySearch === "expanded") setSearchExpanded(false);
        });
        listen("pointerup", () => {
          if (!searchPointerDown) return;
          searchPointerDown = false;
          scheduleSearchClose();
        });
        listen("pointercancel", () => {
          searchPointerDown = false;
          scheduleSearchClose();
        });
        listen("focusin", (event) => {
          if (!canRun(context.getSettings()) || !searchShell) return;
          if (searchShell.contains(event.target) &&
              (event.target === searchInput || searchShell.dataset.xydySearch === "expanded")) setSearchExpanded(true);
        });
        listen("focusout", (event) => {
          if (searchShell && searchShell.contains(event.target)) scheduleSearchClose();
        });
        listen("keydown", (event) => {
          if (event.key !== "Escape" || !searchShell || searchShell.dataset.xydySearch !== "expanded") return;
          setSearchExpanded(false);
          if (searchShell.contains(document.activeElement)) document.activeElement.blur();
        });
        const onWindowBlur = () => {
          searchPointerDown = false;
          if (searchShell) setSearchExpanded(false);
        };
        window.addEventListener("blur", onWindowBlur);
        searchListeners.push(() => window.removeEventListener("blur", onWindowBlur));
      }

      function canRun(settings) {
        return settings.features.navigation &&
               window.location.host === "www.douyin.com" &&
               utils.isImmersiveVideoPage();
      }

      function resolveHeader() {
        header = utils.queryFirst(selectors.header);
        return header;
      }

      function syncHeaderInteractionState() {
        if (!header || !header.isConnected) {
          pointerInsideHeader = false;
          pointerDownInHeader = false;
          focusInsideHeader = false;
          return;
        }

        if (pointerInsideHeader && !header.matches(":hover")) {
          pointerInsideHeader = false;
        }

        if (focusInsideHeader && !header.contains(document.activeElement)) {
          focusInsideHeader = false;
        }
      }

      function showHeader() {
        clearTimeout(hideTimer);
        hideTimer = null;
        clearTimeout(showTimer);
        showTimer = null;

        showTimer = setTimeout(() => {
          document.documentElement.classList.add("xydy-header-visible");
          showTimer = null;
        }, 0);
      }

      function isHeaderInteractionActive() {
        syncHeaderInteractionState();
        const active = pointerInsideHeader || pointerDownInHeader || focusInsideHeader || Date.now() < interactionUntil;
        if (active) {
        }
        return active;
      }

      function markHeaderInteraction(holdMs) {
        interactionUntil = Math.max(interactionUntil, Date.now() + (holdMs || 0));
      }

      function hideHeader() {
        if (isHeaderInteractionActive()) {
          return;
        }

        clearTimeout(showTimer);
        showTimer = null;
        if (hideTimer) {
          return;
        }

        hideTimer = setTimeout(() => {
          document.documentElement.classList.remove("xydy-header-visible");
          hideTimer = null;
        }, 40);
      }

      function maybeHideHeaderSoon(delay) {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          if (!isHeaderInteractionActive() && lastMouseY > 60) {
            hideHeader();
          } else {
          }
        }, delay);
      }

      function resetInactivity() {
        maybeHideHeaderSoon(1200);
      }

      function bindHeaderHoverState() {
        if (!header || header.dataset.xydyNavBound === "1") {
          return;
        }

        header.dataset.xydyNavBound = "1";

        header.addEventListener("pointerenter", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          pointerInsideHeader = true;
          markHeaderInteraction(80);
          showHeader();
          clearTimeout(inactivityTimer);
        }, true);

        header.addEventListener("pointerleave", (event) => {
          if (!canRun(context.getSettings())) {
            return;
          }

          pointerInsideHeader = false;
          lastMouseY = event.clientY;
          maybeHideHeaderSoon(30);
        }, true);

        header.addEventListener("pointerdown", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          pointerDownInHeader = true;
          markHeaderInteraction(180);
          showHeader();
        }, true);

        header.addEventListener("click", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          markHeaderInteraction(220);
          showHeader();
        }, true);
      }

      function bindListeners() {
        if (bound) {
          return;
        }

        bound = true;

        document.addEventListener("pointermove", (event) => {
          if (!canRun(context.getSettings())) {
            return;
          }

          lastMouseY = event.clientY;
          if (event.buttons === 0 && pointerDownInHeader) {
            pointerDownInHeader = false;
          }
          const isPortal = event.target.closest && event.target.closest('.semi-portal-inner');
          if (isPortal || (header && header.contains(event.target))) {
            pointerInsideHeader = true;
            markHeaderInteraction(80);
            showHeader();
            clearTimeout(inactivityTimer);
            return;
          }

          if (pointerInsideHeader) {
            pointerInsideHeader = false;
          }

          if (!isHeaderInteractionActive() && event.clientY > 60) {
            maybeHideHeaderSoon(20);
          }

          if (event.clientY <= 56) {
            showHeader();
            resetInactivity();
          }
        }, true);

        document.addEventListener("pointerup", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          const hadPointerDown = pointerDownInHeader;
          pointerDownInHeader = false;
          if (hadPointerDown) {
            markHeaderInteraction(120);
            if (!pointerInsideHeader && !focusInsideHeader) {
              maybeHideHeaderSoon(30);
            }
          }
        }, true);

        document.addEventListener("mouseout", (event) => {
          if (!canRun(context.getSettings())) {
            return;
          }

          if (!event.relatedTarget && !event.toElement) {
            pointerInsideHeader = false;
            pointerDownInHeader = false;
            maybeHideHeaderSoon(10);
          }
        }, true);

        document.addEventListener("focusin", (event) => {
          if (!canRun(context.getSettings())) {
            return;
          }

          focusInsideHeader = Boolean(header && header.contains(event.target));
          if (focusInsideHeader) {
            markHeaderInteraction(160);
            showHeader();
          }
        }, true);

        document.addEventListener("focusout", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          setTimeout(() => {
            focusInsideHeader = Boolean(header && header.contains(document.activeElement));
            if (!focusInsideHeader && !pointerInsideHeader) {
              maybeHideHeaderSoon(30);
            }
          }, 0);
        }, true);

        window.addEventListener("blur", () => {
          if (canRun(context.getSettings())) {
            pointerInsideHeader = false;
            pointerDownInHeader = false;
            focusInsideHeader = false;
            interactionUntil = 0;
            hideHeader();
          }
        }, true);

        window.addEventListener("scroll", () => {
          if (canRun(context.getSettings()) && !isHeaderInteractionActive() && lastMouseY > 72) {
            hideHeader();
          }
        }, {
          passive: true
        });
      }

      function ensureObserver() {
        observer = new MutationObserver(() => {
          const currentUrlPath = window.location.pathname + window.location.search;
          if (currentUrlPath !== lastUrlPath) {
            lastUrlPath = currentUrlPath;
            apply(context.getSettings());
            return;
          }

          if (!canRun(context.getSettings())) {
            return;
          }

          const nextHeader = utils.queryFirst(selectors.header);
          if (nextHeader && nextHeader !== header) {
            header = nextHeader;
            bindHeaderHoverState();
            showHeader();
            setTimeout(() => {
              if (!isHeaderInteractionActive() && lastMouseY > 72) {
                hideHeader();
              }
            }, 600);
          }
          syncSearch();
          syncHeaderActions();
        });

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }

      function apply(settings) {

        const active = canRun(settings);
        document.documentElement.dataset.xydyNavigation = active ? "on" : "off";

        if (!active) {
          resetSearch();
          document.documentElement.classList.add("xydy-header-visible");
          resolveHeader();
          syncHeaderActions();
          if (header) {
            header.style.removeProperty("position");
            header.style.removeProperty("top");
            header.style.removeProperty("transform");
            header.style.removeProperty("z-index");
          }
          return;
        }

        resolveHeader();
        bindHeaderHoverState();
        syncSearch();
        syncHeaderActions();
        showHeader();
        setTimeout(() => {
          if (!isHeaderInteractionActive() && lastMouseY > 72) {
            hideHeader();
          } else {
          }
        }, 800);
      }

      return {
        init: function init() {
          document.getElementById("xydy-header-blur-bg")?.remove();
          bindListeners();
          bindSearchListeners();
          ensureObserver();
          apply(context.getSettings());
        },
        onSettingsChange: function onSettingsChange(nextSettings) {
          apply(nextSettings);
        },
        destroy: function destroy() {
          searchListeners.forEach(remove => remove());
          resetSearch();
          document.getElementById(app.constants.UI_IDS.headerActionsBackground)?.remove();
          if (observer) {
            observer.disconnect();
          }
          clearTimeout(inactivityTimer);
          clearTimeout(hideTimer);
          clearTimeout(showTimer);
        }
      };
    }
  });
})(globalThis);
