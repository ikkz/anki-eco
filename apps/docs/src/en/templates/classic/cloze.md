---
title: Cloze
---

# Cloze

Cloze template.

Besides the dedicated cloze template, all other templates can enable the cloze function in settings (effective on the next card).

To use, wrap the text you want to cloze with double curly braces, for example, <span v-pre>`{{text}}`</span>. Multiple clozes and image/formula clozes are also supported.

During review, click the gray box to reveal that cloze answer. You can also enable “Reveal next cloze when clicking outside” in settings (enabled by default) to reveal the next hidden answer by clicking outside.

---

[[toc]]

## How to migrate from Anki's cloze field

Anki's cloze field is formatted as <span v-pre>`{{c1::text}}`</span>, so we can use Find and Replace to transform it to this project's cloze format. Here's the settings:

- Find: <span v-pre>`\{\{c\d+::`</span>
- Replace With: <span v-pre>`{{`</span>
- Select "regular expression"

## Fields

All fields are consistent with the basic template.

## Preview and Download

> If cards take a long time to display in AnkiDroid, try enabling the "New study screen" option. See the [official docs](https://forums.ankiweb.net/t/new-study-screen-official-thread/67394) for details.

> If you download the Markdown template, please see docs: [Markdown support](/templates/classic/#markdown-support)

<ClassicTemplateDemo entry="cloze" />

<!--@include: @/parts/feedback-en.md -->
