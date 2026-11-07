(function registerSettingsDialogModule(global) {
  const app = global.XYDYExtension;
  const constants = app.constants;

  app.registerContentModule({
    id: "hotkeys",
    create: function createSettingsDialog(context) {
      let dialog = null;
      let previousFocus = null;
      let closeTimer = null;
      let saving = Promise.resolve();
      let disposed = false;
      let revealAll = false;
      let revealKeyHeld = false;

      function syncRevealAll() {
        if (revealAll && location.host === 'www.douyin.com' && app.utils.isImmersiveVideoPage()) {
          document.documentElement.dataset.xydyReveal = 'on';
        } else {
          delete document.documentElement.dataset.xydyReveal;
        }
      }

      function splitList(value) {
        return String(value || "").split(/[\n,，]+/).map(value => value.trim()).filter(Boolean);
      }

      function setStatus(text, error) {
        if (!dialog) return;
        const status = dialog.querySelector('[data-status]');
        status.textContent = text;
        status.dataset.error = error ? "true" : "false";
      }

      function render(settings) {
        if (!dialog) return;
        dialog.dataset.material = settings.features.liquidGlass && settings.features.styles ? "liquid" : "frosted";
        dialog.querySelectorAll('[data-feature]').forEach(input => {
          input.checked = !!settings.features[input.dataset.feature];
        });
        dialog.querySelector('[data-sidebar="hideRequested"]').checked = settings.sidebar.hideRequested;
        dialog.querySelector('[data-sidebar="locked"]').checked = settings.sidebar.locked;
        dialog.querySelectorAll('[data-header-entry]').forEach(input => {
          input.checked = settings.headerEntries[input.dataset.headerEntry];
        });
        dialog.querySelectorAll('[data-theme-color]').forEach(button => {
          const active = button.dataset.themeColor === settings.appearance.themeColor;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        dialog.querySelectorAll('.xydy-settings-segment').forEach(group => {
          const checked = group.querySelector('input').checked;
          group.querySelectorAll('button').forEach(button => {
            const active = (button.dataset.value === 'true') === checked;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
          });
        });
        dialog.querySelectorAll('[data-list]').forEach(input => {
          if (input !== document.activeElement) input.value = settings.ads[input.dataset.list].join("\n");
        });
      }

      function persist(patch, reset) {
        setStatus("保存中…");
        saving = saving.catch(() => {}).then(async () => {
          const settings = reset ? await app.storage.saveSettings(constants.DEFAULT_SETTINGS) : await app.storage.patchSettings(patch);
          app.runtime.reloadSettings(settings);
          render(settings);
          setStatus("已保存，立即生效");
        }).catch(error => {
          setStatus("保存失败，请重试", true);
          context.log("settings-dialog", "保存设置失败", String(error));
        });
        return saving;
      }

      function close() {
        if (!dialog || !dialog.open || closeTimer) return;
        dialog.classList.remove('xydy-settings-visible');
        closeTimer = setTimeout(() => {
          closeTimer = null;
          dialog.close();
          if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180);
      }

      function ensureDialog() {
        if (dialog) return dialog;
        dialog = document.createElement('dialog');
        dialog.id = 'xydy-settings-dialog';
        dialog.setAttribute('aria-labelledby', 'xydy-settings-title');
        dialog.innerHTML = `
          <div class="xydy-settings-background" aria-hidden="true"></div>
          <div class="xydy-settings-shell">
            <header class="xydy-settings-header">
              <div><span class="xydy-settings-eyebrow">xyDouYinTools</span><h2 id="xydy-settings-title">抖音设置</h2></div>
              <button type="button" class="xydy-settings-close" data-close aria-label="关闭设置">×</button>
            </header>
            <nav class="xydy-settings-tabs" role="tablist" aria-label="设置分类"></nav>
            <div class="xydy-settings-body">
              <section data-view="general" role="tabpanel"><h3>浏览与操作</h3><div data-features="general"></div><h3 class="xydy-settings-subheading">侧边栏行为</h3><div data-sidebar-options></div></section>
              <section data-view="visual" role="tabpanel" hidden><h3>界面与材质</h3><div data-features="visual"></div><h3 class="xydy-settings-subheading">主题颜色</h3><p class="xydy-settings-hint">替换按钮、未读角标、关注图标和搜索推荐等界面强调色。开启界面样式美化后生效，支持磨砂与液态玻璃。</p><div class="xydy-settings-colors" data-theme-colors role="group" aria-label="主题颜色"></div><h3 class="xydy-settings-subheading">顶栏入口</h3><p class="xydy-settings-hint">单独选择各入口是否显示。全部隐藏后仍可按 Alt + X 打开设置。</p><div data-header-entry-options></div></section>
              <section data-view="filters" role="tabpanel" hidden><div class="xydy-settings-section-title"><h3>过滤词库</h3><button type="button" data-reset-lists>恢复默认词库</button></div>
                <div class="xydy-settings-lists"><label>关键词<small>一行一个，也支持逗号分隔</small><textarea data-list="blockedKeywords" rows="7" placeholder="输入要过滤的关键词"></textarea></label>
                <label>作者黑名单<small>支持部分匹配，例如：王者荣耀</small><textarea data-list="blockedAuthors" rows="7" placeholder="输入作者名称"></textarea></label></div>
                <button type="button" data-save-lists>保存过滤配置</button>
              </section>
              <section data-view="shortcuts" role="tabpanel" hidden><h3>快捷操作</h3><div class="xydy-settings-shortcuts" data-shortcuts></div></section>
            </div>
            <footer class="xydy-settings-footer"><span role="status" data-status>修改开关后自动保存</span><button type="button" data-reset-all>恢复全部默认</button></footer>
          </div>`;

        function selectTab(key, focus) {
          dialog.querySelectorAll('[data-tab]').forEach(button => {
            const active = button.dataset.tab === key;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-selected', String(active));
            button.tabIndex = active ? 0 : -1;
            if (active && focus) button.focus();
          });
          dialog.querySelectorAll('[data-view]').forEach(panel => { panel.hidden = panel.dataset.view !== key; });
          dialog.querySelector('.xydy-settings-body').scrollTop = 0;
        }
        const tabs = [['general', '常规'], ['visual', '视觉效果'], ['filters', '内容过滤'], ['shortcuts', '快捷键']];
        tabs.forEach(([key, title], index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.tab = key;
          button.id = 'xydy-settings-tab-' + key;
          button.setAttribute('role', 'tab');
          button.setAttribute('aria-controls', 'xydy-settings-view-' + key);
          button.textContent = title;
          const panel = dialog.querySelector('[data-view="' + key + '"]');
          panel.id = 'xydy-settings-view-' + key;
          panel.setAttribute('aria-labelledby', button.id);
          button.addEventListener('click', () => selectTab(key, false));
          button.addEventListener('keydown', event => {
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = tabs.length - 1;
            else return;
            event.preventDefault();
            selectTab(tabs[next][0], true);
          });
          dialog.querySelector('.xydy-settings-tabs').append(button);
        });
        selectTab('general', false);

        function addSwitch(container, label, description, key, scope) {
          const row = document.createElement('div');
          row.className = 'xydy-settings-row';
          const copy = document.createElement('span');
          const title = document.createElement('strong');
          title.textContent = label;
          const detail = document.createElement('small');
          detail.textContent = description;
          copy.append(title, detail);
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.hidden = true;
          input.dataset[scope] = key;
          const group = document.createElement('div');
          group.className = 'xydy-settings-segment';
          group.setAttribute('role', 'group');
          group.setAttribute('aria-label', label);
          group.append(input);
          const options = scope === 'headerEntry' && key !== 'hideAll'
            ? [['true', '显示'], ['false', '隐藏']] : [['true', 'On'], ['false', 'Off']];
          options.forEach(([value, text]) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.value = value;
            button.textContent = text;
            button.addEventListener('click', () => {
              if (input.checked === (value === 'true')) return;
              input.checked = value === 'true';
              group.querySelectorAll('button').forEach(option => {
                option.classList.toggle('is-active', option === button);
                option.setAttribute('aria-pressed', String(option === button));
              });
              input.dispatchEvent(new Event('change', { bubbles: true }));
            });
            group.append(button);
          });
          row.append(copy, group);
          container.append(row);
        }

        constants.THEME_COLORS.forEach(item => {
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.themeColor = item.id;
          button.style.setProperty('--xydy-swatch', item.color);
          const swatch = document.createElement('span');
          swatch.setAttribute('aria-hidden', 'true');
          button.append(swatch, document.createTextNode(item.label));
          button.addEventListener('click', () => persist({ appearance: { themeColor: item.id } }));
          dialog.querySelector('[data-theme-colors]').append(button);
        });

        const visualFeatures = ['sidebar', 'styles', 'liquidGlass', 'navigation', 'proximity', 'loading'];
        constants.FEATURE_META.forEach(item => {
          const category = visualFeatures.includes(item.key) ? 'visual' : 'general';
          addSwitch(dialog.querySelector('[data-features="' + category + '"]'), item.label, item.description, item.key, 'feature');
        });
        addSwitch(dialog.querySelector('[data-sidebar-options]'), '默认自动隐藏', '鼠标靠近左侧时展开侧边栏。', 'hideRequested', 'sidebar');
        addSwitch(dialog.querySelector('[data-sidebar-options]'), '锁定隐藏', '保持隐藏，也可以用 Alt + 1 切换。', 'locked', 'sidebar');
        const headerOptions = dialog.querySelector('[data-header-entry-options]');
        addSwitch(headerOptions, '隐藏全部顶栏入口', '开启后整组隐藏；关闭后恢复下面各项选择。', 'hideAll', 'headerEntry');
        constants.HEADER_ENTRY_META.forEach(item => {
          addSwitch(headerOptions, item.label, item.description, item.key, 'headerEntry');
        });
        constants.SHORTCUTS.forEach(item => {
          const row = document.createElement('div');
          const key = document.createElement('kbd');
          const text = document.createElement('span');
          key.textContent = item.key;
          text.textContent = item.description;
          row.append(key, text);
          dialog.querySelector('[data-shortcuts]').append(row);
        });

        dialog.addEventListener('change', event => {
          const input = event.target;
          if (input.dataset.feature) persist({ features: { [input.dataset.feature]: input.checked } });
          if (input.dataset.headerEntry) persist({ headerEntries: { [input.dataset.headerEntry]: input.checked } });
          if (input.dataset.sidebar) {
            const sidebar = { [input.dataset.sidebar]: input.checked };
            if (input.dataset.sidebar === 'locked' && input.checked) sidebar.hideRequested = true;
            persist({ sidebar });
          }
        });
        dialog.querySelector('[data-close]').addEventListener('click', close);
        dialog.querySelector('[data-save-lists]').addEventListener('click', () => {
          const ads = {};
          dialog.querySelectorAll('[data-list]').forEach(input => { ads[input.dataset.list] = splitList(input.value); });
          persist({ ads });
        });
        dialog.querySelector('[data-reset-lists]').addEventListener('click', () => persist({ ads: {
          blockedKeywords: constants.DEFAULT_SETTINGS.ads.blockedKeywords,
          blockedAuthors: constants.DEFAULT_SETTINGS.ads.blockedAuthors
        } }));
        dialog.querySelector('[data-reset-all]').addEventListener('click', () => persist(null, true));
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
        dialog.addEventListener('click', event => {
          if (event.target === dialog) close();
        });
        ['keydown', 'keyup', 'wheel', 'mousedown', 'mouseup', 'click', 'dblclick', 'pointerdown', 'pointerup'].forEach(type => {
          dialog.addEventListener(type, event => event.stopPropagation());
        });
        document.documentElement.append(dialog);
        return dialog;
      }

      function open() {
        if (disposed) return;
        ensureDialog();
        clearTimeout(closeTimer);
        closeTimer = null;
        render(context.getSettings());
        if (!dialog.open) {
          previousFocus = document.activeElement;
          dialog.showModal();
        }
        requestAnimationFrame(() => { if (dialog && dialog.open) dialog.classList.add('xydy-settings-visible'); });
      }

      function onKeyDown(event) {
        if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
        const key = (event.key || '').toLowerCase();
        if (key === 'h' || event.code === 'KeyH') {
          if (location.host !== 'www.douyin.com' || !app.utils.isImmersiveVideoPage()) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          revealKeyHeld = true;
          if (event.repeat) return;
          revealAll = !revealAll;
          syncRevealAll();
          context.showToast(revealAll ? '全部界面已显示 · Alt + H 恢复' : '已恢复原来的自动隐藏状态');
          return;
        }
        if (key !== 'x' || event.repeat) return;
        event.preventDefault();
        event.stopPropagation();
        if (dialog && dialog.open) close(); else open();
      }

      function onKeyUp(event) {
        if (!revealKeyHeld || (event.key || '').toLowerCase() !== 'h' && event.code !== 'KeyH') return;
        revealKeyHeld = false;
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      function onMessage(message, sender, respond) {
        if (!message || message.type !== 'xydy-open-settings') return;
        open();
        respond({ opened: true });
      }

      return {
        init() {
          app.settingsDialog = { open, close };
          window.addEventListener('keydown', onKeyDown, true);
          window.addEventListener('keyup', onKeyUp, true);
          document.addEventListener('xydy-open-settings', open);
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) chrome.runtime.onMessage.addListener(onMessage);
          const url = new URL(location.href);
          if (url.searchParams.get('xydy_settings') === '1') {
            url.searchParams.delete('xydy_settings');
            history.replaceState(history.state, '', url.href);
            open();
          }
        },
        onSettingsChange(settings) {
          syncRevealAll();
          render(settings);
        },
        destroy() {
          disposed = true;
          revealAll = false;
          syncRevealAll();
          clearTimeout(closeTimer);
          window.removeEventListener('keydown', onKeyDown, true);
          window.removeEventListener('keyup', onKeyUp, true);
          document.removeEventListener('xydy-open-settings', open);
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) chrome.runtime.onMessage.removeListener(onMessage);
          if (dialog) dialog.remove();
          dialog = null;
          delete app.settingsDialog;
        }
      };
    }
  });
})(globalThis);
