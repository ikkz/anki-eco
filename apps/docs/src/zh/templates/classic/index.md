---
title: Classic 模板概览
---

# 概览

## 模板列表

- [多项选择](/zh/templates/classic/mcq)
- [正误题](/zh/templates/classic/tf)
- [基础问答](/zh/templates/classic/basic)
- [匹配](/zh/templates/classic/match)
- [排序](/zh/templates/classic/ordering)
- [填空](/zh/templates/classic/cloze)
- [原生填空](/zh/templates/classic/cloze-native)
- [输入题](/zh/templates/classic/input)

## 模板内嵌配置（Embedding Options）

由于 Anki 不支持在模板内存储数据，模板的偏好设置会存在以下问题：

- 无法在多设备间同步
- 某些客户端重启后偏好可能丢失

解决方法：将设置页里格式化后的模板配置粘贴到模板代码中，对应步骤：

1. 打开 Anki 卡片模板设置（不同平台入口不同，请参考官方文档）。
2. 在该模板的「Front Template」中，粘贴设置页面中显示的已格式化配置到对应位置。

![embed-options](../../../assets/classic/embed-options.png)

<a id="markdown-support"></a>

## Markdown 支持

Classic Templates 3.0 移除了 Markdown 变体，同时下载名称不再包含 `.native` 后缀。如果你需要在自定义卡片模板中渲染 Markdown，请使用 [XMarkdown 扩展](/zh/extension/xmarkdown)。

<!--@include: @/parts/feedback-zh.md -->
