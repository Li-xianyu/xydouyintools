// ==UserScript==
// @name         xyDouYinTools 抖音沉浸式优化
// @namespace    https://greasyfork.org/zh-CN/users/1513167-咸鱼真人
// @version      6.6.19
// @description  美化抖音界面 一个偏沉浸式观感（最大程度全屏化） + 纯鼠标刷视频的抖音网页端增强脚本：尽量让视频当主角，UI少打扰；同时把高频操作塞到鼠标手势里，省得手来回摸键盘。
// @author       lxy
// @license      MIT
// @match        https://www.douyin.com/*
// @match        https://live.douyin.com/*
// @match        https://www.douyin.com/follow/live/*
// @run-at       document-start
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/548904/xyDouYinTools%20%E6%8A%96%E9%9F%B3%E6%B2%89%E6%B5%B8%E5%BC%8F%E4%BC%98%E5%8C%96.user.js
// @updateURL https://update.greasyfork.org/scripts/548904/xyDouYinTools%20%E6%8A%96%E9%9F%B3%E6%B2%89%E6%B5%B8%E5%BC%8F%E4%BC%98%E5%8C%96.meta.js
// ==/UserScript==

/* ===== src/content/style-payload.js ===== */
(function(){var t="/*\n * 抖音 class 非常容易变，这里把“纯样式层”的易变选择器集中放在一个文件里。\n * 如果是 JS 主动查找的 DOM，请优先改 src/shared/constants.js 里的 SELECTORS。\n */\n\n:root {\n  --xydy-panel-bg: rgba(255, 255, 255, 0.26);\n  --xydy-panel-border: rgba(255, 255, 255, 0.45);\n  --xydy-panel-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);\n  --xydy-panel-shadow-soft: 0 10px 30px rgba(0, 0, 0, 0.16);\n  --xydy-panel-bg-strong: linear-gradient(180deg, rgba(255, 255, 255, 0.36), rgba(240, 246, 255, 0.18));\n  --xydy-panel-bg-soft: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(244, 248, 255, 0.14));\n  --xydy-panel-bg-deep: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(227, 237, 251, 0.16));\n  --xydy-accent-bg: rgba(76, 138, 255, 0.16);\n  --xydy-accent-border: rgba(99, 159, 255, 0.34);\n  --xydy-text-main: rgba(255, 255, 255, 0.96);\n  --xydy-text-subtle: rgba(255, 255, 255, 0.68);\n  --xydy-ink-strong: rgba(18, 27, 44, 0.92);\n  --xydy-ink-main: rgba(31, 41, 55, 0.9);\n  --xydy-ink-subtle: rgba(71, 85, 105, 0.82);\n  --xydy-ink-faint: rgba(100, 116, 139, 0.72);\n}\n\nhtml:root[data-xydy-theme=\"custom\"] {\n  --xydy-theme-color: rgb(var(--xydy-theme-rgb));\n  --xydy-theme-hover: rgb(var(--xydy-theme-hover-rgb));\n  --xydy-theme-active: rgb(var(--xydy-theme-active-rgb));\n  --xydy-theme-light: rgb(var(--xydy-theme-light-rgb));\n  --xydy-accent-bg: rgba(var(--xydy-theme-rgb), 0.16);\n  --xydy-accent-border: rgba(var(--xydy-theme-rgb), 0.4);\n}\n\nhtml:root[data-xydy-theme=\"custom\"],\nhtml:root[data-xydy-theme=\"custom\"] :is(body, #dark, #light, [semi-theme], [delight-theme-mode], .search-darkmode, .delight-always-light, .delight-always-dark, .semi-always-light, .semi-always-dark) {\n  --color-primary: var(--xydy-theme-color) !important;\n  --color-primary-default: var(--xydy-theme-color) !important;\n  --color-primary-hover: var(--xydy-theme-hover) !important;\n  --color-primary-active: var(--xydy-theme-active) !important;\n  --color-primary-disable: rgba(var(--xydy-theme-rgb), 0.34) !important;\n  --color-primary-disabled: rgba(var(--xydy-theme-rgb), 0.34) !important;\n  --color-primary-default-ucenter: var(--xydy-theme-color) !important;\n  --color-primary-hover-ucenter: var(--xydy-theme-hover) !important;\n  --color-primary-active-ucenter: var(--xydy-theme-active) !important;\n  --color-primary-disable-ucenter: rgba(var(--xydy-theme-rgb), 0.34) !important;\n  --color-fill-tag: rgba(var(--xydy-theme-rgb), 0.12) !important;\n  --color-bg-comp-filledTab-selected_Red: rgba(var(--xydy-theme-rgb), 0.12) !important;\n  --color-bg-comp-tag_red: rgba(var(--xydy-theme-rgb), 0.12) !important;\n  --color-fill-live: linear-gradient(131deg, var(--xydy-theme-color), var(--xydy-theme-hover)) !important;\n  --semi-color-primary: var(--xydy-theme-color) !important;\n  --semi-color-primary-hover: var(--xydy-theme-hover) !important;\n  --semi-color-primary-active: var(--xydy-theme-active) !important;\n  --semi-color-primary-disabled: rgba(var(--xydy-theme-rgb), 0.34) !important;\n  --semi-color-primary-light-default: rgba(var(--xydy-theme-rgb), 0.2) !important;\n  --semi-color-primary-light-hover: rgba(var(--xydy-theme-rgb), 0.3) !important;\n  --semi-color-primary-light-active: rgba(var(--xydy-theme-rgb), 0.4) !important;\n  --semi-color-fill-tag: rgba(var(--xydy-theme-rgb), 0.12) !important;\n  --semi-brand-0: var(--xydy-theme-active-rgb) !important;\n  --semi-brand-1: var(--xydy-theme-active-rgb) !important;\n  --semi-brand-2: var(--xydy-theme-active-rgb) !important;\n  --semi-brand-3: var(--xydy-theme-hover-rgb) !important;\n  --semi-brand-4: var(--xydy-theme-rgb) !important;\n  --semi-brand-5: var(--xydy-theme-rgb) !important;\n  --semi-brand-6: var(--xydy-theme-light-rgb) !important;\n  --semi-brand-7: var(--xydy-theme-light-rgb) !important;\n  --semi-brand-8: var(--xydy-theme-light-rgb) !important;\n  --semi-brand-9: var(--xydy-theme-light-rgb) !important;\n  --primary-50: var(--xydy-theme-light-rgb) !important;\n  --primary-100: var(--xydy-theme-light-rgb) !important;\n  --primary-200: var(--xydy-theme-light-rgb) !important;\n  --primary-300: var(--xydy-theme-light-rgb) !important;\n  --primary-400: var(--xydy-theme-rgb) !important;\n  --primary-500: var(--xydy-theme-rgb) !important;\n  --primary-600: var(--xydy-theme-hover-rgb) !important;\n  --primary-700: var(--xydy-theme-active-rgb) !important;\n  --primary-800: var(--xydy-theme-active-rgb) !important;\n  --primary-900: var(--xydy-theme-active-rgb) !important;\n  --dux-Primary: var(--xydy-theme-color) !important;\n  --dux-TextActionPrimary: var(--xydy-theme-color) !important;\n  --dux-BGBadge: var(--xydy-theme-color) !important;\n  --dux-BGBrand: rgba(var(--xydy-theme-rgb), 0.06) !important;\n  --dux-BGBrand2: rgba(var(--xydy-theme-rgb), 0.34) !important;\n  --dux-BGLightPrimary: rgba(var(--xydy-theme-rgb), 0.2) !important;\n  --dux-BGNegative: rgba(var(--xydy-theme-rgb), 0.12) !important;\n  --dux-TextNegativeSecondary: rgba(var(--xydy-theme-rgb), 0.6) !important;\n  --dux-LiveColorStart: var(--xydy-theme-color) !important;\n  --dux-LiveColorEnd: var(--xydy-theme-hover) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] :is(.LfWUAfCI, .JsAyGzb8, .semi-badge-primary.semi-badge-solid, .semi-badge-danger.semi-badge-solid, .ConversationItemUnReadCountmutedUnreadBadge, .semi-switch-checked),\nhtml:root[data-xydy-theme=\"custom\"] :is([style*=\"background-color: rgb(254, 44, 85)\"], [style*=\"background-color: rgb(255, 44, 85)\"], [style*=\"background-color:rgb(254,44,85)\"], [style*=\"background-color:rgb(255,44,85)\"], [style*=\"background-color: #fe2c55\" i], [style*=\"background-color:#fe2c55\" i], [style*=\"background-color: #ff2c55\" i], [style*=\"background-color:#ff2c55\" i]) {\n  background-color: var(--xydy-theme-color) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] .semi-switch-checked:hover {\n  background-color: var(--xydy-theme-hover) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] .xgplayer-volume .xgplayer-slider .xgplayer-drag {\n  background-color: var(--xydy-theme-color) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] :is(.X1UqCDsf, [style^=\"color: rgb(254, 44, 85)\"], [style^=\"color: rgb(255, 44, 85)\"], [style*=\"; color: rgb(254, 44, 85)\"], [style*=\"; color: rgb(255, 44, 85)\"], [style^=\"color: #fe2c55\" i], [style^=\"color: #ff2c55\" i]) {\n  color: var(--xydy-theme-color) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] #douyin-header input {\n  caret-color: var(--xydy-theme-color) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] .danmakuInputContainer :is(input, textarea, [contenteditable=\"true\"]) {\n  caret-color: var(--xydy-theme-color) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] .xg-switch[aria-checked=\"true\"] {\n  background-color: var(--xydy-theme-color) !important;\n  border-color: transparent !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] .xg-switch[aria-checked=\"true\"]:hover {\n  background-color: var(--xydy-theme-hover) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuContainer:has(.danmakuInputContainer) {\n  flex: 0 1 auto !important;\n  width: max-content !important;\n  min-width: 0 !important;\n  max-width: 100% !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuContainer > .BpJmrV14 {\n  width: 100% !important;\n  max-width: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-controls .xgplayer-autoplay-setting {\n  display: block !important;\n  flex-shrink: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-setting-list[data-xydy-settings-empty=\"true\"] {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer {\n  position: relative !important;\n  flex: 0 0 auto !important;\n  width: 56px !important;\n  min-width: 56px !important;\n  max-width: 56px !important;\n  border-radius: 999px !important;\n  transition: width 0.32s cubic-bezier(0.22, 1, 0.36, 1), max-width 0.32s cubic-bezier(0.22, 1, 0.36, 1), min-width 0.32s cubic-bezier(0.22, 1, 0.36, 1), border-radius 0.24s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer::before {\n  content: \"弹幕\";\n  position: absolute;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  color: var(--xydy-text-main);\n  font-size: 12px;\n  pointer-events: none;\n  transition: opacity 0.12s ease;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer[data-xydy-danmaku=\"expanded\"] {\n  width: clamp(196px, 25vw, 420px) !important;\n  min-width: min(196px, 100%) !important;\n  max-width: 100% !important;\n  border-radius: 12px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer[data-xydy-danmaku=\"expanded\"]::before {\n  opacity: 0;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer :is(.FOWJAyvx, .hI6m1KGv, input) {\n  transition: opacity 0.16s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer:not([data-xydy-danmaku=\"expanded\"]) :is(.FOWJAyvx, .hI6m1KGv) {\n  opacity: 0 !important;\n  pointer-events: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer:not([data-xydy-danmaku=\"expanded\"]) input {\n  position: absolute !important;\n  inset: 0 !important;\n  width: 100% !important;\n  height: 100% !important;\n  min-width: 0 !important;\n  margin: 0 !important;\n  opacity: 0 !important;\n  cursor: pointer !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer .lTm4eK4g {\n  min-width: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .danmakuInputContainer[data-xydy-danmaku=\"expanded\"] input {\n  min-width: 0 !important;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html[data-xydy-styles=\"on\"] .danmakuInputContainer,\n  html[data-xydy-styles=\"on\"] .danmakuInputContainer::before,\n  html[data-xydy-styles=\"on\"] .danmakuInputContainer :is(.FOWJAyvx, .hI6m1KGv, input) {\n    transition: none !important;\n  }\n}\n\nhtml:root[data-xydy-theme=\"custom\"] svg :is([fill=\"#fe2c55\" i], [fill=\"#ff2c55\" i], [fill=\"rgb(254, 44, 85)\"], [fill=\"rgb(255, 44, 85)\"]) {\n  fill: var(--xydy-theme-color) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] svg :is([stroke=\"#fe2c55\" i], [stroke=\"#ff2c55\" i]) {\n  stroke: var(--xydy-theme-color) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] svg :is([stop-color=\"#fe2c55\" i], [stop-color=\"#ff2c55\" i], [stop-color=\"#ff1764\" i]) {\n  stop-color: var(--xydy-theme-color) !important;\n}\n\nhtml:root[data-xydy-theme=\"custom\"] svg [stop-color=\"#ed3495\" i] {\n  stop-color: var(--xydy-theme-hover) !important;\n}\n\n#xydy-loading-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 2147483646;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0, 0, 0, 0.9);\n  backdrop-filter: blur(8px);\n  -webkit-backdrop-filter: blur(8px);\n  opacity: 1;\n  transition: opacity 0.24s ease;\n}\n\n#xydy-loading-overlay.closing {\n  opacity: 0;\n  pointer-events: none;\n}\n\n.xydy-loading-card {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 14px;\n  width: min(420px, 86vw);\n  padding: 28px 24px;\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  border-radius: 24px;\n  background: rgba(255, 255, 255, 0.05);\n  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.4);\n  color: var(--xydy-text-main);\n  text-align: center;\n}\n\n.xydy-loading-spinner {\n  width: 52px;\n  height: 52px;\n  border: 5px solid rgba(255, 255, 255, 0.22);\n  border-top-color: rgba(255, 255, 255, 0.96);\n  border-radius: 999px;\n  animation: xydy-spin 0.9s linear infinite;\n}\n\n.xydy-loading-title {\n  font-size: 18px;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n\n.xydy-loading-desc {\n  color: var(--xydy-text-subtle);\n  font-size: 13px;\n  line-height: 1.55;\n}\n\n@keyframes xydy-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n#xydy-toast-host {\n  position: fixed;\n  left: 50%;\n  bottom: 20px;\n  z-index: 2147483647;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  transform: translateX(-50%);\n  pointer-events: none;\n}\n\n.xydy-toast {\n  min-width: 200px;\n  max-width: min(68vw, 480px);\n  padding: 10px 14px;\n  border-radius: 999px;\n  background: rgba(13, 17, 23, 0.88);\n  color: #f8fafc;\n  font-size: 13px;\n  line-height: 1.4;\n  text-align: center;\n  opacity: 0;\n  transform: translateY(8px);\n  transition: transform 0.18s ease, opacity 0.18s ease;\n  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);\n}\n\n.xydy-toast.show {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n.xydy-toast-warn {\n  background: rgba(121, 20, 20, 0.92);\n}\n\n#xydy-quick-help {\n  position: fixed;\n  inset: 0;\n  z-index: 2147483645;\n  display: none;\n  align-items: center;\n  justify-content: center;\n  padding: 20px;\n  background: rgba(0, 0, 0, 0.6);\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n}\n\n#xydy-quick-help.show {\n  display: flex;\n}\n\n.xydy-quick-help-card {\n  width: min(560px, 92vw);\n  padding: 22px 22px 18px;\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 22px;\n  background: rgba(10, 14, 20, 0.82);\n  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.46);\n  color: #f8fafc;\n}\n\n.xydy-quick-help-title {\n  font-size: 20px;\n  font-weight: 800;\n}\n\n.xydy-quick-help-desc {\n  margin-top: 8px;\n  color: rgba(248, 250, 252, 0.72);\n  font-size: 13px;\n  line-height: 1.55;\n}\n\n.xydy-quick-help-list {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  margin-top: 16px;\n}\n\n.xydy-quick-help-row {\n  display: grid;\n  grid-template-columns: 100px 1fr;\n  gap: 10px;\n  padding: 10px 12px;\n  border-radius: 14px;\n  background: rgba(255, 255, 255, 0.06);\n}\n\n.xydy-quick-help-key {\n  color: #fde68a;\n  font-weight: 700;\n}\n\n.xydy-quick-help-value {\n  color: rgba(248, 250, 252, 0.88);\n  line-height: 1.5;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header {\n  position: fixed !important;\n  top: -56px !important;\n  left: 0 !important;\n  width: 100% !important;\n  z-index: 1000 !important;\n  transition: top 0.16s cubic-bezier(0.25, 1, 0.5, 1) !important;\n  background: transparent !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n  border-bottom: none !important;\n}\n\n#xydy-header-blur-bg {\n  display: none !important;\n}\n\nhtml[data-xydy-header-entries=\"on\"][data-xydy-header-hide-all=\"on\"] #douyin-header,\nhtml[data-xydy-header-entries=\"on\"][data-xydy-header-search=\"off\"] #douyin-header .GjgTnTzB,\nhtml[data-xydy-header-entries=\"on\"] #douyin-header [data-xydy-header-hidden=\"on\"],\nhtml[data-xydy-header-entries=\"on\"] #douyin-header-menuCt[data-xydy-header-empty=\"on\"] {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #douyin-header,\nhtml[data-xydy-styles=\"on\"] #douyin-header > .oJj2v8B4,\nhtml[data-xydy-styles=\"on\"] #douyin-header .FJclIVL4,\nhtml[data-xydy-styles=\"on\"] #douyin-header .ztm3KRqq {\n  background: transparent !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n  border-bottom: none !important;\n  box-shadow: none !important;\n}\n\nhtml[data-xydy-navigation=\"on\"].xydy-header-visible #douyin-header {\n  top: 0 !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header .xydy-search-shell {\n  position: fixed !important;\n  left: 50vw !important;\n  right: auto !important;\n  top: -48px !important;\n  width: 92px !important;\n  min-width: 0 !important;\n  max-width: calc(100vw - 24px) !important;\n  height: 40px !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  transform: translateX(-50%) !important;\n  z-index: 1002 !important;\n  transition: width 380ms cubic-bezier(.22, 1, .36, 1), top 160ms cubic-bezier(.25, 1, .5, 1) !important;\n}\n\nhtml[data-xydy-navigation=\"on\"].xydy-header-visible #douyin-header .xydy-search-shell {\n  top: 8px !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header .xydy-search-shell[data-xydy-search=\"expanded\"] {\n  width: clamp(92px, calc(100vw - 320px), 500px) !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell :is(.ov6B8lHR, .zPZkM57p) {\n  width: 100% !important;\n  min-width: 0 !important;\n  max-width: none !important;\n  height: 40px !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header :is(.xydy-search-shell, .xydy-search-shell .ov6B8lHR, .xydy-search-shell .zPZkM57p) {\n  background: transparent !important;\n  border: none !important;\n  box-shadow: none !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header :is(.xydy-search-shell, .xydy-search-shell .ov6B8lHR, .xydy-search-shell .zPZkM57p)::before,\nhtml[data-xydy-navigation=\"on\"] #douyin-header :is(.xydy-search-shell, .xydy-search-shell .ov6B8lHR, .xydy-search-shell .zPZkM57p)::after {\n  content: none !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell .GySDQyGR {\n  position: relative !important;\n  isolation: isolate;\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  width: 100% !important;\n  height: 40px !important;\n  min-width: 0 !important;\n  border-radius: 999px !important;\n  box-sizing: border-box !important;\n  overflow: visible !important;\n  background: transparent !important;\n  border: none !important;\n  box-shadow: none !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n}\n\nhtml[data-xydy-navigation=\"on\"][data-xydy-styles=\"on\"] #xydy-header-search-background {\n  background: rgba(255, 255, 255, 0.1) !important;\n  border: 1px solid rgba(255, 255, 255, 0.24) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.14) !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell .qTaE0VU_ {\n  flex: 1 1 0 !important;\n  width: auto !important;\n  min-width: 0 !important;\n  padding: 0 !important;\n  opacity: 0;\n  visibility: hidden;\n  overflow: hidden !important;\n  transition: opacity 180ms ease, visibility 0s linear 180ms;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell[data-xydy-search=\"expanded\"] .qTaE0VU_ {\n  flex: 1 1 0 !important;\n  width: auto !important;\n  opacity: 1;\n  visibility: visible;\n  transition: opacity 220ms ease 70ms, visibility 0s;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell [data-e2e=\"searchbar-input\"] {\n  width: 100% !important;\n  height: 38px !important;\n  min-width: 0 !important;\n  margin: 0 !important;\n  padding: 0 4px 0 16px !important;\n  background: transparent !important;\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell [data-e2e=\"searchbar-button\"] {\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  flex: 0 0 90px !important;\n  width: 90px !important;\n  min-width: 0 !important;\n  height: 38px !important;\n  gap: 6px !important;\n  padding: 0 10px !important;\n  margin: 0 !important;\n  border: none !important;\n  border-radius: 999px !important;\n  background: transparent !important;\n  box-sizing: border-box !important;\n  transition: flex-basis 380ms cubic-bezier(.22, 1, .36, 1), width 380ms cubic-bezier(.22, 1, .36, 1) !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell[data-xydy-search=\"expanded\"] [data-e2e=\"searchbar-button\"] {\n  flex-basis: 80px !important;\n  width: 80px !important;\n}\n\nhtml[data-xydy-navigation=\"on\"][data-xydy-styles=\"on\"] .xydy-search-shell :is([data-e2e=\"searchbar-input\"], [data-e2e=\"searchbar-button\"], .btn-title) {\n  color: var(--xydy-text-main) !important;\n}\n\nhtml[data-xydy-navigation=\"on\"][data-xydy-styles=\"on\"] .xydy-search-shell [data-e2e=\"searchbar-button\"] path {\n  fill: currentColor !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell :is(.aRMXmTKL, .S5q6TZQt) {\n  display: none !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] .xydy-search-shell[data-xydy-search=\"collapsed\"] :is(.mahkhHpk, .sYw1LTOe) {\n  visibility: hidden !important;\n  opacity: 0 !important;\n  pointer-events: none !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header-menuCt {\n  position: fixed !important;\n  top: -48px !important;\n  right: 16px !important;\n  left: auto !important;\n  display: flex !important;\n  align-items: center !important;\n  width: max-content !important;\n  height: 40px !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 10px !important;\n  border: none !important;\n  border-radius: 999px !important;\n  box-sizing: border-box !important;\n  background: transparent !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n  box-shadow: none !important;\n  isolation: isolate;\n  overflow: visible !important;\n  z-index: 1002 !important;\n  transition: top 160ms cubic-bezier(.25, 1, .5, 1) !important;\n}\n\nhtml[data-xydy-navigation=\"on\"].xydy-header-visible #douyin-header-menuCt {\n  top: 8px !important;\n}\n\n#xydy-header-actions-background,\n#xydy-header-search-background {\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  z-index: -1;\n  box-sizing: border-box;\n}\n\nhtml[data-xydy-navigation=\"on\"][data-xydy-styles=\"on\"] #xydy-header-actions-background {\n  background: rgba(255, 255, 255, 0.1) !important;\n  border: 1px solid rgba(255, 255, 255, 0.24) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.14) !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header-menuCt :is(.K9oPgidp, .K9oPgidp > pace-island, .GLoxxgrP) {\n  height: 100% !important;\n  min-height: 0 !important;\n  align-items: center !important;\n  background: transparent !important;\n  border: none !important;\n  box-shadow: none !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header-menuCt .K9oPgidp > pace-island {\n  display: block !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header-menuCt .iLNqted2 {\n  height: 32px !important;\n  justify-content: center !important;\n  gap: 1px !important;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header-menuCt .NQKIHxUe {\n  width: 24px !important;\n  height: 24px !important;\n  margin: -3px 0 !important;\n  transform: scale(.75);\n  transform-origin: center;\n}\n\nhtml[data-xydy-navigation=\"on\"] #douyin-header-menuCt .phl13lpd {\n  height: 12px !important;\n  margin: 0 !important;\n  font-size: 10px !important;\n  line-height: 12px !important;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html[data-xydy-navigation=\"on\"] #douyin-header-menuCt,\n  html[data-xydy-navigation=\"on\"] .xydy-search-shell,\n  html[data-xydy-navigation=\"on\"] .xydy-search-shell .qTaE0VU_,\n  html[data-xydy-navigation=\"on\"] .xydy-search-shell [data-e2e=\"searchbar-button\"] {\n    transition: none !important;\n  }\n}\n\nhtml[data-xydy-navigation=\"on\"] .danmu {\n  transition: margin-top 0.16s cubic-bezier(0.25, 1, 0.5, 1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-immersive-switch-setting.immersive-switch {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard > #relatedVideoCard {\n  margin-top: 22px !important;\n  height: calc(100% - 22px) !important;\n  padding-top: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #douyin-right-container {\n  padding: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .dy-quick-container .dy-quick-player-content {\n  position: absolute !important;\n  inset: 0 0 0 160px !important;\n  width: auto !important;\n  height: auto !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  min-width: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"][data-xydy-sidebar=\"on\"] .dy-quick-container .dy-quick-player-content {\n  left: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .dy-quick-container #quickPlayer {\n  position: absolute !important;\n  inset: 56px 0 0 !important;\n  width: 100% !important;\n  height: auto !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  border-radius: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"][data-xydy-navigation=\"on\"] .dy-quick-container #quickPlayer {\n  top: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .ES4ZDMnf.N07M3gwz.isDark.nUy2mwhv.tC5Oyw9g {\n  background: transparent !important;\n  backdrop-filter: blur(5px) !important;\n  -webkit-backdrop-filter: blur(5px) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .basePlayerContainer:not(.highlightPlayer) .xgplayer-controls {\n  background-image: none !important;\n  background: rgba(255, 255, 255, 0.06) !important;\n  backdrop-filter: blur(8px) saturate(1.2) !important;\n  -webkit-backdrop-filter: blur(8px) saturate(1.2) !important;\n  border: 1px solid rgba(255, 255, 255, 0.08) !important;\n  box-shadow: none !important;\n  transition: background 0.18s ease, backdrop-filter 0.18s ease, border-color 0.18s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .basePlayerContainer:not(.highlightPlayer) .xgplayer-controls:hover {\n  background: rgba(255, 255, 255, 0.12) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border-color: rgba(255, 255, 255, 0.15) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-controls.show {\n  transform: translateY(0);\n}\n\nhtml[data-xydy-styles=\"on\"] video::-webkit-media-controls {\n  display: none !important;\n  opacity: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] video::-webkit-media-controls-enclosure {\n  display: none !important;\n  opacity: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .video-info-mask,\nhtml[data-xydy-styles=\"on\"] .UXyEyqbq.UdkDK3ea.DZKZZklc,\nhtml[data-xydy-styles=\"on\"] .L1TH4HdO.d6KxRih3.positionBox,\nhtml[data-xydy-styles=\"on\"] .L1TH4HdO.positionBox {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .IXMCDg0e:has(> .H_crvIqw):has(> .KpXu33iw) {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xg-video-container {\n  height: 100% !important;\n  margin: auto 0 !important;\n  bottom: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .nM3w4mVK.byAYwK4P.fullscreen_capture_feedback._z4WuFBP.NdwOHaIw {\n  height: 100% !important;\n  border-radius: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .nM3w4mVK .kkbhJDRa {\n  width: 100% !important;\n  height: 100% !important;\n  border-radius: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #sliderVideo,\nhtml[data-xydy-styles=\"on\"] #sliderVideo::before,\nhtml[data-xydy-styles=\"on\"] #sliderVideo::after {\n  border-radius: 0 !important;\n  clip-path: none !important;\n  -webkit-clip-path: none !important;\n  mask: none !important;\n  -webkit-mask: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #slider-card {\n  border-radius: 0 !important;\n  overflow: visible !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .PsHhivd9.sHGvkSIn,\nhtml[data-xydy-styles=\"on\"] .yZlWL2BG,\nhtml[data-xydy-styles=\"on\"] .vlXyJ9Hj,\nhtml[data-xydy-styles=\"on\"] .N3mRyy_g.popShadowAnimation,\nhtml[data-xydy-styles=\"on\"] .F_XLoeLO.c64lf7w4,\nhtml[data-xydy-styles=\"on\"] .ScTolygy.q1kuhAxH,\nhtml[data-xydy-styles=\"on\"] .eBcBNgnP.PHb7B2cG,\nhtml[data-xydy-styles=\"on\"] .k9soqkkm,\nhtml[data-xydy-styles=\"on\"] .lGxh4PDP.Q2nY9qA2.popShadowAnimation,\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S {\n\tbackground: rgba(255, 255, 255, 0.08) !important;\n\tbackdrop-filter: blur(30px) saturate(180%) !important;\n\t-webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n\tborder-radius: 12px !important;\n\tborder: 1px solid rgba(255, 255, 255, 0.12) !important;\n\tbox-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;\n\tcolor: var(--xydy-text-main) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .PsHhivd9.sHGvkSIn *,\nhtml[data-xydy-styles=\"on\"] .yZlWL2BG *,\nhtml[data-xydy-styles=\"on\"] .vlXyJ9Hj *,\nhtml[data-xydy-styles=\"on\"] .N3mRyy_g.popShadowAnimation *,\nhtml[data-xydy-styles=\"on\"] .F_XLoeLO.c64lf7w4 *,\nhtml[data-xydy-styles=\"on\"] .ScTolygy.q1kuhAxH *,\nhtml[data-xydy-styles=\"on\"] .eBcBNgnP.PHb7B2cG *,\nhtml[data-xydy-styles=\"on\"] .k9soqkkm *,\nhtml[data-xydy-styles=\"on\"] .lGxh4PDP.Q2nY9qA2.popShadowAnimation *,\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S * {\n\tcolor: var(--xydy-text-main) !important;\n\ttext-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .PsHhivd9.sHGvkSIn,\nhtml[data-xydy-styles=\"on\"] .lGxh4PDP.Q2nY9qA2.popShadowAnimation {\n  border-radius: 18px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .ncIQxKQq,\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S>li:first-child,\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S>ul:first-child {\n  background: linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.14)) !important;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.34) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] ._zym1kAG.nAPRGU5n,\nhtml[data-xydy-styles=\"on\"] .K_ckXK2o,\nhtml[data-xydy-styles=\"on\"] .l1obMd7E.vd2YjL9i,\nhtml[data-xydy-styles=\"on\"] .vPbDjtUz,\nhtml[data-xydy-styles=\"on\"] ._ZNpPx3x {\n  background: transparent !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg,\nhtml[data-xydy-styles=\"on\"] .l1obMd7E.vd2YjL9i>div,\nhtml[data-xydy-styles=\"on\"] .K_ckXK2o>div {\n  border-radius: 14px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg:hover,\nhtml[data-xydy-styles=\"on\"] .l1obMd7E.vd2YjL9i>div:hover,\nhtml[data-xydy-styles=\"on\"] .K_ckXK2o>div:hover {\n  background: rgba(255, 255, 255, 0.18) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg [class*=\"top\"],\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg [class*=\"Top\"],\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg span,\nhtml[data-xydy-styles=\"on\"] .K_ckXK2o span,\nhtml[data-xydy-styles=\"on\"] .l1obMd7E.vd2YjL9i span {\n  color: var(--xydy-text-subtle) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg :is(div, span, p) {\n  color: var(--xydy-text-main) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg :is(div, span, p):has(> :is(svg, img)) {\n  color: inherit !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg :is(div, span, p) {\n  text-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .fdVOt4Dg :is(div, span, p):where(:not(:first-child)) {\n  color: var(--xydy-text-subtle) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S {\n  border-radius: 20px !important;\n  overflow: hidden !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S>ul,\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S>li,\nhtml[data-xydy-styles=\"on\"] .Q6VYnosf.userMenuPanelShadowAnimation,\nhtml[data-xydy-styles=\"on\"] .l1obMd7E.vd2YjL9i {\n  background: transparent !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S :is(div, span, p, a),\nhtml[data-xydy-styles=\"on\"] .Q6VYnosf.userMenuPanelShadowAnimation :is(div, span, p, a) {\n  color: var(--xydy-text-main) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S :is(.SgbdwJuv, .NeAI6YYW, .vPbDjtUz, ._ZNpPx3x),\nhtml[data-xydy-styles=\"on\"] .Q6VYnosf.userMenuPanelShadowAnimation :is(.SgbdwJuv, .NeAI6YYW, .vPbDjtUz, ._ZNpPx3x) {\n  color: var(--xydy-text-subtle) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S [class*=\"download\"],\nhtml[data-xydy-styles=\"on\"] .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S [class*=\"Download\"] {\n  background: var(--xydy-accent-bg) !important;\n  border: 1px solid var(--xydy-accent-border) !important;\n  border-radius: 999px !important;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .semi-button.semi-button-primary.semi-button-size-small.B7L9kG57 {\n  background: rgba(180, 30, 45, 0.75) !important;\n  backdrop-filter: blur(8px) saturate(120%) !important;\n  -webkit-backdrop-filter: blur(8px) saturate(120%) !important;\n  color: rgba(255, 255, 255, 0.95) !important;\n  border: 1px solid rgba(255, 255, 255, 0.25) !important;\n  border-radius: 999px !important;\n  font-weight: 600;\n}\n\nhtml[data-xydy-styles=\"on\"] .semi-button.semi-button-primary.semi-button-size-small.B7L9kG57:hover {\n  background: rgba(255, 77, 79, 0.9) !important;\n  transform: translateY(-1px);\n  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playswitch.recommend-out-switch-btn {\n  visibility: hidden !important;\n  opacity: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] :is(.xgplayer-gamepad, .xgplayer-gamepad-button, [class*=\"gamepad\"], [class*=\"gamePad\"], [data-e2e*=\"gamepad\"], [data-e2e*=\"game-pad\"], [aria-label*=\"游戏手柄\"], [title*=\"游戏手柄\"], [aria-label*=\"小游戏\"], [title*=\"小游戏\"]) {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .dySwiperSlide .player-position-box-bottom div:has(> img[src*=\"/game_center/\"]) {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .fullscreen_capture_feedback {\n  padding-right: 0 !important;\n}\n\nhtml.xydy-silent-menu :is(div[id=\"qgmiQqfW\"], #EGfMOP99, #euinefEt, .jQkpodjD) {\n  opacity: 0 !important;\n  pointer-events: none !important;\n  animation: none !important;\n  transition: none !important;\n}\n\n.xydy-context-icon { display: none; }\n\nhtml[data-xydy-styles=\"on\"] .jQkpodjD > .o6tvYzFd {\n  box-sizing: border-box !important;\n  width: 280px !important;\n  min-width: 216px !important;\n  max-width: calc(100vw - 16px) !important;\n  max-height: calc(100dvh - 16px) !important;\n  height: auto !important;\n  padding: 8px !important;\n  border: 1px solid rgba(255, 255, 255, .2) !important;\n  border-radius: 18px !important;\n  background: linear-gradient(145deg, rgba(45, 51, 65, .8), rgba(20, 25, 35, .76)) !important;\n  backdrop-filter: blur(24px) saturate(1.35) !important;\n  -webkit-backdrop-filter: blur(24px) saturate(1.35) !important;\n  box-shadow: inset 0 1px rgba(255, 255, 255, .12), 0 18px 48px rgba(0, 0, 0, .3) !important;\n  overflow-x: hidden !important;\n  overflow-y: auto !important;\n  overscroll-behavior: contain;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(255, 255, 255, .2) transparent;\n  transform-origin: var(--xydy-context-origin, left top);\n  animation: xydy-context-panel-in 150ms ease both;\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd > :is(.wb906g24, a.kb8pfrOo, .xydy-context-settings) {\n  position: relative !important;\n  display: grid !important;\n  grid-template-columns: 18px minmax(0, 1fr) auto !important;\n  align-items: center !important;\n  gap: 10px !important;\n  box-sizing: border-box !important;\n  width: 100% !important;\n  height: auto !important;\n  min-height: 36px !important;\n  margin: 0 !important;\n  padding: 7px 10px !important;\n  border: 0 !important;\n  border-radius: 11px !important;\n  background: transparent !important;\n  color: rgba(255, 255, 255, .92) !important;\n  font-size: 13px !important;\n  font-weight: 500 !important;\n  line-height: 22px !important;\n  text-decoration: none !important;\n  cursor: pointer;\n  text-align: left;\n  transition: background-color 150ms ease, color 150ms ease, transform 150ms ease !important;\n  animation: xydy-context-row-in 180ms cubic-bezier(.19, 1, .22, 1) backwards;\n  animation-delay: calc(var(--xydy-menu-index, 0) * 15ms);\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd > :is(.wb906g24, a.kb8pfrOo, .xydy-context-settings):is(:hover, :focus-visible) {\n  background: rgba(255, 255, 255, .15) !important;\n  color: white !important;\n  transform: translateX(1px);\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd > :is(.wb906g24, a.kb8pfrOo, .xydy-context-settings):active { background: rgba(255, 255, 255, .22) !important; }\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd > .xydy-context-settings-divider {\n  height: 1px !important;\n  margin: 7px 9px !important;\n  padding: 0 !important;\n  background: rgba(255, 255, 255, .15) !important;\n  pointer-events: none;\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd > .xydy-context-settings .xydy-context-settings-label { font-weight: 600 !important; }\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd > :is(.wb906g24, a.kb8pfrOo, .xydy-context-settings)[data-xydy-context-group=\"true\"] { margin-top: 9px !important; }\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd > :is(.wb906g24, a.kb8pfrOo, .xydy-context-settings)[data-xydy-context-group=\"true\"]::before {\n  content: '';\n  position: absolute;\n  left: 9px;\n  right: 9px;\n  top: -5px;\n  height: 1px;\n  background: rgba(255, 255, 255, .12);\n  pointer-events: none;\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd > :is(.wb906g24, a.kb8pfrOo, .xydy-context-settings)[data-xydy-context-action=\"report\"]:hover {\n  background: rgba(255, 100, 125, .13) !important;\n  color: #ffd0d9 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd .xydy-context-icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  grid-column: 1;\n  width: 18px;\n  height: 18px;\n  color: currentColor;\n  opacity: .78;\n  pointer-events: none;\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd :is(.Gq1zvxbB, .xydy-context-settings-label) {\n  grid-column: 2;\n  min-width: 0;\n  margin: 0 !important;\n  color: inherit !important;\n  font-size: 13px !important;\n  font-weight: 500 !important;\n  line-height: 22px !important;\n  white-space: nowrap;\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd .ccZxuS3y {\n  display: inline-flex !important;\n  align-items: center;\n  justify-content: center;\n  box-sizing: border-box;\n  grid-column: 3;\n  min-width: 23px;\n  height: 22px;\n  margin: 0 !important;\n  padding: 0 5px;\n  border: 1px solid rgba(255, 255, 255, .11);\n  border-radius: 6px;\n  background: rgba(255, 255, 255, .055);\n  color: rgba(255, 255, 255, .5) !important;\n  font-size: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .o6tvYzFd .ccZxuS3y::after {\n  content: attr(data-xydy-key);\n  font: 11px/1.2 \"Segoe UI\", sans-serif;\n}\n\n@keyframes xydy-context-panel-in { from { opacity: 0; } to { opacity: 1; } }\n@keyframes xydy-context-row-in {\n  from { opacity: 0; transform: translateX(5px); }\n  to { opacity: 1; transform: translateX(0); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html[data-xydy-styles=\"on\"] :is(.jQkpodjD > .o6tvYzFd, .o6tvYzFd > :is(.wb906g24, a.kb8pfrOo, .xydy-context-settings)) { animation: none !important; transition: none !important; }\n}\n\n/* Semi Popover & Dropdown Glassmorphism Styling */\nhtml[data-xydy-styles=\"on\"] :is(.semi-dropdown-wrapper, .semi-popover-content, ._o7id7Pe, .userMenuPanelShadowAnimation, .Q6VYnosf.userMenuPanelShadowAnimation, .IEv8oDS8.popShadowAnimation, .componentsEntrywrapper, .ASay5JTn, .MhqtMkwi, .Yq8ahEWU, [class*=\"dropdown-showing\"], [class*=\"dropdown-wrapper\"]) {\n  background: rgba(255, 255, 255, 0.08) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.12) !important;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;\n\n  /* Force inner containers to be transparent to show the frosted glass background */\n  --dux-BGPopoverDefault: transparent !important;\n  --dux-BGCardSolid: transparent !important;\n  --dux-BGPrimary: transparent !important;\n  --dux-BGPrimary2: transparent !important;\n  --dux-BGCardGroup: transparent !important;\n  --dux-BGPanelGray: transparent !important;\n  --dux-BGPanelTone: transparent !important;\n  --dux-BGPanelTint: transparent !important;\n  --notice-header-bg-start: transparent !important;\n  --notice-header-bg-end: transparent !important;\n  \n  /* Semi Design UI inner background tokens - override locally to show the blur */\n  --semi-color-bg-0: transparent !important;\n  --semi-color-bg-1: transparent !important;\n  --semi-color-bg-2: transparent !important;\n  --semi-color-bg-3: transparent !important;\n  --semi-color-bg-4: transparent !important;\n  \n  /* Make hover and active states translucent */\n  --dux-BGPopoverPressed: rgba(255, 255, 255, 0.08) !important;\n  --notice-fill-hover: rgba(255, 255, 255, 0.08) !important;\n}\n\n/* Strip inner background colors on share, collect, more (three dots), quality, speed popup items for pure glassmorphism */\n/* NOTE: [class*=\"dropdown-wrapper\"] is intentionally excluded here to avoid overriding the outer wrapper's frosted glass background */\nhtml[data-xydy-styles=\"on\"] :is(.semi-dropdown, .semi-dropdown-content, .semi-dropdown-menu, .semi-dropdown-item, .semi-popover, .semi-popover-inner, [class*=\"dropdown-showing\"]) {\n  background: transparent !important;\n  background-color: transparent !important;\n  box-shadow: none !important;\n  border-color: rgba(255, 255, 255, 0.08) !important;\n}\n\n/* ========================================================================================= */\n/* Immersive Mode Specific Popups (Share, Collect, More) */\n/* These do NOT use standard Semi Design components. They use obfuscated classes like Wl7JZ1MY, lC5eOSqy */\n/* ========================================================================================= */\n\n/* Target the wrapper by matching structural placement in body and inner identifying components (like the copy link input) */\nhtml[data-xydy-styles=\"on\"] body > div:not(#root):not(#preact-border-shadow-host) > div:has(.semi-input-wrapper),\nhtml[data-xydy-styles=\"on\"] body > div:not(#root):not(#preact-border-shadow-host) > div > div:has(.semi-input-wrapper),\nhtml[data-xydy-styles=\"on\"] [class*=\"recommend-login-panel\"],\nhtml[data-xydy-styles=\"on\"] .n4FTI10b,\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX,\nhtml[data-xydy-styles=\"on\"] .hurS2TXT {\n  background: rgba(255, 255, 255, 0.08) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.12) !important;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;\n  border-radius: 12px !important;\n}\n\n/* Keep original widths for teleported popups so they don't deform on document.body */\n/* NOTE: We no longer teleport popups, so these are removed to ensure native width flows */\n\n/* ========================================================================================= */\n/* Immersive Stacking Context Solvers (Bypass backdrop-filter bugs) */\n/* When dynamic popups are open inside the right panel, we temporarily strip filters and transforms */\n/* on their ancestors (.rDq18SJg, .gvcmX2Lf, .D0ZulesG) to let the browser render the blur. */\n/* ========================================================================================= */\nhtml[data-xydy-styles=\"on\"] .rDq18SJg:has(.n4FTI10b, ._KRDPUZX, .hurS2TXT),\nhtml[data-xydy-styles=\"on\"] .gvcmX2Lf:has(.n4FTI10b, ._KRDPUZX, .hurS2TXT),\nhtml[data-xydy-styles=\"on\"] .D0ZulesG.ej8hl0s8:has(.n4FTI10b, ._KRDPUZX, .hurS2TXT) {\n  transform: none !important;\n  filter: none !important;\n}\n\n/* Strip background color ONLY from the overlapping inner panel container .lC5eOSqy to show the outer blur */\n/* DO NOT touch any other descendant elements (buttons, inputs, hover states) to keep internal styles native */\nhtml[data-xydy-styles=\"on\"] .lC5eOSqy {\n  background: transparent !important;\n  background-color: transparent !important;\n  box-shadow: none !important;\n}\n\n/* ========================================================================================= */\n/* Collect popup (._KRDPUZX) inner opaque containers - strip backgrounds to reveal blur */\n/* Classes identified by live DOM inspection: .TIxHFAzq (list area), .PL6IqKFH (row item),  */\n/* .AyByLZ2h (thumbnail bg), .cwlyNJ6o (checkbox zone), .etjjie8s (footer area)            */\n/* PRESERVED: .semi-checkbox-inner-display (red tick), .semi-button-primary (red save btn)  */\n/* ========================================================================================= */\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX .TIxHFAzq,\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX .PL6IqKFH,\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX .AyByLZ2h,\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX .cwlyNJ6o,\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX .etjjie8s {\n  background: transparent !important;\n  background-color: transparent !important;\n}\n\n/* Also strip the outer wrapper bg that was identified */\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX .SoCg1WZL {\n  background: transparent !important;\n  background-color: transparent !important;\n}\n\n/* ========================================================================================= */\n/* Share popup (.n4FTI10b) inner opaque containers - strip backgrounds to reveal blur       */\n/* Classes: .TUOAeWQT (inner list area), .kqYbiwxV (sub-container)                         */\n/* PRESERVED: .xu0OjnsQ.wv0hD3qc.uiL5gOiW (red circular share buttons)                    */\n/* ========================================================================================= */\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .TUOAeWQT,\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .kqYbiwxV,\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .I2cladc1,\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .UvaONlvz,\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .sqaFjMkQ,\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .wZ1j9v7T {\n  background: transparent !important;\n  background-color: transparent !important;\n}\n\n/* Restore translucent hover effect for clickable items (like share destinations) */\nhtml[data-xydy-styles=\"on\"] :is(.n4FTI10b, ._KRDPUZX, .hurS2TXT) {\n  border-radius: 18px !important;\n  color: var(--xydy-text-main) !important;\n  --semi-color-text-0: var(--xydy-text-main);\n  --semi-color-text-1: var(--xydy-text-main);\n  --semi-color-text-2: var(--xydy-text-subtle);\n  --semi-color-bg-0: transparent;\n  --semi-color-bg-1: transparent;\n  --semi-color-bg-2: transparent;\n}\n\nhtml[data-xydy-styles=\"on\"] :is(.n4FTI10b .otFjqQEX, ._KRDPUZX .PL6IqKFH, .hurS2TXT .r5aqUxRL) {\n  background: transparent !important;\n  border-radius: 12px !important;\n  transition: background 160ms ease, box-shadow 160ms ease;\n}\n\nhtml[data-xydy-styles=\"on\"] :is(.n4FTI10b .otFjqQEX, ._KRDPUZX .PL6IqKFH, .hurS2TXT .r5aqUxRL):is(:hover, :focus-within) {\n  background: rgba(255, 255, 255, 0.12) !important;\n  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] :is(.n4FTI10b .otFjqQEX, ._KRDPUZX .PL6IqKFH):has(input:checked) {\n  background: rgba(255, 255, 255, 0.1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .n4FTI10b :is(.WP9AZZAa, .TQChUZFG, .Wl7JZ1MY, .VzoNDwLw),\nhtml[data-xydy-styles=\"on\"] .hurS2TXT :is(.ovKeXnCn, .X49GcmaZ, .lY__ewZJ, .BF7YaXys) {\n  background: transparent !important;\n  box-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT .ovKeXnCn {\n  gap: 4px !important;\n  padding: 10px 8px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT .r5aqUxRL {\n  flex: 1 1 0 !important;\n  width: auto !important;\n  padding: 8px 2px !important;\n  min-width: 0 !important;\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT .CtbumKit {\n  white-space: nowrap !important;\n  font-size: 11px !important;\n  line-height: 16px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT .Au3ppGJ6 {\n  background: rgba(255, 255, 255, 0.07) !important;\n  border: 1px solid rgba(255, 255, 255, 0.12) !important;\n  border-radius: 13px !important;\n  box-sizing: border-box !important;\n  color: var(--xydy-text-main) !important;\n  transition: background 160ms ease, border-color 160ms ease;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT .r5aqUxRL:hover .Au3ppGJ6 {\n  background: rgba(255, 255, 255, 0.16) !important;\n  border-color: rgba(255, 255, 255, 0.3) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT :is(.CtbumKit, .TajsRheG, .tKrkJj14),\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX :is(.w5tzeLDK, .Z237Vhoq),\nhtml[data-xydy-styles=\"on\"] .n4FTI10b :is(.EnYt_IKl, .S874re0p) {\n  color: var(--xydy-text-main) !important;\n  text-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT :is(.PX9SsZUz),\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX .fB79ZcH0 {\n  color: var(--xydy-text-subtle) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT .X49GcmaZ,\nhtml[data-xydy-styles=\"on\"] ._KRDPUZX .etjjie8s,\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .I2cladc1 {\n  border-top: 1px solid rgba(255, 255, 255, 0.12) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .hurS2TXT .ihCkTQ8r,\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .semi-input-wrapper,\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .UvaONlvz {\n  background: rgba(255, 255, 255, 0.08) !important;\n  border: 1px solid rgba(255, 255, 255, 0.12) !important;\n  border-radius: 10px !important;\n  box-shadow: none !important;\n  color: var(--xydy-text-main) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .semi-input {\n  background: transparent !important;\n  color: var(--xydy-text-main) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .semi-input-wrapper:focus-within {\n  border-color: rgba(255, 255, 255, 0.45) !important;\n  background: rgba(255, 255, 255, 0.14) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .n4FTI10b .UvaONlvz:not(:disabled):hover,\nhtml[data-xydy-styles=\"on\"] .hurS2TXT .ihCkTQ8r:hover {\n  background: rgba(255, 255, 255, 0.18) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .W6qKIZ6x.popShadowAnimation {\n  background: rgba(18, 23, 33, 0.48) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.22) !important;\n  border-radius: 16px !important;\n  box-shadow: var(--xydy-panel-shadow-soft) !important;\n  color: var(--xydy-text-main) !important;\n  gap: 12px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .W6qKIZ6x .FvfcGgNr {\n  color: var(--xydy-text-main) !important;\n  background: transparent !important;\n  font-size: 13px !important;\n  line-height: 1.5 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .W6qKIZ6x .qJAyV2xV {\n  background: rgba(255, 255, 255, 0.12) !important;\n  border: 1px solid rgba(255, 255, 255, 0.22) !important;\n  border-radius: 10px !important;\n  color: var(--xydy-text-main) !important;\n  transition: background 160ms ease, border-color 160ms ease;\n}\n\nhtml[data-xydy-styles=\"on\"] .W6qKIZ6x .qJAyV2xV:hover {\n  background: rgba(255, 255, 255, 0.23) !important;\n  border-color: rgba(255, 255, 255, 0.42) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .W6qKIZ6x .oTiszHW4 {\n  border-radius: 50% !important;\n  opacity: 0.7;\n  transition: background 160ms ease, opacity 160ms ease;\n}\n\nhtml[data-xydy-styles=\"on\"] .W6qKIZ6x .oTiszHW4:hover {\n  background: rgba(255, 255, 255, 0.14) !important;\n  opacity: 1;\n}\n\n/* Ensure round corners for search & suggestions panels */\nhtml[data-xydy-styles=\"on\"] :is(.MhqtMkwi, .Yq8ahEWU) {\n  border-radius: 12px !important;\n  overflow: hidden !important;\n}\n\nhtml:root[data-xydy-styles=\"on\"] :is(.MhqtMkwi, .Yq8ahEWU) :is(.y7JjSfUG, .rjLRxj9f)[data-index] {\n  background: transparent !important;\n  border-radius: 8px !important;\n  box-shadow: none !important;\n  transition: background 150ms ease, box-shadow 150ms ease;\n}\n\nhtml[data-xydy-styles=\"on\"] :is(.MhqtMkwi, .Yq8ahEWU) .rjLRxj9f > .gQHdTEA7 {\n  background: transparent !important;\n}\n\nhtml:root[data-xydy-styles=\"on\"] :is(.MhqtMkwi, .Yq8ahEWU) :is(.y7JjSfUG, .rjLRxj9f)[data-index]:is(:hover, :focus-visible, .ttePjoSl, [aria-selected=\"true\"]) {\n  background: rgba(255, 255, 255, 0.08) !important;\n  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12) !important;\n}\n\nhtml:root[data-xydy-styles=\"on\"][data-xydy-liquid-glass=\"on\"] :is(.MhqtMkwi, .Yq8ahEWU) :is(.y7JjSfUG, .rjLRxj9f)[data-index]:is(:hover, :focus-visible, .ttePjoSl, [aria-selected=\"true\"]) {\n  background: linear-gradient(125deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.035) 65%, rgba(255, 255, 255, 0.08)) !important;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.16) !important;\n}\n\n\n\n/* Notification panel: each individual notification item overrides */\nhtml[data-xydy-styles=\"on\"] .v4ybwR9T.ToPeGBn_,\nhtml[data-xydy-styles=\"on\"] .IEv8oDS8.popShadowAnimation .SmkB6fzs {\n  background: transparent !important;\n  background-color: transparent !important;\n  border-radius: 8px !important;\n  transition: background 0.15s ease, background-color 0.15s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .v4ybwR9T.ToPeGBn_:hover,\nhtml[data-xydy-styles=\"on\"] .IEv8oDS8.popShadowAnimation .SmkB6fzs:hover {\n  background: rgba(255, 255, 255, 0.08) !important;\n  background-color: rgba(255, 255, 255, 0.08) !important;\n}\n\n/* Notification panel inner containers transparent for glass effect */\nhtml[data-xydy-styles=\"on\"] .IEv8oDS8.popShadowAnimation .yg9odyl4,\nhtml[data-xydy-styles=\"on\"] .IEv8oDS8.popShadowAnimation .dXEFJgd3,\nhtml[data-xydy-styles=\"on\"] .IEv8oDS8.popShadowAnimation .sKMx4DKd,\nhtml[data-xydy-styles=\"on\"] .IEv8oDS8.popShadowAnimation .GjJ3iWT6 {\n  background: transparent !important;\n}\n\n/* Avatar panel inner containers transparent for glass effect */\nhtml[data-xydy-styles=\"on\"] ._o7id7Pe .gf_raqC9,\nhtml[data-xydy-styles=\"on\"] ._o7id7Pe .mHmVfg4D,\nhtml[data-xydy-styles=\"on\"] ._o7id7Pe .trust-login-tips-info,\nhtml[data-xydy-styles=\"on\"] ._o7id7Pe > *,\nhtml[data-xydy-styles=\"on\"] .userMenuPanelShadowAnimation .gf_raqC9,\nhtml[data-xydy-styles=\"on\"] .userMenuPanelShadowAnimation .mHmVfg4D,\nhtml[data-xydy-styles=\"on\"] .userMenuPanelShadowAnimation .trust-login-tips-info,\nhtml[data-xydy-styles=\"on\"] .userMenuPanelShadowAnimation > * {\n  background: transparent !important;\n  background-color: transparent !important;\n}\n\n/* Avatar and Notification panel text colors to be white / light-gray */\nhtml[data-xydy-styles=\"on\"] :is(._o7id7Pe, .userMenuPanelShadowAnimation, .Q6VYnosf.userMenuPanelShadowAnimation, .IEv8oDS8.popShadowAnimation) :is(div, span, p, a) {\n  color: var(--xydy-text-main) !important;\n  text-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] :is(._o7id7Pe, .userMenuPanelShadowAnimation, .Q6VYnosf.userMenuPanelShadowAnimation, .IEv8oDS8.popShadowAnimation) :is(.SgbdwJuv, .NeAI6YYW, .vPbDjtUz, ._ZNpPx3x, [class*=\"desc\"], [class*=\"time\"], [class*=\"date\"]) {\n  color: var(--xydy-text-subtle) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] ._o7id7Pe [class*=\"download\"],\nhtml[data-xydy-styles=\"on\"] ._o7id7Pe [class*=\"Download\"],\nhtml[data-xydy-styles=\"on\"] .userMenuPanelShadowAnimation [class*=\"download\"],\nhtml[data-xydy-styles=\"on\"] .userMenuPanelShadowAnimation [class*=\"Download\"] {\n  background: var(--xydy-accent-bg) !important;\n  border: 1px solid var(--xydy-accent-border) !important;\n  border-radius: 999px !important;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28) !important;\n}\n\n/* Avatar panel: thicker frosted glass to match message panel density */\nhtml[data-xydy-styles=\"on\"] ._o7id7Pe,\nhtml[data-xydy-styles=\"on\"] .userMenuPanelShadowAnimation,\nhtml[data-xydy-styles=\"on\"] .Q6VYnosf.userMenuPanelShadowAnimation {\n  background: rgba(255, 255, 255, 0.12) !important;\n  backdrop-filter: blur(26px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(26px) saturate(180%) !important;\n}\n\n/* Specific inner fixes for IM and Avatar dropdowns */\nhtml[data-xydy-styles=\"on\"] .componentsEntrywrapper,\nhtml[data-xydy-styles=\"on\"] .ASay5JTn,\nhtml[data-xydy-styles=\"on\"] .gfJJECEm,\nhtml[data-xydy-styles=\"on\"] .imDark,\nhtml[data-xydy-styles=\"on\"] .imContainer {\n  background-color: transparent !important;\n  background-image: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .cCnb7mCE:has(#im-entry-vmok-popup-portal.JTaHbIgX) {\n  width: 0 !important;\n  min-width: 0 !important;\n  flex: 0 0 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .JOMNV4X6:has(#im-entry-vmok-popup-portal.JTaHbIgX) {\n  background: transparent !important;\n  border-radius: 18px !important;\n  position: fixed !important;\n  top: 72px !important;\n  right: 24px !important;\n  bottom: auto !important;\n  left: auto !important;\n  width: min(380px, calc(100vw - 48px)) !important;\n  height: min(680px, calc(100dvh - 96px)) !important;\n  z-index: 2005 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.coB4PJdn {\n  display: none !important;\n  background: transparent !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n  border: none !important;\n  box-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX {\n  width: 100% !important;\n  height: 100% !important;\n  background: rgba(10, 10, 18, 0.68) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.14) !important;\n  border-radius: 18px !important;\n  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5) !important;\n  overflow: hidden !important;\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX :is(.KTRSIMc5, .xR2NeiXU, .ASay5JTn, .componentsEntrywrapper) {\n  width: 100% !important;\n  height: 100% !important;\n  max-height: 100% !important;\n  margin: 0 !important;\n  background: transparent !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n  border: none !important;\n  box-shadow: none !important;\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX .StackLayoutpagespageRoot {\n  background: transparent !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX .StackLayoutStackLayoutV2wrapper > [data-stack-layer]:has(~ [data-stack-layer]) {\n  visibility: hidden !important;\n  opacity: 0 !important;\n  pointer-events: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX .StackLayoutStackTitleBartitleBar {\n  background: rgba(255, 255, 255, 0.035) !important;\n  background-image: none !important;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;\n  box-shadow: none !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX :is(.StackLayoutStackTitleBarleftTitle, .StackLayoutStackChatHeadertitle) {\n  color: rgba(255, 255, 255, 0.92) !important;\n  font-weight: 600 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX .StackLayoutStackTitleBartitleBar svg {\n  border-radius: 8px !important;\n  transition: background 0.15s ease;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX .StackLayoutStackTitleBartitleBar svg:hover {\n  background: rgba(255, 255, 255, 0.1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX :is(.LeftPanelHeaderheader, .searchSearchInputsearch_header, .searchSearchInputinput_box) {\n  background: transparent !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX .searchSearchInputinput_box .semi-input-wrapper {\n  background: rgba(255, 255, 255, 0.07) !important;\n  border: 1px solid rgba(255, 255, 255, 0.12) !important;\n  border-radius: 12px !important;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX .searchSearchInputinput_box input {\n  background: transparent !important;\n  color: rgba(255, 255, 255, 0.9) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #im-entry-vmok-popup-portal.JTaHbIgX .searchSearchInputinput_box input::placeholder {\n  color: rgba(255, 255, 255, 0.45) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .JOMNV4X6.xydy-message-minimized {\n  visibility: hidden !important;\n  opacity: 0 !important;\n  pointer-events: none !important;\n}\n\n#xydy-message-orb {\n  position: fixed;\n  z-index: 2010;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 0;\n  min-height: 0;\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n  border: 1px solid rgba(255, 255, 255, 0.28);\n  border-radius: 18px;\n  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.035) 60%), rgba(12, 17, 26, 0.62);\n  color: rgba(255, 255, 255, 0.9);\n  backdrop-filter: blur(26px) saturate(160%);\n  -webkit-backdrop-filter: blur(26px) saturate(160%);\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 8px 28px rgba(0, 0, 0, 0.28);\n  cursor: pointer;\n  overflow: hidden;\n  opacity: 1;\n  transition: opacity 650ms ease;\n}\n\nhtml[data-xydy-liquid-glass=\"on\"] #xydy-message-orb {\n  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.16)), rgba(12, 17, 26, 0.24);\n  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.65), inset 0 -1px 0 rgba(255, 255, 255, 0.2), 0 8px 28px rgba(0, 0, 0, 0.25);\n}\n\n#xydy-message-orb svg {\n  flex: 0 0 auto;\n  opacity: 0;\n  transition: opacity 180ms ease;\n  pointer-events: none;\n}\n\n#xydy-message-orb:is([data-phase=\"moving\"], [data-phase=\"docked\"]) svg {\n  opacity: 1;\n}\n\n#xydy-message-orb[data-revealed=\"false\"] {\n  opacity: 0;\n  pointer-events: none;\n}\n\n#xydy-message-orb:focus-visible {\n  outline: 2px solid rgba(255, 255, 255, 0.8);\n  outline-offset: -4px;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  #xydy-message-orb,\n  #xydy-message-orb svg {\n    transition-duration: 1ms;\n  }\n}\n\nhtml[data-xydy-styles=\"on\"] .U8pIfXaJ {\n  background: transparent !important;\n  background-color: transparent !important;\n  transition: background-color 0.15s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .U8pIfXaJ:hover {\n  background-color: rgba(255, 255, 255, 0.08) !important;\n}\n\n/* Global OLED Deep Dark Mode Skin Overrides */\nhtml[data-xydy-styles=\"on\"] {\n  --dux-BGPrimary: #000000 !important;\n  --dux-BGPrimary2: #000000 !important;\n  --dux-BGCardGroup: #000000 !important;\n  --dux-BGPanelGray: #000000 !important;\n  --dux-BGCreation: #000000 !important;\n  --dux-BGCreation2: #000000 !important;\n  --dux-BGView: #000000 !important;\n  --dux-BGViewSolid: #000000 !important;\n  --dux-BGCardSolid: #0f0f11 !important;\n  --semi-color-bg-0: #000000 !important;\n  --semi-color-bg-1: #09090b !important;\n  --semi-color-bg-2: #121214 !important;\n  --semi-color-bg-3: #1a1a1f !important;\n  --semi-color-bg-4: #222227 !important;\n  \n  --color-bg-b2: transparent !important; /* Force avatar items blue-gray background to transparent */\n}\n\nhtml[data-xydy-styles=\"on\"] [class*=\"semi-popover-arr\"],\nhtml[data-xydy-styles=\"on\"] [class*=\"semi-dropdown-arr\"],\nhtml[data-xydy-styles=\"on\"] .semi-popover-arrow,\nhtml[data-xydy-styles=\"on\"] [class*=\"userMenuPanelArrow\"] {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .semi-dropdown-item:hover,\nhtml[data-xydy-styles=\"on\"] .semi-dropdown-menu-item:hover {\n  background-color: rgba(255, 255, 255, 0.08) !important;\n}\n\n/* Floating iOS-style Glassmorphism Player Control Bar */\nhtml[data-xydy-styles=\"on\"] .xgplayer .xgplayer-controls,\nhtml[data-xydy-styles=\"on\"] .xgplayer-pc .xgplayer-controls,\nhtml[data-xydy-styles=\"on\"] .xgplayer-is-fullscreen .xgplayer-controls,\nhtml[data-xydy-styles=\"on\"] .xgplayer-fullscreen .xgplayer-controls,\nhtml[data-xydy-styles=\"on\"] .xg-fullscreen .xgplayer-controls,\nhtml[data-xydy-styles=\"on\"] xg-controls.xgplayer-controls,\nhtml[data-xydy-styles=\"on\"] .xgplayer-controls {\n  bottom: 20px !important;\n  left: 50% !important;\n  right: auto !important;\n  transform: translateX(-50%) !important;\n  width: calc(100% - 40px) !important;\n  max-width: 1200px !important;\n  height: 52px !important;\n  background: rgba(255, 255, 255, 0.08) !important;\n  background-image: none !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.12) !important;\n  border-radius: 26px !important;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;\n  overflow: visible !important;\n  padding: 0 12px !important;\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer .xgplayer-controls::before,\nhtml[data-xydy-styles=\"on\"] .xgplayer .xgplayer-controls::after,\nhtml[data-xydy-styles=\"on\"] .xgplayer-pc .xgplayer-controls::before,\nhtml[data-xydy-styles=\"on\"] .xgplayer-pc .xgplayer-controls::after,\nhtml[data-xydy-styles=\"on\"] .xgplayer-is-fullscreen .xgplayer-controls::before,\nhtml[data-xydy-styles=\"on\"] .xgplayer-is-fullscreen .xgplayer-controls::after,\nhtml[data-xydy-styles=\"on\"] .xgplayer-fullscreen .xgplayer-controls::before,\nhtml[data-xydy-styles=\"on\"] .xgplayer-fullscreen .xgplayer-controls::after,\nhtml[data-xydy-styles=\"on\"] xg-controls.xgplayer-controls::before,\nhtml[data-xydy-styles=\"on\"] xg-controls.xgplayer-controls::after {\n  display: none !important;\n  background: transparent !important;\n  background-image: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xg-inner-controls {\n  background: transparent !important;\n  background-color: transparent !important;\n  background-image: none !important;\n  width: 100% !important;\n  left: 0 !important;\n  right: 0 !important;\n  padding: 0 12px !important;\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xg-left-grid,\nhtml[data-xydy-styles=\"on\"] .xg-right-grid {\n  height: 100% !important;\n  display: flex !important;\n  align-items: center !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-progress {\n  bottom: 64px !important;\n  left: 12px !important;\n  right: 12px !important;\n  width: calc(100% - 24px) !important;\n  z-index: 14 !important;\n  touch-action: none !important;\n  user-select: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-recommend-tag {\n  translate: 0 -12px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-shop-anchor {\n  translate: 0 -14px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-shop-anchor > div {\n  display: inline-flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n  max-width: min(320px, calc(100vw - 48px)) !important;\n  padding: 6px 10px !important;\n  border: 1px solid var(--xydy-panel-border) !important;\n  border-radius: 14px !important;\n  background: var(--xydy-panel-bg) !important;\n  backdrop-filter: blur(16px) saturate(1.2) !important;\n  -webkit-backdrop-filter: blur(16px) saturate(1.2) !important;\n  box-shadow: var(--xydy-panel-shadow-soft) !important;\n  color: var(--xydy-text-main) !important;\n  text-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-shop-anchor > div > svg {\n  flex-shrink: 0 !important;\n  border-radius: 6px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-shop-anchor :is(.E_XpBG4T, .nreJijFE, .gcPXOPY1) {\n  background: transparent !important;\n  color: inherit !important;\n  text-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-shop-anchor .gcPXOPY1 {\n  color: var(--xydy-text-subtle) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-video-info-wrap,\nhtml[data-xydy-styles=\"on\"] .douyin-player-video-info-wrap,\nhtml[data-xydy-styles=\"on\"] .video-info-detail {\n  bottom: 24px !important;\n  transition: bottom 0.25s cubic-bezier(0.25, 1, 0.5, 1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer:not(.xgplayer-inactive) .xgplayer-video-info-wrap,\nhtml[data-xydy-styles=\"on\"] .xgplayer:not(.xgplayer-inactive) .douyin-player-video-info-wrap,\nhtml[data-xydy-styles=\"on\"] .xgplayer:not(.xgplayer-inactive) .video-info-detail {\n  bottom: 76px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] div[class*=\"immersive-player-switch-on-hide-interaction-area\"],\nhtml[data-xydy-styles=\"on\"] .gvcmX2Lf,\nhtml[data-xydy-styles=\"on\"] .rDq18SJg {\n  bottom: 24px !important;\n  transition: bottom 0.25s cubic-bezier(0.25, 1, 0.5, 1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer:not(.xgplayer-inactive) div[class*=\"immersive-player-switch-on-hide-interaction-area\"],\nhtml[data-xydy-styles=\"on\"] .xgplayer:not(.xgplayer-inactive) .gvcmX2Lf,\nhtml[data-xydy-styles=\"on\"] .xgplayer:not(.xgplayer-inactive) .rDq18SJg {\n  bottom: 76px !important;\n}\n\n/* ===== Sidebar Floating Glass Panel ===== */\n\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation,\nhtml[data-xydy-sidebar=\"on\"] [data-e2e=\"douyin-navigation\"]:not(#douyin-navigation *) {\n  position: fixed !important;\n  left: 8px !important;\n  top: 50% !important;\n  right: auto !important;\n  bottom: auto !important;\n  width: 160px !important;\n  height: auto !important;\n  min-height: 0 !important;\n  max-height: calc(100dvh - 24px) !important;\n  translate: 0 -50% !important;\n  border-radius: 20px !important;\n  z-index: 1001 !important;\n  flex: none !important;\n  overflow: visible !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation [data-e2e=\"douyin-navigation\"] {\n  position: static !important;\n  width: 100% !important;\n  height: auto !important;\n  min-height: 0 !important;\n  max-height: calc(100dvh - 42px) !important;\n  flex: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  translate: none !important;\n  transform: none !important;\n  overflow: hidden auto !important;\n  scrollbar-width: thin;\n}\n\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation .AVblXapA,\nhtml[data-xydy-sidebar=\"on\"] [data-e2e=\"douyin-navigation\"] .AVblXapA {\n  position: relative !important;\n  left: auto !important;\n  top: auto !important;\n  width: 100% !important;\n  height: auto !important;\n  min-height: 0 !important;\n  max-height: inherit !important;\n  z-index: 1002 !important;\n  display: flex !important;\n  flex-direction: column !important;\n  background: rgba(255, 255, 255, 0.08) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border-radius: 20px !important;\n  border: 1px solid rgba(255, 255, 255, 0.12) !important;\n  box-shadow: 8px 0 32px rgba(2, 6, 23, 0.2) !important;\n  padding: 8px !important;\n  box-sizing: border-box !important;\n  overflow: hidden !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] :is(#douyin-navigation, [data-e2e=\"douyin-navigation\"]) :is(.jgOh5s24, .QBGm3boE, .cXR8kOAg),\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation [data-e2e=\"douyin-navigation\"] > div {\n  width: 100% !important;\n  height: auto !important;\n  min-height: 0 !important;\n  max-height: none !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  flex: none !important;\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] :is(#douyin-navigation, [data-e2e=\"douyin-navigation\"]) :is(footer, .PkTZC_CY, .Y9qfItNq, .kCzNsmN5:not(:has(a))) {\n  display: none !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation .IWnT0pMe,\nhtml[data-xydy-sidebar=\"on\"] [data-e2e=\"douyin-navigation\"] .IWnT0pMe {\n  display: none !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] #panel-menu,\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation pace-island,\nhtml[data-xydy-sidebar=\"on\"] [data-e2e=\"douyin-navigation\"] pace-island {\n  display: none !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation > a:first-child,\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation > a.RZuwF26I {\n  display: none !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation,\nhtml[data-xydy-sidebar=\"on\"] [data-e2e=\"douyin-navigation\"],\nhtml[data-xydy-sidebar=\"on\"] #douyin-navigation svg,\nhtml[data-xydy-sidebar=\"on\"] [data-e2e=\"douyin-navigation\"] svg {\n  color: rgba(241, 245, 249, 0.94) !important;\n  fill: currentColor !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"].xydy-sidebar-hidden #douyin-navigation,\nhtml[data-xydy-sidebar=\"on\"].xydy-sidebar-hidden [data-e2e=\"douyin-navigation\"]:not(#douyin-navigation *) {\n  transform: translateX(calc(-100% - 12px)) !important;\n  transition: transform 0.22s cubic-bezier(0.25, 1, 0.5, 1) !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"]:not(.xydy-sidebar-hidden) #douyin-navigation,\nhtml[data-xydy-sidebar=\"on\"]:not(.xydy-sidebar-hidden) [data-e2e=\"douyin-navigation\"]:not(#douyin-navigation *) {\n  transform: translateX(0) !important;\n  transition: transform 0.22s cubic-bezier(0.25, 1, 0.5, 1) !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] #douyin-right-container {\n  flex: 1 1 auto !important;\n  width: 100% !important;\n  min-width: 0 !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] #dark {\n  min-height: 100vh !important;\n}\n\nhtml[data-xydy-sidebar=\"on\"] .recommend-slidelist {\n  height: 100% !important;\n}\nhtml[data-xydy-sidebar=\"on\"] .recommend-slidelist .fullscreen_capture_feedback {\n  height: 100% !important;\n  padding-bottom: 0 !important;\n}\nhtml[data-xydy-sidebar=\"on\"] .recommend-slidelist .fullscreen_capture_feedback > div {\n  height: 100% !important;\n}\n\n/* Proximity Hover Panels Zen Mode */\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .xgplayer-controls:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .xgplayer-progress:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .xgplayer-video-info-wrap:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .douyin-player-video-info-wrap:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .video-info-detail:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .xgplayer-recommend-tag:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .xgplayer-shop-anchor:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide div[class*=\"immersive-player-switch-on-hide-interaction-area\"]:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .gvcmX2Lf:not(.xydy-proximity-visible),\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .rDq18SJg:not(.xydy-proximity-visible) {\n  opacity: 0 !important;\n  pointer-events: none !important;\n  transition: opacity 0.08s ease, visibility 0.08s ease !important;\n}\n\nhtml[data-xydy-proximity=\"on\"] .dySwiperSlide .xydy-proximity-visible {\n  opacity: 1 !important;\n  pointer-events: auto !important;\n  transition: opacity 0.08s ease, visibility 0.08s ease !important;\n}\n\n/* Video player hover popups: playback speed, volume slider, video quality list, danmaku setting, emoji */\nhtml:root[data-xydy-reveal=\"on\"] #douyin-header {\n  top: 0 !important;\n  opacity: 1 !important;\n  visibility: visible !important;\n  pointer-events: auto !important;\n}\n\nhtml:root[data-xydy-reveal=\"on\"][data-xydy-navigation=\"on\"] #douyin-header :is(.xydy-search-shell, #douyin-header-menuCt) {\n  top: 8px !important;\n}\n\nhtml:root[data-xydy-reveal=\"on\"][data-xydy-sidebar=\"on\"] #douyin-navigation,\nhtml:root[data-xydy-reveal=\"on\"][data-xydy-sidebar=\"on\"] [data-e2e=\"douyin-navigation\"]:not(#douyin-navigation *) {\n  transform: translateX(0) !important;\n  opacity: 1 !important;\n  visibility: visible !important;\n  pointer-events: auto !important;\n}\n\nhtml:root[data-xydy-reveal=\"on\"] body .dySwiperSlide :is(\n  .xgplayer-controls, .xg-inner-controls, .xg-left-grid, .xg-right-grid, .xgplayer-progress,\n  .douyin-player-controls, .douyin-player-controls-inner, .douyin-player-progress,\n  .xgplayer-video-info-wrap, .douyin-player-video-info-wrap, .video-info-detail, .xgplayer-recommend-tag, .xgplayer-shop-anchor,\n  .gvcmX2Lf, .rDq18SJg, [class*=\"immersive-player-switch-on-hide-interaction-area\"]\n) {\n  opacity: 1 !important;\n  visibility: visible !important;\n  pointer-events: auto !important;\n}\n\nhtml:root[data-xydy-reveal=\"on\"] .dySwiperSlide :is(.xgplayer-controls, .xgplayer-progress, .douyin-player-controls, .douyin-player-progress) {\n  display: block !important;\n}\n\nhtml:root[data-xydy-reveal=\"on\"] .dySwiperSlide :is(.xg-inner-controls, .douyin-player-controls-inner) {\n  transform: none !important;\n}\n\nhtml:root[data-xydy-reveal=\"on\"][data-xydy-styles=\"on\"] .dySwiperSlide .xgplayer-controls {\n  transform: translateX(-50%) !important;\n}\n\nhtml:root[data-xydy-reveal=\"on\"][data-xydy-styles=\"on\"] .dySwiperSlide :is(\n  .xgplayer-video-info-wrap, .douyin-player-video-info-wrap, .video-info-detail,\n  .gvcmX2Lf, .rDq18SJg, [class*=\"immersive-player-switch-on-hide-interaction-area\"]\n) {\n  bottom: 76px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-slider,\nhtml[data-xydy-styles=\"on\"] .xgplayer-playclarity-setting .virtual,\nhtml[data-xydy-styles=\"on\"] .xgplayer-controls .xg-options-list,\nhtml[data-xydy-styles=\"on\"] .xg-spot-content,\nhtml[data-xydy-styles=\"on\"] .xgplayer-progress-point,\nhtml[data-xydy-styles=\"on\"] .danmu-setting-box,\nhtml[data-xydy-styles=\"on\"] .danmu-emoji-box {\n  background: rgba(10, 10, 18, 0.68) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.25) !important;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;\n  border-radius: 12px !important;\n}\n\n/* Playback Speed List (Mac-style context menu layout) */\nhtml[data-xydy-styles=\"on\"] .xgplayer-playrates {\n  padding: 6px 4px !important;\n  margin: 0 !important;\n  list-style: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playrates li {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  height: 32px !important;\n  padding: 0 12px !important;\n  margin: 4px 6px !important;\n  border-radius: 6px !important;\n  color: rgba(255, 255, 255, 0.68) !important; /* Muted unselected */\n  font-size: 13px !important;\n  cursor: pointer !important;\n  background: transparent !important;\n  transition: all 0.15s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playrates li:hover {\n  background: rgba(255, 255, 255, 0.12) !important;\n  color: #ffffff !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playrates li.active {\n  background: rgba(255, 255, 255, 0.22) !important;\n  color: #ffffff !important;\n  font-weight: 600 !important;\n}\n\n/* Video Quality Clarity List */\nhtml[data-xydy-styles=\"on\"] .xgplayer-playclarity-setting .virtual {\n  padding: 6px 4px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playclarity-setting .virtual > .item {\n  display: flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  height: 32px !important;\n  padding: 0 12px !important;\n  margin: 4px 6px !important;\n  border-radius: 6px !important;\n  color: rgba(255, 255, 255, 0.68) !important; /* Muted unselected */\n  font-size: 13px !important;\n  cursor: pointer !important;\n  transition: all 0.15s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playclarity-setting .virtual > .item:hover {\n  background: rgba(255, 255, 255, 0.12) !important;\n  color: #ffffff !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playclarity-setting .virtual > :is(.active, .selected) {\n  background: rgba(255, 255, 255, 0.22) !important;\n  color: #ffffff !important;\n  font-weight: 600 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playclarity-setting :is(.login-tooltip-slot, .smart-tooltip-slot) {\n  background: transparent !important;\n  border: none !important;\n  box-shadow: none !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-playclarity-setting :is(.login-tooltip-slot, .smart-tooltip-slot):empty {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] :is(.xgplayer-setting-content, .xgplayer-playratio-wrap, .xg-spot-text, .clarity-wrapper) {\n  background: transparent !important;\n  border: none !important;\n  box-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-controls :is(.xgplayer-playratio-item, .xg-options-list > .option-item) {\n  background: transparent !important;\n  color: rgba(255, 255, 255, 0.75) !important;\n  border-radius: 6px !important;\n  transition: background 0.15s ease, color 0.15s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-controls :is(.xgplayer-playratio-item, .xg-options-list > .option-item):hover {\n  background: rgba(255, 255, 255, 0.12) !important;\n  color: #fff !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xgplayer-controls :is(.xgplayer-playratio-item.select, .xg-options-list > .option-item.selected) {\n  background: rgba(255, 255, 255, 0.2) !important;\n  color: #fff !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xg-spot-content {\n  overflow: hidden !important;\n}\n\n/* Danmaku Settings & Emoticon Panels Text styling */\nhtml[data-xydy-styles=\"on\"] .danmu-setting-box :is(span, p, div, label),\nhtml[data-xydy-styles=\"on\"] .danmu-emoji-box :is(span, p, div) {\n  color: rgba(255, 255, 255, 0.95) !important;\n  text-shadow: none !important;\n}\n\n/* Text Hierarchy inside Danmaku settings (gray subtext) */\nhtml[data-xydy-styles=\"on\"] .danmu-setting-box :is(.desc, .setting-desc, [class*=\"desc\"], [class*=\"value\"], [class*=\"tip\"]) {\n  color: rgba(255, 255, 255, 0.6) !important;\n}\n\n/* Custom tooltips, settings, emoticons, and volume label overrides */\nhtml[data-xydy-styles=\"on\"] :is(.xg-tips, .xgTips, .xgplayer-tips, .xgplayer-tooltip, .semi-tooltip, .semi-tooltip-wrapper, .danmu-switch-box) {\n  background: rgba(10, 10, 18, 0.68) !important;\n  background-image: none !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.3) !important;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;\n  border-radius: 8px !important; /* Consistent 8px roundness */\n  color: #ffffff !important; /* Main tooltip text color: white */\n  text-shadow: none !important;\n}\n\n/* Reset inner content container of Semi Design tooltips to prevent nested borders/boxes */\nhtml[data-xydy-styles=\"on\"] :is(.semi-tooltip-wrapper, .danmu-switch-box) :is(.semi-tooltip-content, .semi-tooltip-inner) {\n  background: transparent !important;\n  background-color: transparent !important;\n  border: none !important;\n  box-shadow: none !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n  padding: 0 !important;\n  border-radius: 0 !important;\n}\n\n/* Ensure all normal elements and spans inside the tooltip remain white */\nhtml[data-xydy-styles=\"on\"] :is(.xg-tips, .xgTips, .xgplayer-tips, .xgplayer-tooltip, .semi-tooltip, .semi-tooltip-wrapper, .danmu-switch-box) :is(p, div, span) {\n  color: #ffffff !important;\n  text-shadow: none !important;\n}\n\n/* ONLY the shortcut keycode text / span should be styled black on a white pill background */\nhtml:root[data-xydy-styles=\"on\"] :is(.xg-tips, .xgTips, .xgplayer-tips, .xgplayer-tooltip, .semi-tooltip, .semi-tooltip-wrapper, .danmu-switch-box) :is(.shortcutKey, [class*=\"shortcutKey\"], [class*=\"shortcut\"], .X6xG2EuS, .ZIbADYYv, kbd) {\n  color: #000000 !important; /* Shortcut key letter color: black */\n  -webkit-text-fill-color: #000000 !important;\n  background-color: #ffffff !important; /* Pill background for contrast */\n  border-radius: 4px !important;\n  padding: 0 4px !important;\n  margin-left: 6px !important;\n  font-weight: bold !important;\n  display: inline-block !important;\n  text-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .semi-tooltip-wrapper {\n  padding: 9px 12px !important;\n  border-radius: 11px !important;\n  font-size: 13px !important;\n  line-height: 20px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .semi-tooltip-wrapper .jalx9Muz {\n  display: flex !important;\n  align-items: center !important;\n  gap: 8px !important;\n}\n\nhtml:root[data-xydy-styles=\"on\"] .semi-tooltip-wrapper .ZIbADYYv {\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  flex: 0 0 auto !important;\n  min-width: 20px !important;\n  height: 20px !important;\n  padding: 0 5px !important;\n  margin-left: 0 !important;\n  box-sizing: border-box !important;\n  line-height: 20px !important;\n  font-size: 12px !important;\n  font-weight: 650 !important;\n  border: 1px solid rgba(255, 255, 255, 0.5) !important;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12) !important;\n}\n\n/* Hide native black triangle arrows for a cleaner aesthetic */\nhtml[data-xydy-styles=\"on\"] :is(.semi-tooltip-wrapper, [class*=\"tooltip\"]) :is(.semi-tooltip-arrow, [class*=\"arrow\"]) {\n  display: none !important;\n}\n\n/* Emoticon popup list background items */\nhtml[data-xydy-styles=\"on\"] .danmu-emoji-box .emoji-item:hover,\nhtml[data-xydy-styles=\"on\"] .danmu-emoji-box [class*=\"emoji\"]:hover {\n  background-color: rgba(255, 255, 255, 0.22) !important;\n}\n\n/* Danmaku setting slider and checkbox background adjustments */\nhtml[data-xydy-styles=\"on\"] .danmu-setting-box :is(.semi-slider, .semi-checkbox, .semi-switch) {\n  background-color: transparent !important;\n}\n\n/* Make volume indicator text background transparent */\nhtml[data-xydy-styles=\"on\"] .xgplayer-value-label {\n  background: transparent !important;\n  background-color: transparent !important;\n  box-shadow: none !important;\n  border: none !important;\n  color: var(--xydy-text-main) !important;\n}\n\n/* --- Floating Frosted Glass Comment Panel Override --- */\n\n/* 1. Prevent the video player container from shrinking or shifting horizontally */\nhtml[data-xydy-styles=\"on\"] .playerContainer,\nhtml[data-xydy-styles=\"on\"] .playerContainer + :not(#chapterVideoSideCard) {\n  width: 100% !important;\n  max-width: 100% !important;\n  flex: 1 1 100% !important;\n  transform: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoSideCard {\n  background: transparent !important;\n  position: absolute !important;\n  left: var(--xydy-chapter-left, 24px) !important;\n  right: auto !important;\n  top: auto !important;\n  bottom: var(--xydy-chapter-bottom, 100px) !important;\n  height: var(--xydy-chapter-height, 480px) !important;\n  max-width: min(420px, calc(100% - 24px)) !important;\n  transform: none !important;\n  z-index: 2002 !important;\n  overflow: hidden !important;\n  border-radius: 16px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard {\n  width: 100% !important;\n  height: 100% !important;\n  box-sizing: border-box !important;\n  background: rgba(10, 10, 18, 0.68) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.14) !important;\n  border-radius: 16px !important;\n  overflow: hidden !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .playerContainer.xydy-chapter-mode ~ #chapterVideoSideCard {\n  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard :is(.WP7MMDl1, .vW0uEvei, .TnOGNqE_, .nUBMGNO_, .nLAfxDzk) {\n  background: transparent !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .WP7MMDl1 {\n  display: flex !important;\n  flex-direction: column !important;\n  height: 100% !important;\n  min-height: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .vW0uEvei {\n  flex: 0 0 auto !important;\n  padding: 12px 16px !important;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .hqpyV2Ae {\n  color: rgba(255, 255, 255, 0.9) !important;\n  font-size: 14px !important;\n  font-weight: 600 !important;\n  letter-spacing: 0.5px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .GMpBYXh8 {\n  width: 28px !important;\n  height: 28px !important;\n  padding: 4px !important;\n  box-sizing: border-box !important;\n  border-radius: 50% !important;\n  opacity: 0.65;\n  cursor: pointer;\n  transition: background 0.16s ease, opacity 0.16s ease;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .GMpBYXh8:hover {\n  background: rgba(255, 255, 255, 0.12) !important;\n  opacity: 1;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .GMpBYXh8 path {\n  fill: rgba(255, 255, 255, 0.9) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .TnOGNqE_ {\n  flex: 1 1 auto !important;\n  min-height: 0 !important;\n  overflow-y: auto !important;\n  overscroll-behavior: contain;\n  padding: 12px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .dc_4S0XF {\n  background: rgba(255, 255, 255, 0.04) !important;\n  border: 1px solid rgba(255, 255, 255, 0.07) !important;\n  border-radius: 12px !important;\n  margin-bottom: 8px !important;\n  padding: 12px !important;\n  transition: background 0.16s ease, border-color 0.16s ease;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .dc_4S0XF:hover {\n  background: rgba(255, 255, 255, 0.1) !important;\n  border-color: rgba(255, 255, 255, 0.18) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .dc_4S0XF.yn7lfBVZ {\n  background: rgba(255, 255, 255, 0.13) !important;\n  border-color: rgba(255, 255, 255, 0.26) !important;\n  box-shadow: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard .n4QS2Hrc {\n  color: rgba(255, 255, 255, 0.55) !important;\n  font-size: 12px !important;\n  font-variant-numeric: tabular-nums;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard ._MafKZXw {\n  color: rgba(255, 255, 255, 0.9) !important;\n  font-size: 14px !important;\n  font-weight: 500 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard ::-webkit-scrollbar {\n  width: 4px;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard ::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.22);\n  border-radius: 999px;\n}\n\nhtml[data-xydy-styles=\"on\"] #chapterVideoCard ::-webkit-scrollbar-track {\n  background: transparent;\n}\n\nhtml[data-xydy-styles=\"on\"][data-xydy-liquid-glass=\"on\"] :is(\n  #xydy-header-actions-background,\n  #xydy-header-search-background,\n  .jQkpodjD > .o6tvYzFd,\n  .xgplayer-shop-anchor > div,\n  .xydy-liquid-surface,\n  .xgplayer-controls,\n  .xgplayer-slider,\n  .xgplayer-playclarity-setting .virtual,\n  .xgplayer-controls .xg-options-list,\n  .xg-spot-content,\n  .xgplayer-progress-point,\n  #douyin-navigation .AVblXapA,\n  [data-e2e=\"douyin-navigation\"] .AVblXapA,\n  #douyin-navigation:not(:has(.AVblXapA)),\n  [data-e2e=\"douyin-navigation\"]:not(#douyin-navigation *):not(:has(.AVblXapA)),\n  #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]),\n  #chapterVideoCard,\n  #im-entry-vmok-popup-portal.JTaHbIgX,\n  .IEv8oDS8.popShadowAnimation,\n  .W6qKIZ6x.popShadowAnimation,\n  .userMenuPanelShadowAnimation,\n  ._o7id7Pe,\n  .semi-dropdown-wrapper,\n  .semi-popover-content,\n  .n4FTI10b,\n  ._KRDPUZX,\n  .hurS2TXT,\n  .danmu-setting-box,\n  .danmu-emoji-box,\n  .MhqtMkwi,\n  .Yq8ahEWU,\n  .lGxh4PDP.Q2nY9qA2.popShadowAnimation,\n  .v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S,\n  .semi-tooltip-wrapper,\n  .xg-tips,\n  .xgTips,\n  .xgplayer-tips,\n  .xgplayer-tooltip,\n  .danmu-switch-box\n) {\n  --xydy-liquid-backdrop: blur(2px) saturate(1.35);\n  background:\n    linear-gradient(135deg, rgba(255, 255, 255, 0.19), rgba(255, 255, 255, 0.025) 38%, rgba(255, 255, 255, 0.07) 78%, rgba(255, 255, 255, 0.14)),\n    rgba(12, 17, 26, 0.2) !important;\n  background-image:\n    linear-gradient(135deg, rgba(255, 255, 255, 0.19), rgba(255, 255, 255, 0.025) 38%, rgba(255, 255, 255, 0.07) 78%, rgba(255, 255, 255, 0.14)) !important;\n  backdrop-filter: var(--xydy-liquid-backdrop) !important;\n  -webkit-backdrop-filter: var(--xydy-liquid-backdrop) !important;\n  border-color: rgba(255, 255, 255, 0.32) !important;\n  box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.55),\n    inset 1px 0 0 rgba(255, 255, 255, 0.16),\n    inset 0 -1px 0 rgba(255, 255, 255, 0.18),\n    0 12px 32px rgba(0, 0, 0, 0.25) !important;\n}\n\n/* 2. Position the comments side card as a floating drawer on the right overlaying the player */\nhtml[data-xydy-styles=\"on\"] .playerContainer[data-xydy-comments-transition=\"on\"] {\n  transition: width .26s cubic-bezier(.22, 1, .36, 1), max-width .26s cubic-bezier(.22, 1, .36, 1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .playerContainer[data-xydy-comments-avoid=\"on\"] {\n  width: calc(100% - var(--xydy-comments-reserved)) !important;\n  max-width: calc(100% - var(--xydy-comments-reserved)) !important;\n  min-width: 0 !important;\n  flex: 0 0 auto !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .playerContainer[data-xydy-comments-resizing=\"true\"] {\n  transition: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .playerContainer[data-xydy-comments-avoid=\"on\"] :is(.slider-video, .basePlayerContainer, .xgplayer, .xg-video-container) {\n  width: 100% !important;\n  max-width: 100% !important;\n  min-width: 0 !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .playerContainer[data-xydy-comments-avoid=\"on\"] :is(video, .focusPanel .dySwiperSlide > div > img.AWIwgv_K) {\n  width: 100% !important;\n  height: 100% !important;\n  max-width: 100% !important;\n  object-fit: contain !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .xydy-comments-pin {\n  position: absolute !important;\n  top: 1px !important;\n  right: 10px !important;\n  display: grid !important;\n  place-items: center !important;\n  width: 26px !important;\n  height: 23px !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  z-index: 1010 !important;\n  border: 0 !important;\n  border-radius: 7px !important;\n  background: transparent !important;\n  color: rgba(255, 255, 255, .58) !important;\n  cursor: pointer !important;\n  transition: color .16s ease, background .16s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .xydy-comments-pin svg {\n  pointer-events: none;\n  transform: rotate(35deg);\n  transition: transform .22s cubic-bezier(.22, 1, .36, 1);\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .xydy-comments-pin:hover {\n  color: white !important;\n  background: rgba(255, 255, 255, .13) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .xydy-comments-pin[aria-pressed=\"true\"] {\n  color: #c4e0ff !important;\n  background: rgba(125, 180, 255, .18) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .xydy-comments-pin[aria-pressed=\"true\"] svg { transform: none; }\nhtml[data-xydy-styles=\"on\"] #videoSideCard .xydy-comments-pin:focus-visible { outline: 2px solid #c4e0ff !important; }\nhtml[data-xydy-styles=\"on\"] #videoSideCard .xydy-comments-dock-resize { display: none; }\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-dock=\"on\"] {\n  box-sizing: border-box !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-dock=\"on\"] > :is(.xydy-drag-handle, .xydy-resize-handle) { display: none !important; }\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-dock=\"on\"] > .xydy-comments-dock-resize {\n  display: block !important;\n  position: absolute !important;\n  left: 0 !important;\n  top: 30px !important;\n  bottom: 12px !important;\n  width: 9px !important;\n  z-index: 1008 !important;\n  touch-action: none;\n  cursor: ew-resize;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-dock=\"on\"] > .xydy-comments-dock-resize::after {\n  content: '';\n  position: absolute;\n  left: 2px;\n  top: calc(50% - 22px);\n  width: 3px;\n  height: 44px;\n  border-radius: 2px;\n  background: rgba(255, 255, 255, .45);\n  opacity: 0;\n  transition: opacity .16s ease;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-dock=\"on\"] > .xydy-comments-dock-resize:is(:hover, :focus-visible)::after { opacity: 1; }\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-dock=\"on\"] .semi-tabs-bar {\n  overflow-x: auto !important;\n  scrollbar-width: none;\n  flex-wrap: nowrap !important;\n  justify-content: flex-start !important;\n  gap: 12px !important;\n  min-width: 0 !important;\n  max-width: calc(100% - 40px) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-dock=\"on\"] .semi-tabs-tab {\n  flex: 0 0 auto !important;\n  margin: 0 !important;\n  font-size: 14px !important;\n  white-space: nowrap !important;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html[data-xydy-styles=\"on\"] .playerContainer[data-xydy-comments-transition=\"on\"] { transition: none !important; }\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-state=\"idle\"] {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) {\n  position: absolute !important;\n  right: 24px !important;\n  top: 76px !important;\n  bottom: 84px !important;\n  width: 420px !important;\n  height: calc(100% - 160px) !important;\n  z-index: 2001 !important;\n  border-radius: 16px !important;\n  background: rgba(10, 10, 18, 0.78) !important;\n  backdrop-filter: blur(30px) saturate(180%) !important;\n  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;\n  border: 1px solid rgba(255, 255, 255, 0.14) !important;\n  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5) !important;\n  overflow: hidden !important;\n  overflow-y: auto !important;\n  overscroll-behavior: contain !important;\n  transition: transform 0.36s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.28s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"])[data-xydy-comments-mounted=\"true\"] {\n  animation: xydy-comments-slide-in 0.36s cubic-bezier(0.25, 1, 0.5, 1) backwards !important;\n}\n\nhtml[data-xydy-styles=\"on\"].xydy-comments-force-hidden #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) {\n  transform: translateX(calc(100% + 56px)) !important;\n  opacity: 0 !important;\n  pointer-events: none !important;\n}\n\n\n\n@keyframes xydy-comments-slide-in {\n  from {\n    transform: translateX(calc(100% + 56px));\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n\n/* Visibility is controlled by Douyin natively — we only handle styling */\n\n/* 图文作品：让内容图片按比例撑满容器高度，消除底部空隙 */\nhtml[data-xydy-styles=\"on\"] [class*=\"imgBackground\"] img {\n  height: 100% !important;\n  width: auto !important;\n  object-fit: contain !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .basePlayerContainer .focusPanel .dySwiperSlide > div > img.AWIwgv_K {\n  height: 100% !important;\n  width: auto !important;\n  max-height: none !important;\n  max-width: none !important;\n  flex: 0 0 auto !important;\n  align-self: center !important;\n  margin: 0 auto !important;\n  object-fit: contain !important;\n}\n\n.xydy-image-sweep {\n  position: fixed;\n  z-index: 2147480000;\n  pointer-events: none;\n  overflow: hidden;\n}\n\n.xydy-image-sweep::after {\n  content: '';\n  position: absolute;\n  left: 0;\n  top: -24%;\n  width: 100%;\n  height: 24%;\n  background: linear-gradient(180deg, transparent 10%, rgba(223, 246, 255, .04) 40%, rgba(255, 255, 255, .2) 56%, rgba(216, 239, 255, .05) 68%, transparent);\n  backdrop-filter: blur(.6px) brightness(1.08);\n  -webkit-backdrop-filter: blur(.6px) brightness(1.08);\n  animation: xydy-image-scan 280ms cubic-bezier(.35, 0, .55, 1) both;\n}\n\n@keyframes xydy-image-scan {\n  from { transform: translateY(0); opacity: 0; }\n  15% { opacity: 1; }\n  85% { opacity: 1; }\n  to { transform: translateY(525%); opacity: 0; }\n}\n\n.xydy-image-float {\n  position: fixed !important;\n  z-index: 2147480001 !important;\n  border: 0 !important;\n  border-radius: 16px;\n  overflow: hidden;\n  background: rgba(20, 24, 32, .3);\n  box-shadow: 0 18px 55px rgba(0, 0, 0, .32), 0 0 0 1px rgba(255, 255, 255, .3);\n  cursor: grab;\n  user-select: none;\n  touch-action: none;\n  isolation: isolate;\n}\n\n.xydy-image-float:active { cursor: grabbing; }\n.xydy-image-float:focus-visible { outline: 2px solid rgba(167, 210, 255, .95); outline-offset: 3px; }\n\n.xydy-image-float > img {\n  display: block !important;\n  width: 100% !important;\n  height: 100% !important;\n  margin: 0 !important;\n  object-fit: contain !important;\n  pointer-events: auto !important;\n  -webkit-user-drag: element;\n}\n\n.xydy-image-float-resolution,\n.xydy-image-float-close,\n.xydy-image-float-toolbar {\n  position: absolute;\n  opacity: 0;\n  transition: opacity 180ms ease;\n  color: white;\n  font: 12px/1.4 sans-serif;\n}\n\n.xydy-image-float[data-ready=\"true\"] :is(.xydy-image-float-resolution, .xydy-image-float-close, .xydy-image-float-toolbar) { opacity: 1; }\n\n.xydy-image-float-resolution { top: 12px; left: 10px; text-shadow: 0 1px 5px rgba(0, 0, 0, .8); pointer-events: none; }\n\n.xydy-image-float-close {\n  top: 7px;\n  right: 7px;\n  width: 25px;\n  height: 25px;\n  padding: 0;\n  border: 1px solid rgba(255, 255, 255, .24);\n  border-radius: 50%;\n  background: rgba(20, 24, 32, .35);\n  backdrop-filter: blur(12px);\n  -webkit-backdrop-filter: blur(12px);\n  font-size: 19px;\n  line-height: 23px;\n  cursor: pointer;\n}\n\n.xydy-image-float-toolbar {\n  display: flex;\n  gap: 4px;\n  left: 7px;\n  right: 7px;\n  bottom: 7px;\n  padding: 4px;\n  border: 1px solid rgba(255, 255, 255, .3);\n  border-radius: 12px;\n  background: rgba(35, 40, 49, .5);\n  backdrop-filter: blur(18px) saturate(1.4);\n  -webkit-backdrop-filter: blur(18px) saturate(1.4);\n}\n\nhtml[data-xydy-liquid-glass=\"on\"] .xydy-image-float-toolbar {\n  background: linear-gradient(135deg, rgba(255, 255, 255, .3), rgba(34, 44, 60, .16));\n  box-shadow: inset 0 1px rgba(255, 255, 255, .5), inset 0 -1px rgba(255, 255, 255, .15);\n  backdrop-filter: blur(8px) saturate(1.6);\n  -webkit-backdrop-filter: blur(8px) saturate(1.6);\n}\n\n.xydy-image-float-toolbar :is(a, button) {\n  flex: 1;\n  min-width: 0;\n  margin: 0;\n  padding: 6px 0;\n  border: 0;\n  border-radius: 8px;\n  background: transparent;\n  color: white;\n  font: inherit;\n  text-align: center;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.xydy-image-float-toolbar :is(a, button):hover { background: rgba(255, 255, 255, .2); }\n.xydy-image-float-toolbar button:disabled { opacity: .6; cursor: progress; }\n\n@media (prefers-reduced-motion: reduce) {\n  .xydy-image-sweep { display: none; }\n  .xydy-image-float * { transition: none !important; }\n}\n\n/* Make inner comment boxes and wrappers transparent so they blend into our frosted background */\n/* NOTE: #videoSideCard itself is NOT included here - its dark frosted background stays intact */\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) div:not(.xydy-drag-handle):not([class*=\"xydy-resize-handle\"]),\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) section,\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) ul,\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) li,\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) form,\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) input:not(.xydy-resize-handle),\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) [class*=\"comment\"],\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) [class*=\"Container\"],\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]):not(.xydy-is-ai-tab) [class*=\"Card\"] {\n  background: transparent !important;\n  background-color: transparent !important;\n  box-shadow: none !important;\n  border-color: rgba(255, 255, 255, 0.12) !important;\n}\n\nhtml:root[data-xydy-styles=\"on\"] #videoSideCard:is(.xydy-is-ai-tab, :has(iframe[src*=\"/search_ai_mobile/\"]), :has(#semiTabai_card[aria-selected=\"true\"])) {\n  isolation: isolate;\n  background: transparent !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is(.xydy-is-ai-tab, :has(iframe[src*=\"/search_ai_mobile/\"]), :has(#semiTabai_card[aria-selected=\"true\"]))::before {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  z-index: -1;\n  pointer-events: none;\n  border-radius: inherit;\n  background: rgba(10, 10, 18, 0.78);\n  backdrop-filter: blur(30px) saturate(180%);\n  -webkit-backdrop-filter: blur(30px) saturate(180%);\n}\n\nhtml[data-xydy-styles=\"on\"][data-xydy-liquid-glass=\"on\"] #videoSideCard:is(.xydy-is-ai-tab, :has(iframe[src*=\"/search_ai_mobile/\"]), :has(#semiTabai_card[aria-selected=\"true\"]))::before {\n  background: linear-gradient(135deg, rgba(255, 255, 255, 0.19), rgba(255, 255, 255, 0.025) 38%, rgba(255, 255, 255, 0.07) 78%, rgba(255, 255, 255, 0.14)), rgba(12, 17, 26, 0.2);\n  backdrop-filter: var(--xydy-liquid-backdrop);\n  -webkit-backdrop-filter: var(--xydy-liquid-backdrop);\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-mounted=\"true\"] .comment-input-container {\n  background: transparent !important;\n  background-image: none !important;\n  border: none !important;\n  box-shadow: none !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .comment-input-linear-bg {\n  display: none !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-mounted=\"true\"] .comment-input-container .comment-input-inner-container {\n  min-height: 44px !important;\n  box-sizing: border-box !important;\n  padding: 10px 12px !important;\n  background: rgba(255, 255, 255, 0.055) !important;\n  background-image: none !important;\n  border: 1px solid rgba(255, 255, 255, 0.14) !important;\n  border-radius: 16px !important;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n  transition: background 180ms ease, border-color 180ms ease, box-shadow 180ms ease;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard[data-xydy-comments-mounted=\"true\"] .comment-input-container .comment-input-inner-container:focus-within {\n  background-color: rgba(255, 255, 255, 0.085) !important;\n  border-color: rgba(255, 255, 255, 0.28) !important;\n}\n\nhtml[data-xydy-styles=\"on\"][data-xydy-liquid-glass=\"on\"] #videoSideCard[data-xydy-comments-mounted=\"true\"] .comment-input-container .comment-input-inner-container {\n  background: linear-gradient(125deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.025) 55%, rgba(255, 255, 255, 0.07)), rgba(10, 14, 22, 0.08) !important;\n  border-color: rgba(255, 255, 255, 0.28) !important;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.07) !important;\n}\n\nhtml[data-xydy-styles=\"on\"][data-xydy-liquid-glass=\"on\"] #videoSideCard[data-xydy-comments-mounted=\"true\"] .comment-input-container .comment-input-inner-container:focus-within {\n  border-color: rgba(255, 255, 255, 0.45) !important;\n  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.045) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .comment-input-container :is(.RXtfhfhu, .public-DraftEditorPlaceholder-root) {\n  color: rgba(255, 255, 255, 0.5) !important;\n  font-size: 14px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .comment-input-container .public-DraftEditor-content {\n  color: rgba(255, 255, 255, 0.92) !important;\n  caret-color: rgba(255, 255, 255, 0.95) !important;\n  font-size: 14px !important;\n  line-height: 1.6 !important;\n  max-height: 160px;\n  overflow-y: auto;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .commentInput-right-ct .oWdMk9B9 > span {\n  border-radius: 8px;\n  cursor: pointer;\n  transition: background 150ms ease;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .commentInput-right-ct .oWdMk9B9 > span:hover {\n  background: rgba(255, 255, 255, 0.1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .commentInput-right-ct svg {\n  width: 28px !important;\n  height: 28px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard .commentInput-right-ct svg path[fill=\"#2F3035\"] {\n  fill: rgba(255, 255, 255, 0.72) !important;\n  fill-opacity: 1 !important;\n}\n\n/* Custom scrollbars inside the floating comments drawer */\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) ::-webkit-scrollbar {\n  width: 4px !important;\n  height: 4px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) ::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.22) !important;\n  border-radius: 999px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) ::-webkit-scrollbar-track {\n  background: transparent !important;\n}\n\n/* Remove messy tab bottom border fragments inside the comments panel */\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) :is(.semi-tabs-tab, .semi-tabs-bar, [class*=\"semi-tabs\"]) {\n  border-bottom: none !important;\n  border-color: transparent !important;\n}\n\n/* --- Interactive Drag & Resize Extensions --- */\n\n/* Add spacing at the top of the card for the drag handle bar */\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) {\n  padding-top: 0 !important;\n}\n\n/* Draggable handle bar at the top center (iOS style) */\nhtml[data-xydy-styles=\"on\"] .xydy-drag-handle {\n  position: absolute !important;\n  top: 9px !important;\n  left: 50% !important;\n  transform: translateX(-50%) !important;\n  width: 36px !important;\n  height: 4px !important;\n  border-radius: 2px !important;\n  background: rgba(229, 231, 235, 0.85) !important; /* Solid gray-white filled pill */\n  border: 1px solid rgba(0, 0, 0, 0.15) !important;\n  cursor: grab !important;\n  z-index: 1005 !important;\n  transition: background 0.18s ease, width 0.18s ease !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xydy-drag-handle::before {\n  content: \"\" !important;\n  position: absolute !important;\n  left: 50% !important;\n  top: 50% !important;\n  width: 96px !important;\n  height: 34px !important;\n  transform: translate(-50%, -50%) !important;\n  background: transparent !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xydy-drag-handle:hover {\n  background: rgba(243, 244, 246, 0.95) !important;\n  width: 50px !important;\n}\n\nhtml[data-xydy-styles=\"on\"] .xydy-drag-handle:active {\n  cursor: grabbing !important;\n  background: #ffffff !important;\n}\n\n/* Invisible but hoverable 8-directional resize handles */\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle {\n  position: absolute !important;\n  z-index: 1004 !important;\n  background: transparent !important;\n}\n\n/* Edge handles */\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle-n {\n  top: 0 !important; left: 8px !important; right: 8px !important; height: 6px !important; cursor: n-resize !important;\n}\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle-s {\n  bottom: 0 !important; left: 8px !important; right: 8px !important; height: 6px !important; cursor: s-resize !important;\n}\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle-e {\n  right: 0 !important; top: 8px !important; bottom: 8px !important; width: 6px !important; cursor: e-resize !important;\n}\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle-w {\n  left: 0 !important; top: 8px !important; bottom: 8px !important; width: 6px !important; cursor: w-resize !important;\n}\n\n/* Corner handles */\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle-nw {\n  top: 0 !important; left: 0 !important; width: 12px !important; height: 12px !important; cursor: nw-resize !important; z-index: 1005 !important;\n}\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle-ne {\n  top: 0 !important; right: 0 !important; width: 12px !important; height: 12px !important; cursor: ne-resize !important; z-index: 1005 !important;\n}\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle-sw {\n  bottom: 0 !important; left: 0 !important; width: 12px !important; height: 12px !important; cursor: sw-resize !important; z-index: 1005 !important;\n}\nhtml[data-xydy-styles=\"on\"] .xydy-resize-handle-se {\n  bottom: 0 !important; right: 0 !important; width: 12px !important; height: 12px !important; cursor: se-resize !important; z-index: 1005 !important;\n}\n\n/* Style the comment badges (like \"作者\", \"作者回复过\") as frosted glass badges */\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) :is(.comment-item-tag, .semi-tag) {\n  background: rgba(255, 255, 255, 0.15) !important;\n  color: rgba(255, 255, 255, 0.9) !important;\n  border-radius: 4px !important;\n  padding: 2px 6px !important;\n  font-size: 11px !important;\n  font-weight: 500 !important;\n  border: 1px solid rgba(255, 255, 255, 0.18) !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;\n}\n\nhtml[data-xydy-styles=\"on\"] #videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"]) :is(.comment-item-tag-text, .semi-tag-content, .text-no-shadow) {\n  color: rgba(255, 255, 255, 0.88) !important;\n}\n\n#xydy-settings-dialog {\n  all: initial;\n  position: fixed;\n  inset: 0;\n  margin: 0;\n  width: 100vw;\n  height: 100dvh;\n  max-width: none;\n  max-height: none;\n  box-sizing: border-box;\n  border: 0;\n  background: transparent;\n  color: #fff;\n  font: 14px/1.5 \"Segoe UI\", \"Microsoft YaHei\", sans-serif;\n  overflow: hidden;\n  isolation: isolate;\n  opacity: 0;\n  transition: opacity 0.2s ease;\n  color-scheme: dark;\n}\n#xydy-settings-dialog:not([open]) { display: none; }\n#xydy-settings-dialog[open] { display: flex; justify-content: center; }\n#xydy-settings-dialog.xydy-settings-visible { opacity: 1; }\n#xydy-settings-dialog::backdrop { background: transparent; }\n#xydy-settings-dialog .xydy-settings-background {\n  position: absolute;\n  inset: 0;\n  z-index: -1;\n  pointer-events: none;\n  background: linear-gradient(135deg, rgba(26,35,48,0.48), rgba(9,16,26,0.68));\n  backdrop-filter: blur(30px) saturate(1.25);\n  -webkit-backdrop-filter: blur(30px) saturate(1.25);\n}\nhtml:root[data-xydy-styles=\"on\"][data-xydy-liquid-glass=\"on\"] #xydy-settings-dialog[data-material=\"liquid\"] .xydy-settings-background {\n  background: linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.015) 40%, rgba(255,255,255,0.04)), rgba(8,16,27,0.5) !important;\n  backdrop-filter: var(--xydy-liquid-backdrop, blur(2px) saturate(1.35)) !important;\n  -webkit-backdrop-filter: var(--xydy-liquid-backdrop, blur(2px) saturate(1.35)) !important;\n  box-shadow: none !important;\n}\n#xydy-settings-dialog * { box-sizing: border-box; }\n#xydy-settings-dialog [hidden] { display: none !important; }\n#xydy-settings-dialog .xydy-settings-shell { display: flex; flex-direction: column; width: min(980px, calc(100% - 48px)); padding: 44px 0 28px; min-height: 0; transform: translateX(24px); transition: transform 0.26s cubic-bezier(0.2,0.8,0.2,1); }\n#xydy-settings-dialog.xydy-settings-visible .xydy-settings-shell { transform: none; }\n#xydy-settings-dialog :is(h2, h3, p) { margin: 0; color: inherit; }\n#xydy-settings-dialog h2 { font-size: 28px; font-weight: 700; line-height: 1.2; text-shadow: 0 8px 24px rgba(15,23,42,0.2); }\n#xydy-settings-dialog h3 { font-size: 11px; line-height: 1.2; font-weight: 500; color: rgba(255,255,255,0.52); letter-spacing: 0.16em; margin: 4px 0 12px; }\n#xydy-settings-dialog .xydy-settings-subheading { margin-top: 30px; }\n#xydy-settings-dialog .xydy-settings-hint { margin: -8px 0 16px; color: rgba(255,255,255,0.64); font-size: 13px; line-height: 1.6; }\n#xydy-settings-dialog .xydy-settings-colors { display: flex; flex-wrap: wrap; gap: 12px; }\n#xydy-settings-dialog [data-theme-color] { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; }\n#xydy-settings-dialog [data-theme-color] > span { display: inline-grid; place-items: center; width: 23px; height: 23px; flex-shrink: 0; border-radius: 50%; background: var(--xydy-swatch); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22); }\n#xydy-settings-dialog [data-theme-color].is-active { border-color: var(--xydy-swatch); background: rgba(255,255,255,0.14); box-shadow: 0 0 0 1px var(--xydy-swatch); color: #fff; }\n#xydy-settings-dialog [data-theme-color].is-active > span::after { content: \"✓\"; color: #fff; font-size: 14px; font-weight: 700; }\n#xydy-settings-dialog .xydy-settings-eyebrow { display: block; font-size: 11px; color: rgba(255,255,255,0.56); letter-spacing: 1px; margin-bottom: 8px; }\n#xydy-settings-dialog .xydy-settings-header { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; margin-bottom: 28px; }\n#xydy-settings-dialog button { appearance: none; font: inherit; font-size: 13px; color: rgba(255,255,255,0.88); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 999px; padding: 10px 16px; cursor: pointer; transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease; }\n#xydy-settings-dialog button:hover { background: rgba(255,255,255,0.16); color: #fff; }\n#xydy-settings-dialog button:focus-visible { outline: 2px solid rgba(255,255,255,0.8); outline-offset: 4px; }\n#xydy-settings-dialog .xydy-settings-close { font-size: 27px; line-height: 36px; width: 40px; height: 40px; padding: 0; }\n#xydy-settings-dialog .xydy-settings-tabs { display: flex; flex-wrap: wrap; gap: 26px; width: min(900px,100%); align-self: center; margin-bottom: 24px; flex-shrink: 0; }\n#xydy-settings-dialog [data-tab] { position: relative; padding: 0 0 12px; border: 0; border-radius: 0; background: transparent; color: rgba(255,255,255,0.62); font-size: 16px; font-weight: 600; line-height: 1.1; }\n#xydy-settings-dialog [data-tab]::after { content: \"\"; position: absolute; left: 0; bottom: 0; width: 100%; height: 3px; border-radius: 999px; background: rgba(255,255,255,0.92); box-shadow: 0 0 12px rgba(255,255,255,0.42); opacity: 0; transform: scaleX(0.45); transform-origin: left center; transition: opacity 0.18s ease, transform 0.22s ease; }\n#xydy-settings-dialog [data-tab]:hover { color: rgba(255,255,255,0.9); transform: translateY(-1px); background: transparent; }\n#xydy-settings-dialog [data-tab].is-active { color: rgba(255,255,255,0.98); }\n#xydy-settings-dialog [data-tab].is-active::after { opacity: 1; transform: scaleX(1); }\n#xydy-settings-dialog .xydy-settings-body { width: min(900px,100%); align-self: center; overflow-y: auto; overscroll-behavior: contain; min-height: 0; flex: 1; padding: 0 12px 24px 0; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.24) transparent; }\n#xydy-settings-dialog [data-view]:not([hidden]) { animation: xydy-settings-panel-in 0.22s ease both; }\n#xydy-settings-dialog .xydy-settings-row { display: flex; gap: 24px; align-items: center; justify-content: space-between; min-height: 74px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.14); }\n#xydy-settings-dialog strong { display: block; font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.96); }\n#xydy-settings-dialog small { display: block; font-size: 12px; color: rgba(255,255,255,0.62); line-height: 1.5; margin-top: 5px; }\n#xydy-settings-dialog .xydy-settings-segment { display: inline-flex; gap: 6px; padding: 6px; border-radius: 999px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); flex-shrink: 0; }\nhtml:root[data-xydy-styles=\"on\"][data-xydy-liquid-glass=\"on\"] #xydy-settings-dialog[data-material=\"liquid\"] .xydy-settings-segment {\n  background: linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.025) 45%, rgba(255,255,255,0.1)) !important;\n  backdrop-filter: var(--xydy-liquid-backdrop, blur(2px) saturate(1.35)) !important;\n  -webkit-backdrop-filter: var(--xydy-liquid-backdrop, blur(2px) saturate(1.35)) !important;\n}\n#xydy-settings-dialog .xydy-settings-segment button { min-width: 66px; padding: 8px 14px; border: 0; background: transparent; color: rgba(255,255,255,0.72); }\n#xydy-settings-dialog .xydy-settings-segment button:hover { color: rgba(255,255,255,0.92); transform: translateY(-1px); }\n#xydy-settings-dialog .xydy-settings-segment button.is-active { background: rgba(255,255,255,0.18); color: #fff; }\n#xydy-settings-dialog .xydy-settings-section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }\n#xydy-settings-dialog .xydy-settings-section-title h3 { margin: 0; }\n#xydy-settings-dialog .xydy-settings-lists { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }\n#xydy-settings-dialog .xydy-settings-lists label { min-width: 0; font-size: 15px; font-weight: 600; }\n#xydy-settings-dialog textarea { display: block; width: 100%; min-height: 190px; max-height: 40vh; resize: vertical; border: 1px solid rgba(255,255,255,0.18); border-radius: 16px; background: rgba(255,255,255,0.07); color: #fff; font: inherit; font-size: 13px; line-height: 1.6; padding: 14px 16px; margin-top: 14px; outline: none; }\n#xydy-settings-dialog textarea:focus { border-color: rgba(255,255,255,0.6); }\n#xydy-settings-dialog textarea::placeholder { color: rgba(255,255,255,0.42); }\n#xydy-settings-dialog .xydy-settings-shortcuts > div { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 64px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.84); }\n#xydy-settings-dialog kbd { font: 14px \"Segoe UI\", sans-serif; font-weight: 600; color: #fff; flex-shrink: 0; }\n#xydy-settings-dialog .xydy-settings-footer { width: min(900px,100%); align-self: center; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 18px; flex-shrink: 0; }\n#xydy-settings-dialog [data-status] { color: rgba(255,255,255,0.56); font-size: 12px; }\n#xydy-settings-dialog [data-error=\"true\"] { color: #ffb7bf; }\n@keyframes xydy-settings-panel-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }\n@media (max-width: 600px) {\n  #xydy-settings-dialog .xydy-settings-shell { width: calc(100% - 32px); padding-top: 24px; padding-bottom: 20px; }\n  #xydy-settings-dialog .xydy-settings-tabs { gap: 20px; }\n  #xydy-settings-dialog .xydy-settings-row { gap: 16px; }\n  #xydy-settings-dialog .xydy-settings-segment button { min-width: 48px; padding: 8px 10px; }\n  #xydy-settings-dialog .xydy-settings-lists { grid-template-columns: 1fr; }\n}\n@media (prefers-reduced-motion: reduce) {\n  #xydy-settings-dialog, #xydy-settings-dialog *, #xydy-settings-dialog *::after { transition: none !important; animation: none !important; }\n}";function install(){var n=document.head||document.documentElement;if(!n){requestAnimationFrame(install);return;}var first=document.createElement('style');first.type='text/css';first.textContent=t;n.appendChild(first);var second=document.createElement('style');second.id='xydy-userscript-css';second.textContent=t;n.appendChild(second);}install();})();

/* ===== src/shared/constants.js ===== */
(function bootstrapConstants(global) {
  const app = global.XYDYExtension = global.XYDYExtension || {};

  const DEFAULT_SETTINGS = {
    features: {
      sidebar: true,
      styles: true,
      liquidGlass: false,
      navigation: true,
      live: true,
      hideElements: true,
      ads: true,
      mouse: true,
      imageFloat: true,
      loading: true,
      proximity: true,
      performance: false
    },
    appearance: {
      themeColor: "original"
    },
    sidebar: {
      hideRequested: false,
      locked: false,
      hoverDelay: 240,
      hoverWidth: 18
    },
    headerEntries: {
      hideAll: false,
      search: true,
      notifications: true,
      messages: true,
      profile: true,
      recharge: false,
      client: false,
      wallpaper: false,
      upload: false,
      cast: false,
      more: false
    },
    live: {
      debounceDelay: 3000,
      pollMs: 1000
    },
    hideElements: {
      textsToHide: ["充值钻石", "客户端", "壁纸", "投屏", "更多", "投稿"]
    },
    ads: {
      blockedKeywords: ["影视", "电影", "电视剧", "观影", "好剧", "狂飙"],
      blockedAuthors: ["@王者荣耀"],
      debounceDelay: 3000,
      stableTries: 6,
      stableGap: 80
    },
    mouse: {
      swipeThreshold: 200,
      clickMaxMove: 5,
      clickMaxTime: 300,
      longPressTime: 500
    },
    ui: {
      quickHelpAutoHideMs: 4200,
      blockNoticeMs: 2200,
      loadingMinMs: 250,
      loadingMaxMs: 12000
    }
  };

  const FEATURE_META = [
    {
      key: "sidebar",
      label: "侧边栏自动隐藏",
      description: "控制左侧导航栏隐藏、悬停回弹和 Alt+1 锁定。"
    },
    {
      key: "styles",
      label: "界面样式美化",
      description: "玻璃态 UI、播放器控制栏和页面细节样式优化。"
    },
    {
      key: "liquidGlass",
      label: "液态玻璃效果",
      description: "开启边缘折射、轻微色散和流光高光；关闭恢复磨砂效果，需开启界面样式美化。"
    },
    {
      key: "navigation",
      label: "顶部导航自动收起",
      description: "鼠标靠近顶部才显示头部导航，离开后自动收起。"
    },
    {
      key: "proximity",
      label: "隐藏视频面板",
      description: "控制栏、信息栏（含推荐状态）和右侧组件在鼠标靠近时原地显示，离开后隐藏。"
    },
    {
      key: "live",
      label: "直播卡片跳过",
      description: "检测当前直播卡片，静默选择“不想看直播”；菜单不可用时自动下翻。"
    },
    {
      key: "hideElements",
      label: "杂项入口隐藏",
      description: "隐藏页面中的干扰入口；顶栏入口可在视觉效果中单独设置。"
    },
    {
      key: "ads",
      label: "关键词与作者过滤",
      description: "命中作者或关键词后自动跳过当前视频。"
    },
    {
      key: "mouse",
      label: "鼠标手势增强",
      description: "左滑点赞、右滑跳过、中键 X、长按 D。"
    },
    {
      key: "imageFloat",
      label: "长按提取图文图片",
      description: "长按图文图片生成悬浮小图，松开后可拖出网页，也可点击保存源图。"
    },
    {
      key: "loading",
      label: "启动遮罩",
      description: "页面刚进入时显示轻量加载遮罩，减少抖动观感。"
    },
    {
      key: "performance",
      label: "调试日志",
      description: "在控制台输出模块启动和运行状态，方便排查。"
    }
  ];

  const THEME_COLORS = [
    { id: "original", label: "原生粉", color: "#fe2c55" },
    { id: "blue", label: "晴空蓝", color: "#4b83f5" },
    { id: "violet", label: "鸢尾紫", color: "#9872f5" },
    { id: "teal", label: "薄荷青", color: "#18a995" },
    { id: "amber", label: "琥珀金", color: "#d99624" },
    { id: "rose", label: "蔷薇粉", color: "#e45c97" }
  ];

  const HEADER_ENTRY_META = [
    { key: "search", label: "搜索", description: "顶栏居中的搜索胶囊。" },
    { key: "notifications", label: "通知", description: "点赞、评论和提及等互动通知。", selector: "headerEntryNotifications", texts: ["通知"] },
    { key: "messages", label: "消息", description: "私信和好友聊天入口。", selector: "messageTrigger", texts: ["消息"] },
    { key: "profile", label: "头像与账号菜单", description: "自己的头像、登录入口和账号菜单。", selector: "headerEntryProfile", texts: ["登录", "登录/注册"] },
    { key: "recharge", label: "充值", description: "充钻石、抖币等充值入口。", texts: ["充钻石", "充值钻石", "充抖币", "充值"] },
    { key: "client", label: "客户端", description: "下载抖音电脑客户端入口。", texts: ["客户端", "下载客户端"] },
    { key: "wallpaper", label: "壁纸", description: "抖音壁纸入口。", texts: ["壁纸"] },
    { key: "upload", label: "投稿", description: "投稿和创作入口。", texts: ["投稿", "创作中心", "创作者中心"] },
    { key: "cast", label: "投屏", description: "页面提供投屏入口时显示。", texts: ["投屏"] },
    { key: "more", label: "更多", description: "顶栏的更多入口。", texts: ["更多"] }
  ];

  const SHORTCUTS = [
    {
      key: "Alt + H",
      description: "显示全部界面组件，再按一次恢复自动隐藏。"
    },
    {
      key: "Alt + X",
      description: "打开或关闭设置面板。"
    },
    {
      key: "Alt + 1",
      description: "切换侧边栏锁定隐藏状态。"
    },
    {
      key: "Alt + F",
      description: "静默触发“不感兴趣 / 不想看直播”。"
    },
    {
      key: "鼠标左滑",
      description: "点赞当前视频。"
    },
    {
      key: "鼠标右滑",
      description: "跳过当前视频。"
    },
    {
      key: "鼠标中键",
      description: "触发 X 快捷键。"
    },
    {
      key: "鼠标左键长按",
      description: "图文图片生成悬浮小图；普通视频持续按下 D，松开时释放。"
    }
  ];

  const STORAGE = {
    commentsDockKey: "xydy_comments_dock",
    area: "local",
    key: "xydy_extension_settings",
    legacyFeaturePrefix: "xyDYTools_feature_",
    legacyAdsKeywordsKey: "xyDYTools_ads_keywords",
    legacyAdsAuthorsKey: "xyDYTools_ads_blockedAuthors",
    legacySidebarHideKey: "hide_sidebar",
    legacySidebarLockKey: "hide_sidebar_lock"
  };

  const UI_IDS = {
    toastHost: "xydy-toast-host",
    loadingOverlay: "xydy-loading-overlay",
    quickHelp: "xydy-quick-help",
    messageOrb: "xydy-message-orb",
    headerActionsBackground: "xydy-header-actions-background",
    headerSearchBackground: "xydy-header-search-background"
  };

  const SELECTORS = {
    commentsPanel: ["#videoSideCard"],
    contextMenuSurface: [".jQkpodjD > .o6tvYzFd"],
    contextMenuRows: [":scope > .wb906g24", ":scope > a.kb8pfrOo"],
    contextMenuLabel: [".Gq1zvxbB"],
    contextMenuShortcut: [".ccZxuS3y"],
    galleryImage: [".basePlayerContainer .focusPanel .dySwiperSlide > div > img.AWIwgv_K"],
    galleryImagePressSurface: [".basePlayerContainer .focusPanel .dySwiperSlide > button.puwYnuKX"],
    galleryImageExcluded: ["#xydy-settings-dialog", "#videoSideCard", "#chapterVideoCard", "#chapterVideoSideCard", ".xgplayer-controls", ".xgplayer-progress", ".douyin-player-controls", ".douyin-player-progress", "#douyin-header", "button", "a[href]", "input", "textarea", "select", "[role=button]", "[contenteditable=true]", "[data-e2e^=video-player-]", "[data-e2e=feed-comment-icon]"],
    /*
     * 这一组是 JS 会主动 query 的 DOM 选择器。
     * 抖音一旦改了 DOM class 或 data-e2e，优先从这里改。
      */
    sidebar: ["#douyin-navigation", "[data-e2e=\"douyin-navigation\"]"],
    header: ["#douyin-header"],
    headerMenu: ["#douyin-header-menuCt"],
    headerMenuList: [".GLoxxgrP", "pace-island > div"],
    headerEntryLabel: [".phl13lpd", ".Q00TJtfx"],
    headerEntryNotifications: [".TftbcKo9"],
    headerEntryProfile: ["a[href*='/user/self']", ".RXVWNc2v"],
    headerSearchInput: ["[data-e2e=\"searchbar-input\"]"],
    headerSearchShell: [".GjgTnTzB"],
    headerSearchForm: [".GySDQyGR"],
    headerSearchButton: ["[data-e2e=\"searchbar-button\"]"],
    headerSearchPopup: [".MhqtMkwi", ".Yq8ahEWU"],
    liveIndicators: [
      ".live-indicator",
      "[data-e2e=\"live-indicator\"]",
      "[class*=\"live-indicator\"]",
      "[class*=\"live-label\"]",
      "[class*=\"live-badge\"]",
      "[data-e2e*=\"live-indicator\"]",
      "[data-e2e*=\"live-badge\"]",
      "[data-e2e*=\"live-tag\"]",
      "[data-e2e*=\"live-status\"]",
      "[class*=\"live-status\"]",
      "[class*=\"live-tag\"]",
      "[aria-label*=\"直播\"]",
      "[title*=\"直播\"]"
    ],
    videoDescription: ["[data-e2e=\"video-desc\"]"],
    authorNickname: ["[data-e2e=\"feed-video-nickname\"]"],
    authorAvatar: ["[data-e2e=\"video-avatar\"]"],
    sideCardContent: ["#relatedVideoCard"],
    playerContainer: [".playerContainer"],
    videoSlide: [".dySwiperSlide"],
    chapterPanel: ["#chapterVideoSideCard", "#chapterVideoCard"],
    chapterClose: ["#chapterVideoCard .GMpBYXh8"],
    chapterAnchor: ["[data-e2e=\"chapter-container\"]", ".chapterContainer"],
    playerShopAnchor: [".xgplayer-shop-anchor"],
    messagePanel: ["#im-entry-vmok-popup-portal.JTaHbIgX"],
    messageHost: [".JOMNV4X6"],
    messageTrigger: ["[data-e2e=\"im-entry\"]"],
    liquidGlassSurfaces: [
      "#xydy-header-actions-background",
      "#xydy-header-search-background",
      ".jQkpodjD > .o6tvYzFd",
      ".xgplayer-shop-anchor > div",
      "#xydy-settings-dialog[data-material=\"liquid\"] .xydy-settings-background",
      "#xydy-settings-dialog[data-material=\"liquid\"] .xydy-settings-segment",
      ".xgplayer-controls", ".xgplayer-slider", ".xgplayer-playclarity-setting .virtual",
        ".xgplayer-controls .xg-options-list", ".xg-spot-content", ".xgplayer-progress-point",
        "#douyin-navigation .AVblXapA",
      "[data-e2e=\"douyin-navigation\"] .AVblXapA", "#douyin-navigation:not(:has(.AVblXapA))",
      "[data-e2e=\"douyin-navigation\"]:not(#douyin-navigation *):not(:has(.AVblXapA))",
      "#videoSideCard:is([data-xydy-comments-state=\"loading\"], [data-xydy-comments-state=\"ready\"])", "#chapterVideoCard",
      "#im-entry-vmok-popup-portal.JTaHbIgX", ".IEv8oDS8.popShadowAnimation", ".W6qKIZ6x.popShadowAnimation",
      ".userMenuPanelShadowAnimation", "._o7id7Pe", ".semi-dropdown-wrapper",
      ".semi-popover-content", ".n4FTI10b", "._KRDPUZX", ".hurS2TXT",
      ".danmu-setting-box", ".danmu-emoji-box", ".MhqtMkwi", ".Yq8ahEWU",
      ".lGxh4PDP.Q2nY9qA2.popShadowAnimation", ".v3wRIyhF.qoOxjH5x.UaYGQUZd.NqzE824S",
      ".semi-tooltip-wrapper", ".xg-tips", ".xgTips", ".xgplayer-tips", ".xgplayer-tooltip", ".danmu-switch-box"
    ],
    hideCandidates: [".jenVD1aU", ".iQdAxsPk", ".xgplayer-playswitch", ".rechargeMountEl"],
    hideCandidateParent: [".Xu0nlrYh", "div"],
    wallpaperCandidates: [".xFzvM6nY", ".iQdAxsPk"],
    silentMenuItems: ["#EGfMOP99 [id=\"UizNwYcn\"]", "#euinefEt .iIX2tp2J", ".JyNO_DD4", ".jQkpodjD .Gq1zvxbB"],
    silentMenuMask: ["#EGfMOP99", "#euinefEt", "div[id=\"qgmiQqfW\"]", ".jQkpodjD"],
    liveSlides: [".dySwiperSlide"],
    video: ["video"],
    danmakuContainer: ["[data-e2e=danmaku-container]", ".danmakuContainer"],
    danmakuInput: [".danmakuInputContainer"],
    danmakuEditor: ["input", "textarea", "[contenteditable=true]"],
    proximityControls: [".xgplayer-controls", ".xgplayer-progress"],
    proximityInfo: [".xgplayer-video-info-wrap", ".douyin-player-video-info-wrap", ".video-info-detail"],
    proximityRight: ["div[class*=\"immersive-player-switch-on-hide-interaction-area\"]", ".gvcmX2Lf", ".rDq18SJg"]
  };

  const SILENT_MENU_LABELS = {
    dislike: "不感兴趣",
    noLive: "不想看直播"
  };

  app.constants = {
    APP_NAME: "xyDouYinTools",
    APP_VERSION: "1.0.0",
    DEFAULT_SETTINGS,
    FEATURE_META,
    THEME_COLORS,
    HEADER_ENTRY_META,
    SHORTCUTS,
    STORAGE,
    UI_IDS,
    SELECTORS,
    SILENT_MENU_LABELS
  };
})(globalThis);

/* ===== src/shared/utils.js ===== */
(function bootstrapUtils(global) {
  const app = global.XYDYExtension = global.XYDYExtension || {};
  const constants = app.constants;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeDeep(base, patch) {
    if (Array.isArray(base)) {
      return Array.isArray(patch) ? patch.slice() : base.slice();
    }

    if (!base || typeof base !== "object") {
      return patch === undefined ? base : patch;
    }

    const output = {};
    const keys = new Set(Object.keys(base).concat(Object.keys(patch || {})));
    keys.forEach((key) => {
      const baseValue = base[key];
      const patchValue = patch ? patch[key] : undefined;

      if (patchValue === undefined) {
        output[key] = Array.isArray(baseValue) ? baseValue.slice() : (baseValue && typeof baseValue === "object" ? mergeDeep(baseValue, {}) : baseValue);
        return;
      }

      if (Array.isArray(baseValue)) {
        output[key] = Array.isArray(patchValue) ? patchValue.slice() : baseValue.slice();
        return;
      }

      if (baseValue && typeof baseValue === "object" && patchValue && typeof patchValue === "object" && !Array.isArray(patchValue)) {
        output[key] = mergeDeep(baseValue, patchValue);
        return;
      }

      output[key] = patchValue;
    });

    return output;
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function queryFirst(selectors, root) {
    const scope = root || document;
    const list = Array.isArray(selectors) ? selectors : [selectors];

    for (const selector of list) {
      const hit = scope.querySelector(selector);
      if (hit) {
        return hit;
      }
    }

    return null;
  }

  function queryAll(selectors, root) {
    const scope = root || document;
    const list = Array.isArray(selectors) ? selectors : [selectors];
    const seen = new Set();
    const hits = [];

    list.forEach((selector) => {
      scope.querySelectorAll(selector).forEach((node) => {
        if (!seen.has(node)) {
          seen.add(node);
          hits.push(node);
        }
      });
    });

    return hits;
  }

  function isVisible(element) {
    if (!element) {
      return false;
    }

    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.width < 5 || rect.height < 5) {
      return false;
    }

    return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
  }

  function pickBestVisible(selectors) {
    const elements = queryAll(selectors);
    let best = null;
    let bestScore = -Infinity;

    elements.forEach((element) => {
      if (!isVisible(element)) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const area = rect.width * rect.height;
      const score = (area * 0.001) + ((window.innerHeight - rect.bottom) * 0.5) + ((window.innerWidth - rect.left) * 0.05);

      if (score > bestScore) {
        best = element;
        bestScore = score;
      }
    });

    return best;
  }

  function createElementFromHTML(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    return wrapper.firstElementChild;
  }

  function ensureToastHost() {
    let host = document.getElementById(constants.UI_IDS.toastHost);
    if (host) {
      return host;
    }

    host = document.createElement("div");
    host.id = constants.UI_IDS.toastHost;

    const mount = document.body || document.documentElement;
    mount.appendChild(host);
    return host;
  }

  function showToast(message, options) {
    const opts = Object.assign({
      type: "info",
      duration: constants.DEFAULT_SETTINGS.ui.blockNoticeMs
    }, options || {});

    const host = ensureToastHost();
    const toast = document.createElement("div");
    toast.className = "xydy-toast xydy-toast-" + opts.type;
    toast.textContent = message;
    host.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 200);
    }, opts.duration);
  }

  function dispatchSyntheticKey(type, key, repeat) {
    const code = key.length === 1 ? "Key" + key.toUpperCase() : key;
    const normalizedKey = key.length === 1 ? key : key;
    const keyCode = key.length === 1 ? key.toUpperCase().charCodeAt(0) : (key === "ArrowDown" ? 40 : 0);

    const event = new KeyboardEvent(type, {
      key: normalizedKey,
      code,
      keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      repeat: Boolean(repeat)
    });

    document.dispatchEvent(event);
  }

  function tapSyntheticKey(key) {
    dispatchSyntheticKey("keydown", key, false);
    dispatchSyntheticKey("keyup", key, false);
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isImmersiveVideoPage() {
    const path = window.location.pathname;
    const allowedPaths = [
      "/",
      "/recommend",
      "/video"
    ];
    if (allowedPaths.some(p => path === p || path.startsWith(p + "/"))) {
      return !new URLSearchParams(window.location.search).has("modal_id");
    }
    return false;
  }

  function isModalVideoPage() {
    return new URLSearchParams(window.location.search).has("modal_id");
  }

  app.utils = {
    clone,
    mergeDeep,
    normalizeText,
    sleep,
    queryFirst,
    queryAll,
    isVisible,
    pickBestVisible,
    createElementFromHTML,
    showToast,
    isModalVideoPage,
    dispatchSyntheticKey,
    tapSyntheticKey,
    isPlainObject,
    isImmersiveVideoPage
  };
})(globalThis);

/* ===== src/shared/storage.js ===== */
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

/* ===== src/content/runtime.js ===== */
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

/* ===== src/content/modules/loading-screen.js ===== */
(function registerLoadingScreenModule(global) {
  const app = global.XYDYExtension;
  const uiIds = app.constants.UI_IDS;

  app.registerContentModule({
    id: "loading-screen",
    create: function createLoadingScreenModule(context) {
      let overlay = null;
      let shownAt = 0;
      let maxTimer = null;
      let bootReady = false;
      let domReady = document.readyState !== "loading";
      let removeBootListener = null;
      let onReadyStateChange = null;

      function removeOverlay(reason) {
        if (!overlay) {
          return;
        }

        if (maxTimer) {
          clearTimeout(maxTimer);
          maxTimer = null;
        }

        const settings = context.getSettings();
        const minShow = settings.ui.loadingMinMs;
        const elapsed = Date.now() - shownAt;
        const waitMore = Math.max(0, minShow - elapsed);

        setTimeout(() => {
          if (!overlay) {
            return;
          }
          overlay.classList.add("closing");
          const el = overlay;
          setTimeout(() => {
            el.remove();
            if (overlay === el) overlay = null;
            context.log("loading", "overlay removed", reason);
          }, 260);
        }, waitMore);
      }

      function maybeRemove(reason) {
        if (!bootReady) {
          return;
        }

        if (!domReady && document.readyState === "loading") {
          return;
        }

        removeOverlay(reason);
      }

      function ensureOverlay() {
        if (overlay || !context.getSettings().features.loading) {
          return;
        }

        overlay = document.getElementById(uiIds.loadingOverlay);
        if (overlay) {
          return;
        }

        overlay = document.createElement("div");
        overlay.id = uiIds.loadingOverlay;
        overlay.innerHTML = [
          "<div class=\"xydy-loading-card\">",
          "  <div class=\"xydy-loading-spinner\"></div>",
          "  <div class=\"xydy-loading-title\">xyDouYinTools 正在接管页面</div>",
          "  <div class=\"xydy-loading-desc\">页面和样式稳定后会自动消失。</div>",
          "</div>"
        ].join("");

        shownAt = Date.now();
        (document.documentElement || document.body).appendChild(overlay);

        maxTimer = setTimeout(() => {
          removeOverlay("timeout");
        }, context.getSettings().ui.loadingMaxMs);
      }

      return {
        init: function init() {
          ensureOverlay();

          removeBootListener = context.on("boot-ready", () => {
            bootReady = true;
            maybeRemove("boot-ready");
          });

          onReadyStateChange = function handleReadyStateChange() {
            domReady = document.readyState !== "loading";
            maybeRemove("dom-ready");
          };

          document.addEventListener("readystatechange", onReadyStateChange, true);
        },
        onSettingsChange: function onSettingsChange(nextSettings, previousSettings) {
          if (!previousSettings) {
            return;
          }

          if (nextSettings.features.loading && !previousSettings.features.loading) {
            ensureOverlay();
            return;
          }

          if (!nextSettings.features.loading && previousSettings.features.loading) {
            removeOverlay("feature-disabled");
          }
        },
        destroy: function destroy() {
          if (removeBootListener) {
            removeBootListener();
          }
          if (onReadyStateChange) {
            document.removeEventListener("readystatechange", onReadyStateChange, true);
          }
          if (maxTimer) {
            clearTimeout(maxTimer);
          }
          removeOverlay("destroy");
        }
      };
    }
  });
})(globalThis);

/* ===== src/content/modules/styles.js ===== */
(function registerStylesModule(global) {
  const app = global.XYDYExtension;
  const SIDEBAR_OVERRIDE_STYLE_ID = "xydy-sidebar-floating-overrides";
  const VIDEO_CONTROL_PATCH_ATTR = "data-xydy-native-controls-patched";

  function ensureSidebarOverrideStyle() {
    let style = document.getElementById(SIDEBAR_OVERRIDE_STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = SIDEBAR_OVERRIDE_STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }

    style.textContent = `
html[data-xydy-sidebar="on"][data-xydy-styles="on"] #douyin-navigation .kCzNsmN5,
html[data-xydy-sidebar="on"][data-xydy-styles="on"] [data-e2e="douyin-navigation"] .kCzNsmN5 {
  border-radius: 10px !important;
  transition: background 0.18s ease, transform 0.18s ease !important;
}

html[data-xydy-sidebar="on"][data-xydy-styles="on"] #douyin-navigation .kCzNsmN5:hover,
html[data-xydy-sidebar="on"][data-xydy-styles="on"] [data-e2e="douyin-navigation"] .kCzNsmN5:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateX(3px) !important;
}
`;

    return style;
  }

  app.registerContentModule({
    id: "styles",
    create: function createStylesModule(context) {
      let videoObserver = null;
      let swapPending = false;
      let triggerSwapFn = null;
      let chapterDismissBound = false;
      let chapterDismissUntil = 0;
      let danmakuBound = false;
      const danmakuCloseTimers = new Map();
      const danmakuPlugins = new WeakMap();
      const restoredDanmakuModes = new Map();
      const restoredSettingLists = new Map();

      function syncCompactSettings(player) {
        const plugin = player && player.plugins && player.plugins.settinglistplugin;
        if (!plugin || !plugin.config || !Array.isArray(plugin.config.hideList) || typeof plugin.updateConfig !== 'function') return;
        const current = plugin.config.hideList;
        const compact = current.filter(name => name !== 'AutoPlaySettingPlugin' && name !== 'ImmersiveSwitchSettingPlugin');
        if (current.length !== compact.length) {
          restoredSettingLists.set(plugin, current.slice());
          plugin.updateConfig({ hideList: compact });
        }
        if (plugin.root && plugin.root.dataset.xydySettingsEmpty !== String(compact.length === 0)) {
          plugin.root.dataset.xydySettingsEmpty = String(compact.length === 0);
        }
      }

      function syncDanmakuControls() {
        app.utils.queryAll(app.constants.SELECTORS.danmakuContainer).forEach(container => {
          let plugin = danmakuPlugins.get(container);
          if (!plugin) {
            const child = container.firstElementChild;
            const key = child && Object.keys(child).find(name => name.startsWith('__reactFiber$'));
            let fiber = key && child[key];
            for (let depth = 0; fiber && depth < 16; depth++, fiber = fiber.return) {
              const player = fiber.memoizedProps && fiber.memoizedProps.player;
              plugin = player && player.plugins && player.plugins.danmakuplugin;
              if (plugin) break;
            }
            if (plugin) danmakuPlugins.set(container, plugin);
          }
          if (!plugin) return;
          syncCompactSettings(plugin.player);
          if (!plugin.config || plugin.config.isDanmuIcon !== true || typeof plugin.updateConfig !== 'function') return;
          if (!restoredDanmakuModes.has(plugin)) restoredDanmakuModes.set(plugin, plugin.config.isDanmuIcon);
          plugin.updateConfig({ ...plugin.config, isDanmuIcon: false });
        });
        restoredDanmakuModes.forEach((mode, plugin) => {
          if (!plugin.root || !plugin.root.isConnected) restoredDanmakuModes.delete(plugin);
        });
        restoredSettingLists.forEach((list, plugin) => {
          if (!plugin.root || !plugin.root.isConnected) restoredSettingLists.delete(plugin);
        });
      }

      function restoreDanmakuControls() {
        restoredSettingLists.forEach((list, plugin) => {
          if (plugin.root && plugin.root.isConnected) {
            delete plugin.root.dataset.xydySettingsEmpty;
            plugin.updateConfig({ hideList: list });
          }
        });
        restoredSettingLists.clear();
        restoredDanmakuModes.forEach((mode, plugin) => {
          if (plugin.root && plugin.root.isConnected && plugin.config && typeof plugin.updateConfig === 'function') {
            plugin.updateConfig({ ...plugin.config, isDanmuIcon: mode });
          }
        });
        restoredDanmakuModes.clear();
      }

      function findDanmaku(target) {
        return target instanceof Element ? target.closest(app.constants.SELECTORS.danmakuInput.join(',')) : null;
      }

      function expandDanmaku(container) {
        clearTimeout(danmakuCloseTimers.get(container));
        danmakuCloseTimers.delete(container);
        container.dataset.xydyDanmaku = 'expanded';
      }

      function onDanmakuPress(event) {
        if (event.button !== 0 || !canRun(context.getSettings())) return;
        const container = findDanmaku(event.target);
        if (!container || container.dataset.xydyDanmaku === 'expanded') return;
        expandDanmaku(container);
        const input = app.utils.queryFirst(app.constants.SELECTORS.danmakuEditor, container);
        if (input) {
          event.preventDefault();
          input.focus({ preventScroll: true });
        }
      }

      function onDanmakuFocus(event) {
        const container = findDanmaku(event.target);
        if (container) expandDanmaku(container);
      }

      function onDanmakuBlur(event) {
        const container = findDanmaku(event.target);
        if (!container || container.contains(event.relatedTarget)) return;
        clearTimeout(danmakuCloseTimers.get(container));
        danmakuCloseTimers.set(container, setTimeout(() => {
          danmakuCloseTimers.delete(container);
          if (!container.contains(document.activeElement)) delete container.dataset.xydyDanmaku;
        }, 180));
      }

      function bindDanmaku() {
        if (danmakuBound) return;
        danmakuBound = true;
        document.addEventListener('pointerdown', onDanmakuPress, true);
        document.addEventListener('focusin', onDanmakuFocus);
        document.addEventListener('focusout', onDanmakuBlur);
      }

      function unbindDanmaku() {
        danmakuBound = false;
        document.removeEventListener('pointerdown', onDanmakuPress, true);
        document.removeEventListener('focusin', onDanmakuFocus);
        document.removeEventListener('focusout', onDanmakuBlur);
        danmakuCloseTimers.forEach(timer => clearTimeout(timer));
        danmakuCloseTimers.clear();
        app.utils.queryAll(app.constants.SELECTORS.danmakuInput).forEach(container => delete container.dataset.xydyDanmaku);
      }

      function blockChapterDismissEvent(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      function handleChapterOutsidePress(event) {
        chapterDismissUntil = 0;
        if (!event.isTrusted || !canRun(context.getSettings())) return;
        const selectors = app.constants.SELECTORS;
        const panel = app.utils.queryAll(selectors.chapterPanel).find((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 50 && rect.height > 50 && rect.bottom > 0 &&
            rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth &&
            style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.01;
        });
        if (!panel || panel.contains(event.target)) return;
        const closeButton = app.utils.queryFirst(selectors.chapterClose, panel);
        if (!closeButton) return;
        chapterDismissUntil = Date.now() + 1500;
        blockChapterDismissEvent(event);
        closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }

      function handleChapterDismissFollowup(event) {
        if (!event.isTrusted || Date.now() >= chapterDismissUntil) return;
        if (event.type === 'click' && event.detail === 0) return;
        blockChapterDismissEvent(event);
        if (['click', 'auxclick', 'contextmenu', 'pointercancel'].includes(event.type)) {
          chapterDismissUntil = 0;
        }
      }

      function bindChapterDismiss() {
        if (chapterDismissBound) return;
        chapterDismissBound = true;
        window.addEventListener('pointerdown', handleChapterOutsidePress, true);
        ['pointerup', 'pointercancel', 'mousedown', 'mouseup', 'click', 'auxclick', 'contextmenu'].forEach((type) => {
          window.addEventListener(type, handleChapterDismissFollowup, true);
        });
      }

      function unbindChapterDismiss() {
        chapterDismissBound = false;
        chapterDismissUntil = 0;
        window.removeEventListener('pointerdown', handleChapterOutsidePress, true);
        ['pointerup', 'pointercancel', 'mousedown', 'mouseup', 'click', 'auxclick', 'contextmenu'].forEach((type) => {
          window.removeEventListener(type, handleChapterDismissFollowup, true);
        });
      }

      function patchVideoControls(root) {
        const scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll("video").forEach((video) => {
          if (video.getAttribute(VIDEO_CONTROL_PATCH_ATTR) === "1") {
            if (context.getSettings().features.styles && video.hasAttribute("controls")) {
              video.removeAttribute("controls");
              video.controls = false;
            }
            return;
          }

          video.setAttribute(VIDEO_CONTROL_PATCH_ATTR, "1");
          if (video.hasAttribute("controls")) {
            video.removeAttribute("controls");
          }
          video.controls = false;
        });
      }

      function patchXgControls() {
        const controls = document.querySelectorAll('.xgplayer-controls');
        controls.forEach((el) => {
          if (context.getSettings().features.liquidGlass) {
            el.style.removeProperty('background-image');
            el.style.removeProperty('background');
            return;
          }
          if (el.style.backgroundImage !== 'none') {
            el.style.setProperty('background-image', 'none', 'important');
            el.style.setProperty('background', 'rgba(255, 255, 255, 0.06)', 'important');
          }
        });
      }

      function syncChapterModeClass() {
        const selectors = app.constants.SELECTORS;
        app.utils.queryAll(selectors.playerContainer).forEach((playerContainer) => {
          const slide = playerContainer.closest(selectors.videoSlide.join(','));
          const chapterPanel = slide && app.utils.queryFirst(selectors.chapterPanel, slide);
          const style = chapterPanel && window.getComputedStyle(chapterPanel);
          const isOpen = !!chapterPanel &&
            chapterPanel.offsetWidth > 50 && chapterPanel.offsetHeight > 50 &&
            style.display !== 'none' && style.visibility !== 'hidden' &&
            parseFloat(style.opacity) > 0;

          playerContainer.classList.toggle('xydy-chapter-mode', isOpen);
          const anchor = slide && app.utils.queryFirst(selectors.chapterAnchor, slide);
          if (chapterPanel && anchor) {
            const bounds = chapterPanel.parentElement.getBoundingClientRect();
            const rect = anchor.getBoundingClientRect();
            const width = Math.min(420, bounds.width - 24);
            const left = Math.max(12, Math.min(rect.left - bounds.left, bounds.width - width - 12));
            chapterPanel.style.setProperty('--xydy-chapter-left', left + 'px');
            chapterPanel.style.setProperty('--xydy-chapter-bottom', Math.max(12, bounds.bottom - rect.top + 12) + 'px');
            chapterPanel.style.setProperty('--xydy-chapter-height', Math.max(0, Math.min(480, rect.top - Math.max(bounds.top, 0) - 24)) + 'px');
          }
        });
      }

      function handleTransformSwap() {
        const popupSelector = '[class*="recommend-login-panel"], .n4FTI10b, ._KRDPUZX, .hurS2TXT';
        const popup = document.querySelector(popupSelector);

        if (popup) {
          const activeSlide = popup.closest('.RFe2KjM2');
          if (activeSlide && !activeSlide.dataset.xydySwapped) {
            const cs = window.getComputedStyle(activeSlide);
            const transformStr = activeSlide.style.transform || cs.transform;
            if (transformStr && transformStr !== 'none') {
              const match = transformStr.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^\)]+)\)/) ||
                            transformStr.match(/translate3d\([^,]+,\s*([^p]+)px/);
              if (match) {
                const translateY = parseFloat(match[1]);
                activeSlide.dataset.xydyOrigTransform = transformStr;
                activeSlide.dataset.xydySwapped = "1";
                activeSlide.style.setProperty('transform', 'none', 'important');
                activeSlide.style.setProperty('top', `${translateY}px`, 'important');
              }
            }
          }
        } else {
          // Restore transform if no popups are open
          const swappedSlide = document.querySelector('[data-xydy-swapped="1"]');
          if (swappedSlide) {
            const orig = swappedSlide.dataset.xydyOrigTransform;
            swappedSlide.style.setProperty('transform', orig === 'none' ? '' : orig);
            swappedSlide.style.removeProperty('top');
            swappedSlide.removeAttribute('data-xydy-swapped');
            swappedSlide.removeAttribute('data-xydy-orig-transform');
          }
        }
      }

      function ensureVideoObserver() {
        if (videoObserver) {
          return;
        }

        videoObserver = new MutationObserver((mutations) => {
          if (!context.getSettings().features.styles) {
            return;
          }

          patchXgControls();
          syncChapterModeClass();
          syncDanmakuControls();

          mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.target && mutation.target.tagName === "VIDEO") {
              mutation.target.removeAttribute("controls");
              mutation.target.controls = false;
              return;
            }

            mutation.addedNodes.forEach((node) => {
              if (!node || node.nodeType !== 1) {
                return;
              }

              // Run the swap logic reactively when DOM changes
              handleTransformSwap();
              syncChapterModeClass();

              if (node.tagName === "VIDEO") {
                if (node.hasAttribute("controls")) {
                  node.removeAttribute("controls");
                }
                node.controls = false;
                node.setAttribute(VIDEO_CONTROL_PATCH_ATTR, "1");
                return;
              }

              patchVideoControls(node);
            });
          });
        });

        videoObserver.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["controls"]
        });

        // Smart event triggers: Reactively run swap when mouse enters elements or clicks
        // Use requestAnimationFrame throttling to avoid any layout thrashing
        triggerSwapFn = () => {
          if (swapPending) return;
          swapPending = true;
          requestAnimationFrame(() => {
            handleTransformSwap();
            syncChapterModeClass();
            swapPending = false;
          });
        };

        document.addEventListener('mouseover', triggerSwapFn, { passive: true });
        document.addEventListener('click', triggerSwapFn, { passive: true });
      }

      let gcTimer = null;
      function startGcTimer() {
        if (gcTimer) return;
        gcTimer = setInterval(() => {
          if (!context.getSettings().features.styles) return;
          handleTransformSwap();
          syncChapterModeClass();
          syncDanmakuControls();
        }, 1000);
      }

      function stopGcTimer() {
        if (gcTimer) {
          clearInterval(gcTimer);
          gcTimer = null;
        }
        if (triggerSwapFn) {
          document.removeEventListener('mouseover', triggerSwapFn);
          document.removeEventListener('click', triggerSwapFn);
          triggerSwapFn = null;
        }
        const swappedSlide = document.querySelector('[data-xydy-swapped="1"]');
        if (swappedSlide) {
          const orig = swappedSlide.dataset.xydyOrigTransform;
          swappedSlide.style.setProperty('transform', orig === 'none' ? '' : orig);
          swappedSlide.style.removeProperty('top');
          swappedSlide.removeAttribute('data-xydy-swapped');
          swappedSlide.removeAttribute('data-xydy-orig-transform');
        }
      }

      function canRun(settings) {
        return settings.features.styles &&
               window.location.host === "www.douyin.com" &&
               app.utils.isImmersiveVideoPage();
      }

      function apply(settings) {
        const root = document.documentElement;
        if (!root) return;

        const active = canRun(settings);

        if (!active) {
          unbindChapterDismiss();
          unbindDanmaku();
          if (videoObserver) {
            videoObserver.disconnect();
            videoObserver = null;
          }
          stopGcTimer();
          restoreDanmakuControls();
          document.querySelectorAll('[data-xydy-teleported="1"]').forEach(el => el.remove());
          const style = document.getElementById(SIDEBAR_OVERRIDE_STYLE_ID);
          if (style) {
            style.remove();
          }
          return;
        }

        ensureSidebarOverrideStyle();
        bindChapterDismiss();
        bindDanmaku();
        syncDanmakuControls();
        patchVideoControls(document);
        patchXgControls();
        ensureVideoObserver();
        startGcTimer();
      }

      return {
        init: function init() {
          apply(context.getSettings());
        },
        onSettingsChange: function onSettingsChange(nextSettings) {
          apply(nextSettings);
        },
        destroy: function destroy() {
          unbindChapterDismiss();
          unbindDanmaku();
          stopGcTimer();
          if (videoObserver) {
            videoObserver.disconnect();
            videoObserver = null;
          }
          restoreDanmakuControls();
        }
      };
    }
  });
})(globalThis);

/* ===== src/content/modules/liquid-glass.js ===== */
(function registerLiquidGlassModule(global) {
  const app = global.XYDYExtension;
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Gradient displacement and RGB separation adapted from the local newtab liquid-glass helper.
  // References: https://github.com/rizroze/liquid-glass and https://aave.com/design/building-glass-for-the-web
  app.registerContentModule({
    id: "liquid-glass",
    create: function createLiquidGlassModule(context) {
      const surfaces = new Map();
      const materialSelector = app.constants.SELECTORS.liquidGlassSurfaces.join(",");
      let host = null;
      let definitions = null;
      let observer = null;
      let resizeObserver = null;
      let scheduled = false;
      let serial = 0;
      let running = false;

      function svgNode(name, attributes) {
        const element = document.createElementNS(SVG_NS, name);
        Object.entries(attributes || {}).forEach(([key, value]) => element.setAttribute(key, value));
        return element;
      }

      function ensureDefinitions() {
        if (host) return;
        host = svgNode("svg", { width: 0, height: 0, "aria-hidden": "true", id: "xydy-liquid-definitions" });
        host.style.cssText = "position:absolute;pointer-events:none;overflow:hidden;";
        definitions = svgNode("defs");
        host.appendChild(definitions);
        document.documentElement.appendChild(host);
      }

      function makeMap(width, height, radius) {
        const ratio = Math.min(1, 768 / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        const drawing = canvas.getContext("2d");
        if (!drawing) throw new Error("Canvas unavailable");
        const w = canvas.width;
        const h = canvas.height;
        const horizontal = drawing.createLinearGradient(0, 0, w, 0);
        horizontal.addColorStop(0, "rgb(0,0,0)");
        horizontal.addColorStop(1, "rgb(255,0,0)");
        drawing.fillStyle = horizontal;
        drawing.fillRect(0, 0, w, h);
        const vertical = drawing.createLinearGradient(0, 0, 0, h);
        vertical.addColorStop(0, "rgb(0,0,0)");
        vertical.addColorStop(1, "rgb(0,0,255)");
        drawing.globalCompositeOperation = "difference";
        drawing.fillStyle = vertical;
        drawing.fillRect(0, 0, w, h);
        drawing.globalCompositeOperation = "source-over";
        const inset = Math.min(w, h) * 0.08;
        drawing.filter = "blur(" + Math.max(2, 9 * ratio) + "px)";
        drawing.fillStyle = "rgba(128,128,128,0.98)";
        drawing.beginPath();
        drawing.roundRect(inset, inset, w - inset * 2, h - inset * 2, Math.max(2, radius * ratio - inset));
        drawing.fill();
        return canvas.toDataURL();
      }

      function createFilter() {
        ensureDefinitions();
        const id = "xydy-liquid-filter-" + (++serial);
        const filter = svgNode("filter", {
          id, x: 0, y: 0, width: "100%", height: "100%", "color-interpolation-filters": "sRGB"
        });
        const map = svgNode("feImage", { x: 0, y: 0, result: "map", preserveAspectRatio: "none" });
        filter.appendChild(map);
        const channels = [
          "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
          "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
          "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
        ];
        channels.forEach((values, index) => {
          filter.appendChild(svgNode("feDisplacementMap", {
            in: "SourceGraphic", in2: "map", scale: -40 + index * 3,
            xChannelSelector: "R", yChannelSelector: "B", result: "displaced" + index
          }));
          filter.appendChild(svgNode("feColorMatrix", {
            in: "displaced" + index, type: "matrix", values, result: "channel" + index
          }));
        });
        filter.appendChild(svgNode("feBlend", { in: "channel0", in2: "channel1", mode: "screen", result: "redGreen" }));
        filter.appendChild(svgNode("feBlend", { in: "redGreen", in2: "channel2", mode: "screen" }));
        definitions.appendChild(filter);
        return { id, filter, map, geometry: "" };
      }

      function release(element) {
        const instance = surfaces.get(element);
        if (!instance) return;
        resizeObserver.unobserve(element);
        instance.filter.remove();
        element.classList.remove("xydy-liquid-surface");
        element.style.removeProperty("--xydy-liquid-backdrop");
        surfaces.delete(element);
      }

      function refresh(element, instance) {
        const width = element.offsetWidth || 256;
        const height = element.offsetHeight || 160;
        const rawRadius = getComputedStyle(element).borderTopLeftRadius;
        const radius = rawRadius.endsWith("%") ? parseFloat(rawRadius) / 100 * Math.min(width, height) : parseFloat(rawRadius) || 0;
        const geometry = [width, height, radius].join(":");
        if (geometry === instance.geometry) return;
        instance.map.setAttribute("href", makeMap(width, height, radius));
        instance.map.setAttribute("width", width);
        instance.map.setAttribute("height", height);
        instance.geometry = geometry;
      }

      function sync() {
        scheduled = false;
        if (!running) return;
        const candidates = app.utils.queryAll(materialSelector);
        const targets = candidates.filter(element => !candidates.some(parent => parent !== element &&
          !parent.classList.contains("xgplayer-controls") && parent.contains(element)));
        surfaces.forEach((instance, element) => {
          if (!targets.includes(element)) release(element);
        });
        targets.forEach((element) => {
          let instance = surfaces.get(element);
          try {
            if (!instance) {
              instance = createFilter();
              surfaces.set(element, instance);
              resizeObserver.observe(element);
            }
            if (!element.classList.contains("xydy-liquid-surface")) {
              element.classList.add("xydy-liquid-surface");
            }
            const backdrop = "url(#" + instance.id + ") blur(2px) saturate(1.35)";
            if (element.style.getPropertyValue("--xydy-liquid-backdrop") !== backdrop) {
              element.style.setProperty("--xydy-liquid-backdrop", backdrop);
            }
            refresh(element, instance);
          } catch (error) {
            release(element);
            context.log("liquid-glass", "液态玻璃回退为磨砂", String(error));
          }
        });
      }

      function schedule() {
        if (!running || scheduled) return;
        scheduled = true;
        queueMicrotask(sync);
      }

      function affectsSurfaces(mutation) {
        if (host && host.contains(mutation.target)) return false;
        const relevant = element => element instanceof Element && element !== host &&
          (surfaces.has(element) || element.matches(materialSelector) ||
            [...surfaces.keys()].some(surface => element.contains(surface)) ||
            (element.children.length > 0 && element.querySelector(materialSelector)));
        if (mutation.type === "attributes") return relevant(mutation.target);
        return [...mutation.addedNodes, ...mutation.removedNodes].some(relevant);
      }

      function stop() {
        running = false;
        if (observer) observer.disconnect();
        observer = null;
        scheduled = false;
        surfaces.forEach((instance, element) => release(element));
        if (resizeObserver) resizeObserver.disconnect();
        resizeObserver = null;
        window.removeEventListener("resize", schedule);
        document.removeEventListener("scroll", schedule, true);
        if (host) host.remove();
        host = null;
        definitions = null;
        document.documentElement.dataset.xydyLiquidGlass = "off";
      }

      function apply(settings) {
        const enabled = settings.features.styles && settings.features.liquidGlass &&
          location.host === "www.douyin.com" &&
          app.utils.isImmersiveVideoPage() && !new URLSearchParams(location.search).has("modal_id") &&
          CSS.supports("backdrop-filter", "url(#xydy-liquid)") && typeof ResizeObserver !== "undefined";
        if (!enabled) {
          stop();
          return;
        }
        document.documentElement.dataset.xydyLiquidGlass = "on";
        if (running) return;
        running = true;
        resizeObserver = new ResizeObserver((entries) => {
          entries.forEach(({ target }) => {
            const instance = surfaces.get(target);
            if (!instance || !running) return;
            try {
              refresh(target, instance);
            } catch (error) {
              release(target);
              context.log("liquid-glass", "液态玻璃尺寸更新失败", String(error));
            }
          });
        });
        observer = new MutationObserver((mutations) => {
          if (mutations.some(affectsSurfaces)) schedule();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "data-material"] });
        window.addEventListener("resize", schedule, { passive: true });
        document.addEventListener("scroll", schedule, { passive: true, capture: true });
        sync();
      }

      return { init: function init() { apply(context.getSettings()); }, onSettingsChange: apply, destroy: stop };
    }
  });
})(globalThis);

/* ===== src/content/modules/message-dock.js ===== */
(function registerMessageDockModule(global) {
  const app = global.XYDYExtension;

  app.registerContentModule({
    id: "message-dock",
    create: function createMessageDock(context) {
      const selectors = app.constants.SELECTORS;
      const animations = new Set();
      let phase = "expanded";
      let panel = null;
      let host = null;
      let orb = null;
      let observer = null;
      let frame = null;
      let fadeTimer = null;
      let generation = 0;
      let edgeNear = false;
      let dockY = 0;
      let suppressUntil = 0;
      let bound = false;

      function enabled() {
        return context.getSettings().features.styles && location.host === "www.douyin.com" &&
          app.utils.isImmersiveVideoPage() && !new URLSearchParams(location.search).has("modal_id");
      }

      function consume(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      function reset() {
        generation++;
        animations.forEach(animation => animation.cancel());
        animations.clear();
        clearTimeout(fadeTimer);
        fadeTimer = null;
        if (host) host.classList.remove("xydy-message-minimized");
        if (orb) orb.remove();
        orb = null;
        phase = "expanded";
        suppressUntil = 0;
      }

      function sync() {
        frame = null;
        const current = app.utils.queryFirst(selectors.messagePanel);
        if (current !== panel || (host && !host.isConnected)) {
          reset();
          panel = current;
          host = panel && panel.closest(selectors.messageHost.join(","));
        }
      }

      function scheduleSync() {
        if (frame === null) frame = requestAnimationFrame(sync);
      }

      function geometry(rect) {
        return { left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", height: rect.height + "px" };
      }

      function circle(left, top) {
        return { left: left + "px", top: top + "px", width: "56px", height: "56px" };
      }

      async function animateTo(target, duration, easing) {
        const element = orb;
        if (!element) return;
        const start = geometry(element.getBoundingClientRect());
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const animation = element.animate([start, target], {
          duration: reduced ? 1 : duration, easing, fill: "forwards"
        });
        animations.add(animation);
        try {
          await animation.finished;
          Object.assign(element.style, target);
        } catch (error) {
          return;
        } finally {
          animations.delete(animation);
          animation.cancel();
        }
      }

      function setRevealed(value) {
        if (orb) orb.dataset.revealed = value ? "true" : "false";
      }

      function placeAtEdge() {
        if (!orb) return;
        dockY = Math.max(16, Math.min(dockY, window.innerHeight - 72));
        Object.assign(orb.style, circle(window.innerWidth - 18, dockY));
      }

      async function minimize() {
        if (!host || phase !== "expanded") return;
        const rect = host.getBoundingClientRect();
        if (rect.width < 40 || rect.height < 40) return;
        const token = ++generation;
        phase = "shrinking";
        orb = document.createElement("button");
        orb.id = app.constants.UI_IDS.messageOrb;
        orb.type = "button";
        orb.dataset.phase = phase;
        orb.dataset.revealed = "true";
        orb.setAttribute("aria-label", "展开消息窗口");
        orb.title = "展开消息窗口";
        orb.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M5 5h14v11H9l-4 3V5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
        Object.assign(orb.style, geometry(rect));
        orb.addEventListener("click", restore);
        orb.addEventListener("focus", () => setRevealed(true));
        orb.addEventListener("blur", () => setRevealed(edgeNear));
        document.documentElement.appendChild(orb);
        host.classList.add("xydy-message-minimized");
        dockY = Math.max(16, Math.min(rect.top + rect.height / 2 - 28, window.innerHeight - 72));
        await animateTo({ ...circle(rect.left + rect.width / 2 - 28, dockY), borderRadius: "28px" }, 420, "cubic-bezier(.22,1,.36,1)");
        if (generation !== token) return;
        phase = "moving";
        orb.dataset.phase = phase;
        await animateTo(circle(window.innerWidth - 18, dockY), 560, "cubic-bezier(.16,1,.3,1)");
        if (generation !== token) return;
        phase = "docked";
        orb.dataset.phase = phase;
        fadeTimer = setTimeout(() => setRevealed(edgeNear || document.activeElement === orb), 900);
      }

      async function restore() {
        if (!orb || phase !== "docked" || !host || !panel || !panel.isConnected) return;
        const token = ++generation;
        clearTimeout(fadeTimer);
        phase = "restoring";
        orb.dataset.phase = phase;
        setRevealed(true);
        const rect = host.getBoundingClientRect();
        await animateTo(circle(rect.left + rect.width / 2 - 28, rect.top + rect.height / 2 - 28), 400, "cubic-bezier(.22,1,.36,1)");
        if (generation !== token) return;
        await animateTo({ ...geometry(rect), borderRadius: "18px" }, 440, "cubic-bezier(.22,1,.36,1)");
        if (generation !== token) return;
        host.classList.remove("xydy-message-minimized");
        orb.remove();
        orb = null;
        phase = "expanded";
      }

      function handlePress(event) {
        suppressUntil = 0;
        if (!event.isTrusted || !enabled()) return;
        sync();
        if (!panel || !host || (orb && orb.contains(event.target))) return;
        const trigger = event.target instanceof Element && event.target.closest(selectors.messageTrigger.join(","));
        if (phase === "docked" && trigger) {
          suppressUntil = Date.now() + 1500;
          consume(event);
          restore();
          return;
        }
        if (phase !== "expanded" || host.contains(event.target)) return;
        suppressUntil = Date.now() + 1500;
        consume(event);
        minimize();
      }

      function handleFollowup(event) {
        if (!event.isTrusted || Date.now() >= suppressUntil) return;
        if (event.type === "click" && event.detail === 0) return;
        consume(event);
        if (["click", "auxclick", "contextmenu", "pointercancel"].includes(event.type)) suppressUntil = 0;
      }

      function handleMove(event) {
        edgeNear = event.clientX >= window.innerWidth - 80;
        if (phase === "docked") {
          clearTimeout(fadeTimer);
          setRevealed(edgeNear || document.activeElement === orb);
        }
      }

      function handleLeave() {
        edgeNear = false;
        if (phase === "docked") setRevealed(document.activeElement === orb);
      }

      function handleResize() {
        if (phase === "docked") placeAtEdge();
        else if (phase !== "expanded") reset();
      }

      function stop() {
        if (observer) observer.disconnect();
        observer = null;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        window.removeEventListener("pointerdown", handlePress, true);
        ["pointerup", "pointercancel", "mousedown", "mouseup", "click", "auxclick", "contextmenu"].forEach(type => window.removeEventListener(type, handleFollowup, true));
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("resize", handleResize);
        document.removeEventListener("pointerleave", handleLeave);
        reset();
        panel = null;
        host = null;
        bound = false;
      }

      function apply() {
        if (!enabled()) {
          stop();
          return;
        }
        if (bound) return;
        bound = true;
        window.addEventListener("pointerdown", handlePress, true);
        ["pointerup", "pointercancel", "mousedown", "mouseup", "click", "auxclick", "contextmenu"].forEach(type => window.addEventListener(type, handleFollowup, true));
        window.addEventListener("pointermove", handleMove, { passive: true });
        window.addEventListener("resize", handleResize, { passive: true });
        document.addEventListener("pointerleave", handleLeave, { passive: true });
        observer = new MutationObserver(scheduleSync);
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
        sync();
      }

      return { init: apply, onSettingsChange: apply, destroy: stop };
    }
  });
})(globalThis);

/* ===== src/content/modules/sidebar.js ===== */
(function registerSidebarModule(global) {
  const app = global.XYDYExtension;
  const constants = app.constants;
  const utils = app.utils;
  const selectors = constants.SELECTORS;

  app.registerContentModule({
    id: "sidebar",
    create: function createSidebarModule(context) {
      let sidebarElement = null;
      let hideTimer = null;
      let isLocked = false;
      let bound = false;
      let insideSidebar = false;
      let rafId = null;
      let lastX = 0;
      let lastY = 0;
      let pointerDownInSidebar = false;

      function isEnabled() {
        return Boolean(context.getSettings().features.sidebar) &&
               utils.isImmersiveVideoPage();
      }

      function getSidebarSettings() {
        return context.getSettings().sidebar;
      }

      function resolveSidebar() {
        sidebarElement = utils.queryFirst(selectors.sidebar);
        return sidebarElement;
      }

      function isMouseInsideSidebar(x, y) {
        const el = resolveSidebar();
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        let left = rect.left;
        if (!document.documentElement.classList.contains("xydy-sidebar-hidden")) {
          const transform = getComputedStyle(el).transform;
          if (transform !== "none") left -= new DOMMatrixReadOnly(transform).m41;
        }
        return x >= left - 8 && x <= left + rect.width + 8 &&
          y >= rect.top - 8 && y <= rect.bottom + 8;
      }

      function setVisible(hidden) {
        if (!document.documentElement) return;
        document.documentElement.classList.toggle("xydy-sidebar-hidden", Boolean(hidden));
        if (!hidden) {
          insideSidebar = true;
        }
      }

      function scheduleHide(delay) {
        if (hideTimer) clearTimeout(hideTimer);
        if (isLocked) return;
        hideTimer = setTimeout(() => {
          hideTimer = null;
          const el = resolveSidebar();
          const focused = el && el.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
          insideSidebar = pointerDownInSidebar || focused ||
            lastX <= getSidebarSettings().hoverWidth || isMouseInsideSidebar(lastX, lastY);
          if (!insideSidebar) {
            setVisible(true);
          }
        }, delay);
      }

      function cancelHide() {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
      }

      function onPointerMove(x, y) {
        if (!isEnabled()) return;
        const ss = getSidebarSettings();
        if (ss.locked || isLocked) return;

        const inSidebar = isMouseInsideSidebar(x, y);
        const inTrigger = x <= ss.hoverWidth;

        if (inSidebar || inTrigger || pointerDownInSidebar) {
          insideSidebar = true;
          cancelHide();
          setVisible(false);
        } else {
          insideSidebar = false;
          if (hideTimer === null) {
            scheduleHide(ss.hoverDelay);
          }
        }
      }

      function handlePointerMove(event) {
        lastX = event.clientX;
        lastY = event.clientY;
        if (event.buttons === 0) pointerDownInSidebar = false;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          onPointerMove(lastX, lastY);
        });
      }

      function bindHover() {
        if (bound) return;
        bound = true;
        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.addEventListener("pointerdown", handleSidebarPointerDown, { passive: true });
        document.addEventListener("pointerup", handleSidebarPointerEnd, { passive: true });
        document.addEventListener("pointercancel", handleSidebarPointerEnd, { passive: true });
      }

      function handleSidebarPointerDown(event) {
        const el = resolveSidebar();
        pointerDownInSidebar = Boolean(el && el.contains(event.target));
        if (pointerDownInSidebar) cancelHide();
      }

      function handleSidebarPointerEnd(event) {
        if (!pointerDownInSidebar) return;
        pointerDownInSidebar = false;
        lastX = event.clientX;
        lastY = event.clientY;
        onPointerMove(lastX, lastY);
      }

      function unbindHover() {
        if (!bound) return;
        bound = false;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerdown", handleSidebarPointerDown);
        document.removeEventListener("pointerup", handleSidebarPointerEnd);
        document.removeEventListener("pointercancel", handleSidebarPointerEnd);
        pointerDownInSidebar = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        cancelHide();
      }

      function toggleLock() {
        isLocked = !isLocked;
        if (isLocked) {
          setVisible(true);
        } else {
          const ss = getSidebarSettings();
          if (!ss.hideRequested) {
            setVisible(false);
          }
        }
      }

      function handleHotkey(event) {
        if (!isEnabled()) return;
        if (event.altKey && event.key === "1") {
          event.preventDefault();
          event.stopPropagation();
          toggleLock();
        }
      }

      function notifySwiperAndPlayer() {
        requestAnimationFrame(function () {
          window.dispatchEvent(new Event("resize"));
          var sc = document.querySelector(".parent-route-container");
          if (sc) {
            var st = sc.scrollTop;
            sc.scrollTop = st + 1;
            requestAnimationFrame(function () {
              sc.scrollTop = st;
            });
          }
        });
      }

      function apply(settings) {
        const enabled = isEnabled();

        if (enabled) {
          resolveSidebar();
          const ss = settings.sidebar;
          isLocked = false;

          if (ss.locked) {
            isLocked = true;
            setVisible(true);
          } else if (ss.hideRequested) {
            setVisible(true);
          } else {
            setVisible(false);
          }

          bindHover();
          document.addEventListener("keydown", handleHotkey, true);

          notifySwiperAndPlayer();
          setTimeout(notifySwiperAndPlayer, 500);
        } else {
          unbindHover();
          document.removeEventListener("keydown", handleHotkey, true);
          setVisible(false);
          isLocked = false;
        }
      }

      return {
        init: function init() {
          apply(context.getSettings());
        },
        onSettingsChange: function onSettingsChange(nextSettings) {
          apply(nextSettings);
        },
        destroy: function destroy() {
          unbindHover();
          document.removeEventListener("keydown", handleHotkey, true);
          setVisible(false);
          isLocked = false;
        }
      };
    }
  });
})(globalThis);

/* ===== src/content/modules/navigation.js ===== */
(function registerNavigationModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;

  app.registerContentModule({
    id: "navigation",
    create: function createNavigationModule(context) {
      let header = null;
      let lastMouseY = 9999;
      let lastUrlPath = window.location.pathname + window.location.search;
      let pointerInsideHeader = false;
      let pointerDownInHeader = false;
      let focusInsideHeader = false;
      let interactionUntil = 0;
      let hideTimer = null;
      let showTimer = null;
      let inactivityTimer = null;
      let observer = null;
      let bound = false;
      let searchShell = null;
      let searchInput = null;
      let searchButton = null;
      let searchButtonExpanded = null;
      let searchCloseTimer = null;
      let searchPointerDown = false;
      const searchListeners = [];

      function syncHeaderActions() {
        const id = app.constants.UI_IDS.headerActionsBackground;
        const previous = document.getElementById(id);
        const menu = header && utils.queryFirst(selectors.headerMenu, header);
        if (!canRun(context.getSettings()) || !menu) {
          if (previous) previous.remove();
          return;
        }
        if (previous && previous.parentElement === menu) return;
        if (previous) previous.remove();
        const background = document.createElement("div");
        background.id = id;
        background.setAttribute("aria-hidden", "true");
        menu.prepend(background);
      }

      function isSearchArea(target) {
        return target instanceof Element && Boolean(
          searchShell && searchShell.contains(target) || target.closest(selectors.headerSearchPopup.join(","))
        );
      }

      function syncSearchBackground() {
        const id = app.constants.UI_IDS.headerSearchBackground;
        const previous = document.getElementById(id);
        const form = searchShell && utils.queryFirst(selectors.headerSearchForm, searchShell);
        if (!form) {
          if (previous) previous.remove();
          return;
        }
        if (previous && previous.parentElement === form) return;
        if (previous) previous.remove();
        const background = document.createElement("div");
        background.id = id;
        background.setAttribute("aria-hidden", "true");
        form.prepend(background);
      }

      function setSearchExpanded(expanded) {
        if (!searchShell) return;
        clearTimeout(searchCloseTimer);
        searchCloseTimer = null;
        const state = expanded ? "expanded" : "collapsed";
        if (searchShell.dataset.xydySearch === state) return;
        searchShell.dataset.xydySearch = state;
        if (searchButton) searchButton.setAttribute("aria-expanded", String(expanded));
        if (expanded) {
          showHeader();
          markHeaderInteraction(450);
        } else {
          markHeaderInteraction(400);
          maybeHideHeaderSoon(430);
        }
      }

      function scheduleSearchClose() {
        clearTimeout(searchCloseTimer);
        searchCloseTimer = setTimeout(() => {
          searchCloseTimer = null;
          if (!searchPointerDown && searchShell && !searchShell.contains(document.activeElement)) {
            setSearchExpanded(false);
          }
        }, 160);
      }

      function resetSearch() {
        clearTimeout(searchCloseTimer);
        searchCloseTimer = null;
        searchPointerDown = false;
        document.getElementById(app.constants.UI_IDS.headerSearchBackground)?.remove();
        if (searchShell) {
          searchShell.classList.remove("xydy-search-shell");
          delete searchShell.dataset.xydySearch;
        }
        if (searchButton) {
          if (searchButtonExpanded === null) searchButton.removeAttribute("aria-expanded");
          else searchButton.setAttribute("aria-expanded", searchButtonExpanded);
        }
        searchShell = null;
        searchInput = null;
        searchButton = null;
      }

      function syncSearch() {
        if (!canRun(context.getSettings()) || !header) {
          resetSearch();
          return;
        }
        const input = utils.queryFirst(selectors.headerSearchInput, header);
        const shell = input && input.closest(selectors.headerSearchShell.join(","));
        if (input === searchInput && shell === searchShell) {
          syncSearchBackground();
          return;
        }
        resetSearch();
        if (!shell) return;
        searchShell = shell;
        searchInput = input;
        searchButton = utils.queryFirst(selectors.headerSearchButton, shell);
        searchButtonExpanded = searchButton ? searchButton.getAttribute("aria-expanded") : null;
        shell.classList.add("xydy-search-shell");
        shell.dataset.xydySearch = shell.contains(document.activeElement) ? "expanded" : "collapsed";
        if (searchButton) searchButton.setAttribute("aria-expanded", String(shell.dataset.xydySearch === "expanded"));
        syncSearchBackground();
      }

      function bindSearchListeners() {
        function listen(type, handler) {
          document.addEventListener(type, handler, true);
          searchListeners.push(() => document.removeEventListener(type, handler, true));
        }
        listen("click", (event) => {
          if (!canRun(context.getSettings()) || !searchShell ||
              !searchShell.contains(event.target) || searchShell.dataset.xydySearch !== "collapsed") return;
          event.preventDefault();
          event.stopImmediatePropagation();
          setSearchExpanded(true);
          searchInput.focus({ preventScroll: true });
        });
        listen("pointerdown", (event) => {
          if (!canRun(context.getSettings()) || !searchShell) return;
          searchPointerDown = isSearchArea(event.target);
          if (searchPointerDown) clearTimeout(searchCloseTimer);
          else if (searchShell.dataset.xydySearch === "expanded") setSearchExpanded(false);
        });
        listen("pointerup", () => {
          if (!searchPointerDown) return;
          searchPointerDown = false;
          scheduleSearchClose();
        });
        listen("pointercancel", () => {
          searchPointerDown = false;
          scheduleSearchClose();
        });
        listen("focusin", (event) => {
          if (!canRun(context.getSettings()) || !searchShell) return;
          if (searchShell.contains(event.target) &&
              (event.target === searchInput || searchShell.dataset.xydySearch === "expanded")) setSearchExpanded(true);
        });
        listen("focusout", (event) => {
          if (searchShell && searchShell.contains(event.target)) scheduleSearchClose();
        });
        listen("keydown", (event) => {
          if (event.key !== "Escape" || !searchShell || searchShell.dataset.xydySearch !== "expanded") return;
          setSearchExpanded(false);
          if (searchShell.contains(document.activeElement)) document.activeElement.blur();
        });
        const onWindowBlur = () => {
          searchPointerDown = false;
          if (searchShell) setSearchExpanded(false);
        };
        window.addEventListener("blur", onWindowBlur);
        searchListeners.push(() => window.removeEventListener("blur", onWindowBlur));
      }

      function canRun(settings) {
        return settings.features.navigation &&
               window.location.host === "www.douyin.com" &&
               utils.isImmersiveVideoPage();
      }

      function resolveHeader() {
        header = utils.queryFirst(selectors.header);
        return header;
      }

      function syncHeaderInteractionState() {
        if (!header || !header.isConnected) {
          pointerInsideHeader = false;
          pointerDownInHeader = false;
          focusInsideHeader = false;
          return;
        }

        if (pointerInsideHeader && !header.matches(":hover")) {
          pointerInsideHeader = false;
        }

        if (focusInsideHeader && !header.contains(document.activeElement)) {
          focusInsideHeader = false;
        }
      }

      function showHeader() {
        clearTimeout(hideTimer);
        hideTimer = null;
        clearTimeout(showTimer);
        showTimer = null;

        showTimer = setTimeout(() => {
          document.documentElement.classList.add("xydy-header-visible");
          showTimer = null;
        }, 0);
      }

      function isHeaderInteractionActive() {
        syncHeaderInteractionState();
        const active = pointerInsideHeader || pointerDownInHeader || focusInsideHeader || Date.now() < interactionUntil;
        if (active) {
        }
        return active;
      }

      function markHeaderInteraction(holdMs) {
        interactionUntil = Math.max(interactionUntil, Date.now() + (holdMs || 0));
      }

      function hideHeader() {
        if (isHeaderInteractionActive()) {
          return;
        }

        clearTimeout(showTimer);
        showTimer = null;
        if (hideTimer) {
          return;
        }

        hideTimer = setTimeout(() => {
          document.documentElement.classList.remove("xydy-header-visible");
          hideTimer = null;
        }, 40);
      }

      function maybeHideHeaderSoon(delay) {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          if (!isHeaderInteractionActive() && lastMouseY > 60) {
            hideHeader();
          } else {
          }
        }, delay);
      }

      function resetInactivity() {
        maybeHideHeaderSoon(1200);
      }

      function bindHeaderHoverState() {
        if (!header || header.dataset.xydyNavBound === "1") {
          return;
        }

        header.dataset.xydyNavBound = "1";

        header.addEventListener("pointerenter", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          pointerInsideHeader = true;
          markHeaderInteraction(80);
          showHeader();
          clearTimeout(inactivityTimer);
        }, true);

        header.addEventListener("pointerleave", (event) => {
          if (!canRun(context.getSettings())) {
            return;
          }

          pointerInsideHeader = false;
          lastMouseY = event.clientY;
          maybeHideHeaderSoon(30);
        }, true);

        header.addEventListener("pointerdown", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          pointerDownInHeader = true;
          markHeaderInteraction(180);
          showHeader();
        }, true);

        header.addEventListener("click", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          markHeaderInteraction(220);
          showHeader();
        }, true);
      }

      function bindListeners() {
        if (bound) {
          return;
        }

        bound = true;

        document.addEventListener("pointermove", (event) => {
          if (!canRun(context.getSettings())) {
            return;
          }

          lastMouseY = event.clientY;
          if (event.buttons === 0 && pointerDownInHeader) {
            pointerDownInHeader = false;
          }
          const isPortal = event.target.closest && event.target.closest('.semi-portal-inner');
          if (isPortal || (header && header.contains(event.target))) {
            pointerInsideHeader = true;
            markHeaderInteraction(80);
            showHeader();
            clearTimeout(inactivityTimer);
            return;
          }

          if (pointerInsideHeader) {
            pointerInsideHeader = false;
          }

          if (!isHeaderInteractionActive() && event.clientY > 60) {
            maybeHideHeaderSoon(20);
          }

          if (event.clientY <= 56) {
            showHeader();
            resetInactivity();
          }
        }, true);

        document.addEventListener("pointerup", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          const hadPointerDown = pointerDownInHeader;
          pointerDownInHeader = false;
          if (hadPointerDown) {
            markHeaderInteraction(120);
            if (!pointerInsideHeader && !focusInsideHeader) {
              maybeHideHeaderSoon(30);
            }
          }
        }, true);

        document.addEventListener("mouseout", (event) => {
          if (!canRun(context.getSettings())) {
            return;
          }

          if (!event.relatedTarget && !event.toElement) {
            pointerInsideHeader = false;
            pointerDownInHeader = false;
            maybeHideHeaderSoon(10);
          }
        }, true);

        document.addEventListener("focusin", (event) => {
          if (!canRun(context.getSettings())) {
            return;
          }

          focusInsideHeader = Boolean(header && header.contains(event.target));
          if (focusInsideHeader) {
            markHeaderInteraction(160);
            showHeader();
          }
        }, true);

        document.addEventListener("focusout", () => {
          if (!canRun(context.getSettings())) {
            return;
          }

          setTimeout(() => {
            focusInsideHeader = Boolean(header && header.contains(document.activeElement));
            if (!focusInsideHeader && !pointerInsideHeader) {
              maybeHideHeaderSoon(30);
            }
          }, 0);
        }, true);

        window.addEventListener("blur", () => {
          if (canRun(context.getSettings())) {
            pointerInsideHeader = false;
            pointerDownInHeader = false;
            focusInsideHeader = false;
            interactionUntil = 0;
            hideHeader();
          }
        }, true);

        window.addEventListener("scroll", () => {
          if (canRun(context.getSettings()) && !isHeaderInteractionActive() && lastMouseY > 72) {
            hideHeader();
          }
        }, {
          passive: true
        });
      }

      function ensureObserver() {
        observer = new MutationObserver(() => {
          const currentUrlPath = window.location.pathname + window.location.search;
          if (currentUrlPath !== lastUrlPath) {
            lastUrlPath = currentUrlPath;
            apply(context.getSettings());
            return;
          }

          if (!canRun(context.getSettings())) {
            return;
          }

          const nextHeader = utils.queryFirst(selectors.header);
          if (nextHeader && nextHeader !== header) {
            header = nextHeader;
            bindHeaderHoverState();
            showHeader();
            setTimeout(() => {
              if (!isHeaderInteractionActive() && lastMouseY > 72) {
                hideHeader();
              }
            }, 600);
          }
          syncSearch();
          syncHeaderActions();
        });

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }

      function apply(settings) {

        const active = canRun(settings);
        document.documentElement.dataset.xydyNavigation = active ? "on" : "off";

        if (!active) {
          resetSearch();
          document.documentElement.classList.add("xydy-header-visible");
          resolveHeader();
          syncHeaderActions();
          if (header) {
            header.style.removeProperty("position");
            header.style.removeProperty("top");
            header.style.removeProperty("transform");
            header.style.removeProperty("z-index");
          }
          return;
        }

        resolveHeader();
        bindHeaderHoverState();
        syncSearch();
        syncHeaderActions();
        showHeader();
        setTimeout(() => {
          if (!isHeaderInteractionActive() && lastMouseY > 72) {
            hideHeader();
          } else {
          }
        }, 800);
      }

      return {
        init: function init() {
          document.getElementById("xydy-header-blur-bg")?.remove();
          bindListeners();
          bindSearchListeners();
          ensureObserver();
          apply(context.getSettings());
        },
        onSettingsChange: function onSettingsChange(nextSettings) {
          apply(nextSettings);
        },
        destroy: function destroy() {
          searchListeners.forEach(remove => remove());
          resetSearch();
          document.getElementById(app.constants.UI_IDS.headerActionsBackground)?.remove();
          if (observer) {
            observer.disconnect();
          }
          clearTimeout(inactivityTimer);
          clearTimeout(hideTimer);
          clearTimeout(showTimer);
        }
      };
    }
  });
})(globalThis);

/* ===== src/content/modules/live-skip.js ===== */
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

/* ===== src/content/modules/hide-elements.js ===== */
(function registerHideElementsModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;

  app.registerContentModule({
    id: "hide-elements",
    create: function createHideElementsModule(context) {
      let observer = null;
      let intervalId = null;
      let scheduled = false;

      function textMatches(targetText, textsToHide) {
        if (!targetText) {
          return false;
        }
        return textsToHide.some((fragment) => {
          if (fragment === "充值钻石" && (targetText === "充钻石" || targetText.includes("充"))) {
            return true;
          }
          return targetText.includes(fragment) || fragment.includes(targetText);
        });
      }

      function resolveHeaderEntry(entry) {
        const items = app.constants.HEADER_ENTRY_META;
        const identified = items.find(item => item.selector && selectors[item.selector].some(selector =>
          entry.matches(selector) || entry.querySelector(selector)));
        if (identified) return identified;
        const label = utils.queryFirst(selectors.headerEntryLabel, entry);
        const text = utils.normalizeText(label ? label.textContent : entry.textContent).substring(0, 6);
        return items.find(item => item.texts && item.texts.includes(text));
      }

      function syncHeaderEntries(settings) {
        const menu = utils.queryFirst(selectors.headerMenu);
        if (!menu) return;
        const list = utils.queryFirst(selectors.headerMenuList, menu) || menu;
        let hasVisibleEntry = false;
        Array.from(list.children).forEach(entry => {
          const item = resolveHeaderEntry(entry);
          if (item) {
            const hidden = settings.headerEntries[item.key] ? "off" : "on";
            if (entry.dataset.xydyHeaderEntry !== item.key) entry.dataset.xydyHeaderEntry = item.key;
            if (entry.dataset.xydyHeaderHidden !== hidden) entry.dataset.xydyHeaderHidden = hidden;
          } else {
            if (entry.dataset.xydyHeaderEntry) delete entry.dataset.xydyHeaderEntry;
            if (entry.dataset.xydyHeaderHidden) delete entry.dataset.xydyHeaderHidden;
          }
          if ((!item || settings.headerEntries[item.key]) && !entry.hidden &&
              entry.style.display !== "none" && entry.childElementCount > 0) hasVisibleEntry = true;
        });
        const empty = hasVisibleEntry ? "off" : "on";
        if (menu.dataset.xydyHeaderEmpty !== empty) menu.dataset.xydyHeaderEmpty = empty;
      }

      function hideNow() {
        scheduled = false;
        const settings = context.getSettings();
        if (!canRun(settings)) return;
        syncHeaderEntries(settings);
        if (!settings.features.hideElements) {
          return;
        }

        const textsToHide = settings.hideElements.textsToHide;

        utils.queryAll(selectors.hideCandidates).forEach((node) => {
          if (node.closest(selectors.header.join(","))) return;
          const text = utils.normalizeText(node.textContent);
          if (!textMatches(text, textsToHide)) {
            return;
          }

          const parent = node.closest(selectors.hideCandidateParent[0]) || node.closest(selectors.hideCandidateParent[1]);
          if (!parent) {
            return;
          }

          parent.style.cssText = "display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important; overflow: hidden !important; position: absolute !important;";
          parent.dataset.xydyHidden = "1";
        });

        utils.queryAll(selectors.wallpaperCandidates).forEach((node) => {
          if (node.closest(selectors.header.join(","))) return;
          const parent = node.closest("div");
          if (!parent) {
            return;
          }
          parent.style.display = "none";
          parent.dataset.xydyHidden = "1";
        });
      }

      function scheduleHide() {
        if (scheduled) {
          return;
        }

        scheduled = true;
        setTimeout(hideNow, 120);
      }

      function canRun(settings) {
        return window.location.host === "www.douyin.com" &&
               utils.isImmersiveVideoPage();
      }

      function start() {
        stop();
        if (!canRun(context.getSettings())) {
          return;
        }

        hideNow();
        intervalId = setInterval(hideNow, 1500);

        observer = new MutationObserver(scheduleHide);
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class"]
        });
      }

      function restoreHiddenElements() {
        document.querySelectorAll('[data-xydy-hidden="1"]').forEach(el => {
          el.style.cssText = "";
          el.style.display = "";
          el.style.visibility = "";
          el.style.width = "";
          el.style.minWidth = "";
          el.style.margin = "";
          el.style.padding = "";
          el.style.overflow = "";
          el.style.height = "";
          el.style.position = "";
          delete el.dataset.xydyHidden;
        });
      }

      function stop() {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }

        if (observer) {
          observer.disconnect();
          observer = null;
        }
        restoreHiddenElements();
        document.querySelectorAll('[data-xydy-header-entry]').forEach(entry => {
          delete entry.dataset.xydyHeaderEntry;
          delete entry.dataset.xydyHeaderHidden;
        });
        utils.queryAll(selectors.headerMenu).forEach(menu => delete menu.dataset.xydyHeaderEmpty);
      }

      return {
        init: function init() {
          start();
        },
        onSettingsChange: function onSettingsChange(nextSettings, previousSettings) {
          start();
        },
        destroy: stop
      };
    }
  });
})(globalThis);

/* ===== src/content/modules/ads-filter.js ===== */
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

/* ===== src/content/modules/image-float.js ===== */
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

/* ===== src/content/modules/mouse-gestures.js ===== */
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

/* ===== src/content/modules/context-menu.js ===== */
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

/* ===== src/content/modules/silent-menu.js ===== */
(function registerSilentMenuModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;
  const selectors = app.constants.SELECTORS;
  const labels = app.constants.SILENT_MENU_LABELS;

  app.registerContentModule({
    id: "silent-menu",
    create: function createSilentMenuModule(context) {
      let lastMouseX = Math.floor(window.innerWidth * 0.5);
      let lastMouseY = Math.floor(window.innerHeight * 0.5);
      let running = false;
      let disposed = false;

      function findMenuItemByText(text) {
        return utils.queryAll(selectors.silentMenuItems).find((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && utils.normalizeText(node.textContent) === text;
        }) || null;
      }

      function waitMenuItem(text, canContinue, timeoutMs) {
        return new Promise((resolve) => {
          let observer = null;
          let timer = null;
          const deadline = Date.now() + timeoutMs;
          function finish(value) {
            if (observer) observer.disconnect();
            clearInterval(timer);
            resolve(value);
          }
          function check() {
            if (disposed || !canContinue()) return finish(null);
            const item = findMenuItemByText(text);
            if (item || Date.now() >= deadline) finish(item);
          }
          observer = new MutationObserver(check);
          observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
          timer = setInterval(check, 50);
          check();
        });
      }

      function triggerRightClick(slide) {
        const rect = slide && slide.getBoundingClientRect();
        const x = rect ? Math.max(1, Math.min(window.innerWidth - 1, rect.left + rect.width * 0.45)) : lastMouseX;
        const y = rect ? Math.max(1, Math.min(window.innerHeight - 1, rect.top + rect.height * 0.45)) : lastMouseY;
        const target = document.elementFromPoint(x, y);
        if (!target || (slide && !slide.contains(target))) return false;
        target.dispatchEvent(new MouseEvent("contextmenu", {
          bubbles: true, cancelable: true, view: window, button: 2, buttons: 2, clientX: x, clientY: y
        }));
        return true;
      }

      function closeMenu() {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      }

      async function runSilentBlock(options) {
        if (running || disposed) return false;
        const slide = options && options.slide;
        const canContinue = options && options.canContinue || (() => true);
        if (!canContinue() || utils.queryAll(selectors.silentMenuMask).some(node => node.getBoundingClientRect().width > 0)) return false;
        running = true;
        document.documentElement.classList.add("xydy-silent-menu");
        try {
          if (!triggerRightClick(slide)) return false;
          const dislikeItem = await waitMenuItem(labels.dislike, canContinue, 900);
          if (!dislikeItem || !canContinue()) return false;
          dislikeItem.click();
          const noLiveItem = await waitMenuItem(labels.noLive, canContinue, 900);
          if (!noLiveItem || !canContinue()) return false;
          noLiveItem.click();
          return true;
        } catch (error) {
          context.log("silent-menu", "不想看直播菜单操作失败", String(error));
          return false;
        } finally {
          closeMenu();
          await utils.sleep(180);
          document.documentElement.classList.remove("xydy-silent-menu");
          running = false;
        }
      }

      function trackMouse(event) {
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }

      function onKeyDown(event) {
        if (!event.altKey || event.ctrlKey || event.shiftKey || event.repeat || event.metaKey) return;
        if ((event.key || "").toLowerCase() !== "f") return;
        event.preventDefault();
        event.stopPropagation();
        runSilentBlock();
      }

      const api = { blockLive: runSilentBlock, isRunning: () => running };
      app.silentMenu = api;
      document.addEventListener("mousemove", trackMouse, true);
      document.addEventListener("keydown", onKeyDown, true);

      return {
        destroy() {
          disposed = true;
          document.removeEventListener("mousemove", trackMouse, true);
          document.removeEventListener("keydown", onKeyDown, true);
          if (app.silentMenu === api) delete app.silentMenu;
        }
      };
    }
  });
})(globalThis);

/* ===== src/content/modules/proximity.js ===== */
(function registerProximityModule(global) {
  const app = global.XYDYExtension;
  const constants = app.constants;
  const utils = app.utils;

  app.registerContentModule({
    id: "proximity",
    create: function createProximityModule(context) {
      let bound = false;
      let throttleTimer = null;
      let lastX = 0;
      let lastY = 0;
      let controlsInteractionActive = false;
      const hideTimers = {
        controls: null,
        info: null,
        right: null
      };
      const THRESHOLD = 85; // Proximity threshold in pixels

      // Separating detection targets (for distance calculations) and styling targets (for applying visible classes)
      const PANEL_GROUPS = [
        {
          name: "controls",
          detect: [
            ".xgplayer-controls",
            ".xgplayer-slider",
            ".xgplayer-playclarity-setting .virtual",
            ".xg-options-list",
            ".danmu-setting-box",
            ".danmu-emoji-box"
          ],
          style: [".xgplayer-controls", ".xgplayer-progress"]
        },
        {
          name: "info",
          // Robust detection: target bottom-left text details. If not found, fallback to outer container bounds
          detect: [
            ".video-info-detail .account",
            ".video-info-detail .title",
            ".video-info-detail > div:first-child",
            ".video-info-detail > div:not(.mini-progress-outer)",
            ".xgplayer-recommend-tag",
            ...constants.SELECTORS.playerShopAnchor
          ],
          style: [".xgplayer-video-info-wrap", ".douyin-player-video-info-wrap", ".video-info-detail", ".xgplayer-recommend-tag", ...constants.SELECTORS.playerShopAnchor]
        },
        {
          name: "right",
          detect: ["div[class*=\"immersive-player-switch-on-hide-interaction-area\"]", ".gvcmX2Lf", ".rDq18SJg"],
          style: ["div[class*=\"immersive-player-switch-on-hide-interaction-area\"]", ".gvcmX2Lf", ".rDq18SJg"]
        }
      ];

      function canRun(settings) {
        return settings.features.proximity &&
               window.location.host === "www.douyin.com" &&
               utils.isImmersiveVideoPage();
      }

      // Find the active slide based on vertical bounding boxes
      function getActiveSlide() {
        const slides = Array.from(document.querySelectorAll('.dySwiperSlide'));
        let activeIndex = -1;
        let minDiff = Infinity;
        slides.forEach((s, idx) => {
          const rect = s.getBoundingClientRect();
          const diff = Math.abs(rect.top);
          if (diff < minDiff) {
            minDiff = diff;
            activeIndex = idx;
          }
        });
        return slides[activeIndex];
      }

      // Calculate Euclidean distance from point (x, y) to element bounding rect
      function getDistanceToRect(x, y, rect) {
        let dx = 0;
        let dy = 0;

        if (x < rect.left) {
          dx = rect.left - x;
        } else if (x > rect.right) {
          dx = x - rect.right;
        }

        if (y < rect.top) {
          dy = rect.top - y;
        } else if (y > rect.bottom) {
          dy = y - rect.bottom;
        }

        return Math.sqrt(dx * dx + dy * dy);
      }

      // Update visibility class for a panel group based on mouse position
      function updateGroupProximity(x, y, activeSlide, group, visibleClassName) {
        if (!activeSlide) return;

        let detectElements = [];
        group.detect.forEach(sel => {
          activeSlide.querySelectorAll(sel).forEach(el => {
            detectElements.push(el);
          });
        });

        const styleElements = [];
        group.style.forEach(sel => {
          activeSlide.querySelectorAll(sel).forEach(el => {
            styleElements.push(el);
          });
        });

        if (styleElements.length === 0) return;

        // Graceful Fallback: if no specific detection elements are found, fallback to styling elements
        if (detectElements.length === 0) {
          detectElements = styleElements;
        }

        // Calculate min distance to any detection element in the group
        let minDistance = Infinity;
        detectElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const dist = getDistanceToRect(x, y, rect);
          if (dist < minDistance) {
            minDistance = dist;
          }
        });

        const isNear = minDistance <= THRESHOLD;

        if (isNear) {
          if (hideTimers[group.name]) {
            clearTimeout(hideTimers[group.name]);
            hideTimers[group.name] = null;
          }
          styleElements.forEach(el => {
            el.classList.add(visibleClassName);
          });
        } else {
          if (!hideTimers[group.name]) {
            hideTimers[group.name] = setTimeout(() => {
              hideTimers[group.name] = null;
              styleElements.forEach(el => {
                el.classList.remove(visibleClassName);
              });
            }, 600); // 600ms delay to smoothly transition to dropdowns or menus
          }
        }
      }

      function isPointerInPopup(target) {
        if (!target) return false;
        try {
          const el = target.nodeType === 3 ? target.parentElement : target;
          if (!el || typeof el.closest !== 'function') return false;
          return !!el.closest([
            '.semi-portal',
            '.semi-portal-inner',
            '.semi-dropdown-wrapper',
            '.semi-popover-wrapper',
            '.semi-tooltip-wrapper',
            '.semi-dropdown',
            '.semi-popover',
            '[id*="portal"]',
            '[class*="portal"]',
            '.xg-options-list',
            '.danmu-setting-box',
            '.danmu-emoji-box',
            '#chapterVideoSideCard',
            '#chapterVideoCard',
            '[class*="LookModalFrame"]',
            '[class*="chapterVideo"]'
          ].join(','));
        } catch (e) {
          return false;
        }
      }

      // Check if any dropdown/popup is currently open INSIDE the right panel
      // Douyin uses .semi-dropdown-showing with visibility:visible (not display) to show them
      function isRightPanelDropdownOpen() {
        const rightPanel = document.querySelector(
          '.gvcmX2Lf, .rDq18SJg, [class*="immersive-player-switch-on-hide-interaction-area"]'
        );
        if (!rightPanel) return false;

        // Directly check for classes without computing style to break the visibility hidden circular loop
        return !!rightPanel.querySelector('.semi-dropdown-showing, .semi-dropdown-wrapper-show');
      }

      function isChapterPanelOpen() {
        const activeSlide = getActiveSlide();
        if (!activeSlide) return false;
        const panel = utils.queryFirst(constants.SELECTORS.chapterPanel, activeSlide);
        if (!panel) return false;
        const style = window.getComputedStyle(panel);
        return style.display !== 'none' && style.visibility !== 'hidden' &&
               parseFloat(style.opacity) > 0 && panel.offsetWidth > 50 && panel.offsetHeight > 50;
      }

      function isAnyPopupVisible() {
        // Check right panel internal dropdowns first (e.g. share, collect menus)
        if (isRightPanelDropdownOpen()) return true;

        // Check portal-level popups and dynamic immersive popups
        const popups = document.querySelectorAll([
          '.semi-portal-inner > div',
          '.semi-dropdown-wrapper-show',
          '.semi-popover-wrapper',
          '.xg-options-list',
          '.danmu-setting-box',
          '.danmu-emoji-box',
          '[class*="recommend-login-panel"]',
          '.n4FTI10b',
          '._KRDPUZX',
          '.hurS2TXT'
        ].join(','));

        for (let i = 0; i < popups.length; i++) {
          const el = popups[i];
          if (el.closest(constants.SELECTORS.chapterPanel.join(','))) continue;
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) !== 0) {
            if (el.offsetHeight > 0 || el.offsetWidth > 0) {
              return true;
            }
          }
        }
        return false;
      }

      function onPointerMove(x, y) {
        if (!canRun(context.getSettings())) return;

        const activeSlide = getActiveSlide();
        if (!activeSlide) return;

        const popupOpen = isAnyPopupVisible();
        const chapterOpen = isChapterPanelOpen();

        PANEL_GROUPS.forEach(group => {
          if (popupOpen || ((controlsInteractionActive || chapterOpen) && group.name === "controls")) {
            if (hideTimers[group.name]) {
              clearTimeout(hideTimers[group.name]);
              hideTimers[group.name] = null;
            }
            const styleElements = [];
            group.style.forEach(sel => {
              activeSlide.querySelectorAll(sel).forEach(el => {
                styleElements.push(el);
              });
            });
            styleElements.forEach(el => {
              el.classList.add("xydy-proximity-visible");
            });
          } else {
            updateGroupProximity(x, y, activeSlide, group, "xydy-proximity-visible");
          }
        });
      }

      function handlePointerMove(event) {
        const chapterTarget = event.target instanceof Element && event.target.closest(constants.SELECTORS.chapterPanel.join(','));
        if (!chapterTarget && isPointerInPopup(event.target)) {
          const activeSlide = getActiveSlide();
          if (activeSlide) {
            PANEL_GROUPS.forEach(group => {
              if (hideTimers[group.name]) {
                clearTimeout(hideTimers[group.name]);
                hideTimers[group.name] = null;
              }
              group.style.forEach(sel => {
                activeSlide.querySelectorAll(sel).forEach(el => {
                  el.classList.add("xydy-proximity-visible");
                });
              });
            });
          }
          return;
        }

        lastX = event.clientX;
        lastY = event.clientY;
        if (throttleTimer) return;
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          onPointerMove(lastX, lastY);
        }, 40); // Throttled to 25 FPS for smooth performance
      }

      function handleControlsPointerDown(event) {
        const target = event.target && event.target.nodeType === 3 ? event.target.parentElement : event.target;
        if (!target || typeof target.closest !== "function" || !target.closest(".xgplayer-controls, .xgplayer-progress, .xgplayer-slider, .xgplayer-bar")) {
          return;
        }

        controlsInteractionActive = true;
        const activeSlide = getActiveSlide();
        if (!activeSlide) return;

        const controlsGroup = PANEL_GROUPS.find(group => group.name === "controls");
        if (hideTimers.controls) {
          clearTimeout(hideTimers.controls);
          hideTimers.controls = null;
        }
        controlsGroup.style.forEach(sel => {
          activeSlide.querySelectorAll(sel).forEach(el => {
            el.classList.add("xydy-proximity-visible");
          });
        });
      }

      function handleControlsPointerEnd(event) {
        if (!controlsInteractionActive) return;
        controlsInteractionActive = false;
        lastX = event.clientX;
        lastY = event.clientY;
        onPointerMove(lastX, lastY);
      }

      function handleWindowBlur() {
        controlsInteractionActive = false;
      }

      function clearProximityClasses() {
        const classesToRemove = ["xydy-proximity-visible"];
        classesToRemove.forEach(cls => {
          document.querySelectorAll("." + cls).forEach(el => {
            el.classList.remove(cls);
          });
        });
      }

      let domObserver = null;

      function bindListeners() {
        if (bound) return;
        bound = true;
        document.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.addEventListener("pointerdown", handleControlsPointerDown, { passive: true });
        document.addEventListener("pointerup", handleControlsPointerEnd, { passive: true });
        document.addEventListener("pointercancel", handleControlsPointerEnd, { passive: true });
        document.addEventListener("pointerleave", clearProximityClasses, { passive: true });
        window.addEventListener("blur", handleWindowBlur);

        // Instantly force reveal right panel when any popup is mounted/unmounted in DOM
        if (!domObserver) {
          domObserver = new MutationObserver(() => {
            if (!canRun(context.getSettings())) return;
            const activeSlide = getActiveSlide();
            if (!activeSlide) return;
            if (isChapterPanelOpen()) {
              onPointerMove(lastX, lastY);
              return;
            }
            if (isAnyPopupVisible()) {
              PANEL_GROUPS.forEach(group => {
                if (hideTimers[group.name]) {
                  clearTimeout(hideTimers[group.name]);
                  hideTimers[group.name] = null;
                }
                group.style.forEach(sel => {
                  activeSlide.querySelectorAll(sel).forEach(el => {
                    el.classList.add("xydy-proximity-visible");
                  });
                });
              });
            }
          });
          domObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
          });
        }
      }

      function unbindListeners() {
        if (!bound) return;
        bound = false;
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerdown", handleControlsPointerDown);
        document.removeEventListener("pointerup", handleControlsPointerEnd);
        document.removeEventListener("pointercancel", handleControlsPointerEnd);
        document.removeEventListener("pointerleave", clearProximityClasses);
        window.removeEventListener("blur", handleWindowBlur);
        controlsInteractionActive = false;
        if (domObserver) {
          domObserver.disconnect();
          domObserver = null;
        }
        if (throttleTimer) {
          clearTimeout(throttleTimer);
          throttleTimer = null;
        }
        clearProximityClasses();
      }

      function apply(settings) {
        const root = document.documentElement;
        if (!root) return;

        const active = canRun(settings);
        root.dataset.xydyProximity = active ? "on" : "off";

        if (active) {
          bindListeners();
        } else {
          unbindListeners();
        }
      }

      return {
        init: function init() {
          apply(context.getSettings());
        },
        onSettingsChange: function onSettingsChange(nextSettings) {
          apply(nextSettings);
        },
        destroy: function destroy() {
          unbindListeners();
        }
      };
    }
  });
})(globalThis);

/* ===== src/content/modules/hotkeys.js ===== */
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

/* ===== src/content/modules/comments-dock.js ===== */
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

/* ===== src/content/modules/comments-interactive.js ===== */
(function registerInteractiveCommentsModule(global) {
  const app = global.XYDYExtension;
  const utils = app.utils;

  app.registerContentModule({
    id: "comments-interactive",
    create: function createInteractiveComments(context) {
      let activeSideCard = null;
      let checkInterval = null;
      let geometryObserver = null;
      let lastStyles = null;
      let closeListenerBound = false;
      const visibilityKey = 'xydy-comments-visibility';
      let preferredClosed = document.documentElement.classList.contains('xydy-comments-force-hidden');
      let visibilityRevision = 0;
      try { preferredClosed = preferredClosed || localStorage.getItem(visibilityKey) === 'closed'; } catch (error) {}
      if (preferredClosed) document.documentElement.classList.add('xydy-comments-force-hidden');

      const MIN_WIDTH = 320;
      const MIN_HEIGHT = 250;
      const EDGE_GAP = 24;
      const SIDEBAR_WIDTH = 160;
      const HEADER_HEIGHT = 56;

      try {
        lastStyles = JSON.parse(localStorage.getItem('comments_panel_styles') || 'null');
      } catch (error) {}

      function canRun() {
        const settings = context.getSettings();
        return settings.features.styles &&
               window.location.host === "www.douyin.com" &&
               utils.isImmersiveVideoPage();
      }

      function injectInteractiveHandles(sideCard) {
        if (!sideCard) return;

        applyPanelGeometry(sideCard);

        // Force state to loading if in protection window or opening flag set
        if (window.xydyCommentsOpening || (window.xydyCommentsProtectUntil && Date.now() < window.xydyCommentsProtectUntil)) {
          sideCard.dataset.xydyCommentsState = "loading";
          sideCard.dataset.xydyCommentsMounted = "true";
        }

        if (!hasRealCommentContent(sideCard)) {
          // If within the loading protection window, do not downgrade to idle
          if (window.xydyCommentsProtectUntil && Date.now() < window.xydyCommentsProtectUntil) {
            return;
          }
          window.xydyCommentsOpening = false;
          sideCard.dataset.xydyCommentsState = "idle";
          delete sideCard.dataset.xydyCommentsMounted;
          sideCard.classList.remove('xydy-is-ai-tab');
          sideCard.querySelectorAll('.xydy-drag-handle, .xydy-resize-handle').forEach(handle => handle.remove());
          ['inset', 'left', 'right', 'top', 'bottom', 'width', 'height', 'transition'].forEach(property => sideCard.style.removeProperty(property));
          return;
        }

        // Once we have real content, we are ready, so we clear the opening flag
        window.xydyCommentsOpening = false;
        sideCard.dataset.xydyCommentsState = "ready";
        sideCard.dataset.xydyCommentsMounted = "true";

        applyPanelGeometry(sideCard);

        // 修复滚轮滚动：页面会劫持 wheel 事件让评论区无法滚
        // 用 capture 阶段拦截，发现滚轮目标在可滚动子元素内就阻止传播
        if (!sideCard.dataset.xydyWheelFixed) {
          sideCard.dataset.xydyWheelFixed = 'true';
          sideCard.addEventListener('wheel', function (e) {
            var t = e.target;
            while (t && t !== sideCard) {
              if (t.scrollHeight > t.clientHeight + 10) {
                e.stopPropagation();
                return;
              }
              t = t.parentElement;
            }
          }, { passive: true, capture: true });
        }

        // 1. Inject Drag Handle
        if (!sideCard.querySelector('.xydy-drag-handle')) {
          const dragHandle = document.createElement('div');
          dragHandle.className = 'xydy-drag-handle';
          dragHandle.title = '拖拽移动面板';

          // Setup pointer drag listeners with PointerCapture (prevents sticky dragging)
          dragHandle.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return; // Only left click
            e.preventDefault();
            e.stopPropagation();

            // Set global flag to disable long press acceleration
            window.xydyIsInteractingWithComments = true;
            dragHandle.setPointerCapture(e.pointerId);

            const parent = sideCard.parentElement;
            if (!parent) return;

            const parentRect = parent.getBoundingClientRect();
            const rect = sideCard.getBoundingClientRect();

            const startX = e.clientX;
            const startY = e.clientY;

            const initialLeft = rect.left - parentRect.left;
            const initialTop = rect.top - parentRect.top;
            const width = rect.width;
            const height = rect.height;

            sideCard.style.setProperty('transition', 'none', 'important');
            sideCard.style.setProperty('right', 'auto', 'important');
            sideCard.style.setProperty('bottom', 'auto', 'important');
            sideCard.style.setProperty('left', initialLeft + 'px', 'important');
            sideCard.style.setProperty('top', initialTop + 'px', 'important');
            sideCard.style.setProperty('width', width + 'px', 'important');
            sideCard.style.setProperty('height', height + 'px', 'important');

            function onPointerMove(moveEvent) {
              const dx = moveEvent.clientX - startX;
              const dy = moveEvent.clientY - startY;

              let newLeft = initialLeft + dx;
              let newTop = initialTop + dy;

              // Boundaries
              newLeft = Math.max(SIDEBAR_WIDTH + EDGE_GAP - parentRect.left, Math.min(newLeft, parentRect.width - width));
              newTop = Math.max(HEADER_HEIGHT - parentRect.top, Math.min(newTop, parentRect.height - height));

              sideCard.style.setProperty('left', newLeft + 'px', 'important');
              sideCard.style.setProperty('top', newTop + 'px', 'important');
            }

            function onPointerUp(upEvent) {
              dragHandle.releasePointerCapture(upEvent.pointerId);
              dragHandle.removeEventListener('pointermove', onPointerMove);
              dragHandle.removeEventListener('pointerup', onPointerUp);

              sideCard.style.removeProperty('transition');
              window.xydyIsInteractingWithComments = false;

              // Save coordinates and persist to chrome storage
              lastStyles = {
                left: sideCard.style.left,
                top: sideCard.style.top,
                width: sideCard.style.width,
                height: sideCard.style.height
              };
              localStorage.setItem('comments_panel_styles', JSON.stringify(lastStyles));
            }

            dragHandle.addEventListener('pointermove', onPointerMove);
            dragHandle.addEventListener('pointerup', onPointerUp);
          });

          sideCard.appendChild(dragHandle);
        }

        // 2. Inject 8 Resize Handles
        const directions = ['s', 'e', 'w', 'sw', 'se','nw','ne']; // skip n/nw/ne — too close to drag handle
        directions.forEach(dir => {
          const className = `xydy-resize-handle xydy-resize-handle-${dir}`;
          if (!sideCard.querySelector(`.${className.replace(/ /g, '.')}`)) {
            const handle = document.createElement('div');
            handle.className = className;

            handle.addEventListener('pointerdown', (e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.stopPropagation();

              window.xydyIsInteractingWithComments = true;
              handle.setPointerCapture(e.pointerId);

              const parent = sideCard.parentElement;
              if (!parent) return;

              const parentRect = parent.getBoundingClientRect();
              const rect = sideCard.getBoundingClientRect();

              const startX = e.clientX;
              const startY = e.clientY;

              const initialLeft = rect.left - parentRect.left;
              const initialTop = rect.top - parentRect.top;
              const initialWidth = rect.width;
              const initialHeight = rect.height;

              sideCard.style.setProperty('transition', 'none', 'important');
              sideCard.style.setProperty('right', 'auto', 'important');
              sideCard.style.setProperty('bottom', 'auto', 'important');

              function onPointerMove(moveEvent) {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;

                let newLeft = initialLeft;
                let newTop = initialTop;
                let newWidth = initialWidth;
                let newHeight = initialHeight;

                // Handle vertical resizing
                if (dir.includes('n')) {
                  newTop = initialTop + dy;
                  newHeight = initialHeight - dy;
                  if (newHeight < MIN_HEIGHT) {
                    newTop = initialTop + (initialHeight - MIN_HEIGHT);
                    newHeight = MIN_HEIGHT;
                  }
                  if (newTop < HEADER_HEIGHT - parentRect.top) {
                    newHeight = newHeight + newTop - (HEADER_HEIGHT - parentRect.top);
                    newTop = HEADER_HEIGHT - parentRect.top;
                  }
                } else if (dir.includes('s')) {
                  newHeight = initialHeight + dy;
                  newHeight = Math.max(newHeight, MIN_HEIGHT);
                  if (newTop + newHeight > parentRect.height) {
                    newHeight = parentRect.height - newTop;
                  }
                }

                // Handle horizontal resizing
                if (dir.includes('w')) {
                  newLeft = initialLeft + dx;
                  newWidth = initialWidth - dx;
                  if (newWidth < MIN_WIDTH) {
                    newLeft = initialLeft + (initialWidth - MIN_WIDTH);
                    newWidth = MIN_WIDTH;
                  }
                  if (newLeft < (SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left) {
                    newWidth = newWidth + newLeft - ((SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left);
                    newLeft = (SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left;
                  }
                } else if (dir.includes('e')) {
                  newWidth = initialWidth + dx;
                  newWidth = Math.max(newWidth, MIN_WIDTH);
                  if (newLeft + newWidth > parentRect.width) {
                    newWidth = parentRect.width - newLeft;
                  }
                }

                sideCard.style.setProperty('left', newLeft + 'px', 'important');
                sideCard.style.setProperty('top', newTop + 'px', 'important');
                sideCard.style.setProperty('width', newWidth + 'px', 'important');
                sideCard.style.setProperty('height', newHeight + 'px', 'important');
              }

              function onPointerUp(upEvent) {
                handle.releasePointerCapture(upEvent.pointerId);
                handle.removeEventListener('pointermove', onPointerMove);
                handle.removeEventListener('pointerup', onPointerUp);

                sideCard.style.removeProperty('transition');
                window.xydyIsInteractingWithComments = false;

                // Save coordinates and persist to chrome storage
                lastStyles = {
                  left: sideCard.style.left,
                  top: sideCard.style.top,
                  width: sideCard.style.width,
                  height: sideCard.style.height
                };
                localStorage.setItem('comments_panel_styles', JSON.stringify(lastStyles));
              }

              handle.addEventListener('pointermove', onPointerMove);
              handle.addEventListener('pointerup', onPointerUp);
            });

            sideCard.appendChild(handle);
          }
        });
      }

      function hasRealCommentContent(sideCard) {
        if (!sideCard) return false;
        if (!utils.queryFirst(app.constants.SELECTORS.sideCardContent, sideCard)) return false;
        const html = sideCard.innerHTML;
        const text = (sideCard.innerText || "").replace(/\s+/g, "");

        // If it contains AI related text or classes, it is valid (AI tab starts with short content or loading skeleton)
        if (/(AI|\u95eeAI|\u667a\u80fd|ai-douyin)/i.test(text) || html.includes('ai-') || html.includes('AI')) {
          return html.length > 200;
        }

        if (html.length < 1200) return false;
        if (/(评论|全部评论|详情|相关推荐)/.test(text)) return true;
        return text.length > 20;
      }

      function keepPanelInViewport(sideCard) {
        if (!sideCard || !hasRealCommentContent(sideCard)) return;
        if (app.commentsDock && app.commentsDock.applyGeometry(sideCard)) return;

        const parent = sideCard.parentElement;
        const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const rect = sideCard.getBoundingClientRect();
        const width = Math.min(Math.max(rect.width || 420, MIN_WIDTH), Math.max(MIN_WIDTH, window.innerWidth - EDGE_GAP * 2));
        const height = Math.min(Math.max(rect.height || 400, MIN_HEIGHT), Math.max(MIN_HEIGHT, window.innerHeight - 96));

        let left = rect.left - parentRect.left;
        let top = rect.top - parentRect.top;
        const minLeft = (SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left;
        const maxLeft = window.innerWidth - EDGE_GAP - width - parentRect.left;
        const minTop = HEADER_HEIGHT - parentRect.top;
        const maxTop = window.innerHeight - EDGE_GAP - height - parentRect.top;

        if (!Number.isFinite(left) || rect.right < EDGE_GAP || rect.left > window.innerWidth - EDGE_GAP) {
          left = window.innerWidth - EDGE_GAP - width - parentRect.left;
        }
        if (!Number.isFinite(top) || rect.bottom < 56 || rect.top > window.innerHeight - EDGE_GAP) {
          top = 76 - parentRect.top;
        }

        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));

        sideCard.style.setProperty('right', 'auto', 'important');
        sideCard.style.setProperty('bottom', 'auto', 'important');
        sideCard.style.setProperty('left', left + 'px', 'important');
        sideCard.style.setProperty('top', top + 'px', 'important');
        sideCard.style.setProperty('width', width + 'px', 'important');
        sideCard.style.setProperty('height', height + 'px', 'important');
      }

      function applyPanelGeometry(sideCard) {
        if (!sideCard) return;
        if (app.commentsDock && app.commentsDock.applyGeometry(sideCard)) return;
        // 正在拖拽/缩放时跳过，防止把面板拉回上次保存的位置
        if (window.xydyIsInteractingWithComments) return;

        const parent = sideCard.parentElement;
        const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const rect = sideCard.getBoundingClientRect();
        const savedWidth = parseFloat(lastStyles && lastStyles.width);
        const savedHeight = parseFloat(lastStyles && lastStyles.height);
        const savedLeft = parseFloat(lastStyles && lastStyles.left);
        const savedTop = parseFloat(lastStyles && lastStyles.top);
        const width = Math.min(Math.max(savedWidth || rect.width || 420, MIN_WIDTH), Math.max(MIN_WIDTH, window.innerWidth - EDGE_GAP * 2));
        const height = Math.min(Math.max(savedHeight || rect.height || window.innerHeight - 160, MIN_HEIGHT), Math.max(MIN_HEIGHT, window.innerHeight - 96));

        const minLeft = (SIDEBAR_WIDTH + EDGE_GAP) - parentRect.left;
        const maxLeft = window.innerWidth - EDGE_GAP - width - parentRect.left;
        const minTop = HEADER_HEIGHT - parentRect.top;
        const maxTop = window.innerHeight - EDGE_GAP - height - parentRect.top;

        let left = rect.left - parentRect.left;
        let top = rect.top - parentRect.top;
        left = Number.isFinite(savedLeft) ? savedLeft : left;
        top = Number.isFinite(savedTop) ? savedTop : top;

        if (!Number.isFinite(left) || (!Number.isFinite(savedLeft) && (rect.width <= 0 || rect.right < EDGE_GAP || rect.left > window.innerWidth - EDGE_GAP || rect.right > window.innerWidth))) {
          left = window.innerWidth - EDGE_GAP - width - parentRect.left;
        }
        if (!Number.isFinite(top) || (!Number.isFinite(savedTop) && (rect.height <= 0 || rect.bottom < 56 || rect.top > window.innerHeight - EDGE_GAP || rect.bottom > window.innerHeight))) {
          top = 76 - parentRect.top;
        }

        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));

        sideCard.style.setProperty('right', 'auto', 'important');
        sideCard.style.setProperty('bottom', 'auto', 'important');
        sideCard.style.setProperty('left', left + 'px', 'important');
        sideCard.style.setProperty('top', top + 'px', 'important');
        sideCard.style.setProperty('width', width + 'px', 'important');
        sideCard.style.setProperty('height', height + 'px', 'important');
      }

      function setupGeometryObserver() {
        if (geometryObserver) geometryObserver.disconnect();
        geometryObserver = new MutationObserver((mutations) => {
          if (!canRun() || window.xydyIsInteractingWithComments) return;
          const sideCard = document.getElementById('videoSideCard');
          if (!sideCard) return;
          const containsPanel = node => node instanceof Element &&
            (node === sideCard || node.contains(sideCard));
          if (mutations.some(mutation => sideCard.contains(mutation.target) ||
            [...mutation.addedNodes].some(containsPanel))) {
            applyPanelGeometry(sideCard);
          }
        });
        geometryObserver.observe(document.documentElement, {
          childList: true, subtree: true, attributes: true, attributeFilter: ['class']
        });
        if (canRun()) applyPanelGeometry(document.getElementById('videoSideCard'));
      }

      function setupScanner() {
        if (checkInterval) clearInterval(checkInterval);
        checkInterval = setInterval(() => {
          if (!canRun()) return;
          // 正在拖拽/缩放时别干扰，等用户松手再恢复
          if (window.xydyIsInteractingWithComments) return;
          const sideCard = document.getElementById('videoSideCard');
          if (!sideCard) {
            activeSideCard = null;
            return;
          }
          if (preferredClosed) document.documentElement.classList.add('xydy-comments-force-hidden');

          // Check if active tab is AI tab and toggle class to preserve native styling/backgrounds
          const activeTab = sideCard.querySelector('.semi-tabs-tab-active, [class*="semi-tabs-tab-active"]');
          const isAITab = activeTab && (
            activeTab.id === 'semiTabai_card' ||
            activeTab.textContent.includes('AI') ||
            activeTab.className.includes('ai-')
          );
          if (isAITab) {
            sideCard.classList.add('xydy-is-ai-tab');
          } else {
            sideCard.classList.remove('xydy-is-ai-tab');
          }

          if (sideCard !== activeSideCard) {
            activeSideCard = sideCard;
            injectInteractiveHandles(sideCard);
          } else {
            // Re-check content readiness on every scan
            injectInteractiveHandles(sideCard);
          }

        }, 800);
      }

      function isSideCardVisible(sideCard) {
        if (!sideCard || document.documentElement.classList.contains('xydy-comments-force-hidden')) {
          return false;
        }

        const rect = sideCard.getBoundingClientRect();
        const style = getComputedStyle(sideCard);
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0.01 &&
          rect.width > 20 &&
          rect.height > 20 &&
          rect.right > 0 &&
          rect.left < window.innerWidth;
      }

      function hidePanelWithFallback() {
        visibilityRevision++;
        preferredClosed = true;
        try { localStorage.setItem(visibilityKey, 'closed'); } catch (error) {}
        window.xydyCommentsOpening = false;
        window.xydyCommentsProtectUntil = 0;
        document.documentElement.classList.add('xydy-comments-force-hidden');
      }

      function showPanelWithFallback() {
        visibilityRevision++;
        preferredClosed = false;
        try { localStorage.setItem(visibilityKey, 'open'); } catch (error) {}
        document.documentElement.classList.remove('xydy-comments-force-hidden');
      }

      function triggerPanelOpening() {
        window.xydyCommentsProtectUntil = Date.now() + 2000; // 2s protection window
        window.xydyCommentsOpening = true;
        showPanelWithFallback();

        const sideCard = document.getElementById('videoSideCard');
        if (sideCard) {
          sideCard.dataset.xydyCommentsState = "loading";
          sideCard.dataset.xydyCommentsMounted = "true";
          applyPanelGeometry(sideCard);
        }
      }

      function schedulePanelOpening() {
        const revision = visibilityRevision;
        window.setTimeout(() => {
          if (revision === visibilityRevision) triggerPanelOpening();
        }, 60);
      }

      function togglePanelFromShortcut() {
        const sideCard = document.getElementById('videoSideCard');
        closeChapterPanel();
        if (preferredClosed || document.documentElement.classList.contains('xydy-comments-force-hidden') || !isSideCardVisible(sideCard)) {
          triggerPanelOpening();
          if (!hasRealCommentContent(sideCard)) {
            utils.tapSyntheticKey('x');
          }
          return true;
        }
        hidePanelWithFallback();
        utils.tapSyntheticKey('x');
        return true;
      }

      function closeChapterPanel() {
        const selectors = app.constants.SELECTORS;
        utils.queryAll(selectors.videoSlide).forEach((slide) => {
          const rect = slide.getBoundingClientRect();
          if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
          const panel = utils.queryFirst(selectors.chapterPanel, slide);
          if (!panel || panel.offsetWidth <= 50) return;
          const closeButton = utils.queryFirst(selectors.chapterClose, slide);
          if (closeButton) {
            closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          }
        });
      }

      function bindCloseFallback() {
        if (closeListenerBound) return;
        closeListenerBound = true;

        const handleInteraction = (event) => {
          if (!canRun() || !(event.target instanceof Element)) return;
          const authorBtn = event.target.closest(app.constants.SELECTORS.authorAvatar.join(','));
          const commentBtn = event.target.closest('[data-e2e="feed-comment-icon"]');
          if (commentBtn) closeChapterPanel();
          const aiBtn = event.target.closest('.ai-douyin-entry, [class*="ai-douyin"]');
          const rightContainer = event.target.closest('.rDq18SJg, [class*="immersive-player-switch-on-hide-interaction-area"], .gvcmX2Lf');
          const isAITextClick = rightContainer && (
            event.target.textContent && (
              event.target.textContent.trim() === 'AI' ||
              event.target.textContent.includes('问AI') ||
              event.target.textContent.includes('智能')
            )
          );

          if (commentBtn || aiBtn || isAITextClick || (authorBtn && !isSideCardVisible(document.getElementById('videoSideCard')))) {
            // DO NOT change geometry or styles synchronously during click capture phase!
            // Wait for native React event loop to finish executing the click, then open our custom layout.
            // This guarantees React routes and mounts the panel natively first without browser click cancellation.
            schedulePanelOpening();
          }
        };

        // ONLY bind to click capture. DO NOT intercept pointerdown to avoid browser click cancellation.
        document.addEventListener('click', handleInteraction, true);

        // Standard card close interception
        document.addEventListener('click', (event) => {
          const sideCard = document.getElementById('videoSideCard');
          if (!sideCard || !sideCard.contains(event.target)) return;
          if (event.target.closest('.xydy-drag-handle, .xydy-resize-handle, .xydy-comments-pin, .xydy-comments-dock-resize')) return;

          const rect = sideCard.getBoundingClientRect();
          const inNativeCloseHotspot =
            event.clientX >= rect.right - 64 &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.top + 64;

          if (inNativeCloseHotspot) {
            hidePanelWithFallback();
          }
        }, true);

        document.addEventListener('keydown', (event) => {
          if (!canRun() || !event.isTrusted || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) return;
          if ((event.key || '').toLowerCase() === 'f' && !isSideCardVisible(document.getElementById('videoSideCard'))) {
            schedulePanelOpening();
            return;
          }
          if (event.isTrusted && event.key && event.key.toLowerCase() === 'x' && !event.altKey && !event.ctrlKey && !event.metaKey) {
            const wasVisible = isSideCardVisible(document.getElementById('videoSideCard'));
            closeChapterPanel();
            if (!wasVisible) {
              triggerPanelOpening();
            } else {
              hidePanelWithFallback();
            }
          }
        }, true);

        document.addEventListener('xydy-comments-toggle', togglePanelFromShortcut);
        document.documentElement.dataset.xydyCommentsBridge = 'on';
        window.XYDYCommentsPanel = Object.assign(window.XYDYCommentsPanel || {}, {
          toggleFromShortcut: togglePanelFromShortcut,
          show: showPanelWithFallback,
          hide: hidePanelWithFallback,
          isOpen: function isOpen() { return isSideCardVisible(document.getElementById('videoSideCard')); },
          restoreGeometry: function restoreGeometry(styles) {
            lastStyles = styles;
            localStorage.setItem('comments_panel_styles', JSON.stringify(lastStyles));
            applyPanelGeometry(document.getElementById('videoSideCard'));
          },
          keepInViewport: function keepCurrentInViewport() {
            applyPanelGeometry(document.getElementById('videoSideCard'));
          }
        });
      }

      return {
        init: function init() {
          bindCloseFallback();
          window.addEventListener('resize', () => {
            applyPanelGeometry(document.getElementById('videoSideCard'));
          }, { passive: true });
          setupGeometryObserver();
          setupScanner();
        },
        destroy: function destroy() {
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
          if (geometryObserver) geometryObserver.disconnect();
          geometryObserver = null;
          activeSideCard = null;
        }
      };
    }
  });
})(window);

/* ===== src/content/main.js ===== */
(function bootContentScript(global) {
  const app = global.XYDYExtension;

  app.runtime.start().then(() => {
    app.runtime.emit("boot-ready", {
      url: window.location.href
    });
  }).catch((error) => {
    console.error("[xyDY] bootstrap failed", error);
  });
})(globalThis);
