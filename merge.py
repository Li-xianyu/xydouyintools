import os
import sys

base_dir = os.path.dirname(os.path.abspath(__file__))
user_js_path = os.path.join(base_dir, "xyDouYinTools.user.js")

# Get version from command line argument, or read from existing file
version_arg = sys.argv[1] if len(sys.argv) > 1 else None

if version_arg:
    version = version_arg
else:
    version = "6.6.9"
    if os.path.exists(user_js_path):
        with open(user_js_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("// @version"):
                    version = line.split()[-1].strip()
                    break

# 1. Metadata header
metadata = f"""// ==UserScript==
// @name         xyDouYinTools 抖音沉浸式优化
// @namespace    https://greasyfork.org/zh-CN/users/1513167-咸鱼真人
// @version      {version}
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
"""

import json

with open(os.path.join(base_dir, "src/content/content.css"), encoding="utf-8") as f:
    css_content = f.read().strip()
css_injection = "(function(){var t=" + json.dumps(css_content, ensure_ascii=False) + ";function install(){var n=document.head||document.documentElement;if(!n){requestAnimationFrame(install);return;}var first=document.createElement('style');first.type='text/css';first.textContent=t;n.appendChild(first);var second=document.createElement('style');second.id='xydy-userscript-css';second.textContent=t;n.appendChild(second);}install();})();\n"
with open(os.path.join(base_dir, "src/content/style-payload.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write(css_injection)

js_files = ['src/content/style-payload.js', 'src/shared/constants.js', 'src/shared/utils.js', 'src/shared/storage.js', 'src/content/runtime.js', 'src/content/modules/loading-screen.js', 'src/content/modules/styles.js', 'src/content/modules/liquid-glass.js', 'src/content/modules/message-dock.js', 'src/content/modules/sidebar.js', 'src/content/modules/navigation.js', 'src/content/modules/live-skip.js', 'src/content/modules/hide-elements.js', 'src/content/modules/ads-filter.js', 'src/content/modules/image-float.js', 'src/content/modules/mouse-gestures.js', 'src/content/modules/context-menu.js', 'src/content/modules/silent-menu.js', 'src/content/modules/proximity.js', 'src/content/modules/hotkeys.js', 'src/content/modules/comments-dock.js', 'src/content/modules/comments-interactive.js', 'src/content/main.js']
merged_js = ""
for name in js_files:
    with open(os.path.join(base_dir, name), encoding="utf-8") as f:
        merged_js += "\n/* ===== " + name + " ===== */\n" + f.read().strip() + "\n"
with open(user_js_path, "w", encoding="utf-8", newline="\n") as f:
    f.write(metadata.strip() + "\n" + merged_js)
print(f"Merge completed! version={version} -> xyDouYinTools.user.js")
