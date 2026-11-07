(function registerProximityModule(global) {
  const app = global.XYDYExtension;
  const constants = app.constants;
  const utils = app.utils;

  app.registerContentModule({
    id: "proximity",
    create: function createProximityModule(context) {
      let bound = false;
      let throttleTimer = null;
      let lastX = 0;
      let lastY = 0;
      let controlsInteractionActive = false;
      const hideTimers = {
        controls: null,
        info: null,
        right: null
      };
      const THRESHOLD = 85; // Proximity threshold in pixels

      // Separating detection targets (for distance calculations) and styling targets (for applying visible classes)
      const PANEL_GROUPS = [
        {
          name: "controls",
          detect: [
            ".xgplayer-controls",
            ".xgplayer-slider",
            ".xgplayer-playclarity-setting .virtual",
            ".xg-options-list",
            ".danmu-setting-box",
            ".danmu-emoji-box"
          ],
          style: [".xgplayer-controls", ".xgplayer-progress"]
        },
        {
          name: "info",
          // Robust detection: target bottom-left text details. If not found, fallback to outer container bounds
          detect: [
            ".video-info-detail .account",
            ".video-info-detail .title",
            ".video-info-detail > div:first-child",
            ".video-info-detail > div:not(.mini-progress-outer)",
            ".xgplayer-recommend-tag",
            ...constants.SELECTORS.playerShopAnchor
          ],
          style: [".xgplayer-video-info-wrap", ".douyin-player-video-info-wrap", ".video-info-detail", ".xgplayer-recommend-tag", ...constants.SELECTORS.playerShopAnchor]
        },
        {
          name: "right",
          detect: ["div[class*=\"immersive-player-switch-on-hide-interaction-area\"]", ".gvcmX2Lf", ".rDq18SJg"],
          style: ["div[class*=\"immersive-player-switch-on-hide-interaction-area\"]", ".gvcmX2Lf", ".rDq18SJg"]
        }
      ];

      function canRun(settings) {
        return settings.features.proximity &&
               window.location.host === "www.douyin.com" &&
               utils.isImmersiveVideoPage();
      }

      // Find the active slide based on vertical bounding boxes
      function getActiveSlide() {
        const slides = Array.from(document.querySelectorAll('.dySwiperSlide'));
        let activeIndex = -1;
        let minDiff = Infinity;
        slides.forEach((s, idx) => {
          const rect = s.getBoundingClientRect();
          const diff = Math.abs(rect.top);
          if (diff < minDiff) {
            minDiff = diff;
            activeIndex = idx;
          }
        });
        return slides[activeIndex];
      }

      // Calculate Euclidean distance from point (x, y) to element bounding rect
      function getDistanceToRect(x, y, rect) {
        let dx = 0;
        let dy = 0;

        if (x < rect.left) {
          dx = rect.left - x;
        } else if (x > rect.right) {
          dx = x - rect.right;
        }

        if (y < rect.top) {
          dy = rect.top - y;
        } else if (y > rect.bottom) {
          dy = y - rect.bottom;
        }

        return Math.sqrt(dx * dx + dy * dy);
      }

      // Update visibility class for a panel group based on mouse position
      function updateGroupProximity(x, y, activeSlide, group, visibleClassName) {
        if (!activeSlide) return;

        let detectElements = [];
        group.detect.forEach(sel => {
          activeSlide.querySelectorAll(sel).forEach(el => {
            detectElements.push(el);
          });
        });

        const styleElements = [];
        group.style.forEach(sel => {
          activeSlide.querySelectorAll(sel).forEach(el => {
            styleElements.push(el);
          });
        });

        if (styleElements.length === 0) return;

        // Graceful Fallback: if no specific detection elements are found, fallback to styling elements
        if (detectElements.length === 0) {
          detectElements = styleElements;
        }

        // Calculate min distance to any detection element in the group
        let minDistance = Infinity;
        detectElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const dist = getDistanceToRect(x, y, rect);
          if (dist < minDistance) {
            minDistance = dist;
          }
        });

        const isNear = minDistance <= THRESHOLD;

        if (isNear) {
          if (hideTimers[group.name]) {
            clearTimeout(hideTimers[group.name]);
            hideTimers[group.name] = null;
          }
          styleElements.forEach(el => {
            el.classList.add(visibleClassName);
          });
        } else {
          if (!hideTimers[group.name]) {
            hideTimers[group.name] = setTimeout(() => {
              hideTimers[group.name] = null;
              styleElements.forEach(el => {
                el.classList.remove(visibleClassName);
              });
            }, 600); // 600ms delay to smoothly transition to dropdowns or menus
          }
        }
      }

      function isPointerInPopup(target) {
        if (!target) return false;
        try {
          const el = target.nodeType === 3 ? target.parentElement : target;
          if (!el || typeof el.closest !== 'function') return false;
          return !!el.closest([
            '.semi-portal',
            '.semi-portal-inner',
            '.semi-dropdown-wrapper',
            '.semi-popover-wrapper',
            '.semi-tooltip-wrapper',
            '.semi-dropdown',
            '.semi-popover',
            '[id*="portal"]',
            '[class*="portal"]',
            '.xg-options-list',
            '.danmu-setting-box',
            '.danmu-emoji-box',
            '#chapterVideoSideCard',
            '#chapterVideoCard',
            '[class*="LookModalFrame"]',
            '[class*="chapterVideo"]'
          ].join(','));
        } catch (e) {
          return false;
        }
      }

      // Check if any dropdown/popup is currently open INSIDE the right panel
      // Douyin uses .semi-dropdown-showing with visibility:visible (not display) to show them
      function isRightPanelDropdownOpen() {
        const rightPanel = document.querySelector(
          '.gvcmX2Lf, .rDq18SJg, [class*="immersive-player-switch-on-hide-interaction-area"]'
        );
        if (!rightPanel) return false;

        // Directly check for classes without computing style to break the visibility hidden circular loop
        return !!rightPanel.querySelector('.semi-dropdown-showing, .semi-dropdown-wrapper-show');
      }

      function isChapterPanelOpen() {
        const activeSlide = getActiveSlide();
        if (!activeSlide) return false;
        const panel = utils.queryFirst(constants.SELECTORS.chapterPanel, activeSlide);
        if (!panel) return false;
        const style = window.getComputedStyle(panel);
        return style.display !== 'none' && style.visibility !== 'hidden' &&
               parseFloat(style.opacity) > 0 && panel.offsetWidth > 50 && panel.offsetHeight > 50;
      }

      function isAnyPopupVisible() {
        // Check right panel internal dropdowns first (e.g. share, collect menus)
        if (isRightPanelDropdownOpen()) return true;

        // Check portal-level popups and dynamic immersive popups
        const popups = document.querySelectorAll([
          '.semi-portal-inner > div',
          '.semi-dropdown-wrapper-show',
          '.semi-popover-wrapper',
          '.xg-options-list',
          '.danmu-setting-box',
          '.danmu-emoji-box',
          '[class*="recommend-login-panel"]',
          '.n4FTI10b',
          '._KRDPUZX',
          '.hurS2TXT'
        ].join(','));

        for (let i = 0; i < popups.length; i++) {
          const el = popups[i];
          if (el.closest(constants.SELECTORS.chapterPanel.join(','))) continue;
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) !== 0) {
            if (el.offsetHeight > 0 || el.offsetWidth > 0) {
              return true;
            }
          }
        }
        return false;
      }

      function onPointerMove(x, y) {
        if (!canRun(context.getSettings())) return;

        const activeSlide = getActiveSlide();
        if (!activeSlide) return;

        const popupOpen = isAnyPopupVisible();
        const chapterOpen = isChapterPanelOpen();

        PANEL_GROUPS.forEach(group => {
          if (popupOpen || ((controlsInteractionActive || chapterOpen) && group.name === "controls")) {
            if (hideTimers[group.name]) {
              clearTimeout(hideTimers[group.name]);
              hideTimers[group.name] = null;
            }
            const styleElements = [];
            group.style.forEach(sel => {
              activeSlide.querySelectorAll(sel).forEach(el => {
                styleElements.push(el);
              });
            });
            styleElements.forEach(el => {
              el.classList.add("xydy-proximity-visible");
            });
          } else {
            updateGroupProximity(x, y, activeSlide, group, "xydy-proximity-visible");
          }
        });
      }

      function handlePointerMove(event) {
        const chapterTarget = event.target instanceof Element && event.target.closest(constants.SELECTORS.chapterPanel.join(','));
        if (!chapterTarget && isPointerInPopup(event.target)) {
          const activeSlide = getActiveSlide();
          if (activeSlide) {
            PANEL_GROUPS.forEach(group => {
              if (hideTimers[group.name]) {
                clearTimeout(hideTimers[group.name]);
                hideTimers[group.name] = null;
              }
              group.style.forEach(sel => {
                activeSlide.querySelectorAll(sel).forEach(el => {
                  el.classList.add("xydy-proximity-visible");
                });
              });
            });
          }
          return;
        }

        lastX = event.clientX;
        lastY = event.clientY;
        if (throttleTimer) return;
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          onPointerMove(lastX, lastY);
        }, 40); // Throttled to 25 FPS for smooth performance
      }

      function handleControlsPointerDown(event) {
        const target = event.target && event.target.nodeType === 3 ? event.target.parentElement : event.target;
        if (!target || typeof target.closest !== "function" || !target.closest(".xgplayer-controls, .xgplayer-progress, .xgplayer-slider, .xgplayer-bar")) {
          return;
        }

        controlsInteractionActive = true;
        const activeSlide = getActiveSlide();
        if (!activeSlide) return;

        const controlsGroup = PANEL_GROUPS.find(group => group.name === "controls");
        if (hideTimers.controls) {
          clearTimeout(hideTimers.controls);
          hideTimers.controls = null;
        }
        controlsGroup.style.forEach(sel => {
          activeSlide.querySelectorAll(sel).forEach(el => {
            el.classList.add("xydy-proximity-visible");
          });
        });
      }

      function handleControlsPointerEnd(event) {
        if (!controlsInteractionActive) return;
        controlsInteractionActive = false;
        lastX = event.clientX;
        lastY = event.clientY;
        onPointerMove(lastX, lastY);
      }

      function handleWindowBlur() {
        controlsInteractionActive = false;
      }

      function clearProximityClasses() {
        const classesToRemove = ["xydy-proximity-visible"];
        classesToRemove.forEach(cls => {
          document.querySelectorAll("." + cls).forEach(el => {
            el.classList.remove(cls);
          });
        });
      }

      let domObserver = null;

      function bindListeners() {
        if (bound) return;
        bound = true;
        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.addEventListener("pointerdown", handleControlsPointerDown, { passive: true });
        document.addEventListener("pointerup", handleControlsPointerEnd, { passive: true });
        document.addEventListener("pointercancel", handleControlsPointerEnd, { passive: true });
        document.addEventListener("pointerleave", clearProximityClasses, { passive: true });
        window.addEventListener("blur", handleWindowBlur);

        // Instantly force reveal right panel when any popup is mounted/unmounted in DOM
        if (!domObserver) {
          domObserver = new MutationObserver(() => {
            if (!canRun(context.getSettings())) return;
            const activeSlide = getActiveSlide();
            if (!activeSlide) return;
            if (isChapterPanelOpen()) {
              onPointerMove(lastX, lastY);
              return;
            }
            if (isAnyPopupVisible()) {
              PANEL_GROUPS.forEach(group => {
                if (hideTimers[group.name]) {
                  clearTimeout(hideTimers[group.name]);
                  hideTimers[group.name] = null;
                }
                group.style.forEach(sel => {
                  activeSlide.querySelectorAll(sel).forEach(el => {
                    el.classList.add("xydy-proximity-visible");
                  });
                });
              });
            }
          });
          domObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
          });
        }
      }

      function unbindListeners() {
        if (!bound) return;
        bound = false;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerdown", handleControlsPointerDown);
        document.removeEventListener("pointerup", handleControlsPointerEnd);
        document.removeEventListener("pointercancel", handleControlsPointerEnd);
        document.removeEventListener("pointerleave", clearProximityClasses);
        window.removeEventListener("blur", handleWindowBlur);
        controlsInteractionActive = false;
        if (domObserver) {
          domObserver.disconnect();
          domObserver = null;
        }
        if (throttleTimer) {
          clearTimeout(throttleTimer);
          throttleTimer = null;
        }
        clearProximityClasses();
      }

      function apply(settings) {
        const root = document.documentElement;
        if (!root) return;

        const active = canRun(settings);
        root.dataset.xydyProximity = active ? "on" : "off";

        if (active) {
          bindListeners();
        } else {
          unbindListeners();
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
          unbindListeners();
        }
      };
    }
  });
})(globalThis);
