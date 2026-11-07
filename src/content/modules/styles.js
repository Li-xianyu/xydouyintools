(function registerStylesModule(global) {
  const app = global.XYDYExtension;
  const SIDEBAR_OVERRIDE_STYLE_ID = "xydy-sidebar-floating-overrides";
  const VIDEO_CONTROL_PATCH_ATTR = "data-xydy-native-controls-patched";

  function ensureSidebarOverrideStyle() {
    let style = document.getElementById(SIDEBAR_OVERRIDE_STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = SIDEBAR_OVERRIDE_STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }

    style.textContent = `
html[data-xydy-sidebar="on"][data-xydy-styles="on"] #douyin-navigation .kCzNsmN5,
html[data-xydy-sidebar="on"][data-xydy-styles="on"] [data-e2e="douyin-navigation"] .kCzNsmN5 {
  border-radius: 10px !important;
  transition: background 0.18s ease, transform 0.18s ease !important;
}

html[data-xydy-sidebar="on"][data-xydy-styles="on"] #douyin-navigation .kCzNsmN5:hover,
html[data-xydy-sidebar="on"][data-xydy-styles="on"] [data-e2e="douyin-navigation"] .kCzNsmN5:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateX(3px) !important;
}
`;

    return style;
  }

  app.registerContentModule({
    id: "styles",
    create: function createStylesModule(context) {
      let videoObserver = null;
      let swapPending = false;
      let triggerSwapFn = null;
      let chapterDismissBound = false;
      let chapterDismissUntil = 0;
      let danmakuBound = false;
      const danmakuCloseTimers = new Map();
      const danmakuPlugins = new WeakMap();
      const restoredDanmakuModes = new Map();
      const restoredSettingLists = new Map();

      function syncCompactSettings(player) {
        const plugin = player && player.plugins && player.plugins.settinglistplugin;
        if (!plugin || !plugin.config || !Array.isArray(plugin.config.hideList) || typeof plugin.updateConfig !== 'function') return;
        const current = plugin.config.hideList;
        const compact = current.filter(name => name !== 'AutoPlaySettingPlugin' && name !== 'ImmersiveSwitchSettingPlugin');
        if (current.length !== compact.length) {
          restoredSettingLists.set(plugin, current.slice());
          plugin.updateConfig({ hideList: compact });
        }
        if (plugin.root && plugin.root.dataset.xydySettingsEmpty !== String(compact.length === 0)) {
          plugin.root.dataset.xydySettingsEmpty = String(compact.length === 0);
        }
      }

      function syncDanmakuControls() {
        app.utils.queryAll(app.constants.SELECTORS.danmakuContainer).forEach(container => {
          let plugin = danmakuPlugins.get(container);
          if (!plugin) {
            const child = container.firstElementChild;
            const key = child && Object.keys(child).find(name => name.startsWith('__reactFiber$'));
            let fiber = key && child[key];
            for (let depth = 0; fiber && depth < 16; depth++, fiber = fiber.return) {
              const player = fiber.memoizedProps && fiber.memoizedProps.player;
              plugin = player && player.plugins && player.plugins.danmakuplugin;
              if (plugin) break;
            }
            if (plugin) danmakuPlugins.set(container, plugin);
          }
          if (!plugin) return;
          syncCompactSettings(plugin.player);
          if (!plugin.config || plugin.config.isDanmuIcon !== true || typeof plugin.updateConfig !== 'function') return;
          if (!restoredDanmakuModes.has(plugin)) restoredDanmakuModes.set(plugin, plugin.config.isDanmuIcon);
          plugin.updateConfig({ ...plugin.config, isDanmuIcon: false });
        });
        restoredDanmakuModes.forEach((mode, plugin) => {
          if (!plugin.root || !plugin.root.isConnected) restoredDanmakuModes.delete(plugin);
        });
        restoredSettingLists.forEach((list, plugin) => {
          if (!plugin.root || !plugin.root.isConnected) restoredSettingLists.delete(plugin);
        });
      }

      function restoreDanmakuControls() {
        restoredSettingLists.forEach((list, plugin) => {
          if (plugin.root && plugin.root.isConnected) {
            delete plugin.root.dataset.xydySettingsEmpty;
            plugin.updateConfig({ hideList: list });
          }
        });
        restoredSettingLists.clear();
        restoredDanmakuModes.forEach((mode, plugin) => {
          if (plugin.root && plugin.root.isConnected && plugin.config && typeof plugin.updateConfig === 'function') {
            plugin.updateConfig({ ...plugin.config, isDanmuIcon: mode });
          }
        });
        restoredDanmakuModes.clear();
      }

      function findDanmaku(target) {
        return target instanceof Element ? target.closest(app.constants.SELECTORS.danmakuInput.join(',')) : null;
      }

      function expandDanmaku(container) {
        clearTimeout(danmakuCloseTimers.get(container));
        danmakuCloseTimers.delete(container);
        container.dataset.xydyDanmaku = 'expanded';
      }

      function onDanmakuPress(event) {
        if (event.button !== 0 || !canRun(context.getSettings())) return;
        const container = findDanmaku(event.target);
        if (!container || container.dataset.xydyDanmaku === 'expanded') return;
        expandDanmaku(container);
        const input = app.utils.queryFirst(app.constants.SELECTORS.danmakuEditor, container);
        if (input) {
          event.preventDefault();
          input.focus({ preventScroll: true });
        }
      }

      function onDanmakuFocus(event) {
        const container = findDanmaku(event.target);
        if (container) expandDanmaku(container);
      }

      function onDanmakuBlur(event) {
        const container = findDanmaku(event.target);
        if (!container || container.contains(event.relatedTarget)) return;
        clearTimeout(danmakuCloseTimers.get(container));
        danmakuCloseTimers.set(container, setTimeout(() => {
          danmakuCloseTimers.delete(container);
          if (!container.contains(document.activeElement)) delete container.dataset.xydyDanmaku;
        }, 180));
      }

      function bindDanmaku() {
        if (danmakuBound) return;
        danmakuBound = true;
        document.addEventListener('pointerdown', onDanmakuPress, true);
        document.addEventListener('focusin', onDanmakuFocus);
        document.addEventListener('focusout', onDanmakuBlur);
      }

      function unbindDanmaku() {
        danmakuBound = false;
        document.removeEventListener('pointerdown', onDanmakuPress, true);
        document.removeEventListener('focusin', onDanmakuFocus);
        document.removeEventListener('focusout', onDanmakuBlur);
        danmakuCloseTimers.forEach(timer => clearTimeout(timer));
        danmakuCloseTimers.clear();
        app.utils.queryAll(app.constants.SELECTORS.danmakuInput).forEach(container => delete container.dataset.xydyDanmaku);
      }

      function blockChapterDismissEvent(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      function handleChapterOutsidePress(event) {
        chapterDismissUntil = 0;
        if (!event.isTrusted || !canRun(context.getSettings())) return;
        const selectors = app.constants.SELECTORS;
        const panel = app.utils.queryAll(selectors.chapterPanel).find((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 50 && rect.height > 50 && rect.bottom > 0 &&
            rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth &&
            style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01;
        });
        if (!panel || panel.contains(event.target)) return;
        const closeButton = app.utils.queryFirst(selectors.chapterClose, panel);
        if (!closeButton) return;
        chapterDismissUntil = Date.now() + 1500;
        blockChapterDismissEvent(event);
        closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }

      function handleChapterDismissFollowup(event) {
        if (!event.isTrusted || Date.now() >= chapterDismissUntil) return;
        if (event.type === 'click' && event.detail === 0) return;
        blockChapterDismissEvent(event);
        if (['click', 'auxclick', 'contextmenu', 'pointercancel'].includes(event.type)) {
          chapterDismissUntil = 0;
        }
      }

      function bindChapterDismiss() {
        if (chapterDismissBound) return;
        chapterDismissBound = true;
        window.addEventListener('pointerdown', handleChapterOutsidePress, true);
        ['pointerup', 'pointercancel', 'mousedown', 'mouseup', 'click', 'auxclick', 'contextmenu'].forEach((type) => {
          window.addEventListener(type, handleChapterDismissFollowup, true);
        });
      }

      function unbindChapterDismiss() {
        chapterDismissBound = false;
        chapterDismissUntil = 0;
        window.removeEventListener('pointerdown', handleChapterOutsidePress, true);
        ['pointerup', 'pointercancel', 'mousedown', 'mouseup', 'click', 'auxclick', 'contextmenu'].forEach((type) => {
          window.removeEventListener(type, handleChapterDismissFollowup, true);
        });
      }

      function patchVideoControls(root) {
        const scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll("video").forEach((video) => {
          if (video.getAttribute(VIDEO_CONTROL_PATCH_ATTR) === "1") {
            if (context.getSettings().features.styles && video.hasAttribute("controls")) {
              video.removeAttribute("controls");
              video.controls = false;
            }
            return;
          }

          video.setAttribute(VIDEO_CONTROL_PATCH_ATTR, "1");
          if (video.hasAttribute("controls")) {
            video.removeAttribute("controls");
          }
          video.controls = false;
        });
      }

      function patchXgControls() {
        const controls = document.querySelectorAll('.xgplayer-controls');
        controls.forEach((el) => {
          if (context.getSettings().features.liquidGlass) {
            el.style.removeProperty('background-image');
            el.style.removeProperty('background');
            return;
          }
          if (el.style.backgroundImage !== 'none') {
            el.style.setProperty('background-image', 'none', 'important');
            el.style.setProperty('background', 'rgba(255, 255, 255, 0.06)', 'important');
          }
        });
      }

      function syncChapterModeClass() {
        const selectors = app.constants.SELECTORS;
        app.utils.queryAll(selectors.playerContainer).forEach((playerContainer) => {
          const slide = playerContainer.closest(selectors.videoSlide.join(','));
          const chapterPanel = slide && app.utils.queryFirst(selectors.chapterPanel, slide);
          const style = chapterPanel && window.getComputedStyle(chapterPanel);
          const isOpen = !!chapterPanel &&
            chapterPanel.offsetWidth > 50 && chapterPanel.offsetHeight > 50 &&
            style.display !== 'none' && style.visibility !== 'hidden' &&
            parseFloat(style.opacity) > 0;

          playerContainer.classList.toggle('xydy-chapter-mode', isOpen);
          const anchor = slide && app.utils.queryFirst(selectors.chapterAnchor, slide);
          if (chapterPanel && anchor) {
            const bounds = chapterPanel.parentElement.getBoundingClientRect();
            const rect = anchor.getBoundingClientRect();
            const width = Math.min(420, bounds.width - 24);
            const left = Math.max(12, Math.min(rect.left - bounds.left, bounds.width - width - 12));
            chapterPanel.style.setProperty('--xydy-chapter-left', left + 'px');
            chapterPanel.style.setProperty('--xydy-chapter-bottom', Math.max(12, bounds.bottom - rect.top + 12) + 'px');
            chapterPanel.style.setProperty('--xydy-chapter-height', Math.max(0, Math.min(480, rect.top - Math.max(bounds.top, 0) - 24)) + 'px');
          }
        });
      }

      function handleTransformSwap() {
        const popupSelector = '[class*="recommend-login-panel"], .n4FTI10b, ._KRDPUZX, .hurS2TXT';
        const popup = document.querySelector(popupSelector);

        if (popup) {
          const activeSlide = popup.closest('.RFe2KjM2');
          if (activeSlide && !activeSlide.dataset.xydySwapped) {
            const cs = window.getComputedStyle(activeSlide);
            const transformStr = activeSlide.style.transform || cs.transform;
            if (transformStr && transformStr !== 'none') {
              const match = transformStr.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^\)]+)\)/) ||
                            transformStr.match(/translate3d\([^,]+,\s*([^p]+)px/);
              if (match) {
                const translateY = parseFloat(match[1]);
                activeSlide.dataset.xydyOrigTransform = transformStr;
                activeSlide.dataset.xydySwapped = "1";
                activeSlide.style.setProperty('transform', 'none', 'important');
                activeSlide.style.setProperty('top', `${translateY}px`, 'important');
              }
            }
          }
        } else {
          // Restore transform if no popups are open
          const swappedSlide = document.querySelector('[data-xydy-swapped="1"]');
          if (swappedSlide) {
            const orig = swappedSlide.dataset.xydyOrigTransform;
            swappedSlide.style.setProperty('transform', orig === 'none' ? '' : orig);
            swappedSlide.style.removeProperty('top');
            swappedSlide.removeAttribute('data-xydy-swapped');
            swappedSlide.removeAttribute('data-xydy-orig-transform');
          }
        }
      }

      function ensureVideoObserver() {
        if (videoObserver) {
          return;
        }

        videoObserver = new MutationObserver((mutations) => {
          if (!context.getSettings().features.styles) {
            return;
          }

          patchXgControls();
          syncChapterModeClass();
          syncDanmakuControls();

          mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.target && mutation.target.tagName === "VIDEO") {
              mutation.target.removeAttribute("controls");
              mutation.target.controls = false;
              return;
            }

            mutation.addedNodes.forEach((node) => {
              if (!node || node.nodeType !== 1) {
                return;
              }

              // Run the swap logic reactively when DOM changes
              handleTransformSwap();
              syncChapterModeClass();

              if (node.tagName === "VIDEO") {
                if (node.hasAttribute("controls")) {
                  node.removeAttribute("controls");
                }
                node.controls = false;
                node.setAttribute(VIDEO_CONTROL_PATCH_ATTR, "1");
                return;
              }

              patchVideoControls(node);
            });
          });
        });

        videoObserver.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["controls"]
        });

        // Smart event triggers: Reactively run swap when mouse enters elements or clicks
        // Use requestAnimationFrame throttling to avoid any layout thrashing
        triggerSwapFn = () => {
          if (swapPending) return;
          swapPending = true;
          requestAnimationFrame(() => {
            handleTransformSwap();
            syncChapterModeClass();
            swapPending = false;
          });
        };

        document.addEventListener('mouseover', triggerSwapFn, { passive: true });
        document.addEventListener('click', triggerSwapFn, { passive: true });
      }

      let gcTimer = null;
      function startGcTimer() {
        if (gcTimer) return;
        gcTimer = setInterval(() => {
          if (!context.getSettings().features.styles) return;
          handleTransformSwap();
          syncChapterModeClass();
          syncDanmakuControls();
        }, 1000);
      }

      function stopGcTimer() {
        if (gcTimer) {
          clearInterval(gcTimer);
          gcTimer = null;
        }
        if (triggerSwapFn) {
          document.removeEventListener('mouseover', triggerSwapFn);
          document.removeEventListener('click', triggerSwapFn);
          triggerSwapFn = null;
        }
        const swappedSlide = document.querySelector('[data-xydy-swapped="1"]');
        if (swappedSlide) {
          const orig = swappedSlide.dataset.xydyOrigTransform;
          swappedSlide.style.setProperty('transform', orig === 'none' ? '' : orig);
          swappedSlide.style.removeProperty('top');
          swappedSlide.removeAttribute('data-xydy-swapped');
          swappedSlide.removeAttribute('data-xydy-orig-transform');
        }
      }

      function canRun(settings) {
        return settings.features.styles &&
               window.location.host === "www.douyin.com" &&
               app.utils.isImmersiveVideoPage();
      }

      function apply(settings) {
        const root = document.documentElement;
        if (!root) return;

        const active = canRun(settings);

        if (!active) {
          unbindChapterDismiss();
          unbindDanmaku();
          if (videoObserver) {
            videoObserver.disconnect();
            videoObserver = null;
          }
          stopGcTimer();
          restoreDanmakuControls();
          document.querySelectorAll('[data-xydy-teleported="1"]').forEach(el => el.remove());
          const style = document.getElementById(SIDEBAR_OVERRIDE_STYLE_ID);
          if (style) {
            style.remove();
          }
          return;
        }

        ensureSidebarOverrideStyle();
        bindChapterDismiss();
        bindDanmaku();
        syncDanmakuControls();
        patchVideoControls(document);
        patchXgControls();
        ensureVideoObserver();
        startGcTimer();
      }

      return {
        init: function init() {
          apply(context.getSettings());
        },
        onSettingsChange: function onSettingsChange(nextSettings) {
          apply(nextSettings);
        },
        destroy: function destroy() {
          unbindChapterDismiss();
          unbindDanmaku();
          stopGcTimer();
          if (videoObserver) {
            videoObserver.disconnect();
            videoObserver = null;
          }
          restoreDanmakuControls();
        }
      };
    }
  });
})(globalThis);
