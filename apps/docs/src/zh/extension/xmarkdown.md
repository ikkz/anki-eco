---
title: XMarkdown
description: 把 Anki 字段按 Markdown 显示
---

# XMarkdown

XMarkdown 能够将 Anki 字段中的 Markdown 文本实时渲染为美观的 HTML 页面，例如来自大模型（LLM）生成的结构化回复。

::: tip 排版建议
建议搭配 [StyleKit](/zh/extension/style-kit) 使用。XMarkdown 负责「转换结构」，而 StyleKit 负责「视觉美化」（如标题、列表、引用块的精致样式）。
:::

## 快速开始

在 Anki 的 **卡片模板编辑器** 中进行以下配置：

### 1. 引入脚本

将以下脚本添加到 **正面模板**。如果你的 **背面模板** 没有包含 <span v-pre>`{{FrontSide}}`</span>，则背面也需要添加。

```html
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/xmarkdown.js" defer></script>
```

### 2. 指定渲染字段

将原本直接显示的字段（如 <span v-pre>`{{Front}}`</span>）包裹在带有 `data-xmd` 属性的隐藏容器中：

```html
<!-- 正面模板 -->
<div data-xmd hidden>{{Front}}</div>

<!-- 背面模板（示例） -->
{{FrontSide}}
<hr id="answer" />
<div data-xmd hidden>{{Back}}</div>
```

## 进阶配置：自定义样式类

如果你希望为渲染后的容器添加特定的 CSS 类，可以使用 `data-xmd-class` 属性：

```html
<div data-xmd data-xmd-class="my-custom-style" hidden>{{Content}}</div>
```

## 使用场景：粘贴大模型回复

你可以直接将 ChatGPT、Claude 等大模型输出的 Markdown 源码粘贴到 Anki 字段中。例如：

````md
# 复习要点

- **核心概念**：xxx
- **注意点**：
  1. 第一点
  2. 第二点

```python
print("Hello Anki")
```
````

在复习时，XMarkdown 会自动将其转换为排版整齐的文档。

<!--@include: @/parts/feedback-zh.md -->
