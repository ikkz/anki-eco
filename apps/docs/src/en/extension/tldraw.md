---
title: Tldraw
description: Anki Tldraw Extension
---

# Tldraw

[Tldraw](https://tldraw.com/) is a powerful whiteboard tool. This extension integrates it with Anki, enabling you to draw freely on cards during review.

Features:

- Installable in any template you like, so it works across all Anki platforms
- Automatically screenshots the card content into the canvas — perfect if you like drawing or sketching while reviewing
- Full Tldraw features for you to explore, including Apple Pencil support

## Installation

Open Anki’s card template editor and add the following to the end of any template you like:

```html
<ae-tldraw></ae-tldraw>
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/tldraw.js" defer></script>
```

During review, you’ll see a button; click it to open the canvas. The button only includes basic styles — feel free to customize its CSS.

::: warning
In Anki settings, disable swipe gesture controls, otherwise they will conflict with canvas interactions.
:::

## Customization

You can customize behavior via HTML attributes. For example:

```html
<ae-tldraw selector="#qa" screenshot="html2canvas">Tldraw</ae-tldraw>
```

### selector

Specifies the CSS selector of the element to screenshot into the canvas. Default is `#qa`.

### screenshot

Specifies the screenshot method. Default is `html2canvas`. If you run into layout issues with screenshots, switch to `html-to-image`.

## Advanced Usage

The `ae-tldraw` element opens the canvas on click and automatically closes it when you move to the next card. If you prefer to control when the canvas opens yourself, call:

```js
window.AnkiEcoExtension_tldraw.initTldraw('#qa', 'html2canvas');
```

> You may remove the `ae-tldraw` element entirely, but you must keep the script tag.

<!--@include: @/parts/feedback-en.md -->
