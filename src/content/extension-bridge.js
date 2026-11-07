(function bindExtensionSettings() {
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (!message || message.type !== 'xydy-open-settings') return;
    document.dispatchEvent(new Event('xydy-open-settings'));
    respond({ ok: true });
  });
})();
