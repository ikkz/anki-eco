---
title: 插件总览
description: 基于模板而非插件（addon）的跨平台 Anki 扩展
---

# 插件

这里的插件基于 Anki 卡片模板（而不是桌面端的插件 addon）实现，因此可以尽可能覆盖多个平台：Anki Desktop、AnkiMobile、AnkiDroid，甚至在合适的场景下也可用于 AnkiWeb。通过在模板中使用 HTML/CSS/JS 的方式，我们力求以最小的配置获得最大的可移植性。

## 当前可用的插件

- [ImageViewer](/zh/extension/image-viewer) —— 在全屏查看器（基于 Viewer.js）中放大和平移卡片图片，支持滑动切换。
- [XMarkdown](/zh/extension/xmarkdown) —— 把字段按 Markdown 格式显示（例如直接粘贴大模型的 Markdown 回复）。
- [StyleKit](/zh/extension/style-kit) —— 为卡片提供一套开箱即用的美观文本样式，基于 Tailwind CSS Typography。
- [CardMotion](/zh/extension/card-motion) —— 在翻转与切换到下一张卡片时展示真实、流畅的动画，支持高度自定义。
- [Tldraw](/zh/extension/tldraw) —— 集成强大的 Tldraw 画板，在复习时直接在卡片上绘制与标注。

<!--@include: @/parts/feedback-zh.md -->
