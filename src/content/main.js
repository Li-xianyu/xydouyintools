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
