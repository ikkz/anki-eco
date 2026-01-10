---
title: Multiple Choice
---

# Multiple Choice

- Support hiding options to avoid potential answer hints
- Support single choice and multiple choice.
- Scrambled question options are restored after showing the answer.
- Obvious answer markers.

---

[[toc]]

## Fields

Note: When all options are empty, the template will behave as a basic Q&A template

| Field name  | Description                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| question    | This is the stem of the question. It supports various content formats in Anki, including bold, formulas, etc.                                                                                                                 |
| optionA...F | This is the content of the question options. Options that are not filled in will not be displayed, and various formats are also supported.                                                                                    |
| answer      | This is the answer to the question. For multiple-choice questions, please write the uppercase letter of the correct answer, for example, A. For multiple-choice questions, write all the correct answer letters, such as ABC. |
| note        | You can fill in detailed explanations, notes, etc., here.                                                                                                                                                                     |
| noteA...F   | You can fill in detailed explanations, notes for every option                                                                                                                                                                 |

## Preview and Download

> If cards take a long time to display in AnkiDroid, try enabling the "New study screen" option. See the [official docs](https://forums.ankiweb.net/t/new-study-screen-official-thread/67394) for details.

> If you download the Markdown template, please see docs: [Markdown support](/templates/classic/#markdown-support)

<ClassicTemplateDemo entry="mcq" />

<!--@include: @/parts/feedback-en.md -->
