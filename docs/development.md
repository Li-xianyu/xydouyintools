# 开发与构建

## 源码与发布文件

主功能有 Chrome 扩展和油猴两种部署形式，共用 `src/shared/`、`src/content/` 下的代码。独立摄像头控制脚本位于 `src/standalone/`，不参加主功能合并。

根目录的两份 `.user.js` 和 `src/content/style-payload.js` 是有意纳入版本管理的发布文件，便于下载后直接安装或加载扩展。请修改源码后生成或同步这些文件。

## 主功能

需要 Python 3。沿用现有版本：

```bash
python merge.py
```

指定新发布版本：

```bash
python merge.py 6.6.20
```

这里的版本号仅为命令示例。每次实际功能修改按现有版本递增；同一修改的重复生成沿用同一个版本。

合并时会从 `src/content/content.css` 更新 `style-payload.js`，再按加载顺序生成根目录 `xyDouYinTools.user.js`。源码使用存储适配与环境桥接支持两种安装方式。

`manifest.json` 中主内容脚本的加载顺序，应与 `merge.py` 的 `js_files` 一致。`extension-bridge.js` 单独运行在扩展隔离环境，用于连接扩展按钮和页面内设置，不合并进油猴脚本。

## 独立手势脚本

修改 `src/standalone/xyDouYinTools.gesture.user.js` 并更新其 `@version` 后，同步到根目录：

```powershell
Copy-Item -LiteralPath src/standalone/xyDouYinTools.gesture.user.js -Destination xyDouYinTools.gesture.user.js
```

不要把独立手势脚本拼进主脚本。其资源缓存和开关与主功能有不同的用途。

## 可选语法检查

安装 Node.js 后，可以执行：

```bash
node --check xyDouYinTools.user.js
node --check xyDouYinTools.gesture.user.js
```

语法检查不代表抖音页面的交互或样式已经通过验证。修改 DOM 选择器、播放器和面板行为时，需要在对应页面类型上确认。

## 调试 Chrome

Windows 下运行：

```powershell
.\scripts\start_chrome_debug.bat
```

启动器默认使用标准安装位置的 Chrome，调试端口为本机 `9222`。浏览器配置目录为 `%LOCALAPPDATA%\ChromeDebugProfile`，位于项目之外，用来保留调试浏览器的登录态与已加载扩展。自定义安装位置时请修改本地启动器中的可执行文件路径。

Chrome 扩展更新后，在扩展管理页重新加载，再刷新抖音网页；油猴版本更新后也需要刷新目标页面。

## 模块约定

- 共享层按 `constants.js → utils.js → storage.js` 顺序加载。
- 功能模块通过 `app.registerContentModule(...)` 注册，由运行时管理初始化、设置更新和清理。
- JS 使用的 DOM 选择器优先放在 `src/shared/constants.js`，纯样式选择器放在 `src/content/content.css`。
- 页面内设置统一由 `hotkeys.js` 实现，扩展按钮通过 `background.js` 和 `extension-bridge.js` 打开同一个面板。
- Chrome 扩展 manifest 版本和主油猴脚本版本是两个字段，发布时分别维护。

## 版本管理

两份根目录油猴脚本和扩展需要的样式载荷随源码一起提交，保证下载后可直接使用。依赖目录、缓存、日志、编辑器配置与凭据由 `.gitignore` 排除。
