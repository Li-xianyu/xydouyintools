(function registerAdsFilterModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;

  app.registerContentModule({
    id: "ads-filter",
    create: function createAdsFilterModule(context) {
      let observer = null;
      let checkTimer = null;
      let lastSkipTime = 0;

      function hitKeyword(text, blockedKeywords) {
        const target = String(text || "").toLowerCase();
        return blockedKeywords.find((item) => target.includes(String(item).toLowerCase())) || "";
      }

      function hitAuthor(authorName, blockedAuthors) {
        const normalizedAuthor = utils.normalizeText(authorName).toLowerCase();
        if (!normalizedAuthor) {
          return "";
        }

        for (const candidate of blockedAuthors) {
          const normalizedCandidate = utils.normalizeText(candidate).toLowerCase();
          if (normalizedCandidate && normalizedAuthor.includes(normalizedCandidate)) {
            return candidate;
          }
        }

        return "";
      }

      function getCurrentDescription() {
        const element = utils.pickBestVisible(selectors.videoDescription);
        return element ? utils.normalizeText(element.textContent) : "";
      }

      function getCurrentAuthor() {
        const element = utils.pickBestVisible(selectors.authorNickname);
        return element ? utils.normalizeText(element.textContent) : "";
      }

      async function readStableValue(reader, tries, gap) {
        let last = "";

        for (let index = 0; index < tries; index += 1) {
          if (index > 0) {
            await utils.sleep(gap);
          }

          const first = reader();
          if (!first) {
            last = "";
            continue;
          }

          await utils.sleep(gap);
          const second = reader();
          if (second && second === first) {
            return second;
          }

          last = second || first;
        }

        return last;
      }

      function skipVideo(reasonText) {
        const settings = context.getSettings();
        const now = Date.now();
        if (now - lastSkipTime < settings.ads.debounceDelay) {
          return;
        }

        lastSkipTime = now;
        utils.tapSyntheticKey("r");
        context.showToast("[屏蔽] " + reasonText, {
          type: "warn",
          duration: settings.ui.blockNoticeMs
        });
      }

      async function checkCurrentVideo() {
        const settings = context.getSettings();
        if (!settings.features.ads) {
          return;
        }

        const description = await readStableValue(
          getCurrentDescription,
          settings.ads.stableTries,
          settings.ads.stableGap
        );

        const author = await readStableValue(
          getCurrentAuthor,
          settings.ads.stableTries,
          settings.ads.stableGap
        );

        const authorHit = hitAuthor(author, settings.ads.blockedAuthors);
        if (authorHit) {
          skipVideo("作者命中: " + authorHit);
          return;
        }

        const keywordHit = hitKeyword(description, settings.ads.blockedKeywords) || hitKeyword(author, settings.ads.blockedKeywords);
        if (keywordHit) {
          skipVideo("关键词命中: " + keywordHit);
        }
      }

      function scheduleCheck() {
        if (checkTimer) {
          return;
        }

        checkTimer = setTimeout(async () => {
          checkTimer = null;
          try {
            await checkCurrentVideo();
          } catch (error) {
            context.log("ads", "check failed", error);
          }
        }, 120);
      }

      function start() {
        stop();
        if (!context.getSettings().features.ads) {
          return;
        }

        observer = new MutationObserver(scheduleCheck);
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });

        scheduleCheck();
      }

      function stop() {
        if (observer) {
          observer.disconnect();
          observer = null;
        }

        if (checkTimer) {
          clearTimeout(checkTimer);
          checkTimer = null;
        }
      }

      return {
        init: function init() {
          start();
        },
        onSettingsChange: function onSettingsChange(nextSettings, previousSettings) {
          if (!previousSettings || nextSettings.features.ads !== previousSettings.features.ads) {
            start();
            return;
          }

          if (nextSettings.features.ads) {
            scheduleCheck();
          } else {
            stop();
          }
        },
        destroy: stop
      };
    }
  });
})(globalThis);
