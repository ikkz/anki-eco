---
title: CardMotion
description: Realistic animations for your cards
---

# CardMotion

Features:

- Shows realistic, smooth animations when flipping and moving to the next card
- Easily integrates with any of your templates
- Works across all Anki clients: Anki Desktop, AnkiMobile, AnkiDroid, AnkiWeb
- Fully customizable: animation easing and speed, appearance, play a sound on flip, and more

| AnkiMobile                                            | AnkiDroid                                                 |
| ----------------------------------------------------- | --------------------------------------------------------- |
| ![card-motion](/extension-assets/card-motion-ios.gif) | ![card-motion](/extension-assets/card-motion-android.gif) |

## Installation

### Manually create or integrate into an existing template (recommended)

- New template: after creating the required fields, paste the following three parts into the Anki card template editor
- Integrate: the front and back display areas are highlighted in the code below for easy replacement with your own template content

> [!WARNING]
> Do not use Anki’s FrontSide field in the Back Template, as it conflicts with this extension

<!--@include: ../../parts/ext-cm-install.md -->

### Install by downloading a Deck

You can also download from AnkiWeb: [link](https://ankiweb.net/shared/info/1841184152). However, it may not always be the latest. For the most up-to-date version, use the manual installation above.

## Customization

### Styles

Some CSS variables are predefined at the top of Styling. If they meet your needs, prefer adjusting these values first.

```css
:root {
  --ae-card-height: 600px; /* card height */
  --ae-card-width: 80vw; /* card width */
  --ae-card-border-radius: 8px; /* card corner radius */
  --ae-front-bg: #1e1e1e; /* front background */
  --ae-back-bg: #2c2c2c; /* back background */
  --ae-card-border: 1px solid #2c2c2c; /* card border */
}
```

Of course, you can customize more advanced styles such as shadows, animation duration and easing, etc.

### Flip callbacks

Set the following global variable to perform actions on card flip, such as playing a sound.

```js
window.ankiEcoExtCMHooks = {
  onFlipCard: () => {
    console.log('play sound or sth');
  },
};
```

<!--@include: @/parts/feedback-en.md -->
