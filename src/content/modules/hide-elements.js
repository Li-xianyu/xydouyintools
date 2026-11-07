(function registerHideElementsModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;

  app.registerContentModule({
    id: "hide-elements",
    create: function createHideElementsModule(context) {
      let observer = null;
      let intervalId = null;
      let scheduled = false;

      function textMatches(targetText, textsToHide) {
        if (!targetText) {
          return false;
        }
        return textsToHide.some((fragment) => {
          if (fragment === "充值钻石" && (targetText === "充钻石" || targetText.includes("充"))) {
            return true;
          }
          return targetText.includes(fragment) || fragment.includes(targetText);
        });
      }

      function resolveHeaderEntry(entry) {
        const items = app.constants.HEADER_ENTRY_META;
        const identified = items.find(item => item.selector && selectors[item.selector].some(selector =>
          entry.matches(selector) || entry.querySelector(selector)));
        if (identified) return identified;
        const label = utils.queryFirst(selectors.headerEntryLabel, entry);
        const text = utils.normalizeText(label ? label.textContent : entry.textContent).substring(0, 6);
        return items.find(item => item.texts && item.texts.includes(text));
      }

      function syncHeaderEntries(settings) {
        const menu = utils.queryFirst(selectors.headerMenu);
        if (!menu) return;
        const list = utils.queryFirst(selectors.headerMenuList, menu) || menu;
        let hasVisibleEntry = false;
        Array.from(list.children).forEach(entry => {
          const item = resolveHeaderEntry(entry);
          if (item) {
            const hidden = settings.headerEntries[item.key] ? "off" : "on";
            if (entry.dataset.xydyHeaderEntry !== item.key) entry.dataset.xydyHeaderEntry = item.key;
            if (entry.dataset.xydyHeaderHidden !== hidden) entry.dataset.xydyHeaderHidden = hidden;
          } else {
            if (entry.dataset.xydyHeaderEntry) delete entry.dataset.xydyHeaderEntry;
            if (entry.dataset.xydyHeaderHidden) delete entry.dataset.xydyHeaderHidden;
          }
          if ((!item || settings.headerEntries[item.key]) && !entry.hidden &&
              entry.style.display !== "none" && entry.childElementCount > 0) hasVisibleEntry = true;
        });
        const empty = hasVisibleEntry ? "off" : "on";
        if (menu.dataset.xydyHeaderEmpty !== empty) menu.dataset.xydyHeaderEmpty = empty;
      }

      function hideNow() {
        scheduled = false;
        const settings = context.getSettings();
        if (!canRun(settings)) return;
        syncHeaderEntries(settings);
        if (!settings.features.hideElements) {
          return;
        }

        const textsToHide = settings.hideElements.textsToHide;

        utils.queryAll(selectors.hideCandidates).forEach((node) => {
          if (node.closest(selectors.header.join(","))) return;
          const text = utils.normalizeText(node.textContent);
          if (!textMatches(text, textsToHide)) {
            return;
          }

          const parent = node.closest(selectors.hideCandidateParent[0]) || node.closest(selectors.hideCandidateParent[1]);
          if (!parent) {
            return;
          }

          parent.style.cssText = "display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important; overflow: hidden !important; position: absolute !important;";
          parent.dataset.xydyHidden = "1";
        });

        utils.queryAll(selectors.wallpaperCandidates).forEach((node) => {
          if (node.closest(selectors.header.join(","))) return;
          const parent = node.closest("div");
          if (!parent) {
            return;
          }
          parent.style.display = "none";
          parent.dataset.xydyHidden = "1";
        });
      }

      function scheduleHide() {
        if (scheduled) {
          return;
        }

        scheduled = true;
        setTimeout(hideNow, 120);
      }

      function canRun(settings) {
        return window.location.host === "www.douyin.com" &&
               utils.isImmersiveVideoPage();
      }

      function start() {
        stop();
        if (!canRun(context.getSettings())) {
          return;
        }

        hideNow();
        intervalId = setInterval(hideNow, 1500);

        observer = new MutationObserver(scheduleHide);
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class"]
        });
      }

      function restoreHiddenElements() {
        document.querySelectorAll('[data-xydy-hidden="1"]').forEach(el => {
          el.style.cssText = "";
          el.style.display = "";
          el.style.visibility = "";
          el.style.width = "";
          el.style.minWidth = "";
          el.style.margin = "";
          el.style.padding = "";
          el.style.overflow = "";
          el.style.height = "";
          el.style.position = "";
          delete el.dataset.xydyHidden;
        });
      }

      function stop() {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        if (observer) {
          observer.disconnect();
          observer = null;
        }
        restoreHiddenElements();
        document.querySelectorAll('[data-xydy-header-entry]').forEach(entry => {
          delete entry.dataset.xydyHeaderEntry;
          delete entry.dataset.xydyHeaderHidden;
        });
        utils.queryAll(selectors.headerMenu).forEach(menu => delete menu.dataset.xydyHeaderEmpty);
      }

      return {
        init: function init() {
          start();
        },
        onSettingsChange: function onSettingsChange(nextSettings, previousSettings) {
          start();
        },
        destroy: stop
      };
    }
  });
})(globalThis);
