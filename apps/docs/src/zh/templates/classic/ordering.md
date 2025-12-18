---
title: 排序
---

# 排序

拖拽碎片并按正确顺序排列。

> [!TIP]
> 建议在 Anki 的复习设置中禁用所有滑动手势。

---

[[toc]]

## 字段

关于 `items` 字段

- 碎片可用 `,,` 或换行分隔
- 碎片会随机打乱顺序，以增强主动回忆

示例：

```
The quick,,brown,,fox
jumps over,,the lazy dog
```

| 字段名   | 说明                                            |
| -------- | ----------------------------------------------- |
| question | 题干，支持加粗、公式等富文本格式                 |
| items    | 需要排序的碎片                                  |
| note     | 解析/备注等                                      |

## 预览与下载

> 如果你下载 Markdown 模板，请查看文档：[Markdown 支持](/zh/templates/classic/#markdown-support)

<ClassicTemplateDemo entry="ordering" />

<!--@include: @/parts/feedback-zh.md -->
