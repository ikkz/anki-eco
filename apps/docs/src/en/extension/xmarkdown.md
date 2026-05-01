---
title: XMarkdown
description: Render Anki fields as Markdown
---

# XMarkdown

XMarkdown brings standard Markdown support to Anki fields, allowing you to create beautifully formatted cards with simple syntax.

::: tip Typography Tip
We recommend using XMarkdown alongside [StyleKit](/extension/style-kit). While XMarkdown handles the "structural conversion," StyleKit takes care of the "visual aesthetics" (providing exquisite styles for headings, lists, blockquotes, etc.).
:::

## Quick Start

Configure your card templates in the **Anki Card Template Editor** as follows:

### 1. Include the Script

Add the following script to your **Front Template**. If your **Back Template** does not include <span v-pre>`{{FrontSide}}`</span>, you will need to add it there as well.

```html
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/xmarkdown.js" defer></script>
```

### 2. Configure Fields

Wrap the fields you want to render (e.g., <span v-pre>`{{Front}}`</span>) in a hidden container with the `data-xmd` attribute:

```html
<!-- Front Template -->
<div data-xmd hidden>{{Front}}</div>

<!-- Back Template (Example) -->
{{FrontSide}}
<hr id="answer" />
<div data-xmd hidden>{{Back}}</div>
```

## Advanced Configuration: Custom Style Classes

If you want to add a specific CSS class to the rendered container, use the `data-xmd-class` attribute:

```html
<div data-xmd data-xmd-class="my-custom-style" hidden>{{Content}}</div>
```

<!--@include: @/parts/feedback-en.md -->
