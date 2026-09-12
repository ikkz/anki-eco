---
title: Native Cloze
---

# Native Cloze

::: warning Beta
This template is currently in beta. If you run into any issues, please report them on [GitHub Issues](https://github.com/ikkz/anki-eco/issues).
:::

Use Anki's built-in cloze syntax directly — no format conversion needed.

Wrap the text you want to hide with <span v-pre>`{{c1::text}}`</span>. Each cloze number generates a separate card, and the rest of the text stays visible as context.

---

[[toc]]

## Quick Start

Write cloze deletions in the `question` field:

<span v-pre>`The capital of China is {{c1::Beijing}}, and its largest city is {{c2::Shanghai}}.`</span>

This produces two cards:

- **Card 1** — hides all `c1` clozes; `c2` text remains visible.
- **Card 2** — hides all `c2` clozes; `c1` text remains visible.

During review, click a hidden cloze or press `W` to reveal it. Press `Shift` + `Space` to reveal or hide all at once.

## Hints

Add an optional hint as a third segment: <span v-pre>`{{c1::answer::hint}}`</span>.

A yellow hint block will appear in place of the hidden text. Hover it on desktop or tap it on mobile to peek at the hint — the answer stays hidden until you click to reveal.

## Fields

| Field    | Description                                                    |
| -------- | -------------------------------------------------------------- |
| question | The question text. Write your cloze deletions here.            |
| answer   | Additional answer content (displayed on the back of the card). |
| note     | Extra notes, explanations, or references.                      |

## Differences from the Interactive Cloze

This template is a **separate note type** and does not affect the existing [interactive cloze template](/templates/classic/cloze).

|                       | Native Cloze                            | Interactive Cloze            |
| --------------------- | --------------------------------------- | ---------------------------- |
| Syntax                | Anki's <span v-pre>`{{c1::...}}`</span> | <span v-pre>`{{...}}`</span> |
| Cards per note        | One card per cloze number               | Single card                  |
| Image / formula cloze | Not supported                           | Supported                    |

## Preview and Download

<ClassicTemplateDemo entry="cloze_native" />

<!--@include: @/parts/feedback-en.md -->
