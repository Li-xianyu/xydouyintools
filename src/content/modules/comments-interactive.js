(function registerInteractiveCommentsModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;

  app.registerContentModule({
    id: "comments-interactive",
    create: function createInteractiveComments(context) {
      let activeSideCard = null;
      let checkInterval = null;
      let geometryObserver = null;
      let lastStyles = null;
      let closeListenerBound = false;
      const visibilityKey = 'xydy-comments-visibility';
      let preferredClosed = document.documentElement.classList.contains('xydy-comments-force-hidden');
      let visibilityRevision = 0;
      try { preferredClosed = preferredClosed || localStorage.getItem(visibilityKey) === 'closed'; } catch (error) {}
      if (preferredClosed) document.documentElement.classList.add('xydy-comments-force-hidden');

      const MIN_WIDTH = 320;
      const MIN_HEIGHT = 250;
      const EDGE_GAP = 24;
      const SIDEBAR_WIDTH = 160;
      const HEADER_HEIGHT = 56;

      try {
        lastStyles = JSON.parse(localStorage.getItem('comments_panel_styles') || 'null');
      } catch (error) {}

      function canRun() {
        const settings = context.getSettings();
        return settings.features.styles &&
               window.location.host === "www.douyin.com" &&
               utils.isImmersiveVideoPage();
      }

      function injectInteractiveHandles(sideCard) {
        if (!sideCard) return;

        applyPanelGeometry(sideCard);

        // Force state to loading if in protection window or opening flag set
        if (window.xydyCommentsOpening || (window.xydyCommentsProtectUntil && Date.now() < window.xydyCommentsProtectUntil)) {
          sideCard.dataset.xydyCommentsState = "loading";
          sideCard.dataset.xydyCommentsMounted = "true";
        }

        if (!hasRealCommentContent(sideCard)) {
          // If within the loading protection window, do not downgrade to idle
          if (window.xydyCommentsProtectUntil && Date.now() < window.xydyCommentsProtectUntil) {
            return;
          }
          window.xydyCommentsOpening = false;
          sideCard.dataset.xydyCommentsState = "idle";
          delete sideCard.dataset.xydyCommentsMounted;
          sideCard.classList.remove('xydy-is-ai-tab');
          sideCard.querySelectorAll('.xydy-drag-handle, .xydy-resize-handle').forEach(handle => handle.remove());
          ['inset', 'left', 'right', 'top', 'bottom', 'width', 'height', 'transition'].forEach(property => sideCard.style.removeProperty(property));
          return;
        }

        // Once we have real content, we are ready, so we clear the opening flag
        window.xydyCommentsOpening = false;
        sideCard.dataset.xydyCommentsState = "ready";
        sideCard.dataset.xydyCommentsMounted = "true";

        applyPanelGeometry(sideCard);

        // 修复滚轮滚动：页面会劫持 wheel 事件让评论区无法滚
        // 用 capture 阶段拦截，发现滚轮目标在可滚动子元素内就阻止传播
        if (!sideCard.dataset.xydyWheelFixed) {
          sideCard.dataset.xydyWheelFixed = 'true';
          sideCard.addEventListener('wheel', function (e) {
            var t = e.target;
            while (t && t !== sideCard) {
              if (t.scrollHeight > t.clientHeight + 10) {
                e.stopPropagation();
                return;
              }
              t = t.parentElement;
            }
          }, { passive: true, capture: true });
        }

        // 1. Inject Drag Handle
        if (!sideCard.querySelector('.xydy-drag-handle')) {
          const dragHandle = document.createElement('div');
          dragHandle.className = 'xydy-drag-handle';
          dragHandle.title = '拖拽移动面板';

          // Setup pointer drag listeners with PointerCapture (prevents sticky dragging)
          dragHandle.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return; // Only left click
            e.preventDefault();
            e.stopPropagation();

            // Set global flag to disable long press acceleration
            window.xydyIsInteractingWithComments = true;
            dragHandle.setPointerCapture(e.pointerId);

            const parent = sideCard.parentElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();
            const rect = sideCard.getBoundingClientRect();

            const startX = e.clientX;
            const startY = e.clientY;

            const initialLeft = rect.left - parentRect.left;
            const initialTop = rect.top - parentRect.top;
            const width = rect.width;
            const height = rect.height;

            sideCard.style.setProperty('transition', 'none', 'important');
            sideCard.style.setProperty('right', 'auto', 'important');
            sideCard.style.setProperty('bottom', 'auto', 'important');
            sideCard.style.setProperty('left', initialLeft + 'px', 'important');
            sideCard.style.setProperty('top', initialTop + 'px', 'important');
            sideCard.style.setProperty('width', width + 'px', 'important');
            sideCard.style.setProperty('height', height + 'px', 'important');

            function onPointerMove(moveEvent) {
              const dx = moveEvent.clientX - startX;
              const dy = moveEvent.clientY - startY;

              let newLeft = initialLeft + dx;
              let newTop = initialTop + dy;

              // Boundaries
              newLeft = Math.max(SIDEBAR_WIDTH + EDGE_GAP - parentRect.left, Math.min(newLeft, parentRect.width - width));
              newTop = Math.max(HEADER_HEIGHT - parentRect.top, Math.min(newTop, parentRect.height - height));

              sideCard.style.setProperty('left', newLeft + 'px', 'important');
              sideCard.style.setProperty('top', newTop + 'px', 'important');
            }

            function onPointerUp(upEvent) {
              dragHandle.releasePointerCapture(upEvent.pointerId);
              dragHandle.removeEventListener('pointermove', onPointerMove);
              dragHandle.removeEventListener('pointerup', onPointerUp);

              sideCard.style.removeProperty('transition');
              window.xydyIsInteractingWithComments = false;

              // Save coordinates and persist to chrome storage
              lastStyles = {
                left: sideCard.style.left,
                top: sideCard.style.top,
                width: sideCard.style.width,
                height: sideCard.style.height
              };
              localStorage.setItem('comments_panel_styles', JSON.stringify(lastStyles));
            }

            dragHandle.addEventListener('pointermove', onPointerMove);
            dragHandle.addEventListener('pointerup', onPointerUp);
          });

          sideCard.appendChild(dragHandle);
        }

        // 2. Inject 8 Resize Handles
        const directions = ['s', 'e', 'w', 'sw', 'se','nw','ne']; // skip n/nw/ne — too close to drag handle
        directions.forEach(dir => {
          const className = `xydy-resize-handle xydy-resize-handle-${dir}`;
          if (!sideCard.querySelector(`.${className.replace(/ /g, '.')}`)) {
            const handle = document.createElement('div');
            handle.className = className;

            handle.addEventListener('pointerdown', (e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.stopPropagation();

              window.xydyIsInteractingWithComments = true;
              handle.setPointerCapture(e.pointerId);

              const parent = sideCard.parentElement;
              if (!parent) return;

              const parentRect = parent.getBoundingClientRect();
              const rect = sideCard.getBoundingClientRect();

              const startX = e.clientX;
              const startY = e.clientY;

              const initialLeft = rect.left - parentRect.left;
              const initialTop = rect.top - parentRect.top;
              const initialWidth = rect.width;
              const initialHeight = rect.height;

              sideCard.style.setProperty('transition', 'none', 'important');
              sideCard.style.setProperty('right', 'auto', 'important');
              sideCard.style.setProperty('bottom', 'auto', 'important');

              function onPointerMove(moveEvent) {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;

                let newLeft = initialLeft;
                let newTop = initialTop;
                let newWidth = initialWidth;
                let newHeight = initialHeight;

                // Handle vertical resizing
                if (dir.includes('n')) {
                  newTop = initialTop + dy;
                  newHeight = initialHeight - dy;
                  if (newHeight < MIN_HEIGHT) {
                    newTop = initialTop + (initialHeight - MIN_HEIGHT);
                    newHeight = MIN_HEIGHT;
                  }
                  if (newTop < HEADER_HEIGHT - parentRect.top) {
                    newHeight = newHeight + newTop - (HEADER_HEIGHT - parentRect.top);
                    newTop = HEADER_HEIGHT - parentRect.top;
                  }
                } else if (dir.includes('s')) {
                  newHeight = initialHeight + dy;
                  newHeight = Math.max(newHeight, MIN_HEIGHT);
                  if (newTop + newHeight > parentRect.height) {
                    newHeight = parentRect.height - newTop;
                  }
                }

                // Handle horizontal resizing
                if (dir.includes('w')) {
                  newLeft = initialLeft + dx;
                  newWidth = initialWidth - dx;
                  if (newWidth < MIN_WIDTH) {
                    newLeft = initialLeft + (initialWidth - MIN_WIDTH);
                    newWidth = MIN_WIDTH;
                  }
                  if (newLeft < (SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left) {
                    newWidth = newWidth + newLeft - ((SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left);
                    newLeft = (SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left;
                  }
                } else if (dir.includes('e')) {
                  newWidth = initialWidth + dx;
                  newWidth = Math.max(newWidth, MIN_WIDTH);
                  if (newLeft + newWidth > parentRect.width) {
                    newWidth = parentRect.width - newLeft;
                  }
                }

                sideCard.style.setProperty('left', newLeft + 'px', 'important');
                sideCard.style.setProperty('top', newTop + 'px', 'important');
                sideCard.style.setProperty('width', newWidth + 'px', 'important');
                sideCard.style.setProperty('height', newHeight + 'px', 'important');
              }

              function onPointerUp(upEvent) {
                handle.releasePointerCapture(upEvent.pointerId);
                handle.removeEventListener('pointermove', onPointerMove);
                handle.removeEventListener('pointerup', onPointerUp);

                sideCard.style.removeProperty('transition');
                window.xydyIsInteractingWithComments = false;

                // Save coordinates and persist to chrome storage
                lastStyles = {
                  left: sideCard.style.left,
                  top: sideCard.style.top,
                  width: sideCard.style.width,
                  height: sideCard.style.height
                };
                localStorage.setItem('comments_panel_styles', JSON.stringify(lastStyles));
              }

              handle.addEventListener('pointermove', onPointerMove);
              handle.addEventListener('pointerup', onPointerUp);
            });

            sideCard.appendChild(handle);
          }
        });
      }

      function hasRealCommentContent(sideCard) {
        if (!sideCard) return false;
        if (!utils.queryFirst(app.constants.SELECTORS.sideCardContent, sideCard)) return false;
        const html = sideCard.innerHTML;
        const text = (sideCard.innerText || "").replace(/\s+/g, "");

        // If it contains AI related text or classes, it is valid (AI tab starts with short content or loading skeleton)
        if (/(AI|\u95eeAI|\u667a\u80fd|ai-douyin)/i.test(text) || html.includes('ai-') || html.includes('AI')) {
          return html.length > 200;
        }

        if (html.length < 1200) return false;
        if (/(评论|全部评论|详情|相关推荐)/.test(text)) return true;
        return text.length > 20;
      }

      function keepPanelInViewport(sideCard) {
        if (!sideCard || !hasRealCommentContent(sideCard)) return;
        if (app.commentsDock && app.commentsDock.applyGeometry(sideCard)) return;

        const parent = sideCard.parentElement;
        const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const rect = sideCard.getBoundingClientRect();
        const width = Math.min(Math.max(rect.width || 420, MIN_WIDTH), Math.max(MIN_WIDTH, window.innerWidth - EDGE_GAP * 2));
        const height = Math.min(Math.max(rect.height || 400, MIN_HEIGHT), Math.max(MIN_HEIGHT, window.innerHeight - 96));

        let left = rect.left - parentRect.left;
        let top = rect.top - parentRect.top;
        const minLeft = (SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left;
        const maxLeft = window.innerWidth - EDGE_GAP - width - parentRect.left;
        const minTop = HEADER_HEIGHT - parentRect.top;
        const maxTop = window.innerHeight - EDGE_GAP - height - parentRect.top;

        if (!Number.isFinite(left) || rect.right < EDGE_GAP || rect.left > window.innerWidth - EDGE_GAP) {
          left = window.innerWidth - EDGE_GAP - width - parentRect.left;
        }
        if (!Number.isFinite(top) || rect.bottom < 56 || rect.top > window.innerHeight - EDGE_GAP) {
          top = 76 - parentRect.top;
        }

        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));

        sideCard.style.setProperty('right', 'auto', 'important');
        sideCard.style.setProperty('bottom', 'auto', 'important');
        sideCard.style.setProperty('left', left + 'px', 'important');
        sideCard.style.setProperty('top', top + 'px', 'important');
        sideCard.style.setProperty('width', width + 'px', 'important');
        sideCard.style.setProperty('height', height + 'px', 'important');
      }

      function applyPanelGeometry(sideCard) {
        if (!sideCard) return;
        if (app.commentsDock && app.commentsDock.applyGeometry(sideCard)) return;
        // 正在拖拽/缩放时跳过，防止把面板拉回上次保存的位置
        if (window.xydyIsInteractingWithComments) return;

        const parent = sideCard.parentElement;
        const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const rect = sideCard.getBoundingClientRect();
        const savedWidth = parseFloat(lastStyles && lastStyles.width);
        const savedHeight = parseFloat(lastStyles && lastStyles.height);
        const savedLeft = parseFloat(lastStyles && lastStyles.left);
        const savedTop = parseFloat(lastStyles && lastStyles.top);
        const width = Math.min(Math.max(savedWidth || rect.width || 420, MIN_WIDTH), Math.max(MIN_WIDTH, window.innerWidth - EDGE_GAP * 2));
        const height = Math.min(Math.max(savedHeight || rect.height || window.innerHeight - 160, MIN_HEIGHT), Math.max(MIN_HEIGHT, window.innerHeight - 96));

        const minLeft = (SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left;
        const maxLeft = window.innerWidth - EDGE_GAP - width - parentRect.left;
        const minTop = HEADER_HEIGHT - parentRect.top;
        const maxTop = window.innerHeight - EDGE_GAP - height - parentRect.top;

        let left = rect.left - parentRect.left;
        let top = rect.top - parentRect.top;
        left = Number.isFinite(savedLeft) ? savedLeft : left;
        top = Number.isFinite(savedTop) ? savedTop : top;

        if (!Number.isFinite(left) || (!Number.isFinite(savedLeft) && (rect.width <= 0 || rect.right < EDGE_GAP || rect.left > window.innerWidth - EDGE_GAP || rect.right > window.innerWidth))) {
          left = window.innerWidth - EDGE_GAP - width - parentRect.left;
        }
        if (!Number.isFinite(top) || (!Number.isFinite(savedTop) && (rect.height <= 0 || rect.bottom < 56 || rect.top > window.innerHeight - EDGE_GAP || rect.bottom > window.innerHeight))) {
          top = 76 - parentRect.top;
        }

        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));

        sideCard.style.setProperty('right', 'auto', 'important');
        sideCard.style.setProperty('bottom', 'auto', 'important');
        sideCard.style.setProperty('left', left + 'px', 'important');
        sideCard.style.setProperty('top', top + 'px', 'important');
        sideCard.style.setProperty('width', width + 'px', 'important');
        sideCard.style.setProperty('height', height + 'px', 'important');
      }

      function setupGeometryObserver() {
        if (geometryObserver) geometryObserver.disconnect();
        geometryObserver = new MutationObserver((mutations) => {
          if (!canRun() || window.xydyIsInteractingWithComments) return;
          const sideCard = document.getElementById('videoSideCard');
          if (!sideCard) return;
          const containsPanel = node => node instanceof Element &&
            (node === sideCard || node.contains(sideCard));
          if (mutations.some(mutation => sideCard.contains(mutation.target) ||
            [...mutation.addedNodes].some(containsPanel))) {
            applyPanelGeometry(sideCard);
          }
        });
        geometryObserver.observe(document.documentElement, {
          childList: true, subtree: true, attributes: true, attributeFilter: ['class']
        });
        if (canRun()) applyPanelGeometry(document.getElementById('videoSideCard'));
      }

      function setupScanner() {
        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(() => {
          if (!canRun()) return;
          // 正在拖拽/缩放时别干扰，等用户松手再恢复
          if (window.xydyIsInteractingWithComments) return;
          const sideCard = document.getElementById('videoSideCard');
          if (!sideCard) {
            activeSideCard = null;
            return;
          }
          if (preferredClosed) document.documentElement.classList.add('xydy-comments-force-hidden');

          // Check if active tab is AI tab and toggle class to preserve native styling/backgrounds
          const activeTab = sideCard.querySelector('.semi-tabs-tab-active, [class*="semi-tabs-tab-active"]');
          const isAITab = activeTab && (
            activeTab.id === 'semiTabai_card' ||
            activeTab.textContent.includes('AI') ||
            activeTab.className.includes('ai-')
          );
          if (isAITab) {
            sideCard.classList.add('xydy-is-ai-tab');
          } else {
            sideCard.classList.remove('xydy-is-ai-tab');
          }

          if (sideCard !== activeSideCard) {
            activeSideCard = sideCard;
            injectInteractiveHandles(sideCard);
          } else {
            // Re-check content readiness on every scan
            injectInteractiveHandles(sideCard);
          }

        }, 800);
      }

      function isSideCardVisible(sideCard) {
        if (!sideCard || document.documentElement.classList.contains('xydy-comments-force-hidden')) {
          return false;
        }

        const rect = sideCard.getBoundingClientRect();
        const style = getComputedStyle(sideCard);
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0.01 &&
          rect.width > 20 &&
          rect.height > 20 &&
          rect.right > 0 &&
          rect.left < window.innerWidth;
      }

      function hidePanelWithFallback() {
        visibilityRevision++;
        preferredClosed = true;
        try { localStorage.setItem(visibilityKey, 'closed'); } catch (error) {}
        window.xydyCommentsOpening = false;
        window.xydyCommentsProtectUntil = 0;
        document.documentElement.classList.add('xydy-comments-force-hidden');
      }

      function showPanelWithFallback() {
        visibilityRevision++;
        preferredClosed = false;
        try { localStorage.setItem(visibilityKey, 'open'); } catch (error) {}
        document.documentElement.classList.remove('xydy-comments-force-hidden');
      }

      function triggerPanelOpening() {
        window.xydyCommentsProtectUntil = Date.now() + 2000; // 2s protection window
        window.xydyCommentsOpening = true;
        showPanelWithFallback();

        const sideCard = document.getElementById('videoSideCard');
        if (sideCard) {
          sideCard.dataset.xydyCommentsState = "loading";
          sideCard.dataset.xydyCommentsMounted = "true";
          applyPanelGeometry(sideCard);
        }
      }

      function schedulePanelOpening() {
        const revision = visibilityRevision;
        window.setTimeout(() => {
          if (revision === visibilityRevision) triggerPanelOpening();
        }, 60);
      }

      function togglePanelFromShortcut() {
        const sideCard = document.getElementById('videoSideCard');
        closeChapterPanel();
        if (preferredClosed || document.documentElement.classList.contains('xydy-comments-force-hidden') || !isSideCardVisible(sideCard)) {
          triggerPanelOpening();
          if (!hasRealCommentContent(sideCard)) {
            utils.tapSyntheticKey('x');
          }
          return true;
        }
        hidePanelWithFallback();
        utils.tapSyntheticKey('x');
        return true;
      }

      function closeChapterPanel() {
        const selectors = app.constants.SELECTORS;
        utils.queryAll(selectors.videoSlide).forEach((slide) => {
          const rect = slide.getBoundingClientRect();
          if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
          const panel = utils.queryFirst(selectors.chapterPanel, slide);
          if (!panel || panel.offsetWidth <= 50) return;
          const closeButton = utils.queryFirst(selectors.chapterClose, slide);
          if (closeButton) {
            closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          }
        });
      }

      function bindCloseFallback() {
        if (closeListenerBound) return;
        closeListenerBound = true;

        const handleInteraction = (event) => {
          if (!canRun() || !(event.target instanceof Element)) return;
          const authorBtn = event.target.closest(app.constants.SELECTORS.authorAvatar.join(','));
          const commentBtn = event.target.closest('[data-e2e="feed-comment-icon"]');
          if (commentBtn) closeChapterPanel();
          const aiBtn = event.target.closest('.ai-douyin-entry, [class*="ai-douyin"]');
          const rightContainer = event.target.closest('.rDq18SJg, [class*="immersive-player-switch-on-hide-interaction-area"], .gvcmX2Lf');
          const isAITextClick = rightContainer && (
            event.target.textContent && (
              event.target.textContent.trim() === 'AI' ||
              event.target.textContent.includes('问AI') ||
              event.target.textContent.includes('智能')
            )
          );

          if (commentBtn || aiBtn || isAITextClick || (authorBtn && !isSideCardVisible(document.getElementById('videoSideCard')))) {
            // DO NOT change geometry or styles synchronously during click capture phase!
            // Wait for native React event loop to finish executing the click, then open our custom layout.
            // This guarantees React routes and mounts the panel natively first without browser click cancellation.
            schedulePanelOpening();
          }
        };

        // ONLY bind to click capture. DO NOT intercept pointerdown to avoid browser click cancellation.
        document.addEventListener('click', handleInteraction, true);

        // Standard card close interception
        document.addEventListener('click', (event) => {
          const sideCard = document.getElementById('videoSideCard');
          if (!sideCard || !sideCard.contains(event.target)) return;
          if (event.target.closest('.xydy-drag-handle, .xydy-resize-handle, .xydy-comments-pin, .xydy-comments-dock-resize')) return;

          const rect = sideCard.getBoundingClientRect();
          const inNativeCloseHotspot =
            event.clientX >= rect.right - 64 &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.top + 64;

          if (inNativeCloseHotspot) {
            hidePanelWithFallback();
          }
        }, true);

        document.addEventListener('keydown', (event) => {
          if (!canRun() || !event.isTrusted || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) return;
          if ((event.key || '').toLowerCase() === 'f' && !isSideCardVisible(document.getElementById('videoSideCard'))) {
            schedulePanelOpening();
            return;
          }
          if (event.isTrusted && event.key && event.key.toLowerCase() === 'x' && !event.altKey && !event.ctrlKey && !event.metaKey) {
            const wasVisible = isSideCardVisible(document.getElementById('videoSideCard'));
            closeChapterPanel();
            if (!wasVisible) {
              triggerPanelOpening();
            } else {
              hidePanelWithFallback();
            }
          }
        }, true);

        document.addEventListener('xydy-comments-toggle', togglePanelFromShortcut);
        document.documentElement.dataset.xydyCommentsBridge = 'on';
        window.XYDYCommentsPanel = Object.assign(window.XYDYCommentsPanel || {}, {
          toggleFromShortcut: togglePanelFromShortcut,
          show: showPanelWithFallback,
          hide: hidePanelWithFallback,
          isOpen: function isOpen() { return isSideCardVisible(document.getElementById('videoSideCard')); },
          restoreGeometry: function restoreGeometry(styles) {
            lastStyles = styles;
            localStorage.setItem('comments_panel_styles', JSON.stringify(lastStyles));
            applyPanelGeometry(document.getElementById('videoSideCard'));
          },
          keepInViewport: function keepCurrentInViewport() {
            applyPanelGeometry(document.getElementById('videoSideCard'));
          }
        });
      }

      return {
        init: function init() {
          bindCloseFallback();
          window.addEventListener('resize', () => {
            applyPanelGeometry(document.getElementById('videoSideCard'));
          }, { passive: true });
          setupGeometryObserver();
          setupScanner();
        },
        destroy: function destroy() {
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
          if (geometryObserver) geometryObserver.disconnect();
          geometryObserver = null;
          activeSideCard = null;
        }
      };
    }
  });
})(window);
