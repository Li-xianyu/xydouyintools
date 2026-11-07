(function registerContextMenuModule(global) {
  const app = global.XYDYExtension;
  const icons = {
    settings: '<path d="m9.5 3-.5 2-1.7 1-2-.5-2.5 4.3 1.5 1.5v2l-1.5 1.4 2.5 4.3 2-.5 1.7 1 .5 2h5l.5-2 1.7-1 2 .5 2.5-4.3-1.5-1.4v-2l1.5-1.5-2.5-4.3-2 .5-1.7-1-.5-2Z"/><circle cx="12" cy="12" r="3"/>',
    clean: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    comment: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 10 10 0 0 1-4-.8L3 21l1.8-5A9 9 0 1 1 21 11.5Z"/>',
    like: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    author: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"/>',
    friends: '<path d="m22 2-7 20-4-9L2 9l20-7ZM22 2 11 13"/>',
    share: '<path d="M12 16V3m-5 5 5-5 5 5M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>',
    dislike: '<circle cx="12" cy="12" r="9"/><path d="m6 6 12 12"/>',
    feedback: '<path d="M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9Z"/><path d="M12 7v4m0 3h.01"/>',
    report: '<path d="M4 22V3c5-3 9 3 16 0v12c-7 3-11-3-16 0"/>',
    detail: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 8 4 4-4 4"/>'
  };
  const actions = {
    '清屏': 'clean', '评论': 'comment', '赞': 'like', '取消赞': 'like',
    '进入作者主页': 'author', '推荐给朋友': 'friends', '分享': 'share',
    '不感兴趣': 'dislike', '意见反馈': 'feedback', '举报': 'report', '进入详情页': 'detail'
  };

  app.registerContentModule({
    id: 'context-menu',
    create(context) {
      const selectors = app.constants.SELECTORS;
      const surfaceSelector = selectors.contextMenuSurface.join(',');
      const rowsSelector = selectors.contextMenuRows.join(',');
      const labelSelector = selectors.contextMenuLabel.join(',');
      const shortcutSelector = selectors.contextMenuShortcut.join(',');
      const surfaces = new Map();
      let observer = null;
      let sizeObserver = null;
      let frame = null;
      let lastPoint = null;
      let disposed = false;

      function enabled() {
        return context.getSettings().features.styles && app.utils.isImmersiveVideoPage();
      }

      function injectSettings(menu) {
        let entry = menu.querySelector(':scope > .xydy-context-settings');
        if (!entry) {
          entry = document.createElement('button');
          entry.className = 'xydy-context-settings';
          entry.type = 'button';
          entry.setAttribute('aria-keyshortcuts', 'Alt+X');
          entry.style.setProperty('--xydy-menu-index', '0');
          entry.innerHTML = '<span class="xydy-context-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + icons.settings + '</svg></span><span class="xydy-context-settings-label">xyDouYinTools 设置</span><span class="ccZxuS3y" data-xydy-key="Alt + X" aria-hidden="true">Alt + X</span>';
          entry.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            if (app.settingsDialog) app.settingsDialog.open();
            else document.dispatchEvent(new Event('xydy-open-settings'));
          });
        }
        if (menu.firstElementChild !== entry) menu.prepend(entry);
        let divider = menu.querySelector(':scope > .xydy-context-settings-divider');
        if (!divider) {
          divider = document.createElement('div');
          divider.className = 'xydy-context-settings-divider';
          divider.setAttribute('role', 'separator');
        }
        if (entry.nextElementSibling !== divider) entry.after(divider);
      }

      function decorate(menu) {
        injectSettings(menu);
        [...menu.querySelectorAll(rowsSelector)].forEach((row, index) => {
          const label = row.querySelector(labelSelector);
          if (!label && row.tagName !== 'A') return;
          const text = (label || row).textContent.trim();
          const action = actions[text];
          if (action && !row.querySelector('.xydy-context-icon')) {
            const icon = document.createElement('span');
            icon.className = 'xydy-context-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">' + icons[action] + '</svg>';
            row.prepend(icon);
          }
          if (row.dataset.xydyContextAction !== (action || 'other')) row.dataset.xydyContextAction = action || 'other';
          const group = ['author', 'dislike', 'feedback'].includes(action) && index > 0;
          if (group && row.dataset.xydyContextGroup !== 'true') row.dataset.xydyContextGroup = 'true';
          if (!group && row.dataset.xydyContextGroup) delete row.dataset.xydyContextGroup;
          if (row.style.getPropertyValue('--xydy-menu-index') !== String(index + 1)) row.style.setProperty('--xydy-menu-index', String(index + 1));
          const shortcut = row.querySelector(shortcutSelector);
          if (shortcut) {
            const key = shortcut.textContent.replace(/[()（）\s]/g, '');
            if (shortcut.dataset.xydyKey !== key) shortcut.dataset.xydyKey = key;
          }
        });
      }

      function fit(menu) {
        const rect = menu.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(8, Math.min(rect.left, innerWidth - rect.width - 8));
        const y = Math.max(8, Math.min(rect.top, innerHeight - rect.height - 8));
        if (Math.abs(x - rect.left) > .5) menu.style.left = (parseFloat(menu.style.left) || 0) + x - rect.left + 'px';
        if (Math.abs(y - rect.top) > .5) menu.style.top = (parseFloat(menu.style.top) || 0) + y - rect.top + 'px';
      }

      function release(menu, state) {
        state.observer.disconnect();
        sizeObserver.unobserve(menu);
        menu.querySelectorAll('.xydy-context-settings, .xydy-context-settings-divider').forEach(element => element.remove());
        menu.querySelectorAll('.xydy-context-icon').forEach(icon => icon.remove());
        menu.querySelectorAll('[data-xydy-context-action]').forEach(row => {
          delete row.dataset.xydyContextAction;
          delete row.dataset.xydyContextGroup;
          row.style.removeProperty('--xydy-menu-index');
        });
        menu.querySelectorAll('[data-xydy-key]').forEach(element => delete element.dataset.xydyKey);
        menu.style.removeProperty('--xydy-context-origin');
        surfaces.delete(menu);
      }

      function sync() {
        frame = null;
        if (disposed) return;
        if (!enabled()) {
          [...surfaces].forEach(([menu, state]) => release(menu, state));
          return;
        }
        const current = [...document.querySelectorAll(surfaceSelector)];
        [...surfaces].forEach(([menu, state]) => { if (!current.includes(menu)) release(menu, state); });
        current.forEach(menu => {
          if (!surfaces.has(menu)) {
            const mutationObserver = new MutationObserver(schedule);
            mutationObserver.observe(menu, { attributes: true, attributeFilter: ['style', 'class'], childList: true });
            surfaces.set(menu, { observer: mutationObserver });
            sizeObserver.observe(menu);
            const origin = lastPoint && lastPoint.x > innerWidth - 260 ? 'right' : 'left';
            menu.style.setProperty('--xydy-context-origin', origin + ' top');
          }
          decorate(menu);
          fit(menu);
        });
      }

      function schedule() {
        if (frame === null && !disposed) frame = requestAnimationFrame(sync);
      }

      function onContextMenu(event) {
        lastPoint = { x: event.clientX, y: event.clientY };
        schedule();
      }

      return {
        init() {
          sizeObserver = new ResizeObserver(schedule);
          observer = new MutationObserver(mutations => {
            const relevant = node => node instanceof Element && (node.matches(surfaceSelector) || node.querySelector(surfaceSelector) || [...surfaces.keys()].some(menu => node === menu || node.contains(menu)));
            if (mutations.some(mutation => [...mutation.addedNodes, ...mutation.removedNodes].some(relevant))) schedule();
          });
          observer.observe(document.documentElement, { childList: true, subtree: true });
          window.addEventListener('contextmenu', onContextMenu, true);
          window.addEventListener('resize', schedule, { passive: true });
          schedule();
        },
        onSettingsChange: schedule,
        destroy() {
          disposed = true;
          if (frame !== null) cancelAnimationFrame(frame);
          observer?.disconnect();
          [...surfaces].forEach(([menu, state]) => release(menu, state));
          sizeObserver?.disconnect();
          window.removeEventListener('contextmenu', onContextMenu, true);
          window.removeEventListener('resize', schedule);
        }
      };
    }
  });
})(globalThis);
