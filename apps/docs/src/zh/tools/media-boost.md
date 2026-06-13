---
title: Media Boost
description: 无需等待媒体同步，直接从大型 APKG 导入媒体
---

# Media Boost

当设备 B 已完成笔记同步，但媒体同步速度很慢时，可以使用此工具。它会生成一个临时 APKG，
其中的辅助笔记引用原集合中的所有媒体，使 Anki 直接从本地 APKG 导入缺失媒体。

<MediaBoostTool />

## 注意事项

- 所有处理均在浏览器本地完成，APKG 不会上传到服务器。
- 支持新版和旧版 APKG，输出会保持输入 APKG 的格式版本。
- 导入生成的 APKG 后，请删除 **AnkiEco Media Boost** 牌组。
- 如果本地已有同名但内容不同的媒体，此工具无法修复真实笔记中的引用。
