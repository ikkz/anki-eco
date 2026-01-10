---
title: 匹配
---

# 匹配

可拖拽交互的匹配题模板。

> [!TIP]
> 建议在 Anki 的复习设置中禁用所有滑动手势。

---

[[toc]]

## 字段

关于 `items` 字段

- 每行以“分类”开始，后跟两个冒号与该分类的条目分隔
- 同一行中，条目之间使用两个逗号分隔
- 分类与条目都会随机打乱顺序，以增强主动回忆

示例：

```
Mammals::Tiger,,Elephant
Birds::Penguin,,Parrot
Reptiles::Cobra,,Crocodile
```

| 字段名   | 说明                                            |
| -------- | ----------------------------------------------- |
| question | 题干，支持加粗、公式等富文本格式                 |
| items    | 分类与条目，按上述格式填写                       |
| note     | 解析/备注等                                      |

## 预览与下载

> 如果在 AnkiDroid 中遇到卡片延迟很久显示的问题，请尝试打开 “New study screen” 选项，详情参阅 <a href="https://forums.ankiweb.net/t/new-study-screen-official-thread/67394">官方文档</a>

> 如果你下载 Markdown 模板，请查看文档：[Markdown 支持](/zh/templates/classic/#markdown-support)

<ClassicTemplateDemo entry="match" />

<!--@include: @/parts/feedback-zh.md -->
