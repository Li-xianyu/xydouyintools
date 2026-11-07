// ==UserScript==
// @name         xyDouYinTools 摄像头手势控制 MVP
// @namespace    https://greasyfork.org/zh-CN/users/1513167-咸鱼真人
// @version      0.1.32
// @description  独立摄像头手势控制：半握伸出食指上下挥动切换抖音、左右挥动发 Z/R，张开手掌开关评论区。本地识别，手动开启摄像头。
// @author       lxy
// @license      MIT
// @match        https://www.douyin.com/*
// @run-at       document-idle
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      cdn.jsdelivr.net
// @connect      unpkg.com
// @connect      storage.googleapis.com
// ==/UserScript==

(function bootstrapGestureControl() {
  'use strict';

  const HOST_ID = 'xydy-camera-gesture-mvp';
  if (window.top !== window.self || document.getElementById(HOST_ID)) return;

  const VERSION = '0.10.21';
  const RESOURCE_PATHS = ['vision_bundle.cjs', 'wasm/vision_wasm_internal.js', 'wasm/vision_wasm_internal.wasm', 'model'];
  const STORAGE_KEY = 'xydy-camera-gesture-mvp-settings';

  // MediaPipe 手部 21 个关键点编号约定（骨架连线按此绘制）：
  //   0 手腕  4 拇指尖  8 食指尖  12 中指尖  16 无名指尖  20 小指尖
  //   5/9/13/17 分别是 食指/中指/无名指/小指 的指根（MCP），1-3 是拇指三段，6-7/10-11/14-15/18-19 是各手指中间两段
  const HAND_CHAINS = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [5, 9, 10, 11, 12], [9, 13, 14, 15, 16], [13, 17, 18, 19, 20], [17, 0]];

  // 水平（左右）手势额外需要的位移倍率：左右切换不常用，做到位才触发，避免竖刷时误触
  const HORIZONTAL_THRESHOLD_EXTRA = 1.6;
  const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
  const FACE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
  const SELECTORS = {
    feedVideo: '.dySwiperSlide video, .basePlayerContainer video, #sliderVideo video',
    feedCard: '.basePlayerContainer, [data-e2e="feed-active-video"], [data-e2e="feed-active-item"]',
    feedSlide: '#sliderVideo .dySwiperSlide, .focusPanel .dySwiperSlide',
    feedImage: '.basePlayerContainer .focusPanel img, #sliderVideo .focusPanel img, .dySwiperSlide img.AWIwgv_K',
    postLink: 'a[href*="/video/"], a[href*="/note/"]',
    description: '[data-e2e="video-desc"], [data-e2e="feed-video-desc"]',
    previous: '[data-e2e="video-switch-prev-arrow"], [data-e2e="video-switch-previous-arrow"]',
    next: '[data-e2e="video-switch-next-arrow"]',
    editor: 'input, textarea, select, [contenteditable="true"], [role="textbox"]',
    modal: 'dialog[open], [role="dialog"][aria-modal="true"]'
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? clamp(Number(value), min, max) : fallback;

  // 持久化设置（油猴 GM_getValue/GM_setValue 存到本地）
  const saved = GM_getValue(STORAGE_KEY, {}) || {};
  const settings = {
    swipeUp: saved.swipeUp !== false,
    swipeDown: saved.swipeDown !== false,
    swipeLeft: saved.swipeLeft !== false,
    swipeRight: saved.swipeRight !== false,
    reverse: saved.reverse === true,                 // 反转上下手势方向（对应上下翻页方向）
    preview: saved.preview !== false,                // 是否显示摄像头预览小窗
    controlHand: ['Left', 'Right'].includes(saved.controlHand) ? saved.controlHand : 'auto', // 指定控制手：auto/Left/Right
    palmOnly: saved.palmOnly !== false,              // 忽略手背（只接受掌心朝向摄像头的手）
    swapHands: saved.swapHands === true,             // 左右手识别相反时的补救开关
    virtualDrag: saved.virtualDrag === true,         // 虚拟拖动模式（模拟触摸拖动而非发翻页键）
    faceReject: saved.faceReject === true,
    smileLike: saved.smileLike === true,
    aggressive: saved.aggressive === true,
    showSkeleton: saved.showSkeleton !== false,
    showHandSkeleton: saved.showHandSkeleton !== false,
    showFaceSkeleton: saved.showFaceSkeleton !== false,
    showGuide: saved.showGuide !== false,
    fps: Math.round(number(saved.fps, 30, 5, 60)),   // 采集/识别帧率 5~60，默认 15
    distance: number(!saved.schema && Number(saved.distance) === 0.16 ? 0.1 : saved.distance, 0.1, 0.06, 0.26), // 挥动距离灵敏度（0.06~0.26）
    center: number(saved.center, 0.52, 0.3, 0.7),    // 预览横条默认垂直位置（画面占比）
    left: typeof saved.left === 'number' ? saved.left : null, // 面板上次拖动的水平位置
    top: typeof saved.top === 'number' ? saved.top : null     // 面板上次拖动的垂直位置
  };

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.dataset.e2e = 'video-player-camera-gesture';
  host.style.cssText = 'position:fixed;right:18px;bottom:92px;z-index:2147483646;width:292px;max-width:calc(100vw - 24px);color-scheme:dark;';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { font:13px/1.5 "Segoe UI","Microsoft YaHei",sans-serif; color:#edf3ff; text-align:left; }
      * { box-sizing:border-box; }
      [hidden] { display:none !important; }
      .panel { background:rgba(20,25,36,.94); border:1px solid #ffffff30; border-radius:18px; box-shadow:0 12px 42px #0005; overflow:hidden; }
      header { display:flex; align-items:center; gap:8px; padding:12px 14px; touch-action:none; cursor:move; user-select:none; }
      .dot { width:8px; height:8px; border-radius:50%; background:#8692a7; flex-shrink:0; }
      .dot[data-kind="active"] { background:#58d8aa; }
      .dot[data-kind="busy"] { background:#ffc766; }
      .dot[data-kind="error"] { background:#ff8494; }
      strong { flex:1; font-size:13px; font-weight:600; }
      button { appearance:none; font:inherit; color:inherit; background:#ffffff12; border:1px solid #ffffff24; border-radius:10px; padding:7px 10px; cursor:pointer; }
      button:hover { background:#ffffff24; }
      button:focus-visible, input:focus-visible { outline:2px solid #8fbcff; outline-offset:3px; }
      header button { width:26px; height:26px; padding:0; font-size:18px; line-height:24px; }
      .body { padding:0 14px 14px; max-height:calc(100vh - 168px); overflow-y:auto; scrollbar-width:thin; }
      .status { min-height:18px; margin:0 0 8px; color:#c5d0e3; font-size:12px; overflow-wrap:anywhere; }
      .settings-group { margin:12px 0 0; padding:10px; border:1px solid #ffffff15; border-radius:12px; background:#ffffff03; }
      .settings-group h2 { margin:0 0 7px; color:#9fb5d5; font-size:11px; font-weight:600; }
      .settings-group label:first-of-type { margin-top:0; }
      .actions { display:flex; gap:8px; margin-bottom:12px; }
      .actions button { flex:1; }
      .start { background:#5178c6; border-color:#88b4ff80; }
      .start:hover { background:#6288d5; }
      .preview { position:relative; width:100%; aspect-ratio:4/3; overflow:hidden; background:#0c1019; border-radius:12px; margin-bottom:10px; }
      :host([data-preview-only="true"]) .panel { background:transparent; border-radius:14px; }
      :host([data-preview-only="true"]) header,
      :host([data-preview-only="true"]) .body > :not(.preview) { display:none !important; }
      :host([data-preview-only="true"]) .body { padding:0; max-height:none; overflow:visible; }
      :host([data-preview-only="true"]) .preview { margin:0; border-radius:12px; cursor:move; touch-action:none; user-select:none; }
      video, canvas { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; transform:scaleX(-1); }
      canvas { pointer-events:none; }
      label { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:9px; font-size:12px; }
      input[type="checkbox"] { accent-color:#91b7ff; }
      input[type="range"] { width:128px; accent-color:#91b7ff; }
      .fps input[type="range"] { width:100px; flex-shrink:0; }
      [data-fps-label] { font-size:10px; font-variant-numeric:tabular-nums; white-space:nowrap; }
      select { background:#202938; border:1px solid #ffffff30; border-radius:8px; color:inherit; padding:5px 9px; font:inherit; }
      .ghost { position:fixed; z-index:2147483644; pointer-events:none; width:28px; height:28px; margin:-14px; border:2px solid #fff; border-radius:50%; background:#7198ef55; box-shadow:0 0 0 5px #7198ef22,0 3px 16px #0008; transition:transform 70ms linear,opacity 120ms; }
      .ghost::after { content:""; position:absolute; width:4px; height:4px; background:#fff; border-radius:50%; top:10px; left:10px; }
      .ghost[data-pressed="true"] { background:#7fb6ff99; box-shadow:0 0 0 10px #7fb6ff22,0 3px 16px #0008; }
      .meter { height:4px; background:#ffffff15; border-radius:4px; margin-top:10px; overflow:hidden; }
      .meter > i { display:block; width:0; height:100%; background:#8eb8ff; transition:width .1s linear; }
      @media (prefers-reduced-motion:reduce) { .meter > i { transition:none; } }
    </style>
    <section class="panel" aria-label="摄像头手势控制">
      <header><span class="dot" data-dot></span><strong>手势控制</strong><button type="button" data-fold aria-label="收起面板" aria-expanded="true">−</button></header>
      <div class="body">
        <p class="status" data-status role="status" aria-live="polite">摄像头未开启</p>
        <div class="actions"><button type="button" class="start" data-start>开启摄像头</button></div>
        <div class="preview" data-preview tabindex="0" role="button" title="双击切换预览小窗" aria-label="摄像头预览，双击切换小窗和完整面板"><video muted playsinline aria-label="摄像头预览"></video><canvas width="320" height="240" aria-hidden="true"></canvas></div>
        <section class="settings-group" aria-label="手部控制">
          <h2>手部控制</h2>
          <label>控制手<select data-control-hand aria-label="选择控制手"><option value="auto">自动</option><option value="Right">右手</option><option value="Left">左手</option></select></label>
          <label>忽略手背<input type="checkbox" data-palm-only></label>
          <label title="左右手识别相反时再打开">左右手反转<input type="checkbox" data-swap-hands></label>
          <label>虚拟拖动<input type="checkbox" data-virtual-drag></label>
          <label>反转上下方向<input type="checkbox" data-reverse></label>
        </section>
        <section class="settings-group" aria-label="挥动方向">
          <h2>挥动方向</h2>
          <label>向上挥动<input type="checkbox" data-swipe-up></label>
          <label>向下挥动<input type="checkbox" data-swipe-down></label>
          <label>向左挥动 · Z<input type="checkbox" data-swipe-left></label>
          <label>向右挥动 · R<input type="checkbox" data-swipe-right></label>
        </section>
        <section class="settings-group" aria-label="面部控制">
          <h2>面部控制</h2>
          <label title="微笑后在视频中心双击，持续微笑时随机位置双击">微笑点赞<input type="checkbox" data-smile-like></label>
          <label title="先正脸保持片刻，再左右摇头触发一次R；首次开启下载面部模型">摇头 R <small data-face-status hidden></small><input type="checkbox" data-face-reject></label>
        </section>
        <section class="settings-group" aria-label="识别调节">
          <h2>识别调节</h2>
          <label title="降低挥动幅度、速度和准备等待门槛，保留收手保护；更灵敏，也更容易误触">激进模式<input type="checkbox" data-aggressive></label>
          <label>挥动距离 <span data-distance-label></span><input type="range" min="6" max="26" step="1" data-distance aria-label="挥动距离相对于手掌大小，越小越灵敏"></label>
          <label class="fps">识别帧率 <span data-fps-label title="目标 / 实际识别帧率"></span><input type="range" min="5" max="60" step="1" data-fps aria-label="每秒采集识别帧数"></label>
        </section>
        <section class="settings-group" aria-label="预览显示">
          <h2>预览显示</h2>
          <label>摄像头预览<input type="checkbox" data-preview-toggle></label>
          <label>手部骨架<input type="checkbox" data-show-hand-skeleton></label>
          <label>面部骨架<input type="checkbox" data-show-face-skeleton></label>
          <label>辅助横条<input type="checkbox" data-show-guide></label>
        </section>
        <div class="meter" aria-hidden="true"><i data-progress></i></div>
      </div>
    </section><div class="ghost" data-ghost hidden aria-hidden="true"></div>`;
  document.documentElement.append(host);
  const find = selector => shadow.querySelector(selector);
  const video = find('video');
  const canvas = find('canvas');
  const paint = canvas.getContext('2d');
  const statusNode = find('[data-status]');
  let handStatusText = '摄像头未开启';
  let handStatusKind = 'idle';
  const progress = find('[data-progress]');
  const assetURLs = [];          // 模型资源转成的 blob URL，释放时统一 revoke
  let assetCachePromise = null;  // IndexedDB 资源缓存的打开 Promise
  let assetCacheDB = null;       // IndexedDB 资源缓存连接
  let stream = null;             // 摄像头 MediaStream
  let worker = null;             // 识别 Worker 线程
  let modelPromise = null;       // 模型初始化 Promise（去重，避免重复加载）
  let modelEpoch = 0;            // 模型代次，用于取消/失效旧初始化
  let workerReady = false;       // Worker 是否已确认模型就绪
  let initReject = null;         // 待拒绝的初始化 Promise
  let frameTimer = null;         // 采集循环的 setTimeout 句柄
  let watchdog = null;           // 识别超时看门狗
  let running = false;           // 摄像头是否运行中
  let starting = false;          // 是否正在启动（显示“取消启动”）
  let inFlight = false;          // 是否有一帧正在 Worker 中识别（防止并发堆积）
  let generation = 0;            // 会话代次，帧/异步结果据此判断是否过期
  let lastVideoTime = -1;        // 上一次采集的视频 currentTime，用于判断是否来了新帧
  let latestPalm = null;         // 当前控制点的归一化坐标（手指尖或掌心）
  let latestLandmarks = null;    // 最近一帧的 21 点关键点
  let frameStarted = 0;          // 当前帧开始处理的时间戳，用于补足帧间隔
  const frameTimes = [];         // 近 1.8s 完成识别的帧时间戳，用于计算实际帧率
  let inferenceStats = { hand: 0, face: 0, capture: 0, backend: 'CPU', faceBackend: '' };
  let fpsUpdatedAt = 0;          // 帧率标签上次刷新时间（0.5s 节流）
  let cameraRateApplying = false;// 是否正在应用摄像头期望帧率
  let cameraRateRevision = 0;    // 帧率应用请求的版本号（只应用最新一次）
  let pendingNavigation = null;  // 待确认的翻页请求
  let navigationTimer = null;    // 翻页确认轮询定时器
  let navigationLockUntil = 0;   // 翻页锁，到该时间前不再重复发送
  let intentRecovery = null;     // 收手状态（一次手势后的回程与停稳检测）
  let currentHandScale = null;   // 平滑后的手掌尺度（用于阈值缩放）
  let previewGuideY = null;      // 预览横条当前垂直位置（跟随手）
  let normalPanelStyles = null;  // 小窗模式下暂存的原面板样式
  let previewPosition = null;    // 小窗拖到哪了
  let handTracks = [];           // 手部跟踪记录（跨帧身份保持）
  let handSerial = 0;            // 手部跟踪记录自增 id
  let activeTrackId = null;      // 当前被选为控制手的 track id
  let activeHand = null;         // 当前控制手对象
  let selectionHint = '';        // 选手提示文案
  let virtualStroke = null;      // 虚拟拖动的手势状态
  let nativeDrag = null;         // 原生的模拟拖动状态
  let oppositeGuard = null;      // 反向回落抑制（收手后紧接着的反向动作忽略）
  let gate = {};                 // 手势门控状态（armed 表示已就绪可触发）
  let wasOpenPalm = false;       // 上一帧是否“张掌”（用于张掌点击的边缘触发，每次重新张开只点一次）
  let palmHoldSince = null;
  let palmHoldAnchor = null;
  let palmReleaseSince = null;
  let palmClickAfter = 0;
  let workerAssets = null;
  let faceReady = false;
  let faceModelPromise = null;
  let faceInitResolve = null;
  let faceInitReject = null;
  let faceGate = null;
  let smileGate = null;
  let latestFace = null;
  let latestFaceAt = 0;

  function resetGesture(clearIntent = false) {
    // 重置手势门控。clearIntent=true 时连收手/反向抑制也一起清（重新选手、换手等场景）。
    if (clearIntent) {
      intentRecovery = null;
      oppositeGuard = null;
    }
    cancelVirtualStroke();
    if (intentRecovery) resetRecoveryStillness();
    gate = { armed: false, centerSince: null, cooldownUntil: 0, missingSince: null, smooth: null, smoothX: null, anchorX: null, anchorY: null, anchorPalmY: null, homeX: null, homeY: null, reference: null, lastPoseAt: 0, history: [] };
    progress.style.width = '0%';
  }

  function save() {
    GM_setValue(STORAGE_KEY, { ...settings, schema: 3 }); // 把所有设置连同数据结构版本号一起持久化
  }

  function status(message, kind = 'idle') {
    // 面板顶部的状态文案；kind 控制状态圆点颜色（idle/active/busy/error）
    if (running && activeHand && kind !== 'error') message = (activeHand.side === 'Right' ? '右手' : activeHand.side === 'Left' ? '左手' : '控制手') + ' · ' + message;
    handStatusText = message;
    handStatusKind = kind;
    renderCombinedStatus();
    find('[data-dot]').dataset.kind = kind;
  }

  function renderCombinedStatus() {
    const parts = [handStatusText];
    if (running && handStatusKind !== 'error' && (settings.faceReject || settings.smileLike)) {
      const faceStatus = find('[data-face-status]').textContent;
      if (faceStatus) parts.push(faceStatus);
      if (settings.smileLike && smileGate?.detail) parts.push(smileGate.detail);
    }
    const message = parts.join(' · ');
    if (statusNode.textContent !== message) statusNode.textContent = message;
  }

  function syncSettings() {
    // 把内存里的设置回写到面板控件（控件值变化后调用，保持 UI 一致）
    find('[data-preview-toggle]').checked = settings.preview;
    find('[data-aggressive]').checked = settings.aggressive;
    for (const [direction, key] of [['up', 'swipeUp'], ['down', 'swipeDown'], ['left', 'swipeLeft'], ['right', 'swipeRight']]) find('[data-swipe-' + direction + ']').checked = settings[key];
    find('[data-show-hand-skeleton]').checked = settings.showHandSkeleton;
    find('[data-show-face-skeleton]').checked = settings.showFaceSkeleton;
    find('[data-show-guide]').checked = settings.showGuide;
    find('[data-reverse]').checked = settings.reverse;
    find('[data-control-hand]').value = settings.controlHand;
    find('[data-palm-only]').checked = settings.palmOnly;
    find('[data-swap-hands]').checked = settings.swapHands;
    find('[data-virtual-drag]').checked = settings.virtualDrag;
    find('[data-face-reject]').checked = settings.faceReject;
    find('[data-smile-like]').checked = settings.smileLike;
    find('[data-face-status]').textContent = (settings.faceReject || settings.smileLike) ? faceReady ? '已加载' : running ? '加载中' : '待开启' : '';
    find('[data-distance]').value = String(Math.round(settings.distance * 100));
    find('[data-distance-label]').textContent = Math.round(distanceFactor() * 100) + '% 掌宽';
    find('[data-fps]').value = String(settings.fps);
    showFrameRate(performance.now(), true);
    find('[data-preview]').hidden = !settings.preview;
  }

  function setButton() {
    find('[data-start]').textContent = starting ? '取消启动' : running ? '停止摄像头' : '开启摄像头';
  }

  function assetURL(data, type) {
    const url = URL.createObjectURL(new Blob([data], { type }));
    assetURLs.push(url);
    return url;
  }

  function download(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET', url, responseType: 'arraybuffer', timeout: 45000,
        onload: response => response.status >= 200 && response.status < 300 && response.response?.byteLength
          ? resolve(response.response) : reject(new Error('资源下载失败：HTTP ' + response.status)),
        onerror: () => reject(new Error('资源网络连接失败')),
        ontimeout: () => reject(new Error('资源下载超时'))
      });
    });
  }

  function assetKey(path) {
    if (path === 'face-model') return FACE_MODEL_URL;
    return path === 'model' ? MODEL_URL : VERSION + '/' + path;
  }

  function openAssetCache() {
    if (assetCachePromise) return assetCachePromise;
    assetCachePromise = new Promise(resolve => {
      if (typeof indexedDB === 'undefined') { resolve(null); return; }
      let settled = false;
      const timeout = setTimeout(() => finish(null), 1200);
      function finish(db) {
        if (settled) { if (db) db.close(); return; }
        settled = true;
        clearTimeout(timeout);
        assetCacheDB = db;
        resolve(db);
      }
      try {
        const request = indexedDB.open('xydy-gesture-model-assets', 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains('assets')) request.result.createObjectStore('assets');
        };
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => { db.close(); assetCacheDB = null; assetCachePromise = null; };
          finish(db);
        };
        request.onerror = request.onblocked = () => finish(null);
      } catch (error) { finish(null); }
    });
    return assetCachePromise;
  }

  async function readAssetCache(path) {
    const db = await openAssetCache();
    if (!db) return null;
    return new Promise(resolve => {
      let settled = false;
      const timeout = setTimeout(() => finish(null), 1000);
      function finish(value) {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(value);
      }
      try {
        const transaction = db.transaction('assets', 'readonly');
        const request = transaction.objectStore('assets').get(assetKey(path));
        request.onsuccess = () => {
          const value = request.result;
          finish(Object.prototype.toString.call(value) === '[object ArrayBuffer]' && value.byteLength > 0 ? value : null);
        };
        request.onerror = transaction.onabort = () => finish(null);
      } catch (error) { finish(null); }
    });
  }

  function writeAssetCache(path, buffer) {
    if (!assetCacheDB) return;
    try {
      const transaction = assetCacheDB.transaction('assets', 'readwrite');
      transaction.objectStore('assets').put(buffer, assetKey(path));
      transaction.onerror = transaction.onabort = () => {};
    } catch (error) {}
  }

  function invalidateAssetCache() {
    if (!assetCacheDB) return;
    try {
      const transaction = assetCacheDB.transaction('assets', 'readwrite');
      const store = transaction.objectStore('assets');
      for (const path of RESOURCE_PATHS) store.delete(assetKey(path));
      transaction.onerror = transaction.onabort = () => {};
    } catch (error) {}
  }

  async function downloadAsset(path) {
    const cached = await readAssetCache(path);
    if (cached) return { buffer: cached, cached: true };
    const urls = path === 'face-model' ? [FACE_MODEL_URL] : path === 'model' ? [MODEL_URL] : [
      `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/${path}`,
      `https://unpkg.com/@mediapipe/tasks-vision@${VERSION}/${path}`
    ];
    let failure;
    for (const url of urls) {
      try {
        const buffer = await download(url);
        writeAssetCache(path, buffer);
        return { buffer, cached: false };
      } catch (error) { failure = error; }
    }
    throw new Error((path === 'model' || path === 'face-model' ? '模型下载失败，请检查 storage.googleapis.com 的连接。' : '识别资源下载失败，请检查 CDN 连接。') + ' ' + failure.message);
  }

  function recognitionWorker() {
    let detector = null;
    let faceDetector = null;
    let lastFaceAt = -Infinity;
    let faceCost = 0;
    let handBackend = 'CPU';
    let faceBackend = 'CPU';
    async function makeDetector(Type, data, options) {
      const files = { wasmLoaderPath: data.loader, wasmBinaryPath: data.binary };
      const baseOptions = { modelAssetBuffer: new Uint8Array(data.model) };
      if (typeof OffscreenCanvas === 'function') {
        try {
          const instance = await Type.createFromOptions(files, { ...options, canvas: new OffscreenCanvas(1, 1), baseOptions: { ...baseOptions, delegate: 'GPU' } });
          return { instance, backend: 'GPU' };
        } catch (error) {}
      }
      return { instance: await Type.createFromOptions(files, { ...options, baseOptions: { ...baseOptions, delegate: 'CPU' } }), backend: 'CPU' };
    }
    self.onmessage = async event => {
      const data = event.data;
      if (data.type === 'init') {
        try {
          self.exports = {};
          importScripts(data.bundle);
          const created = await makeDetector(self.exports.HandLandmarker, data, {
            runningMode: 'VIDEO', numHands: 2,
            minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.4, minTrackingConfidence: 0.35
          });
          detector = created.instance;
          handBackend = created.backend;
          self.postMessage({ type: 'ready', backend: handBackend });
        } catch (error) {
          self.postMessage({ type: 'error', message: error.message || String(error) });
        }
      } else if (data.type === 'face-init') {
        try {
          if (!faceDetector) {
            const created = await makeDetector(self.exports.FaceLandmarker, data, {
              runningMode: 'VIDEO', numFaces: 1, outputFaceBlendshapes: true, outputFacialTransformationMatrixes: true,
              minFaceDetectionConfidence: 0.6, minFacePresenceConfidence: 0.6, minTrackingConfidence: 0.6
            });
            faceDetector = created.instance;
            faceBackend = created.backend;
          }
          self.postMessage({ type: 'face-ready', backend: faceBackend });
        } catch (error) { self.postMessage({ type: 'face-error', message: error.message || String(error) }); }
      } else if (data.type === 'frame') {
        try {
          const begin = performance.now();
          const result = detector.detectForVideo(data.image, data.timestamp);
          const handMs = performance.now() - begin;
          let faceMs = 0;
          let face = null;
          if (data.faceEnabled && faceDetector && data.timestamp - lastFaceAt >= Math.min(400, Math.max(160, faceCost * 4))) {
            lastFaceAt = data.timestamp;
            try {
              const faceBegin = performance.now();
              const detected = faceDetector.detectForVideo(data.image, data.timestamp);
              faceMs = performance.now() - faceBegin;
              faceCost = faceCost ? faceCost * 0.7 + faceMs * 0.3 : faceMs;
              const matrix = detected.facialTransformationMatrixes?.[0];
              const categories = detected.faceBlendshapes?.[0];
              const landmarks = detected.faceLandmarks?.[0];
              if (landmarks) {
                const scores = Object.fromEntries((categories?.categories || []).map(item => [item.categoryName, item.score]));
                const m = matrix?.data;
                face = { found: true, landmarks, yaw: m ? Math.atan2(m[8], m[10]) : null, pitch: m ? Math.atan2(-m[9], Math.hypot(m[8], m[10])) : null, frownLeft: scores.mouthFrownLeft || 0, frownRight: scores.mouthFrownRight || 0, smile: Math.max(scores.mouthSmileLeft || 0, scores.mouthSmileRight || 0), jawOpen: scores.jawOpen || 0 };
              } else face = { found: false };
            } catch (error) {
              try { faceDetector.close(); } catch (ignored) {}
              faceDetector = null;
              self.postMessage({ type: 'face-error', message: error.message || String(error) });
            }
          }
          self.postMessage({ type: 'result', generation: data.generation, face, handMs, faceMs, backend: handBackend, hands: result.landmarks.map((landmarks, index) => ({ landmarks, world: result.worldLandmarks[index] || null, handedness: result.handedness[index] || [] })), elapsed: performance.now() - begin });
        } catch (error) {
          self.postMessage({ type: 'error', message: error.message || String(error) });
        } finally {
          data.image.close();
        }
      }
    };
  }

  function disposeWorker() {
    if (faceInitReject) faceInitReject(new Error('面部模型已取消'));
    faceInitResolve = faceInitReject = null;
    faceReady = false;
    faceModelPromise = null;
    workerAssets = null;
    faceGate = null;
    smileGate = null;
    latestFace = null;
    latestFaceAt = 0;
    modelEpoch++;
    if (initReject) {
      const reject = initReject;
      initReject = null;
      reject(new Error('识别初始化已取消。'));
    }
    if (worker) worker.terminate();
    worker = null;
    workerReady = false;
    modelPromise = null;
    assetURLs.splice(0).forEach(url => URL.revokeObjectURL(url));
  }

  function workerFailure(message) {
    if (initReject) {
      const reject = initReject;
      initReject = null;
      reject(new Error(message));
      return;
    }
    stop('识别线程出错，摄像头已关闭。' + message, 'error');
    disposeWorker();
  }

  function ensureFaceRecognizer() {
    if (!(settings.faceReject || settings.smileLike) || !workerReady || faceReady) return Promise.resolve();
    if (faceModelPromise) return faceModelPromise;
    const epoch = modelEpoch;
    const currentWorker = worker;
    find('[data-face-status]').textContent = '加载中';
    if (inFlight) {
      clearTimeout(watchdog);
      watchdog = setTimeout(() => workerFailure('识别超时，请重新开启。'), 45000);
    }
    const request = (async () => {
      const asset = await downloadAsset('face-model');
      if (epoch !== modelEpoch || currentWorker !== worker || !(settings.faceReject || settings.smileLike)) return;
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => finish(new Error('面部模型初始化超时')), 45000);
        function finish(error) {
          clearTimeout(timeout);
          faceInitResolve = faceInitReject = null;
          if (error) reject(error); else resolve();
        }
        faceInitResolve = () => finish();
        faceInitReject = error => finish(error);
        currentWorker.postMessage({ type: 'face-init', ...workerAssets, model: asset.buffer }, [asset.buffer]);
      });
    })().catch(error => {
      if (epoch !== modelEpoch) return;
      faceReady = false;
      faceGate = null;
    smileGate = null;
    latestFace = null;
    latestFaceAt = 0;
      find('[data-face-status]').textContent = (settings.faceReject || settings.smileLike) ? '加载失败' : '';
      find('[data-face-status]').title = error.message || String(error);
      if (assetCacheDB) {
        try { assetCacheDB.transaction('assets', 'readwrite').objectStore('assets').delete(assetKey('face-model')); } catch (ignored) {}
      }
    }).finally(() => {
      if (faceModelPromise === request) faceModelPromise = null;
    });
    faceModelPromise = request;
    return request;
  }

  function smileLikeButton(feed) {
    const scope = feed.card.closest('[data-e2e="feed-active-video"], [data-e2e="feed-active-item"], .dySwiperSlide') || feed.card;
    return scope.querySelector('[data-e2e="video-player-digg"], [data-e2e="feed-digg-icon"]');
  }

  function smileLiked(button) {
    if (!button) return null;
    const state = button.getAttribute('data-e2e-state') || '';
    if (state.includes('no-digged')) return false;
    if (state.includes('digged')) return true;
    const pressed = button.getAttribute('aria-pressed');
    if (pressed === 'true' || pressed === 'false') return pressed === 'true';
    return null;
  }

  function confirmSmileLike(feed, token) {
    const current = () => running && settings.smileLike && smileGate === token && !document.hidden && document.hasFocus() && activeFeed()?.card === feed.card;
    setTimeout(() => {
      if (!current()) return;
      const button = smileLikeButton(feed);
      const liked = smileLiked(button);
      if (liked === true) {
        token.detail = '微笑✓ · 已确认点赞';
        renderCombinedStatus();
      } else if (liked === false && !blockingReason() && !nativeDrag && !pendingNavigation) {
        if (token.likePendingButton === button) return;
        token.likePendingButton = button;
        button.click();
        setTimeout(() => {
          if (token.likePendingButton === button) token.likePendingButton = null;
          if (!current()) return;
          token.detail = smileLiked(smileLikeButton(feed)) === true ? '微笑✓ · 已确认点赞' : '微笑✓ · 已点原生赞，尚未确认';
          renderCombinedStatus();
        }, 500);
      } else {
        token.detail = '微笑✓ · 双击已发送，未确认点赞';
        renderCombinedStatus();
      }
    }, 250);
  }

  function smileDoubleClick(randomPosition) {
    const reject = reason => { if (smileGate) smileGate.blockReason = reason; return false; };
    const reason = blockingReason();
    if (reason || nativeDrag || pendingNavigation) return reject(reason || '切换中');
    const feed = activeFeed();
    if (!feed?.media) return reject('未找到视频画面');
    const rect = feed.media.getBoundingClientRect();
    const left = Math.max(0, rect.left);
    const right = Math.min(innerWidth, rect.right);
    const top = Math.max(0, rect.top);
    const bottom = Math.min(innerHeight, rect.bottom);
    if (right - left < 100 || bottom - top < 100) return reject('画面太小');
    for (let attempt = 0; attempt < 6; attempt++) {
      const x = left + (right - left) * (randomPosition ? 0.2 + Math.random() * 0.6 : 0.5);
      const y = top + (bottom - top) * (randomPosition ? 0.2 + Math.random() * 0.6 : 0.5);
      const target = document.elementFromPoint(x, y);
      if (!target || target === host || !(feed.card.contains(target) || target.contains(feed.media))) continue;
      const control = target.closest('a,button,input,textarea,select,[contenteditable="true"],[role="button"]');
      if (control && !control.contains(feed.media)) continue;
      try {
        const wasPlaying = feed.movie && !feed.movie.paused;
        const init = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, screenX: x + window.screenX, screenY: y + window.screenY, button: 0 };
        for (const detail of [1, 2]) {
          if (typeof PointerEvent === 'function') target.dispatchEvent(new PointerEvent('pointerdown', { ...init, detail, pointerId: 1, pointerType: 'mouse', isPrimary: true, buttons: 1 }));
          target.dispatchEvent(new MouseEvent('mousedown', { ...init, detail, buttons: 1 }));
          if (typeof PointerEvent === 'function') target.dispatchEvent(new PointerEvent('pointerup', { ...init, detail, pointerId: 1, pointerType: 'mouse', isPrimary: true, buttons: 0 }));
          target.dispatchEvent(new MouseEvent('mouseup', { ...init, detail, buttons: 0 }));
          target.dispatchEvent(new MouseEvent('click', { ...init, detail, buttons: 0 }));
        }
        target.dispatchEvent(new MouseEvent('dblclick', { ...init, detail: 2, buttons: 0 }));
        confirmSmileLike(feed, smileGate);
        if (wasPlaying) setTimeout(() => {
          if (running && settings.smileLike && activeFeed()?.card === feed.card && feed.movie.paused) feed.movie.play().catch(() => {});
        }, 100);
        return true;
      } catch (error) { return reject('双击失败：' + error.message); }
    }
    return reject('点击位置被控件遮挡');
  }

  function streamSmileClicks(state) {
    const card = activeFeed()?.card;
    let sent = 0;
    state.burstActive = true;
    const step = () => {
      state.burstTimer = null;
      if (!running || !settings.smileLike || smileGate !== state || !state.active || state.relaxedSince !== null || performance.now() - state.lastSeen > 800 || activeFeed()?.card !== card) {
        state.burstActive = false;
        return;
      }
      if (!smileDoubleClick(true)) {
        state.burstActive = false;
        state.detail = '微笑✓ · 未点击：' + state.blockReason;
        renderCombinedStatus();
        return;
      }
      sent++;
      state.detail = '微笑✓ · 随机双击 ' + sent + '/10';
      renderCombinedStatus();
      if (sent < 10) state.burstTimer = setTimeout(step, 100);
      else state.burstActive = false;
    };
    step();
  }

  function processSmileGesture(face, now) {
    if (!settings.smileLike) { smileGate = null; return; }
    if (!smileGate) smileGate = { since: null, relaxedSince: null, active: false, detected: false, nextAt: 0, lastSeen: now, detail: '', blockReason: '' };
    const state = smileGate;
    if (!face.found || now - state.lastSeen > 1500) {
      clearTimeout(state.burstTimer);
      state.burstActive = false;
      state.since = null;
      state.relaxedSince = null;
      state.active = state.detected = false;
      state.lastSeen = now;
      state.detail = face.found ? '微笑重新识别' : '未见面部';
      return;
    }
    state.lastSeen = now;
    const points = face.landmarks;
    let mouthSmile = false;
    if (points?.length > 291) {
      const width = Math.hypot(points[61].x - points[291].x, points[61].y - points[291].y);
      const eyeWidth = Math.hypot(points[33].x - points[263].x, points[33].y - points[263].y);
      const lift = ((points[0].y + points[17].y) / 2 - (points[61].y + points[291].y) / 2) / Math.max(width, 0.001);
      mouthSmile = lift > 0.035 && width / Math.max(eyeWidth, 0.001) > 0.65;
    }
    const score = Math.round(face.smile * 100);
    if (face.smile < (settings.aggressive ? 0.005 : 0.01) && !mouthSmile) {
      clearTimeout(state.burstTimer);
      state.burstActive = false;
      if (state.relaxedSince === null) state.relaxedSince = now;
      if (now - state.relaxedSince >= 350) {
        state.active = state.detected = false;
        state.since = null;
      }
      state.detail = '微笑 ' + score + '% · 等待微笑';
      return;
    }
    state.relaxedSince = null;
    if (!state.active && face.smile < (settings.aggressive ? 0.01 : 0.02) && !mouthSmile) {
      state.since = null;
      state.detected = false;
      state.detail = '微笑 ' + score + '% · 等待微笑';
      return;
    }
    if (state.since === null) state.since = now;
    if (now - state.since < (settings.aggressive ? 100 : 180)) { state.detail = '微笑 ' + score + '% · 确认中'; return; }
    state.detected = true;
    if (state.burstActive || now < state.nextAt) return;
    if (!state.active) {
      if (smileDoubleClick(false)) {
        state.active = true;
        state.detail = '微笑✓ · 中心双击，等待确认';
        state.nextAt = now + 1400;
      } else {
        state.detail = '微笑✓ · 未点击：' + state.blockReason;
        state.nextAt = now + 500;
      }
    } else {
      streamSmileClicks(state);
      state.nextAt = now + 1400;
    }
  }

  function faceAngle(value) {
    return Math.atan2(Math.sin(value), Math.cos(value));
  }

  function processFaceGesture(face, now) {
    if (!(settings.faceReject || settings.smileLike) || !faceReady) return;
    latestFace = face;
    latestFaceAt = now;
    processSmileGesture(face, now);
    if (!settings.faceReject) {
      find('[data-face-status]').textContent = '';
      return;
    }
    const label = find('[data-face-status]');
    if (!faceGate) faceGate = { neutralYaw: null, neutralPitch: 0, neutralSince: null, candidateYaw: 0, lastSeen: now, history: [], cooldownUntil: 0 };
    const state = faceGate;
    if (!face.found || !Number.isFinite(face.yaw) || !Number.isFinite(face.pitch) || blockingReason() || nativeDrag) {
      state.history = [];
      state.neutralSince = null;
      label.textContent = !face.found ? '未见面部' : !Number.isFinite(face.yaw) ? '缺少头部方向' : '暂停';
      return;
    }
    if (now - state.lastSeen > 700) {
      state.history = [];
      state.neutralSince = state.neutralYaw = null;
    }
    state.lastSeen = now;
    if (state.neutralYaw === null) {
      if (state.neutralSince === null || Math.abs(faceAngle(face.yaw - state.candidateYaw)) > 0.08) {
        state.neutralSince = now;
        state.candidateYaw = face.yaw;
      }
      if (now - state.neutralSince >= 350) {
        state.neutralYaw = face.yaw;
        state.neutralPitch = face.pitch;
      }
      label.textContent = state.neutralYaw === null ? '正脸保持片刻' : '就绪';
      return;
    }
    const yaw = faceAngle(face.yaw - state.neutralYaw);
    const pitch = faceAngle(face.pitch - state.neutralPitch);
    state.yaw = yaw;
    if (now < state.cooldownUntil) {
      state.history = [];
      label.textContent = '冷却中';
      return;
    }
    if (Math.abs(pitch) > 0.5 || Math.abs(yaw) > 0.8) {
      state.history = [];
      label.textContent = '请左右摇头，别低头';
      return;
    }
    state.history.push({ yaw, pitch, time: now });
    while (state.history.length && now - state.history[0].time > 2000) state.history.shift();
    const yaws = state.history.map(item => item.yaw);
    const pitches = state.history.map(item => item.pitch);
    const left = Math.min(...yaws) < -(settings.aggressive ? 0.07 : 0.085);
    const right = Math.max(...yaws) > (settings.aggressive ? 0.07 : 0.085);
    label.textContent = '摇头 ' + (left ? '左✓ ' : '左○ ') + (right ? '右✓' : '右○');
    const yawRange = Math.max(...yaws) - Math.min(...yaws);
    const pitchRange = Math.max(...pitches) - Math.min(...pitches);
    if (left && right && yawRange >= (settings.aggressive ? 0.16 : 0.20) && yawRange > pitchRange * 1.25 && state.history.length >= 4 && now - state.history[0].time >= 350 && sendSwipeShortcut(1)) {
      state.cooldownUntil = now + 4000;
      state.history = [];
      label.textContent = '已发送 R';
    }
  }

  function drawFacePreview() {
    if (!(settings.faceReject || settings.smileLike) || !running || !settings.preview) return;
    const face = latestFace;
    if (!face?.found || performance.now() - latestFaceAt >= 800) return;
    if (!settings.showFaceSkeleton) return;
    const points = face.landmarks;
    if (!points?.length) return;
    paint.save();
    paint.setLineDash([]);
    paint.fillStyle = '#a3eaff88';
    for (const point of points) {
      paint.beginPath();
      paint.arc(point.x * canvas.width, point.y * canvas.height, 0.65, 0, Math.PI * 2);
      paint.fill();
    }
    const contours = [
      [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109,10],
      [33,160,158,133,153,144,33], [362,385,387,263,373,380,362],
      [168,6,1,4], [61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185,61]
    ];
    paint.lineWidth = 1.2;
    contours.forEach((chain, index) => {
      paint.strokeStyle = index === 4 ? '#5ce0ad' : '#8cddff';
      paint.beginPath();
      chain.forEach((id, order) => paint[order ? 'lineTo' : 'moveTo'](points[id].x * canvas.width, points[id].y * canvas.height));
      paint.stroke();
    });
    paint.restore();
  }

  function ensureRecognizer() {
    if (workerReady) return Promise.resolve();
    if (modelPromise) return modelPromise;
    const epoch = ++modelEpoch;
    modelPromise = (async () => {
      let count = 0;
      const assets = await Promise.all(RESOURCE_PATHS.map(async path => {
        const asset = await downloadAsset(path);
        count++;
        if (starting) status((asset.cached ? '读取本地资源 ' : '下载识别资源 ') + count + '/4', 'busy');
        return asset.buffer;
      }));
      if (epoch !== modelEpoch) throw new Error('识别初始化已取消。');
      if (starting) status('加载识别模型…', 'busy');
      const bundle = assetURL(assets[0], 'application/javascript');
      const loader = assetURL(assets[1], 'application/javascript');
      const binary = assetURL(assets[2], 'application/wasm');
      workerAssets = { loader, binary };
      const source = assetURL('(' + recognitionWorker.toString() + ')();', 'application/javascript');
      worker = new Worker(source);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => finish(new Error('识别模型初始化超时，请重试。')), 45000);
        function finish(error) {
          clearTimeout(timeout);
          initReject = null;
          if (error) reject(error); else resolve();
        }
        initReject = error => finish(error);
        worker.onerror = event => workerFailure(event.message || '页面可能拦截了识别线程，请查看浏览器控制台。');
        worker.onmessageerror = () => workerFailure('识别线程通信失败。');
        worker.onmessage = event => {
          const data = event.data;
          if (data.type === 'ready') {
            workerReady = true;
            finish();
          } else if (data.type === 'face-ready') {
            inferenceStats.faceBackend = data.backend || 'CPU';
            faceReady = true;
            if (faceInitResolve) faceInitResolve();
            find('[data-face-status]').textContent = (settings.faceReject || settings.smileLike) ? '正脸保持片刻' : '';
          } else if (data.type === 'face-error') {
            faceReady = false;
            faceGate = null;
    smileGate = null;
    latestFace = null;
    latestFaceAt = 0;
            if (faceInitReject) faceInitReject(new Error(data.message));
            find('[data-face-status]').textContent = (settings.faceReject || settings.smileLike) ? '加载失败' : '';
            find('[data-face-status]').title = data.message;
          } else if (data.type === 'error') {
            workerFailure(data.message);
          } else if (data.type === 'result' && running && data.generation === generation) {
            clearTimeout(watchdog);
            inFlight = false;
            const now = performance.now();
            inferenceStats.hand = inferenceStats.hand * 0.7 + (data.handMs || 0) * 0.3;
            if (data.faceMs) inferenceStats.face = inferenceStats.face * 0.7 + data.faceMs * 0.3;
            inferenceStats.backend = data.backend || 'CPU';
            frameTimes.push(now);
            showFrameRate(now);
            try {
              if (data.face && (settings.faceReject || settings.smileLike) && faceReady) processFaceGesture(data.face, now);
              const hand = selectControlHand(data.hands || [], now);
              processHand(hand ? hand.landmarks : null, hand ? hand.world : null, now);
              drawPreview(hand ? hand.landmarks : null);
              renderCombinedStatus();
            } catch (error) {
              stop('识别异常：' + (error.message || String(error)), 'error');
            }
            scheduleFrame(Math.max(0, 1000 / settings.fps - (performance.now() - frameStarted)));
          }
        };
        worker.postMessage({ type: 'init', bundle, loader, binary, model: assets[3] }, [assets[3]]);
      });
    })().catch(error => {
      if (epoch === modelEpoch) {
        invalidateAssetCache();
        disposeWorker();
      }
      throw error;
    });
    return modelPromise;
  }

  function visible(element) {
    // 判断元素是否在视口内可见（尺寸非零、在屏幕内、且 display/visibility/opacity 没被隐藏）
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01;
  }

  function blockingReason() {
    // 返回阻止响应手势的原因；空字符串表示可以响应。只在真正要发动作时调用，避免每帧全页扫描。
    if (document.hidden || !document.hasFocus()) return '窗口不在前台';
    if (document.activeElement?.matches(SELECTORS.editor)) return '输入中，暂不响应手势';
    if ([...document.querySelectorAll(SELECTORS.modal)].some(visible)) return '弹窗打开中，暂不响应手势';
    if (!activeFeed()) return '请打开抖音视频流或图文卡片';
    return '';
  }

  function bestVisible(elements, minSize = 64) {
    // 在一组元素里挑最“居中且足够大”的那个（越靠近屏幕中心权重越高）
    let best = null;
    let bestArea = 0;
    for (const element of elements) {
      if (!visible(element)) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) continue;
      const area = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0)) * Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0)) / (1 + Math.abs(rect.top + rect.height / 2 - innerHeight / 2) / innerHeight);
      if (area > bestArea) {
        best = element;
        bestArea = area;
      }
    }
    return best;
  }

  function activeFeed() {
    // 定位当前正在展示的视频/图文卡片及其媒体元素
    const cards = [...document.querySelectorAll(SELECTORS.feedCard)];
    const players = cards.filter(element => element.classList.contains('basePlayerContainer'));
    let card = bestVisible(players, 120) || bestVisible(cards, 120);
    if (!card) {
      const slides = [...document.querySelectorAll(SELECTORS.feedSlide)].filter(element => !element.parentElement?.closest(SELECTORS.feedSlide));
      card = bestVisible(slides, 120);
    }
    const scope = card || document;
    const movie = bestVisible(scope.querySelectorAll(SELECTORS.feedVideo));
    const picture = bestVisible(scope.querySelectorAll(SELECTORS.feedImage));
    const media = picture || movie;
    if (!card && !media) return null;
    return { card: card || media.closest('.dySwiperSlide') || media, media, movie, kind: picture ? 'gallery' : movie ? 'video' : 'loading' };
  }

  function videoSnapshot() {
    // 抓取当前作品的身份指纹（id/链接/描述），用于翻页后比对确认是否真的切换了
    const feed = activeFeed();
    if (!feed) return null;
    const card = feed.card;
    const link = card.querySelector(SELECTORS.postLink)?.getAttribute('href') || '';
    const description = card.querySelector(SELECTORS.description)?.textContent.trim() || '';
    const strongKey = card.getAttribute('data-aweme-id') || card.getAttribute('data-video-id') || card.getAttribute('data-item-id') || link;
    const contentKey = strongKey || description;
    return { element: card, media: feed.media, kind: feed.kind, contentKey, strongKey, movie: feed.movie, source: feed.kind === 'video' ? feed.movie?.currentSrc || feed.movie?.getAttribute('src') || '' : '' };
  }

  function changedVideo(before, after) {
    if (!before || !after || after.kind === 'loading') return false;
    if (before.strongKey && after.strongKey) return before.strongKey !== after.strongKey;
    if (before.contentKey && after.contentKey && before.contentKey !== after.contentKey) return true;
    if (before.element !== after.element) return true;
    if (before.kind !== after.kind && before.kind !== 'loading') return true;
    return before.kind === 'video' && after.kind === 'video' && Boolean(before.source && after.source && before.source !== after.source);
  }

  function actionStatus(message, kind = 'idle') {
    status(message, kind);
  }

  function verifyNavigation(request) {
    // 翻页后轮询核对作品是否真的切换了；连续两次采样确认才算成功，超时则提示。
    if (pendingNavigation !== request) return;
    const after = videoSnapshot();
    if (changedVideo(request.before, after)) {
      if (request.observed && request.observed.element === after.element && request.observed.contentKey === after.contentKey && request.observed.kind === after.kind && request.observed.source === after.source) request.stable++;
      else request.stable = 1;
      request.observed = after;
      if (request.stable >= 2) {
        pendingNavigation = null;
        actionStatus(request.label, 'active');
        return;
      }
    } else {
      request.stable = 0;
      request.observed = null;
    }
    if (performance.now() >= request.deadline) {
      pendingNavigation = null;
      actionStatus('未确认切换，可重试', 'busy');
      return;
    }
    navigationTimer = setTimeout(() => verifyNavigation(request), 160);
  }

  function navigate(direction, manual = false) {
    // 上下翻页：优先点原生按钮，没有就发方向键。direction>0=下一个，<0=上一个。
    if (nativeDrag) return false;
    const reason = blockingReason();
    if (reason) {
      actionStatus('没有发送切换：' + reason, 'busy');
      return false;
    }
    if (performance.now() < navigationLockUntil) return false; // 短暂锁定，防连发
    if (pendingNavigation) {
      clearTimeout(navigationTimer);
      pendingNavigation = null;
    }
    const next = manual ? direction > 0 : settings.reverse ? direction < 0 : direction > 0; // 反转开关影响最终方向
    const before = videoSnapshot();
    if (!before) {
      actionStatus('没有找到当前视频或图文卡片，暂时无法切换。', 'error');
      return false;
    }
    const selector = next ? SELECTORS.next : SELECTORS.previous;
    const button = [...document.querySelectorAll(selector)].find(element => visible(element) && !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true');
    const request = { before, label: next ? '下一个视频' : '上一个视频', method: button ? '原生切换按钮' : '视频区域方向键', deadline: performance.now() + 2400, observed: null, stable: 0 };
    pendingNavigation = request;
    navigationLockUntil = performance.now() + 420;
    actionStatus(request.label, 'active');
    if (button) button.click();
    else {
      const key = next ? 'ArrowDown' : 'ArrowUp';
      const keyCode = next ? 40 : 38;
      const target = before.media || before.element;
      for (const type of ['keydown', 'keyup']) {
        target.dispatchEvent(new KeyboardEvent(type, { key, code: key, keyCode, which: keyCode, bubbles: true, cancelable: true }));
      }
    }
    clearTimeout(navigationTimer);
    navigationTimer = setTimeout(() => verifyNavigation(request), 160);
    return true;
  }

  function sendSwipeShortcut(direction) {
    // 左右挥动：发送 Z（左）/ R（右）快捷键，模拟抖音的左右翻页/收藏交互。
    if (nativeDrag || performance.now() < navigationLockUntil || blockingReason()) return false;
    const feed = activeFeed();
    if (!feed) return false;
    const key = direction < 0 ? 'z' : 'r';
    const target = feed.media || feed.card;
    const keyCode = key === 'z' ? 90 : 82;
    const init = { key, code: key === 'z' ? 'KeyZ' : 'KeyR', keyCode, which: keyCode, bubbles: true, cancelable: true, repeat: false };
    target.dispatchEvent(new KeyboardEvent('keydown', init));
    target.dispatchEvent(new KeyboardEvent('keyup', init));
    navigationLockUntil = performance.now() + 420;
    return true;
  }

  function sendClickShortcut() {
    // 张开手掌 = 模拟“点击 X”语义（开关评论区）。
    // 关键结论（从鼠标中键绑定 X 那块学到的）：
    //   - 抖音原生 X 热键、以及主脚本对 X 的 keydown 监听都要求 event.isTrusted === true，
    //     而 dispatchEvent 合成出来的键盘事件 isTrusted 恒为 false，抖音会直接忽略。
    //   - 鼠标中键绑定 X 之所以一直稳定，是因为它根本不靠合成 X 键，而是直接调用
    //     主脚本暴露的 window.XYDYCommentsPanel.toggleFromShortcut() 来开关评论区。
    // 所以这里也照做：优先调用同一个可靠入口，主脚本没装时才退回直接点评论区按钮。
    if (nativeDrag || performance.now() < navigationLockUntil || blockingReason()) return false;
    return toggleCommentPanel();
  }

  function toggleCommentPanel() {
    // 优先复用主脚本（xyDouYinTools.user.js）里已验证可靠的评论区开关入口。
    // 真机验证：主脚本用 xydy-comments-force-hidden + CSS translateX 把面板推出屏幕，开/关都有效；
    // 抖音面板里没有原生关闭按钮，点图标在打开态也不能关，所以这条路是唯一可靠的。
    if (window.XYDYCommentsPanel && typeof window.XYDYCommentsPanel.toggleFromShortcut === 'function') {
      window.XYDYCommentsPanel.toggleFromShortcut();
      navigationLockUntil = performance.now() + 500; // 防抖：手部检测抖动导致连续开合
      return true;
    }
    if (document.documentElement.dataset.xydyCommentsBridge === 'on') {
      document.dispatchEvent(new Event('xydy-comments-toggle'));
      navigationLockUntil = performance.now() + 500;
      return true;
    }

    // 主脚本没装时的兜底：打开点评论区图标；关闭直接内联隐藏面板。
    const sideCard = document.getElementById('videoSideCard') || document.getElementById('chapterVideoSideCard');
    if (commentPanelVisible()) {
      if (sideCard) {
        try { localStorage.setItem('xydy-comments-visibility', 'closed'); } catch (error) {}
        document.documentElement.classList.add('xydy-comments-force-hidden');
        sideCard.style.setProperty('display', 'none', 'important');
        navigationLockUntil = performance.now() + 500;
        return true;
      }
      return false;
    }
    const commentIcon = findVisibleCommentIcon();
    if (!commentIcon) return false;
    try { localStorage.setItem('xydy-comments-visibility', 'open'); } catch (error) {}
    document.documentElement.classList.remove('xydy-comments-force-hidden');
    if (sideCard) sideCard.style.removeProperty('display');
    commentIcon.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    navigationLockUntil = performance.now() + 500;
    return true;
  }

  function commentPanelVisible() {
    if (document.documentElement.classList.contains('xydy-comments-force-hidden')) return false;
    const sideCard = document.getElementById('videoSideCard') || document.getElementById('chapterVideoSideCard');
    if (!sideCard) return false;
    const rect = sideCard.getBoundingClientRect();
    const style = getComputedStyle(sideCard);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > 20 && rect.height > 20 && rect.right > 0 && rect.left < innerWidth;
  }

  function findVisibleCommentIcon() {
    return [...document.querySelectorAll('[data-e2e="feed-comment-icon"], [data-e2e="video-comment-icon"]')].find(el => visible(el));
  }

  function cancelVirtualStroke() {
    virtualStroke = null;
    const ghost = find('[data-ghost]');
    ghost.hidden = true;
    ghost.dataset.pressed = 'false';
  }

  function updateVirtualStroke(point, points, pose, swipe, now, scale) {
    // 虚拟拖动：让一个网页里的指示点跟随控制手指上下移动，达到幅度后在停顿/回程/离手时松开。
    if (nativeDrag) return;
    if (!virtualStroke) {
      const feed = activeFeed();
      if (!feed) return;
      const rect = (feed.media || feed.card).getBoundingClientRect();
      virtualStroke = { originX: point.x, originY: point.y, screenX: clamp(rect.left + rect.width / 2, 30, innerWidth - 30), screenY: clamp(rect.top + rect.height / 2, 40, innerHeight - 40), candidate: null, lastY: point.y, extremeY: point.y, extremePalmY: palmCenter(points).y, quietSince: now, createdAt: now };
    }
    const stroke = virtualStroke;
    stroke.points = points;
    stroke.scale = scale;
    stroke.lastSeenAt = now;
    if (Math.abs(point.y - stroke.lastY) > scale * 0.035) stroke.quietSince = now;
    stroke.lastY = point.y;
    if (!stroke.candidate && swipe) { // 检测到挥动，锁定拖动候选方向
      stroke.candidate = { ...swipe };
      stroke.extremeY = point.y;
      stroke.extremePalmY = palmCenter(points).y;
      stroke.quietSince = now;
      stroke.createdAt = now;
    }
    if (!stroke.candidate && gate.history.length) {
      stroke.originX = gate.history[0].x;
      stroke.originY = gate.history[0].y;
    }
    // 手指位移 → 屏幕像素位移（按手势阈值归一化映射）
    const dx = clamp(-(point.x - stroke.originX) * frameAspect() / gestureThreshold(scale) * innerHeight * 0.16, -innerWidth * 0.35, innerWidth * 0.35);
    const dy = clamp((point.y - stroke.originY) / gestureThreshold(scale) * innerHeight * 0.16, -innerHeight * 0.35, innerHeight * 0.35);
    const ghost = find('[data-ghost]');
    ghost.hidden = false;
    ghost.style.left = '0';
    ghost.style.top = '0';
    ghost.style.transform = 'translate(' + clamp(stroke.screenX + dx, 24, innerWidth - 24) + 'px,' + clamp(stroke.screenY + dy, 24, innerHeight - 24) + 'px)';
    ghost.dataset.pressed = String(Boolean(stroke.candidate) || Math.hypot(dx, dy) > 8);
    if (!stroke.candidate) {
      status('虚拟拖动 · 就绪', 'active');
      return;
    }
    const direction = stroke.candidate.direction;
    if (direction * (point.y - stroke.extremeY) > 0) stroke.extremeY = point.y;
    if (direction * (palmCenter(points).y - stroke.extremePalmY) > 0) stroke.extremePalmY = palmCenter(points).y;
    const reversed = direction * (stroke.extremeY - point.y) >= Math.max(scale * 0.12, stroke.candidate.displacement * 0.25); // 是否已经回程
    status('虚拟拖动 · 按住', 'active');
    if (reversed || now - stroke.quietSince >= 160 || now - stroke.createdAt >= 1200) {
      const candidate = { ...stroke.candidate, extremeY: stroke.extremeY, extremePalmY: stroke.extremePalmY, displacement: Math.max(stroke.candidate.displacement, Math.abs(stroke.extremeY - stroke.candidate.originY)) };
      commitGesture(candidate, points, now, scale);
    }
  }

  function emitDragPointer(attempt, type, y) {
    // 向目标元素派发一个合成的 PointerEvent（pointerId=27182，触摸类型）
    attempt.target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 27182, pointerType: 'touch', isPrimary: true, clientX: attempt.x, clientY: y, button: 0, buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1, pressure: type === 'pointerup' || type === 'pointercancel' ? 0 : 0.5 }));
  }

  function cancelNativeDrag() {
    const attempt = nativeDrag;
    nativeDrag = null;
    if (!attempt) return;
    clearTimeout(attempt.timer);
    cancelAnimationFrame(attempt.animation);
    if (!attempt.released) { // 未释放就取消，补发 pointercancel + pointerup 避免卡住
      emitDragPointer(attempt, 'pointercancel', attempt.lastY);
      emitDragPointer(attempt, 'pointerup', attempt.lastY);
    }
  }

  function checkNativeDrag(attempt) {
    // 原生 PointerEvent 拖动后核对作品是否变化；没变则回退用 navigate() 完成切换。
    if (nativeDrag !== attempt) return;
    const after = videoSnapshot();
    if (changedVideo(attempt.before, after)) attempt.stable++;
    else attempt.stable = 0;
    if (attempt.stable >= 2) {
      nativeDrag = null;
      status('已拖动切换', 'active');
      return;
    }
    if (performance.now() >= attempt.deadline) {
      nativeDrag = null;
      if (after && after.kind !== 'loading' && !changedVideo(attempt.before, after)) navigate(attempt.direction);
      else status('等待视频加载', 'busy');
      return;
    }
    attempt.timer = setTimeout(() => checkNativeDrag(attempt), 100);
  }

  function sendVirtualDrag(swipe) {
    if (!swipeDirectionEnabled('y', swipe.direction)) return false;
    // 执行一次合成的垂直拖动：在约 80ms 内派发 pointerdown→move→up，再核对作品是否真的切换。
    if (nativeDrag || performance.now() < navigationLockUntil || blockingReason()) return false;
    const before = videoSnapshot();
    if (!before) return false;
    if (typeof PointerEvent !== 'function') return navigate(swipe.direction); // 不支持 PointerEvent 就退回翻页
    clearTimeout(navigationTimer);
    pendingNavigation = null;
    const target = before.media || before.element;
    const rect = target.getBoundingClientRect();
    const next = settings.reverse ? swipe.direction < 0 : swipe.direction > 0;
    const y = clamp(rect.top + rect.height / 2, 40, innerHeight - 40);
    const endY = clamp(y + (next ? -1 : 1) * Math.min(rect.height * 0.28, 220), 24, innerHeight - 24);
    const attempt = { before, target, x: clamp(rect.left + rect.width / 2, 24, innerWidth - 24), startY: y, lastY: y, endY, startedAt: performance.now(), deadline: performance.now() + 650, released: false, stable: 0, direction: swipe.direction, timer: null, animation: null };
    nativeDrag = attempt;
    navigationLockUntil = performance.now() + 420;
    emitDragPointer(attempt, 'pointerdown', y);
    function step() {
      if (nativeDrag !== attempt) return;
      const progress = Math.min(1, (performance.now() - attempt.startedAt) / 80);
      attempt.lastY = attempt.startY + (attempt.endY - attempt.startY) * progress;
      emitDragPointer(attempt, 'pointermove', attempt.lastY);
      if (progress < 1) attempt.animation = requestAnimationFrame(step);
      else {
        emitDragPointer(attempt, 'pointerup', attempt.lastY);
        attempt.released = true;
        attempt.timer = setTimeout(() => checkNativeDrag(attempt), 120);
      }
    }
    attempt.animation = requestAnimationFrame(step);
    return true;
  }

  function handFacing(points, world, modelSide) {
    // 估算手掌朝向：palm=掌心朝向摄像头，back=手背朝向摄像头，edge=侧面/无法判断。
    // 用 食指根(5)→中指根差异 与 小指根(17)→腕部 两个向量叉乘得到掌面法向量。
    // modelSide 是模型给的手别标签；法向量 z 分量按左右手取不同的正负符号做修正。
    if (modelSide !== 'Left' && modelSide !== 'Right') return 'edge';
    const metric = world || points;
    const aspect = world ? 1 : frameAspect(); // 世界坐标已等尺度，归一化坐标需要按宽高比修正 x
    const vector = index => ({ x: (metric[index].x - metric[0].x) * aspect, y: metric[index].y - metric[0].y, z: (metric[index].z || 0) - (metric[0].z || 0) });
    const a = vector(5);
    const b = vector(17);
    const normal = { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
    const length = Math.hypot(normal.x, normal.y, normal.z);
    if (length < 0.000001) return 'edge';
    const facing = normal.z / length * (modelSide === 'Right' ? -1 : 1);
    return facing > 0.2 ? 'palm' : facing < -0.2 ? 'back' : 'edge'; // 容差带 ±0.2 之间的算侧面
  }

  function clearControlHand() {
    cancelNativeDrag();
    resetGesture(true);
    activeTrackId = null;
    activeHand = null;
    handTracks = [];
    currentHandScale = null;
    previewGuideY = null;
    latestPalm = null;
  }

  function selectControlHand(hands, now) {
    // 从本帧检测到的一只手/两只手里选出“控制手”。核心：跨帧保持同一只手的身份，
    // 挥动或收手过程中不被另一只手抢走；静止的手会让位给新出现/活动的手。
    handTracks = handTracks.filter(track => now - track.seenAt < 1600); // 1.6s 没出现的手丢弃
    const used = new Set();
    const candidates = [];
    for (const hand of hands) {
      const points = hand.landmarks;
      if (!points || points.length < 21 || points.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) continue;
      const category = hand.handedness && hand.handedness[0];
      const rawSide = category && category.score >= 0.5 ? category.categoryName : ''; // 模型给的手别（置信度≥0.5才信）
      const side = rawSide ? (settings.swapHands ? (rawSide === 'Left' ? 'Right' : 'Left') : rawSide) : ''; // 应用“左右手反转”
      const center = palmCenter(points);
      const scale = measurePalm(points, frameAspect());
      if (!Number.isFinite(scale) || scale < 0.018) continue; // 手太小/太远，忽略
      // 就近匹配现有 track，维持身份；空间距离够近且手别一致才算同一个
      let track = null;
      let best = Infinity;
      for (const previous of handTracks) {
        if (used.has(previous.id) || previous.side && side && previous.side !== side) continue;
        const gap = Math.hypot((previous.center.x - center.x) * frameAspect(), previous.center.y - center.y);
        if (gap < Math.max(scale * 2, 0.16) && gap < best) { track = previous; best = gap; }
      }
      if (!track) {
        track = { id: ++handSerial, createdAt: now, lastActiveAt: now, side, center, history: [] };
        handTracks.push(track);
      }
      used.add(track.id);
      track.side = side || track.side;
      track.rawSide = rawSide || track.rawSide; // rawSide 存模型原始手别，供手心手背判断（不受反转影响）
      track.center = center;
      track.seenAt = now;
      track.history.push({ x: center.x, y: center.y, tipX: points[8].x, tipY: points[8].y, time: now });
      while (track.history.length > 1 && now - track.history[0].time > 450) track.history.shift();
      const first = track.history[0];
      track.motion = (Math.hypot((center.x - first.x) * frameAspect(), center.y - first.y) + Math.hypot((points[8].x - first.tipX) * frameAspect(), points[8].y - first.tipY) * 0.35) / scale; // 活动量（中心+食指尖位移归一化）
      if (track.motion > 0.22) track.lastActiveAt = now;
      track.facing = handFacing(points, hand.world, track.rawSide);
      track.pose = handPose(points, hand.world);
      track.hand = hand;
      track.eligible = Boolean(track.pose) && (settings.controlHand === 'auto' || settings.controlHand === track.side) && (!settings.palmOnly || track.facing !== 'back'); // 有效手势 + 手别匹配 + 非手背
      if (track.eligible) track.lastEligibleAt = now;
      track.score = Math.min(track.motion, 2) * 2 + (track.facing === 'palm' ? 0.8 : 0) + (now - track.createdAt < 500 ? 0.7 : 0); // 越活跃、掌心朝摄像头、刚出现的手越优先
      candidates.push(track);
    }
    const previous = handTracks.find(track => track.id === activeTrackId);
    let chosen = candidates.find(track => track.id === activeTrackId);
    const alternatives = candidates.filter(track => track.eligible).sort((a, b) => b.score - a.score);
    const challenger = alternatives.find(track => track.id !== activeTrackId);
    if (chosen && chosen.eligible) {
      // 当前手一直有效，只在它久不活动且另一只手明显更活跃时才让位
      if (!intentRecovery && !(virtualStroke && virtualStroke.candidate) && !nativeDrag && challenger && now - chosen.lastActiveAt > 650 && challenger.score > chosen.score + 0.3) chosen = challenger;
    } else if (previous && now - (previous.lastEligibleAt || previous.createdAt) < 650 && (intentRecovery || virtualStroke || !chosen)) {
      chosen = null; // 正在收手/拖动时，短暂失去手势也别立刻换手
    } else {
      chosen = alternatives[0] || null;
    }
    selectionHint = candidates.length ? settings.palmOnly && candidates.every(track => track.facing === 'back') ? '请把掌心朝向摄像头' : '等待控制手' : '等待手入镜';
    if (!chosen || !chosen.eligible) return null;
    if (chosen.id !== activeTrackId) {
      // 换手：清空所有手势状态，重新定位
      cancelNativeDrag();
      resetGesture(true);
      currentHandScale = null;
      previewGuideY = null;
      activeTrackId = chosen.id;
    }
    activeHand = chosen;
    return chosen.hand;
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)); // 两点三维距离
  }

  function angle(a, b, c) {
    // 以 b 为顶点、a 和 c 为两端的三维夹角（度）；用于判断手指是否伸直
    const ab = [a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)];
    const cb = [c.x - b.x, c.y - b.y, (c.z || 0) - (b.z || 0)];
    const length = Math.hypot(...ab) * Math.hypot(...cb);
    return length > 0 ? Math.acos(clamp(ab.reduce((sum, value, index) => sum + value * cb[index], 0) / length, -1, 1)) * 180 / Math.PI : 0;
  }

  function handPose(points, world) {
    // 判断手势，返回 { label, finger }：
    //   '张掌'：四指几乎全张开（open palm）→ 开关评论区（等价按 X 键）
    //   '半握'：只伸出食指、其余手指蜷起（half-fist pointing）→ 用食指尖控制翻页/滑动
    //   null：握拳或看不清 → 无动作
    // world 优先（毫米级世界坐标更稳），没有 world 时退回归一化像素坐标。
    const metric = world || points;
    const span = distance(metric[0], metric[9]); // 手腕到中指根的长度，作为手掌尺寸基准
    // 依次检查 食指/中指/无名指/小指 是否伸直：
    //   手指三段接近直线（夹角>125°）、指尖离指根够远、且指尖比第二关节更远离手腕
    const fingers = [5, 9, 13, 17].filter(base => angle(metric[base], metric[base + 1], metric[base + 3]) > (settings.aggressive ? 110 : 125) && distance(metric[base + 3], metric[base]) > span * (settings.aggressive ? 0.45 : 0.55) && distance(metric[base + 3], metric[0]) > distance(metric[base + 1], metric[0]) * (settings.aggressive ? 0.98 : 1.01));
    if (fingers.length >= 3) return { label: '张掌', finger: null, openFingers: fingers.length };
    if (fingers.includes(5)) return { label: '半握', finger: 8 };                 // 食指伸直（其余蜷起）= 半握 → 食指尖控制
    if (fingers.length) return { label: '半握', finger: fingers[0] + 3 };         // 其他非食指单指，兼容处理
    return null;                                                                  // 握拳
  }

  function controlPoint(points, reference) {
    // 计算手势的“控制点”。半握（食指）时紧贴食指尖，张掌时用掌心均值（更稳、抖动小）。
    if (reference.finger !== null) {
      const tip = points[reference.finger];        // 指尖（食指=8）
      const base = points[reference.finger - 3];   // 指根（食指=5）
      // 95% 取指尖、5% 取指根，紧贴指尖又保留一点点指根稳定性
      return { x: tip.x * 0.95 + base.x * 0.05, y: tip.y * 0.95 + base.y * 0.05 };
    }
    const ids = [0, 5, 9, 13, 17]; // 张掌：腕部 + 四指根，平均成掌心
    return { x: ids.reduce((sum, index) => sum + points[index].x, 0) / ids.length, y: ids.reduce((sum, index) => sum + points[index].y, 0) / ids.length };
  }

  function frameAspect() {
    return video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 4 / 3; // 画面宽高比，用于把 x 坐标换算成与 y 同尺度
  }

  function cameraFrameRate() {
    return Math.max(30, settings.fps); // 摄像头实际采集帧率不低于 30，识别仍按 settings.fps；避免快速挥手拖影
  }

  function palmCenter(points) {
    const ids = [0, 5, 9, 13, 17]; // 掌心近似 = 腕部 + 四指根平均
    return { x: ids.reduce((sum, index) => sum + points[index].x, 0) / ids.length, y: ids.reduce((sum, index) => sum + points[index].y, 0) / ids.length };
  }

  function measurePalm(points, aspect) {
    // 手掌尺度：食指根→小指根 与 腕→中指根 的平均（x 按宽高比修正）
    const span = (a, b) => Math.hypot((a.x - b.x) * aspect, a.y - b.y);
    return (span(points[5], points[17]) + span(points[0], points[9])) / 2;
  }

  function distanceFactor() {
    // 挥动距离滑杆(0.06~0.26) → 阈值倍率；值越大需要的位移越大（越不灵敏）
    return 0.24 + (clamp(settings.distance, 0.06, 0.26) - 0.06) * 1.8;
  }

  function gestureThreshold(scale) {
    // 触发手势所需的最小位移，随手掌大小缩放
    return clamp(scale * distanceFactor() * (settings.aggressive ? 0.65 : 1), settings.aggressive ? 0.005 : 0.008, 0.22);
  }

  function gestureCoordinate(point, axis, aspect) {
    return axis === 'x' ? -point.x * aspect : point.y; // x 取反并乘宽高比，统一到同一尺度
  }

  function motionSample(point, palm, time) {
    return { x: point.x, y: point.y, palmX: palm.x, palmY: palm.y, time }; // 手势轨迹采样点
  }

  function swipeDirectionEnabled(axis, direction) {
    return settings[axis === 'x' ? direction < 0 ? 'swipeLeft' : 'swipeRight' : direction < 0 ? 'swipeUp' : 'swipeDown'];
  }

  function recognizeSwipe(history, threshold, scale, aspect) {
    // 从控制点轨迹里识别一次挥动。threshold 是上下手势门槛，水平方向额外乘 HORIZONTAL_THRESHOLD_EXTRA。
    if (history.length < 2) return null;
    const last = history[history.length - 1];
    for (let start = 0; start <= history.length - 2; start++) {
      const first = history[start];
      const duration = (last.time - first.time) / 1000; // 秒
      if (duration < (settings.aggressive ? 0.04 : 0.08) || duration > (settings.aggressive ? 1.1 : 0.85)) continue; // 太快(抖动)或太慢(不算挥动)都跳过
      const dy = last.y - first.y;
      const dx = -(last.x - first.x) * aspect; // x 镜像并校正尺度，使左右挥手感一致
      // 主方向判定：某方向位移明显大于另一方向(≥1.35倍)才算该方向，斜向忽略
      const dominance = settings.aggressive ? 1.15 : 1.35;
      const axis = Math.abs(dx) >= Math.abs(dy) * dominance ? 'x' : Math.abs(dy) >= Math.abs(dx) * dominance ? 'y' : null;
      if (!axis) continue;
      const delta = axis === 'x' ? dx : dy;
      if (!swipeDirectionEnabled(axis, delta > 0 ? 1 : -1)) continue;
      const samples = history.length - start;
      // 有效位移门槛：2 帧采样时放宽 15%；水平方向整体再乘 1.6 倍（左右手势要做到位）
      const need = threshold * (samples === 2 ? 1.15 : 1) * (axis === 'x' ? settings.aggressive ? 1.2 : HORIZONTAL_THRESHOLD_EXTRA : 1);
      if (Math.abs(delta) < need) continue;
      let travel = 0;      // 沿主方向累计行进
      let crossTravel = 0; // 横向偏移累计（用于过滤画圈/斜线）
      for (let index = start + 1; index < history.length; index++) {
        const stepX = Math.abs(history[index].x - history[index - 1].x) * aspect;
        const stepY = Math.abs(history[index].y - history[index - 1].y);
        travel += axis === 'x' ? stepX : stepY;
        crossTravel += axis === 'x' ? stepY : stepX;
      }
      // 位移要相对干净（净位移≥70%总行程、横向≤85%），速度下限水平方向更宽松（慢滑也能触发）
      const minSpeed = scale * (samples === 2 ? 0.5 : (axis === 'x' ? 0.28 : 0.4)) * (settings.aggressive ? 0.65 : 1);
      if (!travel || Math.abs(delta) / travel < (settings.aggressive ? 0.55 : 0.7) || crossTravel > travel * (settings.aggressive ? 1.15 : 0.85) || Math.abs(delta) / duration < minSpeed) continue;
      return { axis, direction: delta > 0 ? 1 : -1, displacement: Math.abs(delta), originX: first.x, originY: first.y, originPalmX: first.palmX, originPalmY: first.palmY };
    }
    return null;
  }

  function resetRecoveryStillness() {
    if (!intentRecovery) return;
    intentRecovery.samples = []; // 清空收手的“停稳”采样，重新计时
  }

  function recoveryStep(recovery, point, palm, hasPose, now, scale, aspect) {
    // 收手机制：一次手势触发后，需要回程到一定量并停稳一小段时间才算“一手做完”，
    // 之后才能再次触发；未回程/还在动/手抖都不算，避免一次挥动被连发成多次。
    const direction = recovery.direction;
    const coordinate = gestureCoordinate(point, recovery.axis, aspect);
    const palmCoordinate = gestureCoordinate(palm, recovery.axis, aspect);
    if (direction * (coordinate - recovery.extreme) > 0) recovery.extreme = coordinate;   // 继续更新挥动极值
    if (direction * (palmCoordinate - recovery.extremePalm) > 0) recovery.extremePalm = palmCoordinate;
    const retreat = direction * (recovery.extreme - coordinate);                          // 回程量（从极值折返）
    const palmRetreat = direction * (recovery.extremePalm - palmCoordinate);
    const retreatNeeded = clamp(Math.max(recovery.displacement * (settings.aggressive ? 0.24 : 0.32), recovery.scale * (settings.aggressive ? 0.07 : 0.09)), 0.004, recovery.scale * 0.65); // 需要折返的最低量
    if (retreat >= retreatNeeded || palmRetreat >= retreatNeeded) recovery.returnStarted = true;
    if ((!recovery.returnStarted && !recovery.reentered) || !hasPose) {
      recovery.samples = [];
      return { ready: false, phase: 'return', progress: 0 }; // 还没开始回程，继续等
    }
    let samples = recovery.samples;
    if (samples.length && now - samples[samples.length - 1].time > 400) samples.length = 0;
    samples.push({ x: point.x, y: point.y, palmX: palm.x, palmY: palm.y, time: now });
    while (samples.length > 1 && now - samples[0].time > 500) samples.shift();
    const radius = clamp(Math.min(recovery.scale, scale) * 0.18, 0.004, 0.024); // 停稳判定半径：位移小于这个半径算“停住”
    const anchor = samples[0];
    const drift = Math.hypot((point.x - anchor.x) * aspect, point.y - anchor.y);
    const palmDrift = Math.hypot((palm.x - anchor.palmX) * aspect, palm.y - anchor.palmY);
    if (drift > radius || palmDrift > radius) {
      recovery.samples = [samples[samples.length - 1]]; // 又动了，重新开始停稳计时
      return { ready: false, phase: 'settle', progress: 0 };
    }
    const duration = now - anchor.time;
    const settleTime = settings.aggressive ? 100 : 160;
    const ready = duration >= settleTime && samples.length >= 2 && Math.abs(coordinate - gestureCoordinate(anchor, recovery.axis, aspect)) <= scale * 0.05 && palmDrift <= scale * 0.1 && now >= recovery.readyAfter; // 停满 160ms 才算收手完成
    return { ready, phase: 'settle', progress: Math.min(1, duration / settleTime) };
  }

  function recoverIntent(points, pose, now, scale) {
    // 收手状态下的每帧处理：直到回程+停稳达成，才重新 arm 进入可触发状态。
    const recovery = intentRecovery;
    const point = controlPoint(points, recovery.reference);
    latestPalm = point;
    const result = recoveryStep(recovery, point, palmCenter(points), Boolean(pose), now, scale, frameAspect());
    recovery.phase = result.phase;
    if (!result.ready) {
      progress.style.width = Math.round(result.progress * 100) + '%';
      status(recovery.action ? recovery.action + ' · 收手中' : '收手中', 'busy');
      return;
    }
    const origin = controlPoint(points, pose);
    intentRecovery = null;
    resetGesture();
    oppositeGuard = { axis: recovery.axis, direction: recovery.direction, quietSince: now, lastCoordinate: gestureCoordinate(origin, recovery.axis, frameAspect()) }; // 收手完成后的反向回落抑制
    gate.armed = true; // 直接进入就绪，等待下一次挥动
    gate.reference = pose;
    gate.homeX = origin.x;
    gate.homeY = origin.y;
    gate.anchorX = origin.x;
    gate.anchorY = origin.y;
    gate.anchorPalmY = palmCenter(points).y;
    gate.smooth = origin.y;
    gate.smoothX = origin.x;
    gate.history = [motionSample(origin, palmCenter(points), now)];
    gate.lastPoseAt = now;
    latestPalm = origin;
    progress.style.width = '0%';
    status('已就绪', 'active');
  }

  function processHand(points, world, now) {
    // 处理一帧控制手关键点：更新门控、识别挥动并提交动作。now 为 performance.now() 时间戳。
    latestLandmarks = points;
    const measuredScale = points && points.length >= 21 ? measurePalm(points, frameAspect()) : 0;
    if (!points || !Number.isFinite(measuredScale) || measuredScale < (settings.aggressive ? 0.014 : 0.018)) {
      palmHoldSince = null;
      palmHoldAnchor = null;
      if (wasOpenPalm && activeHand && activeHand.seenAt === now && !activeHand.pose) {
        if (palmReleaseSince === null) palmReleaseSince = now;
        if (now - palmReleaseSince >= 350) {
          wasOpenPalm = false;
          palmReleaseSince = null;
        }
      } else palmReleaseSince = null;
      // 收尾未完成的虚拟拖动，并按不同超时逐步解除手势状态
      if (virtualStroke && virtualStroke.candidate && now - virtualStroke.lastSeenAt < 350) {
        const stroke = virtualStroke;
        commitGesture({ ...stroke.candidate, extremeY: stroke.extremeY, extremePalmY: stroke.extremePalmY }, stroke.points, now, stroke.scale);
      } else cancelVirtualStroke();
      latestPalm = null;
      if (intentRecovery) {
        resetRecoveryStillness();
        if (intentRecovery.missingSince === null) intentRecovery.missingSince = now;
        if (now - intentRecovery.missingSince >= 350) intentRecovery.reentered = true;
        status('等待控制手', 'busy');
        return;
      }
      gate.history = [];
      if (gate.missingSince === null) gate.missingSince = now;
      if (now - gate.missingSince > 300) gate.centerSince = null;   // 手消失超过 300ms 不再算“居中”
      if (now - gate.missingSince > 650) {
        gate.armed = false; // 超过 650ms 彻底解除就绪
        gate.smooth = null;
        gate.smoothX = null;
        gate.homeX = null;
        gate.homeY = null;
        gate.reference = null;
        currentHandScale = null;
        progress.style.width = '0%';
      }
      status(points ? '请稍微靠近摄像头' : selectionHint || '等待控制手', 'busy');
      return;
    }
    gate.missingSince = null;
    currentHandScale = currentHandScale === null ? measuredScale : currentHandScale * 0.65 + clamp(measuredScale, currentHandScale * 0.75, currentHandScale * 1.25) * 0.35; // 平滑手掌尺度，防抖
    const scale = clamp(currentHandScale, 0.018, 0.35);
    const pose = handPose(points, world);
    if (intentRecovery) {
      // 收手过程中同步“张掌”状态，避免收手结束时把一直张着的手当成新的一次张开。
      if (pose && pose.label === '张掌') wasOpenPalm = true;
      palmHoldSince = null;
      palmHoldAnchor = null;
      palmReleaseSince = null;
      intentRecovery.missingSince = null;
      recoverIntent(points, pose, now, scale); // 收手过程中专注检测回程+停稳
      return;
    }
    const isOpenPalm = Boolean(pose && pose.label === '张掌');
    if (isOpenPalm) {
      latestPalm = palmCenter(points);
      resetGesture();
      palmReleaseSince = null;
      if (wasOpenPalm || now < palmClickAfter) {
        status('张掌 · 收掌后可再次开关', 'active');
        return;
      }
      if (pose.openFingers !== 4) {
        palmHoldSince = null;
        palmHoldAnchor = null;
        status('完整张掌后稍停', 'busy');
        return;
      }
      if (palmHoldSince === null || !palmHoldAnchor || Math.hypot((latestPalm.x - palmHoldAnchor.x) * frameAspect(), latestPalm.y - palmHoldAnchor.y) > scale * 0.2) {
        palmHoldSince = now;
        palmHoldAnchor = { ...latestPalm };
      }
      progress.style.width = Math.min(100, (now - palmHoldSince) / (settings.aggressive ? 450 : 650) * 100) + '%';
      if (now - palmHoldSince >= (settings.aggressive ? 450 : 650)) {
        wasOpenPalm = true;
        palmClickAfter = now + 1500;
        palmHoldSince = null;
        palmHoldAnchor = null;
        status(sendClickShortcut() ? '已开关评论区' : '张掌 · 暂无法开关评论区', 'active');
      } else status('张掌确认中', 'busy');
      return;
    }
    palmHoldSince = null;
    palmHoldAnchor = null;
    if (wasOpenPalm) {
      if (palmReleaseSince === null) palmReleaseSince = now;
      if (now - palmReleaseSince >= 350) {
        wasOpenPalm = false;
        palmReleaseSince = null;
      }
    } else palmReleaseSince = null;
    if (pose) gate.lastPoseAt = now;
    if (!pose && (!gate.armed || now - gate.lastPoseAt > 350)) {
      // 没有有效手势（握拳等）且未就绪，或手势丢失超过 350ms：重置
      latestPalm = null;
      gate.armed = false;
      gate.centerSince = null;
      gate.history = [];
      gate.homeY = null;
      gate.homeX = null;
      gate.reference = null;
      gate.smooth = null;
      gate.smoothX = null;
      progress.style.width = '0%';
      status('半握伸食指控制 / 张掌开评论区', 'busy');
      return;
    }
    if (!gate.armed && pose && gate.reference && gate.reference.finger !== pose.finger) {
      // 未就绪时手指形态变了（半握↔张掌），重置参考，重新判定
      gate.reference = pose;
      gate.homeY = null;
      gate.homeX = null;
      gate.smooth = null;
      gate.smoothX = null;
      gate.centerSince = null;
      gate.history = [];
    }
    if (!gate.reference) gate.reference = pose;
    const palm = controlPoint(points, gate.reference); // 控制点：半握=食指尖，张掌=掌心
    latestPalm = palm;
    gate.smooth = gate.smooth === null ? palm.y : gate.smooth * 0.2 + palm.y * 0.8;     // 指数平滑：20% 旧值，响应快
    gate.smoothX = gate.smoothX === null ? palm.x : gate.smoothX * 0.2 + palm.x * 0.8;
    const homeBand = clamp(scale * 0.3, 0.012, 0.04); // 居中判定半径
    if (gate.homeX === null || gate.homeY === null || !gate.armed && Math.hypot((gate.smoothX - gate.homeX) * frameAspect(), gate.smooth - gate.homeY) > homeBand) {
      gate.homeX = gate.smoothX;
      gate.homeY = gate.smooth;
      gate.centerSince = null;
    }
    const neutral = Math.hypot((gate.smoothX - gate.homeX) * frameAspect(), gate.smooth - gate.homeY) < homeBand; // 是否在“家”位置上静止
    if (!gate.armed) {
      // 就绪阶段：需要手在靠近原位处稳住约 160ms 才 arm（防止一伸进来就误触）
      if (neutral && pose && now >= gate.cooldownUntil) {
        if (gate.centerSince === null) gate.centerSince = now;
        const duration = now - gate.centerSince;
        const hold = settings.aggressive ? 80 : 160; // 就绪保持时长（毫秒）
        progress.style.width = Math.min(100, duration / hold * 100) + '%';
        status('准备中', 'busy');
        if (duration >= hold) {
          gate.armed = true; // 已就绪，接下来位移即可触发
          gate.anchorX = palm.x;
          gate.anchorY = gate.smooth;
          gate.anchorPalmY = palmCenter(points).y;
          gate.history = [motionSample({ x: gate.smoothX, y: gate.smooth }, palmCenter(points), now)];
          progress.style.width = '0%';
          status('已就绪', 'active');
        }
      } else {
        gate.centerSince = null;
        progress.style.width = '0%';
        status('准备中', 'busy');
      }
      return;
    }
    if (Math.abs(palm.x - gate.anchorX) * frameAspect() > Math.max(scale * 2.5, 0.12)) {
      // 水平方向跑太远（可能换了只手/位置），重新定位
      gate.armed = false;
      gate.centerSince = null;
      gate.homeY = null;
      gate.homeX = null;
      gate.reference = null;
      gate.history = [];
      status('重新定位', 'busy');
      return;
    }
    gate.history.push(motionSample({ x: gate.smoothX, y: gate.smooth }, palmCenter(points), now));
    while (gate.history.length > 1 && now - gate.history[0].time > (settings.aggressive ? 1100 : 850)) gate.history.shift(); // 只保留近 850ms 轨迹
    const threshold = gestureThreshold(scale);
    const recent = gate.history[0];
    const delta = Math.max(Math.abs(gate.smooth - recent.y), Math.abs(gate.smoothX - recent.x) * frameAspect());
    progress.style.width = Math.min(100, delta / threshold * 100) + '%'; // 进度条反映当前位移占阈值的比例
    if (oppositeGuard) {
      // 收手后的反向回落抑制：检测是否快速反向移动，避免一次挥动被当成两次
      const coordinate = gestureCoordinate(palm, oppositeGuard.axis, frameAspect());
      if (Math.abs(coordinate - oppositeGuard.lastCoordinate) > scale * 0.05) oppositeGuard.quietSince = now;
      oppositeGuard.lastCoordinate = coordinate;
      if (now - oppositeGuard.quietSince >= 400) oppositeGuard = null;
    }
    const swipe = recognizeSwipe(gate.history, threshold, scale, frameAspect());
    if (swipe && oppositeGuard && swipe.axis === oppositeGuard.axis && swipe.direction !== oppositeGuard.direction) {
      gate.history = [motionSample({ x: gate.smoothX, y: gate.smooth }, palmCenter(points), now)];
      cancelVirtualStroke();
      status('收手中', 'busy');
      return;
    }
    if (swipe && swipe.axis === 'x' && !(virtualStroke && virtualStroke.candidate)) {
      commitGesture(swipe, points, now, scale); // 左右挥动：直接发按键，不走虚拟拖动
      return;
    }
    if (settings.virtualDrag) {
      updateVirtualStroke(palm, points, pose, swipe, now, scale);
      return;
    }
    if (swipe) commitGesture(swipe, points, now, scale); // 上下挥动：翻页
    else status('已就绪', 'active');
  }

  function commitGesture(swipe, points, now, scale) {
    // 一次手势被确认：x 轴发左右键，y 轴翻页（或虚拟拖动）。发送成功后进入“收手”恢复流程。
    const axis = swipe.axis || 'y';
    if (!swipeDirectionEnabled(axis, swipe.direction)) { cancelVirtualStroke(); return; }
    const sent = axis === 'x' ? sendSwipeShortcut(swipe.direction) : settings.virtualDrag ? sendVirtualDrag(swipe) : navigate(swipe.direction);
    if (sent) {
      const point = controlPoint(points, gate.reference);
      const palm = palmCenter(points);
      // 记录挥动的极值点，供收手时判断回程
      const extreme = axis === 'y' && Number.isFinite(swipe.extremeY) ? swipe.extremeY : gestureCoordinate(point, axis, frameAspect());
      const extremePalm = axis === 'y' && Number.isFinite(swipe.extremePalmY) ? swipe.extremePalmY : gestureCoordinate(palm, axis, frameAspect());
      intentRecovery = { axis, action: axis === 'x' ? swipe.direction < 0 ? '左挥 Z' : '右挥 R' : '', reference: { ...gate.reference }, direction: swipe.direction, displacement: swipe.displacement, scale, extreme, extremePalm, returnStarted: false, reentered: false, missingSince: null, samples: [], readyAfter: now + (settings.aggressive ? 100 : 160) };
      oppositeGuard = null;
      status('收手中', 'busy');
    }
    cancelVirtualStroke();
    gate.armed = false;             // 触发了就取消就绪，下一次要重新稳住
    gate.centerSince = null;
    gate.cooldownUntil = now + (settings.aggressive ? 100 : 160); // 短暂冷却，防止一次动作连发
    gate.history = [];
    progress.style.width = '0%';
  }

  function drawPreview(points) {
    if (!settings.preview) return;
    const width = canvas.width;
    const height = canvas.height;
    paint.clearRect(0, 0, width, height);
    if (!settings.showSkeleton) return;
    drawFacePreview();
    if (!points || points.length < 21) {
      previewGuideY = null; // 检测不到骨架：清空画面、横条和骨架一起隐藏
      return;
    }
    paint.fillStyle = '#92bcff22';
    const point = latestPalm || palmCenter(points);
    if (Number.isFinite(point.y)) {
      const nextY = clamp(point.y, 0, 1);
      previewGuideY = previewGuideY === null ? nextY : previewGuideY * 0.35 + nextY * 0.65; // 横条平滑跟随指/掌心高度
    }
    const home = previewGuideY === null ? settings.center : previewGuideY;
    const scale = clamp(currentHandScale || 0.08, 0.018, 0.35);
    const band = clamp(scale * 0.3, 0.012, 0.04);
    const threshold = gestureThreshold(scale);
    if (settings.showGuide) {
      paint.fillRect(0, (home - band) * height, width, band * 2 * height); // 中间“家”横条
      const anchor = home;
      for (const offset of [-threshold, 0, threshold]) {
        paint.strokeStyle = offset === 0 ? '#dbe9ffcc' : '#9ec3ff99'; // 上/下触发线（虚线）
        paint.setLineDash(offset === 0 ? [] : [5, 5]);
        paint.beginPath();
        paint.moveTo(0, (anchor + offset) * height);
        paint.lineTo(width, (anchor + offset) * height);
        paint.stroke();
      }
      paint.setLineDash([]);
    }
    if (!settings.showHandSkeleton) return;
    // 骨架颜色：已就绪可控制=绿色，否则=黄色（检测到了但还没就绪，或正在准备/收手）
    paint.strokeStyle = (gate.armed && latestPalm) ? '#5ce0ad' : '#ffc56b';
    paint.fillStyle = paint.strokeStyle;
    paint.lineWidth = 1.5;
    for (const chain of HAND_CHAINS) {
      paint.beginPath();
      chain.forEach((index, order) => paint[order ? 'lineTo' : 'moveTo'](points[index].x * width, points[index].y * height));
      paint.stroke();
    }
    for (const point of points) {
      paint.beginPath();
      paint.arc(point.x * width, point.y * height, 2, 0, Math.PI * 2);
      paint.fill();
    }
    if (latestPalm) {
      paint.strokeStyle = '#ffffff'; // 控制点（指尖/掌心）用白色圆圈高亮
      paint.lineWidth = 2;
      paint.beginPath();
      paint.arc(latestPalm.x * width, latestPalm.y * height, 6, 0, Math.PI * 2);
      paint.stroke();
    }
  }

  function showFrameRate(now, force = false) {
    // 更新“目标 / 实际”帧率标签。实际帧率 = 近 1.8s 完成识别帧的速率，0.5s 节流刷新。
    while (frameTimes.length && now - frameTimes[0] > 1800) frameTimes.shift();
    if (!force && now - fpsUpdatedAt < 500) return;
    fpsUpdatedAt = now;
    const span = frameTimes.length > 1 ? frameTimes[frameTimes.length - 1] - frameTimes[0] : 0;
    const actual = span > 0 ? Math.round((frameTimes.length - 1) * 1000 / span) : null;
    const label = find('[data-fps-label]');
    label.textContent = running ? settings.fps + ' / 实际' + (actual === null ? '—' : actual) : settings.fps + ' FPS';
    const camera = stream?.getVideoTracks()[0]?.getSettings();
    label.title = '目标识别 ' + settings.fps + ' FPS；摄像头 ' + (camera?.frameRate ? Math.round(camera.frameRate) : '—') + ' FPS；手部 ' + inferenceStats.backend + ' ' + Math.round(inferenceStats.hand) + 'ms；面部 ' + (inferenceStats.faceBackend || '未开启') + ' ' + Math.round(inferenceStats.face) + 'ms；取帧 ' + Math.round(inferenceStats.capture) + 'ms';
  }

  async function applyCameraFrameRate() {
    // 把摄像头期望帧率设成 cameraFrameRate()。用版本号保证频繁调整时只应用最新一次，避免竞态。
    cameraRateRevision++;
    if (cameraRateApplying) return;
    cameraRateApplying = true;
    try {
      let handled;
      do {
        handled = cameraRateRevision;
        const track = stream && stream.getVideoTracks()[0];
        if (!track || typeof track.applyConstraints !== 'function') break;
        try { await track.applyConstraints({ frameRate: { ideal: cameraFrameRate(), max: 60 } }); } catch (error) {}
      } while (handled !== cameraRateRevision);
    } finally {
      cameraRateApplying = false;
    }
  }

  function scheduleFrame(delay = 1000 / settings.fps) {
    // 按设定帧率安排下一帧采集。delay 是到下次采集的剩余毫秒数。
    clearTimeout(frameTimer);
    if (running) frameTimer = setTimeout(captureFrame, delay);
  }

  async function captureFrame() {
    // 采集一帧：从 video 截取画面送 Worker 识别。inFlight 防止上一帧没识别完就并发堆积。
    if (!running || inFlight) return;
    showFrameRate(performance.now());
    if (document.hidden || !document.hasFocus()) {
      stop('窗口已离开前台，摄像头已关闭。回来后点击开启继续。');
      return;
    }
    if (video.readyState < 2 || video.currentTime === lastVideoTime) {
      scheduleFrame(Math.min(16, 500 / settings.fps)); // 还没来新帧就稍后重试
      return;
    }
    const current = generation;
    inFlight = true;
    frameStarted = performance.now();
    try {
      const width = Math.min(320, video.videoWidth);
      const height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
      const captureBegin = performance.now();
      const image = await createImageBitmap(video, { resizeWidth: width, resizeHeight: height, resizeQuality: 'low' });
      inferenceStats.capture = inferenceStats.capture * 0.7 + (performance.now() - captureBegin) * 0.3; // 缩到 320 宽，省算力
      if (!running || current !== generation) {
        image.close();
        return;
      }
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const previewAspect = width + ' / ' + height;
      if (find('[data-preview]').style.aspectRatio !== previewAspect) find('[data-preview]').style.aspectRatio = previewAspect;
      lastVideoTime = video.currentTime;
      worker.postMessage({ type: 'frame', image, timestamp: performance.now(), generation: current, faceEnabled: (settings.faceReject || settings.smileLike) && faceReady }, [image]);
      watchdog = setTimeout(() => workerFailure('识别超时，请重新开启。'), faceModelPromise ? 45000 : 8000);
    } catch (error) {
      if (current === generation) {
        stop('读取摄像头画面失败：' + error.message, 'error');
      }
    }
  }

  function stop(message = '已停止，摄像头已关闭。', kind = 'idle') {
    faceGate = null;
    smileGate = null;
    latestFace = null;
    latestFaceAt = 0;
    // 停止摄像头：关流、清状态、取消所有未完成的拖动/翻页。
    cancelNativeDrag();
    generation++;
    running = false;
    starting = false;
    inFlight = false;
    clearTimeout(frameTimer);
    clearTimeout(watchdog);
    clearTimeout(navigationTimer);
    if (pendingNavigation) actionStatus('切换指令已发出，摄像头停止后不再等待确认。', 'busy');
    pendingNavigation = null;
    navigationLockUntil = 0;
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.pause();
    video.srcObject = null;
    lastVideoTime = -1;
    frameTimes.length = 0;
    showFrameRate(performance.now(), true);
    currentHandScale = null;
    previewGuideY = null;
    latestPalm = null;
    latestLandmarks = null;
    clearControlHand();
    paint.clearRect(0, 0, canvas.width, canvas.height);
    setButton();
    status(message, kind);
  }

  async function start() {
    // 开启摄像头并启动识别循环：先确保模型就绪，再申请摄像头，成功后进入采集循环。
    if (starting || running) return;
    const current = ++generation;
    starting = true;
    setButton();
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('当前页面不支持摄像头，请使用新版 Chrome 打开 HTTPS 抖音网页。');
      if (typeof Worker !== 'function' || typeof createImageBitmap !== 'function') throw new Error('当前浏览器不支持识别线程或视频帧读取，请升级 Chrome。');
      status('正在准备本地识别模型，首次需要联网下载…', 'busy');
      await ensureRecognizer();
      if (current !== generation) return;
      if (document.hidden || !document.hasFocus()) throw new Error('请回到抖音窗口后再点击开启。');
      status('请在浏览器提示中允许摄像头访问。', 'busy');
      const requestedFps = cameraFrameRate();
      const acquired = await navigator.mediaDevices.getUserMedia({ audio: false, video: { width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: requestedFps, max: 60 }, facingMode: 'user' } });
      if (current !== generation) {
        acquired.getTracks().forEach(track => track.stop());
        return;
      }
      stream = acquired;
      if (requestedFps !== cameraFrameRate()) applyCameraFrameRate();
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      if (current !== generation) return;
      if (document.hidden || !document.hasFocus()) {
        stop('请回到抖音窗口后重新开启，摄像头已关闭。');
        return;
      }
      for (const track of stream.getVideoTracks()) track.addEventListener('ended', () => { if (running) stop('摄像头已断开，请检查设备或权限。', 'error'); }, { once: true });
      starting = false;
      running = true;
      frameTimes.length = 0;
      showFrameRate(performance.now(), true);
      resetGesture(true);
      setButton();
      status('等待控制手', 'active');
      if (settings.faceReject || settings.smileLike) ensureFaceRecognizer();
      scheduleFrame(0);
    } catch (error) {
      if (current !== generation) return;
      const messages = {
        NotAllowedError: '摄像头权限未获允许。请在地址栏的网站权限中允许摄像头，再点击开启。',
        NotFoundError: '没有找到摄像头，请连接设备后重试。',
        NotReadableError: '摄像头无法读取，可能正被其他软件占用。'
      };
      stop(messages[error.name] || error.message || '启动失败，请重试。', 'error');
    }
  }

  function unfold() {
    find('.body').hidden = false;
    find('[data-fold]').textContent = '−';
    find('[data-fold]').setAttribute('aria-expanded', 'true');
    find('[data-fold]').setAttribute('aria-label', '收起面板');
  }

  function setPreviewOnly(enabled) {
    if ((host.dataset.previewOnly === 'true') === enabled) return;
    if (enabled) {
      normalPanelStyles = { left: host.style.left, right: host.style.right, top: host.style.top, bottom: host.style.bottom, width: host.style.width };
      host.dataset.previewOnly = 'true';
      host.style.left = 'auto';
      host.style.right = '24px';
      host.style.top = '76px';
      host.style.bottom = 'auto';
      host.style.width = '240px';
      if (previewPosition) positionPreview(previewPosition.left, previewPosition.top);
      find('[data-preview]').title = '双击恢复完整面板';
    } else {
      delete host.dataset.previewOnly;
      if (normalPanelStyles) Object.assign(host.style, normalPanelStyles);
      normalPanelStyles = null;
      find('[data-preview]').title = '双击切换预览小窗';
      unfold();
    }
  }

  function position(left, top) {
    const rect = host.getBoundingClientRect();
    settings.left = clamp(left, 8, Math.max(8, innerWidth - rect.width - 8));
    settings.top = clamp(top, 8, Math.max(8, innerHeight - rect.height - 8));
    host.style.left = settings.left + 'px';
    host.style.top = settings.top + 'px';
    host.style.right = 'auto';
    host.style.bottom = 'auto';
  }

  function positionPreview(left, top) {
    const rect = host.getBoundingClientRect();
    previewPosition = {
      left: clamp(left, 8, Math.max(8, innerWidth - rect.width - 8)),
      top: clamp(top, 8, Math.max(8, innerHeight - rect.height - 8))
    };
    host.style.left = previewPosition.left + 'px';
    host.style.top = previewPosition.top + 'px';
    host.style.right = 'auto';
    host.style.bottom = 'auto';
  }

  find('[data-start]').addEventListener('click', () => starting || running ? stop() : start());
  find('[data-preview]').addEventListener('contextmenu', event => {
    event.preventDefault();
    event.stopPropagation();
    settings.showSkeleton = !settings.showSkeleton;
    save();
    drawPreview(latestLandmarks);
  });
  find('[data-preview]').addEventListener('dblclick', event => {
    event.preventDefault();
    event.stopPropagation();
    setPreviewOnly(host.dataset.previewOnly !== 'true');
  });
  find('[data-preview]').addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    setPreviewOnly(host.dataset.previewOnly !== 'true');
  });
  for (const [selector, key] of [
    ['[data-show-hand-skeleton]', 'showHandSkeleton'],
    ['[data-show-face-skeleton]', 'showFaceSkeleton'],
    ['[data-show-guide]', 'showGuide']
  ]) {
    find(selector).addEventListener('change', event => {
      settings[key] = event.target.checked;
      if (settings[key]) settings.showSkeleton = true;
      save();
      drawPreview(latestLandmarks);
    });
  }
  find('[data-preview-toggle]').addEventListener('change', event => {
    settings.preview = event.target.checked;
    syncSettings();
    save();
  });
  for (const [direction, key] of [['up', 'swipeUp'], ['down', 'swipeDown'], ['left', 'swipeLeft'], ['right', 'swipeRight']]) {
    find('[data-swipe-' + direction + ']').addEventListener('change', event => {
      settings[key] = event.target.checked;
      cancelNativeDrag();
      clearControlHand();
      save();
    });
  }
  find('[data-control-hand]').addEventListener('change', event => {
    settings.controlHand = event.target.value;
    clearControlHand();
    save();
    status('等待控制手', 'busy');
  });
  find('[data-palm-only]').addEventListener('change', event => {
    settings.palmOnly = event.target.checked;
    clearControlHand();
    save();
  });
  find('[data-swap-hands]').addEventListener('change', event => {
    settings.swapHands = event.target.checked;
    clearControlHand();
    save();
    status('等待控制手', 'busy');
  });
  find('[data-virtual-drag]').addEventListener('change', event => {
    settings.virtualDrag = event.target.checked;
    clearControlHand();
    save();
    status(settings.virtualDrag ? '虚拟拖动已开启' : '普通手势模式', 'active');
  });
  find('[data-smile-like]').addEventListener('change', event => {
    settings.smileLike = event.target.checked;
    smileGate = null;
    save();
    syncSettings();
    if ((settings.faceReject || settings.smileLike) && running) ensureFaceRecognizer();
  });
  find('[data-face-reject]').addEventListener('change', event => {
    settings.faceReject = event.target.checked;
    faceGate = null;
    smileGate = null;
    latestFace = null;
    latestFaceAt = 0;
    save();
    syncSettings();
    if ((settings.faceReject || settings.smileLike) && running) ensureFaceRecognizer();
  });
  find('[data-reverse]').addEventListener('change', event => {
    settings.reverse = event.target.checked;
    clearControlHand();
    syncSettings();
    save();
  });
  find('[data-aggressive]').addEventListener('change', event => {
    settings.aggressive = event.target.checked;
    cancelNativeDrag();
    clearControlHand();
    save();
    syncSettings();
    status(settings.aggressive ? '激进模式已开启' : '普通模式', 'active');
  });
  find('[data-distance]').addEventListener('input', event => {
    settings.distance = Number(event.target.value) / 100;
    cancelNativeDrag();
    resetGesture(true);
    syncSettings();
    drawPreview(latestLandmarks);
  });
  find('[data-distance]').addEventListener('change', save);
  find('[data-fps]').addEventListener('input', event => {
    settings.fps = Math.round(number(event.target.value, 30, 5, 60));
    frameTimes.length = 0;
    cancelNativeDrag();
    resetGesture(true);
    syncSettings();
    if (running && !inFlight) scheduleFrame(0);
  });
  find('[data-fps]').addEventListener('change', () => {
    save();
    applyCameraFrameRate();
  });
  find('[data-fold]').addEventListener('click', () => {
    const collapse = !find('.body').hidden;
    find('.body').hidden = collapse;
    find('[data-fold]').textContent = collapse ? '+' : '−';
    find('[data-fold]').setAttribute('aria-expanded', String(!collapse));
    find('[data-fold]').setAttribute('aria-label', collapse ? '展开面板' : '收起面板');
    if (settings.left !== null) position(settings.left, settings.top);
  });
  let drag = null;
  const header = find('header');
  header.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    const rect = host.getBoundingClientRect();
    drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    header.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  header.addEventListener('pointermove', event => { if (drag) position(event.clientX - drag.x, event.clientY - drag.y); });
  for (const type of ['pointerup', 'pointercancel']) header.addEventListener(type, () => {
    if (drag) save();
    drag = null;
  });
  const preview = find('[data-preview]');
  let previewDrag = null;
  preview.addEventListener('pointerdown', event => {
    if (host.dataset.previewOnly !== 'true' || event.button !== 0) return;
    const rect = host.getBoundingClientRect();
    previewDrag = { id: event.pointerId, x: event.clientX - rect.left, y: event.clientY - rect.top, startX: event.clientX, startY: event.clientY, moved: false };
    preview.setPointerCapture(event.pointerId);
  });
  preview.addEventListener('pointermove', event => {
    if (!previewDrag || event.pointerId !== previewDrag.id) return;
    if (!previewDrag.moved && Math.hypot(event.clientX - previewDrag.startX, event.clientY - previewDrag.startY) < 4) return;
    previewDrag.moved = true;
    positionPreview(event.clientX - previewDrag.x, event.clientY - previewDrag.y);
    event.preventDefault();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) preview.addEventListener(type, event => {
    if (previewDrag && event.pointerId === previewDrag.id) previewDrag = null;
  });
  preview.addEventListener('dragstart', event => event.preventDefault());
  for (const type of ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'keydown', 'keyup', 'wheel']) host.addEventListener(type, event => event.stopPropagation());
  window.addEventListener('keydown', event => {
    if (event.repeat || event.isComposing || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.code !== 'KeyG') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    unfold();
    if (running || starting) stop(); else start();
  }, true);
  window.addEventListener('blur', () => { if (running || stream) stop('窗口已离开前台，摄像头已关闭。回来后点击开启继续。'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && (running || starting)) stop('标签页已隐藏，摄像头已关闭。回来后点击开启继续。'); });
  window.addEventListener('pointerdown', event => { if (event.isTrusted && nativeDrag) cancelNativeDrag(); }, true);
  window.addEventListener('resize', () => {
    cancelNativeDrag();
    resetGesture(true);
    if (host.dataset.previewOnly === 'true' && previewPosition) positionPreview(previewPosition.left, previewPosition.top);
    else if (host.dataset.previewOnly !== 'true' && settings.left !== null) position(settings.left, settings.top);
  });
  window.addEventListener('pagehide', () => { stop(); disposeWorker(); });
  GM_registerMenuCommand('显示手势控制面板', () => { setPreviewOnly(false); unfold(); });
  GM_registerMenuCommand('停止手势并关闭摄像头', () => stop());
  syncSettings();
  resetGesture();
  if (settings.left !== null && settings.top !== null) position(settings.left, settings.top);
})();
