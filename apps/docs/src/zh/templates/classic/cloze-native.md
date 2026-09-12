---
title: 原生填空
---

# 原生填空

原生填空模板使用 Anki 的 <span v-pre>`{{c1::文本}}`</span> 语法。每个填空编号生成一张独立卡片，同时保留全文作为上下文。

例如：

<span v-pre>`中国的首都是 {{c1::北京::首都名称}}，政治中心也是 {{c1::北京}}，最大的城市是 {{c2::上海}}。`</span>

这会生成两张卡片。第一张卡片同时隐藏两个 `c1` 填空，第二张卡片隐藏 `c2`。点击隐藏的填空或按 `W` 即可显示答案。

可选的第三段是提示，例如 <span v-pre>`{{c1::答案::提示}}`</span>。桌面端悬停黄色提示块、移动端点击黄色提示块即可查看提示，且不会显示答案。

---

[[toc]]

## 字段

字段与[基础问答模板](/zh/templates/classic/basic)一致，填空语法写在 `question` 字段中。

## 预览与下载

<ClassicTemplateDemo entry="cloze_native" />

该模板使用独立的笔记类型；现有[交互式填空模板](/zh/templates/classic/cloze)保持不变。

<!--@include: @/parts/feedback-zh.md -->
