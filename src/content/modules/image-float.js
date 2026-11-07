(function registerImageFloatModule(global) {
  const app = global.XYDYExtension;

  app.registerContentModule({
    id: "image-float",
    create(context) {
      const cards = new Set();
      const effects = new Set();
      const timers = new Set();
      const objectUrls = new Set();
      const listeners = [];
      const imageSelector = app.constants.SELECTORS.galleryImage.join(',');
      const pressSurfaceSelector = app.constants.SELECTORS.galleryImagePressSurface.join(',');
      const excludedSelector = app.constants.SELECTORS.galleryImageExcluded.join(',');
      let press = null;
      let dragging = null;
      let dragCandidate = null;
      let nativeDrag = null;
      let suppressClickUntil = 0;
      let disposed = false;

      function later(fn, delay) {
        const timer = setTimeout(() => { timers.delete(timer); fn(); }, delay);
        timers.add(timer);
        return timer;
      }

      function listen(target, type, fn, options) {
        target.addEventListener(type, fn, options);
        listeners.push(() => target.removeEventListener(type, fn, options));
      }

      function enabled() {
        return context.getSettings().features.imageFloat && app.utils.isImmersiveVideoPage();
      }

      function stopEvent(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      function position(card, x, y) {
        card.style.left = Math.max(8, Math.min(x, innerWidth - card.offsetWidth - 8)) + 'px';
        card.style.top = Math.max(8, Math.min(y, innerHeight - card.offsetHeight - 8)) + 'px';
      }

      function closeCard(card) {
        if (dragging && dragging.card === card) releaseHeldDrag();
        if (dragCandidate && dragCandidate.card === card) dragCandidate = null;
        if (nativeDrag && nativeDrag.card === card) nativeDrag = null;
        if (card.xydyFetch) card.xydyFetch.abort();
        card.getAnimations().forEach(animation => animation.cancel());
        cards.delete(card);
        card.remove();
      }

      function cancelPress() {
        if (!press) return;
        clearTimeout(press.timer);
        timers.delete(press.timer);
        press = null;
      }

      function releaseHeldDrag() {
        if (!dragging) return;
        const { card, pointerId } = dragging;
        dragging = null;
        if (card.hasPointerCapture(pointerId)) card.releasePointerCapture(pointerId);
      }

      function releaseNativeGesture(state) {
        if (!state || state.nativeReleased || !state.target.isConnected) return;
        state.nativeReleased = true;
        const options = { bubbles: true, cancelable: true, clientX: state.x, clientY: state.y, button: 0, buttons: 0 };
        const pointerOptions = { ...options, pointerId: state.pointerId, pointerType: state.pointerType, isPrimary: true };
        if (state.target.hasPointerCapture(state.pointerId)) state.target.releasePointerCapture(state.pointerId);
        state.target.dispatchEvent(new PointerEvent('pointercancel', pointerOptions));
        state.target.dispatchEvent(new PointerEvent('pointerup', pointerOptions));
        state.target.dispatchEvent(new MouseEvent('mouseup', options));
      }

      function releasePress() {
        releaseNativeGesture(press);
        cancelPress();
        releaseHeldDrag();
        dragCandidate = null;
      }

      function findImage(event) {
        if (!(event.target instanceof Element)) return null;
        if (!event.target.matches(pressSurfaceSelector) && event.target.closest(excludedSelector)) return null;
        const player = event.target.closest('.basePlayerContainer');
        if (!player) return null;
        return [...player.querySelectorAll(imageSelector)].find(image => {
          const rect = image.getBoundingClientRect();
          return image.complete && image.naturalWidth > 0 && rect.width > 80 && rect.height > 80 &&
            event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom;
        });
      }

      function loadImage(card, source) {
        if (card.xydyAssetPromise) return card.xydyAssetPromise;
        const controller = new AbortController();
        card.xydyFetch = controller;
        card.xydyAssetPromise = fetch(source, { credentials: 'omit', signal: controller.signal }).then(async response => {
          if (!response.ok) throw new Error('image response ' + response.status);
          const blob = await response.blob();
          if (!blob.type.startsWith('image/')) throw new Error('invalid image');
          const type = blob.type.split('/')[1].split(';')[0];
          const name = '抖音图片-' + Date.now() + '.' + (type === 'jpeg' ? 'jpg' : type);
          const asset = { blob, name, file: new File([blob], name, { type: blob.type }) };
          card.xydyAsset = asset;
          return asset;
        }).catch(error => {
          card.xydyAssetPromise = null;
          throw error;
        }).finally(() => { card.xydyFetch = null; });
        return card.xydyAssetPromise;
      }

      async function saveImage(card, source, button) {
        if (button.disabled) return;
        button.disabled = true;
        button.textContent = '保存中';
        try {
          const { blob, name } = await loadImage(card, source);
          if (!card.isConnected || disposed) return;
          const url = URL.createObjectURL(blob);
          objectUrls.add(url);
          const link = document.createElement('a');
          link.download = name;
          link.href = url;
          document.documentElement.append(link);
          link.click();
          link.remove();
          later(() => { URL.revokeObjectURL(url); objectUrls.delete(url); }, 60000);
          context.showToast('已开始保存源图片');
        } catch (error) {
          if (error.name === 'AbortError') return;
          context.showToast('暂时无法直接保存，请点“源图”后右键另存为');
        } finally {
          button.disabled = false;
          button.textContent = '保存';
        }
      }

      function createCard(state) {
        if (disposed) return;
        while (cards.size >= 4) closeCard(cards.values().next().value);
        const ratio = state.width / state.height;
        const height = Math.min(248, innerHeight - 32, (innerWidth - 32) / ratio, 184 / ratio);
        const width = height * ratio;
        const x = Math.max(8, Math.min(state.x - width / 2, innerWidth - width - 8));
        const y = Math.max(8, Math.min(state.y - height / 2, innerHeight - height - 8));
        const card = document.createElement('div');
        card.className = 'xydy-image-float';
        card.draggable = true;
        card.dataset.source = state.source;
        card.tabIndex = 0;
        card.setAttribute('role', 'group');
        card.setAttribute('aria-label', '悬浮图片，可拖动到网页外或保存，Esc 关闭');
        card.title = '松开后再拖动小图，可拖到标签栏、桌面或支持图片拖放的软件';
        Object.assign(card.style, { width: width + 'px', height: height + 'px', left: x + 'px', top: y + 'px' });
        const image = document.createElement('img');
        image.src = state.source;
        image.alt = '提取的图文图片';
        image.draggable = true;
        const resolution = document.createElement('span');
        resolution.className = 'xydy-image-float-resolution';
        resolution.textContent = state.width + ' × ' + state.height;
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'xydy-image-float-close';
        close.textContent = '×';
        close.setAttribute('aria-label', '关闭悬浮图片');
        close.addEventListener('click', () => closeCard(card));
        const toolbar = document.createElement('div');
        toolbar.className = 'xydy-image-float-toolbar';
        const open = document.createElement('a');
        open.href = state.source;
        open.target = '_blank';
        open.rel = 'noopener noreferrer';
        open.textContent = '源图';
        const save = document.createElement('button');
        save.type = 'button';
        save.textContent = '保存';
        save.addEventListener('click', () => saveImage(card, state.source, save));
        toolbar.append(open, save);
        card.append(image, resolution, close, toolbar);
        card.addEventListener('dragstart', onNativeDragStart);
        card.addEventListener('dragend', finishNativeDrag);
        ['click', 'dblclick', 'contextmenu', 'wheel'].forEach(type => card.addEventListener(type, event => event.stopPropagation()));
        document.documentElement.append(card);
        cards.add(card);
        loadImage(card, state.source).catch(() => {});
        state.card = card;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const rect = state.rect;
        const animation = card.animate([
          { transform: `translate(${rect.left - x}px, ${rect.top - y}px) scale(${rect.width / width}, ${rect.height / height})`, borderRadius: '0px', opacity: 0.98, boxShadow: 'none' },
          { transform: 'translate(0, 0) scale(1, 1)', borderRadius: '16px', opacity: 1, boxShadow: '0 18px 55px rgba(0,0,0,.32), 0 0 0 1px rgba(255,255,255,.3)' }
        ], { duration: reduced ? 0 : 440, easing: 'cubic-bezier(.22, 1, .36, 1)' });
        animation.finished.then(() => {
          if (!card.isConnected) return;
          card.dataset.ready = 'true';
          if (press === state) {
            dragging = { card, pointerId: state.pointerId, offsetX: state.x - x, offsetY: state.y - y };
            card.setPointerCapture(state.pointerId);
          }
        }).catch(() => {});
      }

      function extract(state) {
        if (press !== state || !enabled()) {
          cancelPress();
          return;
        }
        state.active = true;
        releaseNativeGesture(state);
        suppressClickUntil = Date.now() + 1200;
        const sweep = document.createElement('div');
        sweep.className = 'xydy-image-sweep';
        const rect = state.rect;
        Object.assign(sweep.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' });
        document.documentElement.append(sweep);
        effects.add(sweep);
        later(() => {
          sweep.remove();
          effects.delete(sweep);
          createCard(state);
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280);
      }

      function onPointerDown(event) {
        if (!event.isTrusted) return;
        suppressClickUntil = 0;
        dragCandidate = null;
        const card = event.target instanceof Element && event.target.closest('.xydy-image-float');
        if (card) {
          if (event.button !== 0) return;
          if (event.target.closest('button, a') || card.dataset.ready !== 'true') return;
          const rect = card.getBoundingClientRect();
          dragCandidate = { card, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
          card.focus({ preventScroll: true });
          return;
        }
        cancelPress();
        if (!enabled() || event.button !== 0 || !event.isPrimary) return;
        const image = findImage(event);
        if (!image) return;
        press = { image, target: event.target, source: image.currentSrc, rect: image.getBoundingClientRect(), width: image.naturalWidth, height: image.naturalHeight, x: event.clientX, y: event.clientY, pointerId: event.pointerId, pointerType: event.pointerType, active: false };
        const state = press;
        state.timer = later(() => extract(state), Math.max(400, context.getSettings().mouse.longPressTime));
      }

      function onPointerMove(event) {
        if (!event.isTrusted) return;
        if (!(event.buttons & 1)) {
          releasePress();
          return;
        }
        if (dragging && event.pointerId === dragging.pointerId) {
          stopEvent(event);
          position(dragging.card, event.clientX - dragging.offsetX, event.clientY - dragging.offsetY);
          return;
        }
        if (!press || event.pointerId !== press.pointerId) return;
        if (press.active) stopEvent(event);
        else if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) cancelPress();
      }

      function onPointerUp(event) {
        if (!event.isTrusted) return;
        if (dragging && event.pointerId === dragging.pointerId) {
          releaseHeldDrag();
          suppressClickUntil = Date.now() + 400;
        }
        if (press && event.pointerId === press.pointerId) {
          if (press.active) {
            suppressClickUntil = Date.now() + 400;
          }
          cancelPress();
        }
        dragCandidate = null;
      }

      function onNativeDragStart(event) {
        const card = event.currentTarget;
        if (card.dataset.ready !== 'true' || event.target.closest('button, a') || !event.dataTransfer) {
          event.preventDefault();
          return;
        }
        const candidate = dragCandidate;
        releasePress();
        const rect = card.getBoundingClientRect();
        const source = card.dataset.source;
        nativeDrag = candidate && candidate.card === card ? candidate : { card, offsetX: Math.max(0, Math.min(event.clientX - rect.left, rect.width)), offsetY: Math.max(0, Math.min(event.clientY - rect.top, rect.height)) };
        const data = event.dataTransfer;
        data.effectAllowed = 'copyMove';
        data.setData('text/uri-list', source);
        data.setData('text/plain', source);
        data.setData('text/html', card.querySelector('img').outerHTML);
        const asset = card.xydyAsset;
        if (asset) {
          data.setData('DownloadURL', asset.blob.type + ':' + asset.name + ':' + source);
          if (![...data.items].some(item => item.kind === 'file')) {
            try { data.items.add(asset.file); } catch (error) {}
          }
        } else {
          data.setData('DownloadURL', 'image/webp:抖音图片.webp:' + source);
        }
        data.setDragImage(card, nativeDrag.offsetX, nativeDrag.offsetY);
        event.stopPropagation();
      }

      function onNativeDragOver(event) {
        if (!nativeDrag) return;
        stopEvent(event);
        event.dataTransfer.dropEffect = 'move';
        position(nativeDrag.card, event.clientX - nativeDrag.offsetX, event.clientY - nativeDrag.offsetY);
      }

      function finishNativeDrag() {
        nativeDrag = null;
        releasePress();
        suppressClickUntil = Date.now() + 250;
      }

      function stop() {
        releasePress();
        nativeDrag = null;
        suppressClickUntil = 0;
        timers.forEach(clearTimeout);
        timers.clear();
        effects.forEach(effect => effect.remove());
        effects.clear();
        [...cards].forEach(closeCard);
        objectUrls.forEach(url => URL.revokeObjectURL(url));
        objectUrls.clear();
      }

      return {
        init() {
          app.imageFloat = { isPressing: () => !!press };
          listen(window, 'pointerdown', onPointerDown, true);
          listen(window, 'pointermove', onPointerMove, true);
          listen(window, 'pointerup', onPointerUp, true);
          listen(window, 'pointercancel', event => { if (event.isTrusted) releasePress(); }, true);
          listen(window, 'lostpointercapture', event => {
            if (dragging && dragging.card === event.target && dragging.pointerId === event.pointerId) releaseHeldDrag();
          }, true);
          listen(window, 'mousemove', event => { if (dragging || press && press.active) stopEvent(event); }, true);
          ['click', 'dblclick', 'contextmenu'].forEach(type => listen(window, type, event => {
            const inCard = event.target instanceof Element && event.target.closest('.xydy-image-float');
            if (event.isTrusted && !inCard && Date.now() < suppressClickUntil) stopEvent(event);
          }, true));
          listen(window, 'dragstart', event => {
            const inCard = event.target instanceof Element && event.target.closest('.xydy-image-float');
            if (press && !inCard) stopEvent(event);
          }, true);
          listen(window, 'dragover', onNativeDragOver, true);
          listen(window, 'drop', event => { if (nativeDrag) { stopEvent(event); finishNativeDrag(); } }, true);
          listen(window, 'blur', releasePress);
          listen(window, 'wheel', releasePress, { capture: true, passive: true });
          listen(document, 'visibilitychange', () => { if (document.hidden) releasePress(); });
          listen(window, 'keydown', event => {
            if (event.key !== 'Escape') return;
            releasePress();
            const card = document.activeElement && document.activeElement.closest('.xydy-image-float');
            if (card) { stopEvent(event); closeCard(card); }
          }, true);
          listen(window, 'resize', () => cards.forEach(card => position(card, parseFloat(card.style.left), parseFloat(card.style.top))));
        },
        onSettingsChange() { if (!enabled()) stop(); },
        destroy() { disposed = true; stop(); listeners.forEach(remove => remove()); delete app.imageFloat; }
      };
    }
  });
})(globalThis);
