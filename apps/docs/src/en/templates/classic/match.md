---
title: Match
---

# Match

Drag and drop interactive matching question template.

> [!TIP]
> It is best to disable all swipe gesture controls in Anki's review settings.

---

[[toc]]

## Fields

Notes for `items`

- Each line starts with a category, followed by two colons separating it from the items under that category
- Each item is separated by two commas
- Categories and items are shuffled to enhance active recall

An example:

```
Mammals::Tiger,,Elephant
Birds::Penguin,,Parrot
Reptiles::Cobra,,Crocodile
```

| Field name | Description                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| question   | This is the stem of the question. It supports various content formats in Anki, including bold, formulas, etc. |
| items      | The category and items                                                                                        |
| note       | You can fill in detailed explanations, notes, etc., here.                                                     |

## Preview and Download

> If cards take a long time to display in AnkiDroid, try enabling the "New study screen" option. See the [official docs](https://forums.ankiweb.net/t/new-study-screen-official-thread/67394) for details.

> If you download the Markdown template, please see docs: [Markdown support](/templates/classic/#markdown-support)

<ClassicTemplateDemo entry="match" />

<!--@include: @/parts/feedback-en.md -->
