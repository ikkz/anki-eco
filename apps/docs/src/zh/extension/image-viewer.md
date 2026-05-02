---
title: ImageViewer
description: 基于 Viewer.js 的 Anki 图片查看器
---

# ImageViewer

ImageViewer 将 [Viewer.js](https://fengyuanchen.github.io/viewerjs/) 集成到 Anki 卡片模板中，支持全屏查看、缩放、旋转、翻转、拖拽与左右切换图片。

::: warning 移动端兼容性
此扩展在桌面端（Anki Desktop）运行良好，但尚未在移动设备（如 AnkiMobile、AnkiDroid）上进行充分测试。
:::

## 安装

在模板中添加：

```html
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/image-viewer.js" defer></script>
```

::: tip 安装提示
如果你的 **背面模板** 没有包含 <span v-pre>`{{FrontSide}}`</span>，则背面也需要添加同样的 script。
:::

加载后，点击卡片下的任意图片会自动打开查看器。

## 配置

该扩展开箱即用，大多数情况下你不需要任何配置。如果你需要自定义某些行为，可以通过提供 JSON 配置块来实现。

```html
<script id="anki-eco-image-viewer-config" type="application/json">
  {
    "selector": "#qa"
  }
</script>
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/image-viewer.js" defer></script>
```

- 配置需要写在 `#anki-eco-image-viewer-config`，并且必须使用 `type="application/json"`。
- `selector`：图库根节点选择器，默认 `#qa`。

<!--@include: @/parts/feedback-zh.md -->
