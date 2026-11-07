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
