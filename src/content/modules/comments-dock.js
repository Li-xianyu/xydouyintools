(function registerCommentsDockModule(global) {
  const app = global.XYDYExtension;

  app.registerContentModule({
    id: 'comments-dock',
    create(context) {
      const panelSelector = app.constants.SELECTORS.commentsPanel.join(',');
      const playerSelector = app.constants.SELECTORS.playerContainer.join(',');
      const storageKey = app.constants.STORAGE.commentsDockKey;
      const geometryProperties = ['left', 'top', 'right', 'bottom', 'width', 'height'];
      let state = { pinned: false, width: 320, floating: null };
      let panel = null;
      let host = null;
      let player = null;
      let button = null;
      let resizeHandle = null;
      let resize = null;
      let frame = null;
      let observer = null;
      let panelObserver = null;
      let rootObserver = null;
      let sizeObserver = null;
      let disposed = false;
      const transitionedPlayers = new Set();

      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved) state = { pinned: saved.pinned === true, width: Number(saved.width) || 320, floating: saved.floating || null };
      } catch (error) {}

      function persist() {
        try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (error) {}
      }

      function setStyle(element, property, value) {
        if (element.style.getPropertyValue(property) !== value || element.style.getPropertyPriority(property) !== 'important') {
          element.style.setProperty(property, value, 'important');
        }
      }

      function enabled() {
        return context.getSettings().features.styles && app.utils.isImmersiveVideoPage();
      }

      function clearAvoidance() {
        if (player) {
          player.removeAttribute('data-xydy-comments-avoid');
          player.style.removeProperty('--xydy-comments-reserved');
        }
      }

      function applyGeometry(sideCard) {
        if (disposed || !sideCard || !state.pinned || !enabled()) return false;
        const parent = sideCard.parentElement;
        if (!parent) return false;
        const bounds = parent.getBoundingClientRect();
        const right = Math.min(bounds.right, innerWidth);
        const left = Math.max(bounds.left, 0);
        const available = Math.max(0, right - left);
        if (available < 480) return false;
        const width = Math.max(240, Math.min(state.width, 480, available * .48));
        const gap = 16;
        const top = Math.max(bounds.top + gap, innerHeight > 480 ? 64 : gap);
        const height = Math.max(180, Math.min(bounds.bottom, innerHeight) - top - gap);
        setStyle(sideCard, 'left', right - bounds.left - width - gap + 'px');
        setStyle(sideCard, 'right', 'auto');
        setStyle(sideCard, 'top', top - bounds.top + 'px');
        setStyle(sideCard, 'bottom', 'auto');
        setStyle(sideCard, 'width', width + 'px');
        setStyle(sideCard, 'height', height + 'px');
        if (sideCard.dataset.xydyCommentsDock !== 'on') sideCard.dataset.xydyCommentsDock = 'on';
        return true;
      }

      function isOpen() {
        if (!panel || !host || document.documentElement.classList.contains('xydy-comments-force-hidden')) return false;
        if (panel.dataset.xydyCommentsState === 'idle') return false;
        const bounds = host.getBoundingClientRect();
        if (bounds.bottom <= 0 || bounds.top >= innerHeight || bounds.right <= 0 || bounds.left >= innerWidth) return false;
        const style = getComputedStyle(panel);
        return style.display !== 'none' && style.visibility !== 'hidden' && panel.offsetWidth > 20 &&
          (panel.dataset.xydyCommentsMounted === 'true' || panel.dataset.xydyCommentsState === 'ready');
      }

      function updateButton() {
        if (!button) return;
        button.setAttribute('aria-pressed', String(state.pinned));
        const label = state.pinned ? '取消固定，恢复浮窗' : '固定到右侧，视频避让';
        button.setAttribute('aria-label', label);
        button.title = label;
      }

      function rememberFloating() {
        if (!panel || panel.dataset.xydyCommentsDock === 'on') return;
        const rect = panel.getBoundingClientRect();
        const bounds = panel.parentElement.getBoundingClientRect();
        state.floating = { left: rect.left - bounds.left + 'px', top: rect.top - bounds.top + 'px', right: 'auto', bottom: 'auto', width: rect.width + 'px', height: rect.height + 'px' };
      }

      function restoreFloating(sideCard) {
        if (!sideCard) return;
        delete sideCard.dataset.xydyCommentsDock;
        if (state.floating) {
          geometryProperties.forEach(property => {
            if (state.floating[property]) setStyle(sideCard, property, state.floating[property]);
          });
          if (window.XYDYCommentsPanel && typeof window.XYDYCommentsPanel.restoreGeometry === 'function') {
            window.XYDYCommentsPanel.restoreGeometry(state.floating);
          }
        }
      }

      function toggle() {
        if (!panel || !enabled()) return;
        finishResize();
        if (!state.pinned) rememberFloating();
        state.pinned = !state.pinned;
        if (!state.pinned) {
          clearAvoidance();
          restoreFloating(panel);
        }
        persist();
        updateButton();
        sync();
      }

      function injectControls() {
        if (!panel) return;
        button = panel.querySelector('.xydy-comments-pin');
        if (!button) {
          button = document.createElement('button');
          button.className = 'xydy-comments-pin';
          button.type = 'button';
          button.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4v5l-3 3v2h14v-2l-3-3V4M7 4h10M12 14v7"/></svg>';
          panel.append(button);
        }
        updateButton();
        resizeHandle = panel.querySelector('.xydy-comments-dock-resize');
        if (!resizeHandle) {
          resizeHandle = document.createElement('div');
          resizeHandle.className = 'xydy-comments-dock-resize';
          resizeHandle.tabIndex = 0;
          resizeHandle.setAttribute('role', 'separator');
          resizeHandle.setAttribute('aria-orientation', 'vertical');
          resizeHandle.setAttribute('aria-label', '调整固定评论栏宽度');
          resizeHandle.addEventListener('pointerdown', startResize);
          resizeHandle.addEventListener('pointermove', moveResize);
          resizeHandle.addEventListener('pointerup', finishResize);
          resizeHandle.addEventListener('pointercancel', finishResize);
          resizeHandle.addEventListener('lostpointercapture', finishResize);
          resizeHandle.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            event.stopPropagation();
            state.width = Math.max(240, Math.min(480, state.width + (event.key === 'ArrowLeft' ? 16 : -16)));
            persist();
            sync();
          });
          panel.append(resizeHandle);
        }
      }

      function startResize(event) {
        if (!state.pinned || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        resize = { pointerId: event.pointerId, x: event.clientX, width: panel.getBoundingClientRect().width, handle: event.currentTarget };
        window.xydyIsInteractingWithComments = true;
        resize.handle.setPointerCapture(event.pointerId);
        player?.setAttribute('data-xydy-comments-resizing', 'true');
      }

      function moveResize(event) {
        if (!resize || event.pointerId !== resize.pointerId) return;
        if (!(event.buttons & 1)) { finishResize(); return; }
        event.preventDefault();
        event.stopPropagation();
        state.width = Math.max(240, Math.min(480, resize.width + resize.x - event.clientX));
        schedule();
      }

      function finishResize() {
        if (!resize) return;
        const previous = resize;
        resize = null;
        if (previous.handle.hasPointerCapture(previous.pointerId)) previous.handle.releasePointerCapture(previous.pointerId);
        window.xydyIsInteractingWithComments = false;
        player?.removeAttribute('data-xydy-comments-resizing');
        persist();
        schedule();
      }

      function detachPanel() {
        finishResize();
        clearAvoidance();
        panelObserver?.disconnect();
        sizeObserver?.disconnect();
        if (panel) {
          restoreFloating(panel);
          panel.querySelectorAll('.xydy-comments-pin, .xydy-comments-dock-resize').forEach(element => element.remove());
        }
        panel = host = player = button = resizeHandle = null;
      }

      function sync() {
        frame = null;
        if (disposed) return;
        const current = document.querySelector(panelSelector);
        const currentHost = current && current.parentElement;
        const currentPlayer = currentHost && [...currentHost.children].find(element => element.matches(playerSelector));
        if (current !== panel || currentHost !== host || currentPlayer !== player) {
          detachPanel();
          panel = current;
          host = currentHost;
          player = currentPlayer;
          if (panel) {
            panelObserver.observe(panel, { attributes: true, attributeFilter: ['style', 'class', 'data-xydy-comments-state', 'data-xydy-comments-mounted'] });
            if (host) sizeObserver.observe(host);
          }
        }
        if (!panel) return;
        if (!enabled()) {
          clearAvoidance();
          if (panel.dataset.xydyCommentsDock) restoreFloating(panel);
          return;
        }
        injectControls();
        const docked = state.pinned && isOpen() && applyGeometry(panel);
        if (!docked) {
          clearAvoidance();
          if (panel.dataset.xydyCommentsDock === 'on' && (!state.pinned || !isOpen())) delete panel.dataset.xydyCommentsDock;
          return;
        }
        if (!player) return;
        const width = parseFloat(panel.style.width);
        const reserved = width + 32 + 'px';
        if (player.style.getPropertyValue('--xydy-comments-reserved') !== reserved) player.style.setProperty('--xydy-comments-reserved', reserved);
        if (player.dataset.xydyCommentsAvoid !== 'on') player.dataset.xydyCommentsAvoid = 'on';
        if (player.dataset.xydyCommentsTransition !== 'on') player.dataset.xydyCommentsTransition = 'on';
        transitionedPlayers.add(player);
        resizeHandle.setAttribute('aria-valuenow', String(Math.round(width)));
        resizeHandle.setAttribute('aria-valuemin', '240');
        resizeHandle.setAttribute('aria-valuemax', '480');
      }

      function schedule() {
        if (frame === null && !disposed) frame = requestAnimationFrame(sync);
      }

      function onClick(event) {
        if (!(event.target instanceof Element) || !event.target.closest('.xydy-comments-pin')) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        toggle();
      }

      const api = { applyGeometry, isPinned: () => state.pinned };
      return {
        init() {
          app.commentsDock = api;
          panelObserver = new MutationObserver(schedule);
          sizeObserver = new ResizeObserver(schedule);
          rootObserver = new MutationObserver(schedule);
          rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-xydy-styles'] });
          observer = new MutationObserver(mutations => {
            const relevant = node => node instanceof Element && (node === panel || node === host || node.matches(panelSelector) || node.querySelector(panelSelector));
            if (mutations.some(mutation => [...mutation.addedNodes, ...mutation.removedNodes].some(relevant))) schedule();
          });
          observer.observe(document.documentElement, { childList: true, subtree: true });
          window.addEventListener('click', onClick, true);
          window.addEventListener('resize', schedule, { passive: true });
          window.addEventListener('blur', finishResize);
          schedule();
        },
        onSettingsChange: schedule,
        destroy() {
          disposed = true;
          if (frame !== null) cancelAnimationFrame(frame);
          observer?.disconnect();
          rootObserver?.disconnect();
          detachPanel();
          transitionedPlayers.forEach(element => { delete element.dataset.xydyCommentsTransition; delete element.dataset.xydyCommentsResizing; });
          window.removeEventListener('click', onClick, true);
          window.removeEventListener('resize', schedule);
          window.removeEventListener('blur', finishResize);
          if (app.commentsDock === api) delete app.commentsDock;
        }
      };
    }
  });
})(globalThis);
