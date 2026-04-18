---
title: Tldraw
description: Anki Tldraw 插件
---

# Tldraw

[Tldraw](https://tldraw.com/) 是一个功能强大的画板工具，本插件实现了其和 Anki 的集成，实现复习时自由的在卡片上绘画

功能：

- 可以在任何你喜欢的模板中安装，因此也支持 Anki 全平台
- 自动将卡片内容截图至画板内，对于习惯在记忆时绘图、打草稿的用户非常实用
- 所有 Tldraw 的功能待你探索，包括 Apple Pencil 支持

## 安装

打开 Anki 的卡片模板编辑器，在任何你喜欢的模板的尾部添加以下代码：

```html
<ae-tldraw></ae-tldraw>
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/tldraw.js" defer></script>
```

在复习时就能看到一个按钮，点击后就能打开画板。该按钮只包括基础样式，你可以按自己的喜好设置它的 css

::: warning
请在 Anki 设置中禁用滑动手势控制，否则会和画板操作冲突
:::

## 自定义

支持通过 HTML 属性配置实现自定义。例如

```html
<ae-tldraw selector="#qa" screenshot="html2canvas">Tldraw</ae-tldraw>
```

### selector

指定截图至画板的元素选择器，默认是 `#qa`

### screenshot

指定截图至画板的方式，默认是 `html2canvas`，如果使用中遇到截图布局异常等可切换至 `html-to-image`

## 高级用法

上面的 `ae-tldraw` 元素在点击时打开画板，切换到下一张卡片时为你自动关闭画板。如果你希望自己控制何时打开画板，可以直接调用：

```js
window.AnkiEcoExtension_tldraw.initTldraw('#qa', 'html2canvas');
```

> 可以直接删除 `ae-tldraw` 元素，但必须保留 script

<!--@include: @/parts/feedback-zh.md -->
