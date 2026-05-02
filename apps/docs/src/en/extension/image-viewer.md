---
title: ImageViewer
description: Open and zoom card images with Viewer.js
---

# ImageViewer

ImageViewer integrates [Viewer.js](https://fengyuanchen.github.io/viewerjs/) into Anki card templates, so you can open images in a full-screen viewer with zoom, rotate, flip, pan, and swipe navigation.

::: warning Mobile Compatibility
This extension works well on the Anki desktop client, but it has not been extensively tested on mobile devices (e.g., AnkiMobile, AnkiDroid).
:::

## Installation

Add the following to your template:

```html
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/image-viewer.js" defer></script>
```

::: tip Installation Note
If your **Back Template** does not include <span v-pre>`{{FrontSide}}`</span>, add the same script there as well.
:::

After loading, clicking any image on the card opens the viewer automatically.

## Configuration

The extension works out-of-the-box without any configuration required. However, if you need to customize its behavior, you can do so by providing a JSON configuration block.

```html
<script id="anki-eco-image-viewer-config" type="application/json">
  {
    "selector": "#qa"
  }
</script>
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/image-viewer.js" defer></script>
```

- Config must be declared in `#anki-eco-image-viewer-config` with `type="application/json"`.
- `selector`: Gallery root selector. Default is `#qa`.

<!--@include: @/parts/feedback-en.md -->
