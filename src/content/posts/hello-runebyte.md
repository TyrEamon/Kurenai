---
title: 新站起航 · RuneByte 重做笔记
published: 2026-06-18T20:00:00
description: 把博客从 Fuwari 模版重做成一套属于自己的暗色编辑式创意站——这是第一篇，聊聊为什么重做、想做成什么样。
image: /covers/cover-hello.svg
tags:
  - 建站
  - 设计
category: 手记
lang: zh
pinned: true
draft: false
---

折腾了好几年的博客，终于决定推倒重做。旧站是基于 **Fuwari** 模版魔改的，功能其实都齐：搜索、评论、标签、友链。问题只有一个——**它一眼就是个模版**。

## 为什么重做

模版的好处是快，坏处是**识别度来自模版，不来自你自己**。我想要的是一种「高级但不失阅读性」的感觉：

- 暗色、黑白、克制；
- 入场有点仪式感；
- 翻页有连续性的转场；
- 但正文，要安静、好读。

> 创意活在「外壳」，克制活在「阅读面」。

## 想做成什么样

参考了几个创意开发者的站（lukebaffait、lucas-aufrere），把它们的「动效 + 排版建立身份」的内核，嫁接到我这台已经跑得不错的博客机器上。

```ts
// 内容模型沿用旧站字段名，迁移近 1:1
const post = {
  title: '…',
  published: new Date(),
  tags: ['建站'],
  lang: 'zh',
};
```

技术栈定在 **Astro + 原生 View Transitions**，部署到边缘。下一篇开始记录具体的复盘。
