---
title: 正误题
---

# 正误题

- 支持随机打乱子题顺序；若未启用“显示答案时保持随机顺序”，翻转到答案面后将恢复原顺序。

[[toc]]

## 字段

关于 `items` 字段

- 所有子题应满足格式约束
- 每个子题必须以 “T===” 或 “F===” 开头，分别表示该子题为正确或错误
- 注意确保 “T/F” 后跟随三个或以上的等号
- 键盘快捷键：使用 Alt+1（Mac 上为 Option+1）选择 **正确**，使用 Alt+2（Mac 上为 Option+2）选择 **错误**

| 字段名   | 说明                             |
| -------- | -------------------------------- |
| question | 题干，支持加粗、公式等富文本格式 |
| items    | 子题集合，按上面的格式逐行填写   |
| note     | 解析/备注等                      |

## 预览与下载

> 如果在 AnkiDroid 中遇到卡片延迟很久显示的问题，请尝试打开 “New study screen” 选项，详情参阅 <a href="https://forums.ankiweb.net/t/new-study-screen-official-thread/67394">官方文档</a>

> 如果你下载 Markdown 模板，请查看文档：[Markdown 支持](/zh/templates/classic/#markdown-support)

<ClassicTemplateDemo entry="tf" />

<!--@include: @/parts/feedback-zh.md -->
