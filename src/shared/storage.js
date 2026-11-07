(function bootstrapStorage(global) {
  var app = global.XYDYExtension = global.XYDYExtension || {};
  var constants = app.constants;
  var utils = app.utils;

  function normalizeBoolean(value, fallback) {
    if (typeof value === "boolean") {
      return value;
    }

    if (value === "true" || value === "1" || value === 1) {
      return true;
    }

    if (value === "false" || value === "0" || value === 0) {
      return false;
    }

    return fallback;
  }

  function normalizeStringArray(value, fallback) {
    if (!Array.isArray(value)) {
      return fallback.slice();
    }

    return value
      .map((item) => utils.normalizeText(item))
      .filter(Boolean);
  }

  function normalizeSettings(raw) {
    const merged = utils.mergeDeep(constants.DEFAULT_SETTINGS, raw || {});

    Object.keys(constants.DEFAULT_SETTINGS.features).forEach((featureKey) => {
      merged.features[featureKey] = normalizeBoolean(merged.features[featureKey], constants.DEFAULT_SETTINGS.features[featureKey]);
    });

    merged.sidebar.hideRequested = normalizeBoolean(merged.sidebar.hideRequested, constants.DEFAULT_SETTINGS.sidebar.hideRequested);
    merged.sidebar.locked = normalizeBoolean(merged.sidebar.locked, constants.DEFAULT_SETTINGS.sidebar.locked);
    merged.sidebar.hoverDelay = Number(merged.sidebar.hoverDelay) || constants.DEFAULT_SETTINGS.sidebar.hoverDelay;
    merged.sidebar.hoverWidth = Number(merged.sidebar.hoverWidth) || constants.DEFAULT_SETTINGS.sidebar.hoverWidth;

    const headerRaw = utils.isPlainObject(raw && raw.headerEntries) ? raw.headerEntries : {};
    if (!utils.isPlainObject(merged.headerEntries)) merged.headerEntries = {};
    Object.keys(constants.DEFAULT_SETTINGS.headerEntries).forEach((key) => {
      const fallback = key !== "hideAll" && !merged.features.hideElements
        ? true : constants.DEFAULT_SETTINGS.headerEntries[key];
      merged.headerEntries[key] = normalizeBoolean(headerRaw[key], fallback);
    });

    if (!utils.isPlainObject(merged.appearance)) merged.appearance = {};
    if (!constants.THEME_COLORS.some(item => item.id === merged.appearance.themeColor)) {
      merged.appearance.themeColor = constants.DEFAULT_SETTINGS.appearance.themeColor;
    }

    merged.live.debounceDelay = Number(merged.live.debounceDelay) || constants.DEFAULT_SETTINGS.live.debounceDelay;
    merged.live.pollMs = Number(merged.live.pollMs) || constants.DEFAULT_SETTINGS.live.pollMs;

    const defaultTexts = constants.DEFAULT_SETTINGS.hideElements.textsToHide;
    const userTexts = normalizeStringArray(merged.hideElements.textsToHide, defaultTexts);
    merged.hideElements.textsToHide = Array.from(new Set([...userTexts, ...defaultTexts]));

    merged.ads.blockedKeywords = normalizeStringArray(merged.ads.blockedKeywords, constants.DEFAULT_SETTINGS.ads.blockedKeywords);
    merged.ads.blockedAuthors = normalizeStringArray(merged.ads.blockedAuthors, constants.DEFAULT_SETTINGS.ads.blockedAuthors);
    merged.ads.debounceDelay = Number(merged.ads.debounceDelay) || constants.DEFAULT_SETTINGS.ads.debounceDelay;
    merged.ads.stableTries = Number(merged.ads.stableTries) || constants.DEFAULT_SETTINGS.ads.stableTries;
    merged.ads.stableGap = Number(merged.ads.stableGap) || constants.DEFAULT_SETTINGS.ads.stableGap;

    merged.mouse.swipeThreshold = Number(merged.mouse.swipeThreshold) || constants.DEFAULT_SETTINGS.mouse.swipeThreshold;
    merged.mouse.clickMaxMove = Number(merged.mouse.clickMaxMove) || constants.DEFAULT_SETTINGS.mouse.clickMaxMove;
    merged.mouse.clickMaxTime = Number(merged.mouse.clickMaxTime) || constants.DEFAULT_SETTINGS.mouse.clickMaxTime;
    merged.mouse.longPressTime = Number(merged.mouse.longPressTime) || constants.DEFAULT_SETTINGS.mouse.longPressTime;

    merged.ui.quickHelpAutoHideMs = Number(merged.ui.quickHelpAutoHideMs) || constants.DEFAULT_SETTINGS.ui.quickHelpAutoHideMs;
    merged.ui.blockNoticeMs = Number(merged.ui.blockNoticeMs) || constants.DEFAULT_SETTINGS.ui.blockNoticeMs;
    merged.ui.loadingMinMs = Number(merged.ui.loadingMinMs) || constants.DEFAULT_SETTINGS.ui.loadingMinMs;
    merged.ui.loadingMaxMs = Number(merged.ui.loadingMaxMs) || constants.DEFAULT_SETTINGS.ui.loadingMaxMs;

    return merged;
  }

  function storageGet(key) {
    return new Promise(function(resolve) {
      resolve(JSON.parse(localStorage.getItem(key) || 'null'));
    });
  }

  function storageSet(payload) {
    return new Promise(function(resolve) {
      Object.keys(payload).forEach(function(k) { localStorage.setItem(k, JSON.stringify(payload[k])); });
      resolve();
    });
  }

  function splitLegacyList(value) {
    return String(value || "")
      .split(/[\n,，]+/g)
      .map((item) => utils.normalizeText(item))
      .filter(Boolean);
  }

  function readLegacySettings() {
    try {
      const legacyStorage = window.localStorage;
      if (!legacyStorage) {
        return null;
      }

      const featurePatch = {};
      let hasLegacyValue = false;

      Object.keys(constants.DEFAULT_SETTINGS.features).forEach((featureKey) => {
        const legacyValue = legacyStorage.getItem(constants.STORAGE.legacyFeaturePrefix + featureKey.toUpperCase());
        if (legacyValue === "0" || legacyValue === "1") {
          featurePatch[featureKey] = legacyValue === "1";
          hasLegacyValue = true;
        }
      });

      const sidebarHide = legacyStorage.getItem(constants.STORAGE.legacySidebarHideKey);
      const sidebarLock = legacyStorage.getItem(constants.STORAGE.legacySidebarLockKey);
      if (sidebarHide !== null || sidebarLock !== null) {
        hasLegacyValue = true;
      }

      const blockedKeywords = splitLegacyList(legacyStorage.getItem(constants.STORAGE.legacyAdsKeywordsKey));
      const blockedAuthors = splitLegacyList(legacyStorage.getItem(constants.STORAGE.legacyAdsAuthorsKey));
      if (blockedKeywords.length || blockedAuthors.length) {
        hasLegacyValue = true;
      }

      if (!hasLegacyValue) {
        return null;
      }

      return normalizeSettings({
        features: featurePatch,
        sidebar: {
          hideRequested: sidebarHide === "true",
          locked: sidebarLock === "true"
        },
        ads: {
          blockedKeywords: blockedKeywords.length ? blockedKeywords : undefined,
          blockedAuthors: blockedAuthors.length ? blockedAuthors : undefined
        }
      });
    } catch (error) {
      return null;
    }
  }

  async function getSettings() {
    const stored = await storageGet(constants.STORAGE.key);
    if (stored) {
      return normalizeSettings(stored);
    }

    const migrated = readLegacySettings();
    const initial = migrated || normalizeSettings(constants.DEFAULT_SETTINGS);
    await storageSet({
      [constants.STORAGE.key]: initial
    });
    return initial;
  }

  async function saveSettings(nextSettings) {
    const normalized = normalizeSettings(nextSettings);
    await storageSet({
      [constants.STORAGE.key]: normalized
    });
    return normalized;
  }

  async function patchSettings(patch) {
    const current = await getSettings();
    const next = normalizeSettings(utils.mergeDeep(current, patch || {}));
    await saveSettings(next);
    return next;
  }

  app.storage = {
    normalizeSettings: normalizeSettings,
    getSettings: getSettings,
    saveSettings: saveSettings,
    patchSettings: patchSettings
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
