(function bootstrapRuntime(global) {
  const app = global.XYDYExtension = global.XYDYExtension || {};
  const constants = app.constants;
  const storage = app.storage;

  const moduleDefinitions = [];
  const controllers = [];
  const eventBus = new EventTarget();
  let currentSettings = null;
  let started = false;
  let storageListenerBound = false;

  function log(moduleName, message, details) {
    if (!currentSettings || !currentSettings.features.performance) {
      return;
    }

    if (details === undefined) {
      console.log("[xyDY][" + moduleName + "]", message);
      return;
    }

    console.log("[xyDY][" + moduleName + "]", message, details);
  }

  function applyGlobalRootFlags(settings) {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    if (new URLSearchParams(window.location.search).has("modal_id")) {
      // modal_id 页面：还干净，移除所有扩展痕迹
      Array.from(root.attributes).forEach(function(attr) {
        if (attr.name.startsWith("data-xydy")) {
          root.removeAttribute(attr.name);
        }
      });
      root.className = root.className.split(/\s+/).filter(function(c) { return !c.startsWith("xydy-"); }).join(" ");

      // 清理扩展注入的 DOM 元素
      document.querySelectorAll("#xydy-loading-overlay, #xydy-header-blur-bg, #xydy-quick-help, #xydy-sidebar-floating-overrides").forEach(function(el) { el.remove(); });

      // 还原 xgplayer-controls 的内联样式
      document.querySelectorAll(".xgplayer-controls").forEach(function(el) {
        el.style.removeProperty("background-image");
        el.style.removeProperty("background");
      });

      // 还原视频 controls
      document.querySelectorAll('video[data-xydy-native-controls-patched="1"]').forEach(function(video) {
        video.controls = true;
        video.removeAttribute("data-xydy-native-controls-patched");
      });

      // 清理 header 上的内联样式
      var header = document.querySelector("#douyin-header, [data-e2e='douyin-navigation']");
      if (header) {
        header.style.removeProperty("position");
        header.style.removeProperty("top");
        header.style.removeProperty("left");
        header.style.removeProperty("width");
        header.style.removeProperty("z-index");
        delete header.dataset.xydyNavBound;
      }

      return;
    }

    const allowed = app.utils.isImmersiveVideoPage();
    const theme = constants.THEME_COLORS.find(item => item.id === settings.appearance.themeColor) || constants.THEME_COLORS[0];
    const channels = [1, 3, 5].map(index => parseInt(theme.color.slice(index, index + 2), 16));
    const shade = (amount) => channels.map(value => Math.round(value * amount)).join(', ');
    root.style.setProperty('--xydy-theme-rgb', channels.join(', '));
    root.style.setProperty('--xydy-theme-hover-rgb', shade(0.86));
    root.style.setProperty('--xydy-theme-active-rgb', shade(0.72));
    root.style.setProperty('--xydy-theme-light-rgb', channels.map(value => Math.round(value + (255 - value) * 0.6)).join(', '));
    root.dataset.xydyTheme = allowed && settings.features.styles && theme.id !== "original" ? "custom" : "original";
    root.dataset.xydyHeaderEntries = allowed && location.host === "www.douyin.com" ? "on" : "off";
    root.dataset.xydyHeaderHideAll = settings.headerEntries.hideAll ? "on" : "off";
    root.dataset.xydyHeaderSearch = settings.headerEntries.search ? "on" : "off";

    if (!allowed) {
      root.dataset.xydyStyles = "off";
      root.dataset.xydyLiquidGlass = "off";
      root.dataset.xydySidebar = "off";
      root.dataset.xydyNavigation = "off";
      root.dataset.xydyMouse = "off";
      root.dataset.xydyLoading = "off";
      return;
    }

    root.dataset.xydyStyles = settings.features.styles ? "on" : "off";
    root.dataset.xydyLiquidGlass = settings.features.styles && settings.features.liquidGlass ? "on" : "off";
    root.dataset.xydySidebar = settings.features.sidebar ? "on" : "off";
    root.dataset.xydyNavigation = settings.features.navigation ? "on" : "off";
    root.dataset.xydyMouse = settings.features.mouse ? "on" : "off";
    root.dataset.xydyLoading = settings.features.loading ? "on" : "off";

    // 侧栏关闭时清理模块注入的 class
    if (!settings.features.sidebar) {
      root.classList.remove("xydy-sidebar-hidden");
    }
    // 导航关闭时还原 header
    if (!settings.features.navigation) {
      var h = document.getElementById("douyin-header");
      if (h) { h.classList.add("show"); h.style.removeProperty("transform"); }
    }
    // 样式关闭时清理各模块注入的样式
    if (!settings.features.styles) {
      var sv = document.getElementById("sliderVideo");
      if (sv) { sv.style.removeProperty("overflow"); }
    }
  }

  function emit(type, detail) {
    eventBus.dispatchEvent(new CustomEvent(type, {
      detail
    }));
  }

  function on(type, handler) {
    eventBus.addEventListener(type, handler);
    return function dispose() {
      eventBus.removeEventListener(type, handler);
    };
  }

  async function updateSettings(patch) {
    return reloadSettings(await storage.patchSettings(patch));
  }

  function reloadSettings(nextSettings) {
    const previousSettings = currentSettings;
    currentSettings = storage.normalizeSettings(nextSettings);
    applyGlobalRootFlags(currentSettings);
    controllers.forEach((controller) => {
      if (typeof controller.onSettingsChange === "function") {
        controller.onSettingsChange(currentSettings, previousSettings);
      }
    });
    emit("settings-changed", {
      current: currentSettings,
      previous: previousSettings
    });
    return currentSettings;
  }

  function getContext() {
    return {
      app,
      constants,
      storage,
      utils: app.utils,
      getSettings: function getSettingsSnapshot() {
        return currentSettings;
      },
      updateSettings,
      showToast: app.utils.showToast,
      log,
      on,
      emit
    };
  }

  function bindStorageListener() {
    if (storageListenerBound) {
      return;
    }

    storageListenerBound = true;
      if (!chrome || !chrome.storage || !chrome.storage.onChanged) return;
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== constants.STORAGE.area || !changes[constants.STORAGE.key]) {
        return;
      }

      const previousSettings = currentSettings;
      currentSettings = storage.normalizeSettings(changes[constants.STORAGE.key].newValue);
      applyGlobalRootFlags(currentSettings);

      controllers.forEach((controller) => {
        if (typeof controller.onSettingsChange === "function") {
          controller.onSettingsChange(currentSettings, previousSettings);
        }
      });

      emit("settings-changed", {
        current: currentSettings,
        previous: previousSettings
      });
    });
  }

  let lastUrlPath = window.location.pathname + window.location.search;

  function bindPathChangeListener() {
    const observer = new MutationObserver(() => {
      const currentUrlPath = window.location.pathname + window.location.search;
      if (currentUrlPath !== lastUrlPath) {
        console.log("[xyDY] URL changed from " + lastUrlPath + " to " + currentUrlPath + ". Syncing settings and layout.");
        lastUrlPath = currentUrlPath;

        applyGlobalRootFlags(currentSettings);

        controllers.forEach((controller) => {
          if (typeof controller.onSettingsChange === "function") {
            controller.onSettingsChange(currentSettings, currentSettings);
          }
        });
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  async function start() {
    if (started) {
      return;
    }

    started = true;
    currentSettings = await storage.getSettings();
    applyGlobalRootFlags(currentSettings);
    bindStorageListener();
    bindPathChangeListener();

    const context = getContext();
    moduleDefinitions.forEach((definition) => {
      const controller = definition.create(context) || {};
      controllers.push(controller);
      if (typeof controller.init === "function") {
        controller.init();
      }
      log(definition.id || "module", "initialized");
    });
  }

  app.registerContentModule = function registerContentModule(definition) {
    moduleDefinitions.push(definition);
  };

  app.runtime = {
    start,
    reloadSettings,
    emit,
    on,
    log,
    getSettings: function getCurrentSettings() {
      return currentSettings;
    }
  };
})(globalThis);
