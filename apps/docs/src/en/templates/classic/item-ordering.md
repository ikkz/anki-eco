---
title: Item Ordering
---

# Item Ordering

Randomly shuffle sub-items from a list and provide drag-and-drop sorting functionality during review.

> [!TIP]
> It is recommended to disable all swipe gestures in Anki's review settings.

---

[[toc]]

## Fields

About the `items` field

- Items must be separated by `===`.
- Items will be randomly shuffled to enhance active recall.

Example:

```
Apple
===
Banana
===
Orange
```

| Field Name | Description                                           |
| ---------- | ----------------------------------------------------- |
| question   | Stem, supports rich text formats like bold, formulas. |
| items      | List of items to be sorted                            |
| note       | Explanation/remarks                                   |

## Preview and Download

> If you encounter issues where cards are significantly delayed before displaying in AnkiDroid, try enabling the "New study screen" option. For more details, refer to the <a target="_blank" href="https://forums.ankiweb.net/t/new-study-screen-official-thread/67394">official documentation</a>.

<ClassicTemplateDemo entry="item-ordering" />

<!--@include: @/parts/feedback-en.md -->
