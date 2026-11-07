(function registerMouseGestureModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;

  app.registerContentModule({
    id: "mouse-gestures",
    create: function createMouseGestureModule(context) {
      let startX = 0;
      let startY = 0;
      let startTime = 0;
      let isMouseDown = false;
      let isSwiping = false;
      let blockClick = false;
      let longPressTimer = null;
      let isLongPressing = false;
      const interactiveTargetSelector = selectors.sidebar.concat(selectors.header).join(", ") + ", #xydy-settings-dialog, .xgplayer-controls, .xgplayer-progress, .xgplayer-slider, .xgplayer-bar, .rDq18SJg, .gvcmX2Lf, [class*=\"immersive-player-switch-on-hide-interaction-area\"], [data-e2e^=\"video-player-\"], [data-e2e=\"feed-comment-icon\"], [data-e2e=\"video-play-more\"], button, a[href], input, textarea, select, [contenteditable=\"true\"], [role=\"button\"], #videoSideCard, #chapterVideoSideCard";

      function enabled() {
        return context.getSettings().features.mouse && utils.isImmersiveVideoPage();
      }

      function tapShortcut(key) {
        utils.tapSyntheticKey(key);
      }

      function likeVideo() {
        const video = utils.queryFirst(selectors.video);
        if (!video) {
          return;
        }

        const wasPlaying = !video.paused;
        tapShortcut("z");

        if (wasPlaying) {
          setTimeout(() => {
            if (video.paused && typeof video.play === "function") {
              video.play().catch(function ignorePlayError() {});
            }
          }, 100);
        }
      }

      function handleSwipe(direction) {
        if (direction === "left") {
          likeVideo();
        }

        if (direction === "right") {
          tapShortcut("r");
        }
      }

      document.addEventListener("mousedown", (event) => {
        if (event.target instanceof Element && event.target.closest('.xydy-image-float')) return;
        if (app.imageFloat && app.imageFloat.isPressing()) return;
        if (!enabled() || window.xydyIsInteractingWithComments) {
          return;
        }

        if (event.button === 0 && event.target instanceof Element && event.target.closest(interactiveTargetSelector)) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
          isMouseDown = false;
          isSwiping = false;
          blockClick = false;
          isLongPressing = false;
          return;
        }

        startX = event.clientX;
        startY = event.clientY;
        startTime = Date.now();
        isMouseDown = true;
        isSwiping = false;
        blockClick = false;
        isLongPressing = false;

        if (event.button === 1) {
          // If clicked inside comments side card, allow native middle click (scrolling, etc.)
          if (event.target.closest('#videoSideCard')) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          if (window.XYDYCommentsPanel && typeof window.XYDYCommentsPanel.toggleFromShortcut === "function") {
            window.XYDYCommentsPanel.toggleFromShortcut();
            return;
          }
          tapShortcut("x");
          return;
        }

        if (event.button === 0) {
          longPressTimer = setTimeout(() => {
            if (isMouseDown && !isSwiping) {
              isLongPressing = true;
              blockClick = true;
              utils.dispatchSyntheticKey("keydown", "d", true);
            }
          }, context.getSettings().mouse.longPressTime);
        }
      }, true);

      document.addEventListener("mousemove", (event) => {
        if (!enabled() || !isMouseDown || isLongPressing || window.xydyIsInteractingWithComments) {
          return;
        }

        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        const mouseSettings = context.getSettings().mouse;

        if (isSwiping) {
          return;
        }

        if (Math.abs(deltaX) > mouseSettings.swipeThreshold || Math.abs(deltaY) > mouseSettings.swipeThreshold) {
          isSwiping = true;
          blockClick = true;
          clearTimeout(longPressTimer);
          longPressTimer = null;

          const direction = Math.abs(deltaX) > Math.abs(deltaY)
            ? (deltaX > 0 ? "right" : "left")
            : (deltaY > 0 ? "down" : "up");

          handleSwipe(direction);
        }
      }, true);

      document.addEventListener("mouseup", (event) => {
        if (!enabled() || !isMouseDown || window.xydyIsInteractingWithComments) {
          return;
        }

        if (event.button === 0) {
          clearTimeout(longPressTimer);
          longPressTimer = null;

          if (isLongPressing) {
            utils.dispatchSyntheticKey("keyup", "d", false);
            event.preventDefault();
            event.stopPropagation();
          }
        }

        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        const duration = Date.now() - startTime;
        const mouseSettings = context.getSettings().mouse;

        if (
          distance >= mouseSettings.clickMaxMove ||
          duration >= mouseSettings.clickMaxTime ||
          isSwiping ||
          isLongPressing
        ) {
          event.preventDefault();
          event.stopPropagation();
        }

        isMouseDown = false;
        isSwiping = false;
        isLongPressing = false;

        setTimeout(() => {
          blockClick = false;
        }, 50);
      }, true);

      document.addEventListener("click", (event) => {
        if (enabled() && blockClick) {
          event.preventDefault();
          event.stopPropagation();
        }
      }, true);

      return {};
    }
  });
})(globalThis);
