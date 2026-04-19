---
title: 项目排序
---

# 项目排序

将输入列表中的子项目随机打乱，并在复习时提供拖拽排列功能。

> [!TIP]
> 建议在 Anki 的复习设置中禁用所有滑动手势。

---

[[toc]]

## 字段

关于 `items` 字段

- 项目之间必须使用 `===` 进行分隔。
- 项目会随机打乱顺序，以增强主动回忆。

示例：

```
苹果
===
香蕉
===
橘子
```

| 字段名   | 说明                             |
| -------- | -------------------------------- |
| question | 题干，支持加粗、公式等富文本格式 |
| items    | 需要排序的项目列表               |
| note     | 解析/备注等                      |

## 预览与下载

> 如果在 AnkiDroid 中遇到卡片延迟很久显示的问题，请尝试打开 “New study screen” 选项，详情参阅 <a target="_blank" href="https://forums.ankiweb.net/t/new-study-screen-official-thread/67394">官方文档</a>

<ClassicTemplateDemo entry="item-ordering" />

<!--@include: @/parts/feedback-zh.md -->
