(function registerLoadingScreenModule(global) {
  const app = global.XYDYExtension;
  const uiIds = app.constants.UI_IDS;

  app.registerContentModule({
    id: "loading-screen",
    create: function createLoadingScreenModule(context) {
      let overlay = null;
      let shownAt = 0;
      let maxTimer = null;
      let bootReady = false;
      let domReady = document.readyState !== "loading";
      let removeBootListener = null;
      let onReadyStateChange = null;

      function removeOverlay(reason) {
        if (!overlay) {
          return;
        }

        if (maxTimer) {
          clearTimeout(maxTimer);
          maxTimer = null;
        }

        const settings = context.getSettings();
        const minShow = settings.ui.loadingMinMs;
        const elapsed = Date.now() - shownAt;
        const waitMore = Math.max(0, minShow - elapsed);

        setTimeout(() => {
          if (!overlay) {
            return;
          }
          overlay.classList.add("closing");
          const el = overlay;
          setTimeout(() => {
            el.remove();
            if (overlay === el) overlay = null;
            context.log("loading", "overlay removed", reason);
          }, 260);
        }, waitMore);
      }

      function maybeRemove(reason) {
        if (!bootReady) {
          return;
        }

        if (!domReady && document.readyState === "loading") {
          return;
        }

        removeOverlay(reason);
      }

      function ensureOverlay() {
        if (overlay || !context.getSettings().features.loading) {
          return;
        }

        overlay = document.getElementById(uiIds.loadingOverlay);
        if (overlay) {
          return;
        }

        overlay = document.createElement("div");
        overlay.id = uiIds.loadingOverlay;
        overlay.innerHTML = [
          "<div class=\"xydy-loading-card\">",
          "  <div class=\"xydy-loading-spinner\"></div>",
          "  <div class=\"xydy-loading-title\">xyDouYinTools 正在接管页面</div>",
          "  <div class=\"xydy-loading-desc\">页面和样式稳定后会自动消失。</div>",
          "</div>"
        ].join("");

        shownAt = Date.now();
        (document.documentElement || document.body).appendChild(overlay);

        maxTimer = setTimeout(() => {
          removeOverlay("timeout");
        }, context.getSettings().ui.loadingMaxMs);
      }

      return {
        init: function init() {
          ensureOverlay();

          removeBootListener = context.on("boot-ready", () => {
            bootReady = true;
            maybeRemove("boot-ready");
          });

          onReadyStateChange = function handleReadyStateChange() {
            domReady = document.readyState !== "loading";
            maybeRemove("dom-ready");
          };

          document.addEventListener("readystatechange", onReadyStateChange, true);
        },
        onSettingsChange: function onSettingsChange(nextSettings, previousSettings) {
          if (!previousSettings) {
            return;
          }

          if (nextSettings.features.loading && !previousSettings.features.loading) {
            ensureOverlay();
            return;
          }

          if (!nextSettings.features.loading && previousSettings.features.loading) {
            removeOverlay("feature-disabled");
          }
        },
        destroy: function destroy() {
          if (removeBootListener) {
            removeBootListener();
          }
          if (onReadyStateChange) {
            document.removeEventListener("readystatechange", onReadyStateChange, true);
          }
          if (maxTimer) {
            clearTimeout(maxTimer);
          }
          removeOverlay("destroy");
        }
      };
    }
  });
})(globalThis);
