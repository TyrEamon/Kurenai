---
title: 用 video-ts 在 Cloudflare Pages / Worker 零成本托管你的视频文件
published: '2026-02-27T16:30:00'
description: 不用自建流媒体服务器，hls/dash静态分片托管到cloudflare在线播放，享受CDN 分发。
image: /blogimg/tittle.webp
tags:
  - video-ts
  - Cloudflare
  - HLS
  - DASH
  - FFmpeg
draft: false
lang: zh
---
`项目仓库地址:`

::github{repo="TyrEamon/video-ts"}

<details>
  <summary>点击展开</summary>
  <p>源站：https://github.com/TyrEamon/video-ts
  <p>镜像站：https://gh.kaza.de5.net/TyrEamon/video-tsp</p>
</details>
---

# 前言
如果你想把视频放进博客，但又不想自建流媒体服务器，那么你可以考虑用强大的FFmpeg工具和video-ts项目。这种“静态分片 + CDN 分发”的方案会非常实用。
核心思路是：
> - 本地用 FFmpeg 处理视频，转码和生成 HLS/DASH 分片文件。
> - `video-ts` 负责整理路由和播放页。
> - 白嫖Cloudflare服务，让大善人负责全球分发和缓存。

后续可以`嵌入` 、`读取`到博客中，直接播放
比如：

```md
::video-ts{url="https://你的域名/_v/001/index.m3u8"}
```
![](/blogimg/img-4.webp)
---

## 1、为什么用 Cloudflare Pages 或 Worker 托管视频
用cloudflare托管我们可以享受它的服务：`我们不用自己搭流媒体服务器`、`自带有 CDN`，跨地区访问更稳。`自带 HTTPS 和自定义域名`，不用自己配置。`可用缓存规则把热分片打到边缘缓存（HIT）`
> - 同时每次提交新文件到 GitHub，Pages 会自动部署新的视频文件。

Pages 和 Worker 的选择：

- 想省事：先用 Pages（静态托管很直接）
- 如果你后面想做更复杂逻辑（鉴权、签名、反代）：再加 Worker

---

## 2、想托管到cf，首先得进行HLS 和 DASH 分片
> Cloudflare Pages 托管静态文件的约束：
> - 单个静态文件最大 25 MiB
> - Free 计划每个站点最多 20,000 个文件

HLS 和 DASH本质就是“把一个大视频切成很多小段 + 一份清单文件”。

- HLS文件：入口文件 `.m3u8`＋多个 `.ts` 或 `.m4s` 分片文件
![HLS 分片文件](/blogimg/hls.webp)
- DASH文件：入口文件 `.mpd`＋多个 `.m4s` 或 `.webm` 分片文件
![DASH 分片文件](/blogimg/dash.webp)

进行播放时，播放器会先读清单，再按顺序拉分片。


---

## 3、分片前要先考虑视频的编码格式。选H.264(AVC) 还是 AV1？兼容性和压缩率怎么选?

- 目前主流上最稳定的视频编码格式是 `H.264`（AVC）。它是最老的视频编码格式，兼容性最强。
- `AV1`：同画质通常更省码率兼并高压缩率、文件更小更省流量，但前提是得设备支持 AV1 解码。

我的建议：
- 博客主力先上 H.264（稳）
- 你有精力再补 AV1 版本（省流量）

---

## 4、工具推荐 FFmpeg（含命令 + 关键参数）
FFmpeg处理视频、音频界的`瑞士军刀`，功能强大，支持几乎所有视频格式。我们的转码和分片都在FFmpeg里进行。

### 4.1 转 AV1（示例）

```bash
ffmpeg -i "input.mp4" -c:v libsvtav1 -crf 30 -preset 6 -pix_fmt yuv420p -c:a libopus -b:a 160k "output-av1.mkv"
```

参数调整：
- `-c:v libsvtav1`：视频编码器用 AV1
- `-crf 30`：质量与体积平衡（越小越清晰，也更大）
- `-preset 6`：编码速度档位（越慢通常压得更好）
- `-pix_fmt yuv420p`：兼容性更稳
- `-c:a libopus -b:a 160k`：音频 Opus 160k

---

### 4.2 切 HLS（`.m3u8 + .ts`）

```bash
ffmpeg -i "input.mp4" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -f hls -hls_time 6 -hls_playlist_type vod -hls_flags independent_segments -hls_segment_filename "public/_v/001/seg_%05d.ts" "public/_v/001/index.m3u8"
```

关键调整：
- `-f hls`：输出 HLS
- `-hls_time 6`：每段大约 6 秒
- `-hls_playlist_type vod`：点播场景
- `-hls_segment_filename`：分片命名模板

---

### 4.3 切 DASH（`.mpd + 分片`）

```bash
ffmpeg -i "input.mp4" -map 0:v:0 -map 0:a:0 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -f dash -seg_duration 4 -use_template 1 -use_timeline 1 "public/_v/001/manifest.mpd"
```

关键调整：
- `-f dash`：输出 DASH
- `-seg_duration 4`：每段约 4 秒
- `-use_template 1 -use_timeline 1`：模板 + 时间线

---

## 5、分片后的`.m3u8`和`.ts`、`.mpd`和`.m4s/webm`文件放,统一放在 `_v` 下

在 `video-ts` 里统一放：

```txt
public/_v/<slug>/
```

比如：

```txt
public/_v/001/index.m3u8
public/_v/001/seg_00000.ts
public/_v/001/manifest.mpd
public/_v/001/chunk-stream0-00001.m4s
```

---


## 6、video-ts的首次部署&日常使用流程（最实用）
- （1）首次部署：
    1. worker 端：
        - 到 cf 控制台，创建一个新的 Worker。
        - 把 `worker.js` 内容复制到 Worker 编辑器。
        - 绑定自定义域名到 Worker。
    2. pages 端：
        - 到 cf 控制台，创建一个新的 Pages 项目。
        - 链接到你的 GitHub 仓库项目
        - 构建命令：`npm run build`
        - 构建输出：public
        - 绑定自定义域名到 Pages。

- （2）日常使用（每次加新视频我就是这四步）：
    1. 把分片放进 `public/_v/<slug>/`
    2. 跑：
```bash
npm run build
```
3. 提交并 push
4. push到远端github仓库，cf pages等会自动部署



---


# 后记

 `_headers` 和 `player.html` 是干嘛的

### `_headers`： Cloudflare 静态响应头配置。
- CORS（跨域播放）
- 缓存策略（清单短缓存、分片长缓存）：`m3u8/mpd`：短缓存、`ts/m4s/webm/mp4`：长缓存 + immutable

###  `player.html`：通用播放器页面，能直接打开 URL 播放。  
引用的js库：
- `video-dev/hls.js`（HLS）
- `Dash-Industry-Forum/dash.js`（DASH）
![](/blogimg/html.webp)
然后博客端直接用：

<details>
  <summary>点我展开</summary>
  <p>/d、/h 指定解码方式
- HLS解码：`https://你的域名/h/<slug>`
- DASH解码：`https://你的域名/d/<slug>`
- 默认入口：`https://你的域名/<slug>`（优先 HLS）</p>
</details>


如果你博客自己已经内置播放器，也可以不走 `player.html`，直接用路由：
- HLS：`/h/<slug>`
- DASH：`/d/<slug>`

---

### Cloudflare 缓存规则建议(看情况加)

如果浏览器缓存命中了，但 `CF-Cache-Status` 还是 `DYNAMIC`。可以到cf的缓存规则里加 Cache Rules。

1. 分片规则（长缓存）
- 匹配：`/_v/*` 下的 `m4s/ts/webm/mp4`
- 动作：`Eligible for cache`
- Edge TTL：1 个月或 1 年

2. 清单规则（短缓存）
- 匹配：`/_v/*` 下的 `m3u8/mpd`
- 动作：`Eligible for cache`
- Edge TTL：5 分钟

这样基本就能从 `DYNAMIC` 变成 `MISS/HIT` 了。

---

`video-ts` 这套就是“轻后端视频托管”：  
**FFmpeg 负责处理，Cloudflare 负责分发，博客负责展示**

## `--到此本文结束--`
