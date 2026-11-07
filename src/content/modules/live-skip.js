(function registerLiveSkipModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;

  app.registerContentModule({
    id: "live-skip",
    create: function createLiveSkipModule(context) {
      let intervalId = null;
      let lastPressTime = 0;
      let generation = 0;
      let handling = false;
      const feedbackSlides = new WeakSet();

      function getActiveLiveSlide() {
        const slides = utils.queryAll(selectors.liveSlides);
        slides.sort((first, second) => {
          const firstRect = first.getBoundingClientRect();
          const secondRect = second.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          return Math.abs(firstRect.top + firstRect.height / 2 - viewportCenter) -
                 Math.abs(secondRect.top + secondRect.height / 2 - viewportCenter);
        });

        const slide = slides[0];
        if (!slide) return null;
        const rect = slide.getBoundingClientRect();
        if (rect.top > window.innerHeight / 2 || rect.bottom < window.innerHeight / 2) return null;

        const indicators = utils.queryAll(selectors.liveIndicators, slide).filter(utils.isVisible);
        if (indicators.length) {
          return { slide, indicator: indicators[0] };
        }

        const liveStatus = Array.from(slide.querySelectorAll("[aria-label], [title], [data-e2e*='live'], [class*='live-status'], [class*='live-tag'], [class*='live-label'], [class*='live-badge']"))
          .filter(utils.isVisible)
          .find((element) => /^(正在直播|直播中|主播正在直播)$/i.test(utils.normalizeText(element.getAttribute("aria-label") || element.title || element.textContent)));
        if (liveStatus) {
          return { slide, indicator: liveStatus };
        }

        return null;
      }

      function skipLive(activeSlide) {
        ["keydown", "keyup"].forEach((type) => {
          activeSlide.dispatchEvent(new KeyboardEvent(type, {
            key: "ArrowDown",
            code: "ArrowDown",
            keyCode: 40,
            which: 40,
            bubbles: true,
            cancelable: true
          }));
        });
      }

      function start() {
        stop();
        if (!context.getSettings().features.live) {
          return;
        }

        const currentGeneration = generation;
        intervalId = setInterval(async () => {
          const settings = context.getSettings();
          if (!settings.features.live) {
            return;
          }

          if (window.location.host !== "www.douyin.com" || !utils.isImmersiveVideoPage()) {
            return;
          }

          if (handling || (app.silentMenu && app.silentMenu.isRunning())) return;
          const activeLive = getActiveLiveSlide();
          if (!activeLive) return;

          const now = Date.now();
          if (now - lastPressTime < settings.live.debounceDelay) {
            return;
          }

          lastPressTime = now;
          handling = true;
          const isCurrent = () => currentGeneration === generation && context.getSettings().features.live &&
            window.location.host === "www.douyin.com" && utils.isImmersiveVideoPage() &&
            getActiveLiveSlide()?.slide === activeLive.slide;
          try {
            if (app.silentMenu && !feedbackSlides.has(activeLive.slide)) {
              feedbackSlides.add(activeLive.slide);
              await app.silentMenu.blockLive({ slide: activeLive.slide, canContinue: isCurrent });
            }
            if (isCurrent()) skipLive(activeLive.slide);
          } finally {
            handling = false;
          }
        }, context.getSettings().live.pollMs);
      }

      function stop() {
        generation += 1;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }

      return {
        init: function init() {
          start();
        },
        onSettingsChange: function onSettingsChange(nextSettings, previousSettings) {
          if (!previousSettings || nextSettings.features.live !== previousSettings.features.live || nextSettings.live.pollMs !== previousSettings.live.pollMs || nextSettings.live.debounceDelay !== previousSettings.live.debounceDelay) {
            start();
          }
        },
        destroy: stop
      };
    }
  });
})(globalThis);
