---
title: XMarkdown
description: 把 Anki 字段按 Markdown 显示
---

# XMarkdown

把 Anki 的字段内容按 Markdown 格式渲染显示。

## 安装与用法

在 Anki 卡片模板编辑器中：

1. 添加脚本。

- 先把脚本加到「正面模板」。
- 如果「背面模板」**没有**包含 <span v-pre>`{{FrontSide}}`</span>，那么背面也需要再添加一次同样的脚本。

```html
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/xmarkdown.js" defer></script>
```

2. 为需要渲染 Markdown 的字段添加一个隐藏块：

```html
<div data-xmd hidden>{{Front}}</div>
```

3. 如果答案也想按 Markdown 显示，就在背面模板再添加一个块（常见写法如下）：

```html
{{FrontSide}}
<hr id="answer" />

<div data-xmd hidden>{{Back}}</div>
```

## 可选：自定义样式类

如果你想给渲染结果加 class，可以添加 `data-xmd-class`：

```html
<div data-xmd data-xmd-class="custom-class" hidden>{{Front}}</div>
```

## 示例：直接粘贴大模型的 Markdown 回复

在 Anki 的笔记编辑器里，你可以把一段大模型的 Markdown 格式回复直接粘贴到字段里（例如 `Front` / `Back`），例如：

````md
# 要点

- 第一条
- 第二条

```js
console.log('hello');
```
````

开启 XMarkdown 后，复习时该字段会按 Markdown 格式显示。

<!--@include: @/parts/feedback-zh.md -->
