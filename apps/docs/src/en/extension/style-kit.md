---
title: StyleKit
description: Beautiful text styles for Anki cards
---

# StyleKit

StyleKit provides a set of beautiful, out-of-the-box text styles for Anki cards, with core design inspired by [Tailwind CSS Typography](https://tailwindcss-typography.vercel.app/) (you can visit the website to preview the styles).

This style set comprehensively optimizes common HTML elements, including but not limited to:

- **Headings** (h1, h2, h3...)
- **Blockquotes** (blockquote)
- **Tables** (table)
- **Lists** (ul, ol)
- **Code Blocks** (pre, code)
- As well as paragraphs, links, and other basic text elements.

## Features

- **Plug and Play**: Applied to the entire card by default, no complex HTML structural changes required.
- **Dark Mode Support**: Perfectly adapts to Anki's native dark mode.
- **Responsive Design**:
  - Automatically switches to larger text sizes on wide screens to enhance readability.
  - Sets an optimal reading width (Max-width) for various screen sizes to prevent eye strain from overly long lines.

## Installation and Usage

In the Anki card template editor, add the following script to the top (or bottom) of your "Front Template":

```html
<script src="https://cdn.jsdelivr.net/npm/@anki-eco/extensions/dist/style-kit.js" defer></script>
```

> [!TIP]
> If your "Back Template" **does not** include <span v-pre>`{{FrontSide}}`</span>, you will need to add the same script to the back template as well.

## Troubleshooting

### Layout looks broken?

If you find that the card layout looks strange after adding StyleKit, it is usually because it conflicts with the built-in styles of the third-party template you are using.

**Solution:**

1. Try removing the original CSS style definitions from the template.
2. Check for other conflicting global style scripts.

<!--@include: @/parts/feedback-en.md -->
