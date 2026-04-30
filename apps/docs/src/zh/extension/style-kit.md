---
title: StyleKit
description: 美观的 Anki 卡片文本样式库
---

# StyleKit

StyleKit 为 Anki 卡片提供了一套开箱即用的美观文本样式，其核心设计灵感来自于 [Tailwind CSS Typography](https://tailwindcss-typography.vercel.app/)（您可以前往该网站预览具体的样式效果）。

这套样式对常用的 HTML 元素进行了全面优化，包括但不限于：

- **标题** (h1, h2, h3...)
- **引用块** (blockquote)
- **表格** (table)
- **列表** (ul, ol)
- **代码块** (pre, code)
- 以及段落、链接等基础文本元素。

> [!TIP]
> 搭配 [XMarkdown](/zh/extension/xmarkdown) 使用效果更佳！XMarkdown 负责将文本渲染为 HTML 结构，而 StyleKit 为这些结构提供精美的样式。

## 特性

- **即插即用**：默认应用于整张卡片，无需对 HTML 结构进行复杂修改。
- **黑暗模式支持**：完美适配 Anki 的原生黑暗模式。
- **响应式设计**：
  - 在宽屏设备上会自动切换到更大的文本尺寸，提升阅读体验。
  - 针对不同屏幕宽度设置了最佳的阅读行宽（Max-width），防止文字过长导致阅读疲劳。

## 安装与用法

在 Anki 卡片模板编辑器中，将以下脚本添加到「正面模板」顶部（或底部）：

```html
<script
  src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/style-kit.js"
  defer
></script>
```

> [!TIP]
> 如果「背面模板」**没有**包含 <span v-pre>`{{FrontSide}}`</span>，那么背面也需要再添加一次同样的脚本。

## 常见问题

### 样式显示错乱？

如果您发现添加 StyleKit 后卡片布局变得奇怪，通常是因为它与您正在使用的第三方模板内置样式发生了冲突。

**解决方案：**

1. 尝试移除模板中原有的 CSS 样式定义。
2. 检查是否有其他相互冲突的全局样式脚本。

<!--@include: @/parts/feedback-zh.md -->
