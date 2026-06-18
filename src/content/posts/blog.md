---
title: 踩着前人的脚印，RuneByte Blog 终于建站成功了
published: '2026-01-27T20:30:00'
description: 记录我从 fork 到上线的个人博客搭建过程，展示成果、简单部署流程和致谢清单。
image: /blogimg/1769529932865.webp
tags:
  - 搭建记录
  - 个人博客
draft: false
lang: zh
---

> 说明：本博客基于开源项目进行二次改造与使用，感谢原作者和相关项目的贡献。本文是我的建站记录与成果分享。

## 1) 终于有自己的博客了

踩着前人的脚印折腾了一阵子，**RuneByte Blog** 总算上线了。  
站点入口在这里：  
👉 **https://i.kyr.us.ci**

作为编程小白，这次建站从“能跑起来”到“像自己的网站”，看到它跑起来挺有成就感。


# 我就微微带过一下我的搭建过程（博客主框架Fuwari）

也没什么特别值得详谈的东西。
## 首先
- fork 原作者项目 
>这里`原作者[saicaca]`的[`Fuwari`](https://github.com/saicaca/fuwari)、作者`二叉树树[afoim]`二改过[`Fuwari`](https://github.com/afoim/fuwari)
 >>  我本人用的是[以fuwari为底的新一代博客](https://github.com/Spr-Aachen/Twilight)
- 先在自己本地跑起来，方便调试改动。
```bash
pnpm install #如果没有项目依赖包的话
pnpm dev

```  
开放4321端口，本地预览 http://localhost:4321
> 修改配置（把个人信息换过来）>删除旧文章>去广告把分类页标签加回来>改脚注>加功能，花了一点时间。
- 然后正常流程：部署上线给它扔到edgeone上 + 绑定自定义域名。
- 浏览器访问，成功返回博客页面ok了，博客到这里旧通了。  

>> EdgeOne的线路说是国内挺快的(但是要得是备案域名，可惜我的域名还没备案)，看看后面吧！要不要给它整一个备案。目前就这样吧，先建着站玩玩先。
![itdog 结果](/blogimg/1769621915743.webp)

- 还过得去，后面再研究研究优化一下。
---

# —— 这是我的第一篇，继续更新中 ——
