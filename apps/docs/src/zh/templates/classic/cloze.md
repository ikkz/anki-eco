---
title: 填空
---

# 填空

填空题模板。

除了专用的填空模板外，其他模板也可在设置中启用“填空功能”（在下一张卡片生效）。

使用时，将需要填空的文本用双大括号包裹，例如 <span v-pre>`{{text}}`</span>。支持多个填空，也支持图片/公式填空。

复习时，你可以点击灰色框查看答案，也可以点击框外任意位置查看下一个答案。

---

[[toc]]

## 如何从 Anki 的 cloze 字段迁移

Anki 的 cloze 字段格式为 <span v-pre>`{{c1::text}}`</span>，可以使用“查找与替换”转换为本项目的填空格式。设置如下：

- Find: <span v-pre>`\{\{c\d+::`</span>
- Replace With: <span v-pre>`{{`</span>
- 选择 “正则表达式”

## 字段

与基础问答模板一致。

## 预览与下载

> 如果在 AnkiDroid 中遇到卡片延迟很久显示的问题，请尝试打开 “New study screen” 选项，详情参阅 <a href="https://forums.ankiweb.net/t/new-study-screen-official-thread/67394">官方文档</a>

> 如果你下载 Markdown 模板，请查看文档：[Markdown 支持](/zh/templates/classic/#markdown-support)

<ClassicTemplateDemo entry="cloze" />

<!--@include: @/parts/feedback-zh.md -->
