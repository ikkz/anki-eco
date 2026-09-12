---
title: Native Cloze
---

# Native Cloze

The native cloze template uses Anki's <span v-pre>`{{c1::text}}`</span> syntax. Each cloze number generates a separate card while retaining the full text as context.

For example:

<span v-pre>`The capital of China is {{c1::Beijing::capital city}}, its political center is also {{c1::Beijing}}, and its largest city is {{c2::Shanghai}}.`</span>

This creates two cards. The first card hides both `c1` clozes, while the second card hides `c2`. Click a hidden cloze or press `W` to reveal it.

The optional third segment is a hint, for example <span v-pre>`{{c1::answer::hint}}`</span>. Hover over its yellow hint block on desktop or tap it on mobile to view the hint without revealing the answer.

---

[[toc]]

## Fields

The fields are the same as in the [basic template](/templates/classic/basic). Cloze syntax belongs in the `question` field.

## Preview and Download

<ClassicTemplateDemo entry="cloze_native" />

This is a separate note type, so the existing [interactive cloze template](/templates/classic/cloze) remains unchanged.

<!--@include: @/parts/feedback-en.md -->
