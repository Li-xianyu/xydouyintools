chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id !== undefined) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "xydy-open-settings" });
      return;
    } catch (error) {}
  }
  chrome.tabs.create({ url: "https://www.douyin.com/?recommend=1&xydy_settings=1" });
});
