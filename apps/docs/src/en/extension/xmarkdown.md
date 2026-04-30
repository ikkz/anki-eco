---
title: XMarkdown
description: Render Anki fields as Markdown
---

# XMarkdown

Render an Anki field in Markdown format during review.

> [!TIP]
> Use it with [StyleKit](/extension/style-kit) for an even better experience! StyleKit provides beautiful, professional typography for the rendered Markdown content (headings, lists, quotes, etc.).

## Install & Use

In Anki’s card template editor:

1. Add the script tag to your templates.

- Add it to the **Front Template**.
- If your **Back Template** does **not** include <span v-pre>`{{FrontSide}}`</span>, also add the same script tag to the **Back Template**.

```html
<script
  src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/xmarkdown.js"
  defer
></script>
```

2. Add a hidden block for any field you want to render as Markdown:

```html
<div data-xmd hidden>{{Front}}</div>
```

3. If you also want the answer to be Markdown, add another block on the back template:

```html
{{FrontSide}}
<hr id="answer" />

<div data-xmd hidden>{{Back}}</div>
```

## Optional: custom class

If you want a class on the rendered container, add `data-xmd-class`:

```html
<div data-xmd data-xmd-class="custom-class" hidden>{{Front}}</div>
```

## Example: paste Markdown from an LLM

In Anki’s note editor, you can paste a Markdown-formatted reply from an LLM directly into your field (e.g. `Front` or `Back`). For example:

````md
# Key points

- One
- Two

```js
console.log("hello");
```
````

With XMarkdown enabled in your template, the field will be rendered as Markdown while reviewing.

<!--@include: @/parts/feedback-en.md -->
