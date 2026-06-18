---
title: Pixiv 收藏本地下载器（Python）随手记
published: '2026-01-27T21:10:00'
description: 记录我用 Python 把 Pixiv 收藏下载到本地的过程，附上配置说明和一些个人踩坑感受。
image: /blogimg/1769661912955.webp
tags:
  - 工具
  - 折腾记录
  - Python
  - Pixiv
draft: false
lang: zh
---

> 说明：本文仅供个人学习 + 进行本地备份记录，还请遵守 Pixiv 的相关使用条款，不要二次分发。

> **Github项目地址:**
<details>
<summary>点击展开</summary>

`https://github.com/TyrEamon/Pixiv-mylove`

</details>

# 至于这个该工具能做什么？

这是一个 **Pixiv 个人收藏本地下载器（用的Python语言，单线程就不上go了）**，我拿来做本地备份。功能单一，但也挺实用：

- 它能自动下载你的pixiv收藏插画（支持标签筛选）。
- 自动分页抓取`page1`、`page2`。
- 3次的失败重试 + 页间间隔10s，图间1.5s外加随机间隔（避免过快，触发pixiv的风控。至于有没有，我觉得应该是有的）。
- 流程自生成` history_* .json `历史文件，下载中同步写入记录进行去重，避免重复爬取。
- ` history_* .json `是按标签生成独立历史文件，个人收藏根目录下用的是全局去重，它会合并所有的` history_* .json `子历史文件构建全局去重池，所以你`"tag": "留空时"`爬到的插画不会和子标签里的图片重复。
- 命名格式统一：`pixiv_{id}_p{n}.ext`，`p0、p1....`对应的就是父子图。
- 爬过的图，再次获取将直接跳过，当连续跳过 200 张就停止。(你也可以关闭该设置，或增加阈值)

---

# 项目结构一览：

`pixiv_mylove/` 里主要是这几样：
```
pixiv_mylove/
├── main.py                 # 主程序
├── config.json             # 配置文件
├── history_*.json          # 历史记录（去重）
└── run.bat                 # 一键运行脚本（这个我不想调终端，就整了懒人bat）
```

### ` 前置准备： `
> 注意需要自己配置好网络环境，确保与Pixiv的连通性！！！
>> `我个人用的是V2ranyN，直接开启Tun模式。
>> `你也可以自己手动进行相应的配置

- 获取你自己的`Pixiv Cookie/PHPSESSID`、个人`uid`
- 登录你的Pixiv账号，`F12` 开发者面板
![](/blogimg/1769671892275.webp)
- 找到PHPSESSID，里面的值就是我们要的Cookie了
![](/blogimg/1769671929543.webp)
> 接下来进入实操
# 使用步骤
###  ① Clone仓库文件到本地
```bash
git clone https://github.com/TyrEamon/Pixiv-mylove.git
```
### ② 根据你自己的信息修改配置文件 `config.json`
```json
{
  "php_sessid": "你的PHPSESSID",
  "user_id": "你的Pixiv用户ID",
  "tag": "H",
  "limit": 40,
  "max_pages": 0,
  "download_dir": "E:/pixiv图片/h"
}
```
### ③ 直接运行
```bash
python main.py
```
或者直接双击 `run.bat`。

### -正常运行-
![运行状态](/blogimg/1769672990592.webp)

> 拿到图片文件，你可以存在本地或上传到图床。
>> 说到上传你可以原图直传，但你下次获取的时候也是原图，图片体量会非常大（十到几十M）。这里我会用到[Xnconvert](https://www.xnview.com/en/xnconvert/)，它能批量在保证图片质量下给你转成webp。更多详见[文章]()

---

# 配置项说明

- **php_sessid**：Pixiv 登录后 cookie 里的 `PHPSESSID`
- **user_id**：你的 Pixiv 用户 ID
- **tag**：收藏标签，留空=全部收藏
- **limit**：每页抓取数量（默认 40）
- **max_pages**：你要抓取页数（值=0将爬完延续下页轮询爬取）
- **download_dir**：你要保存到本地的目录位置

### 爬图频率与稳定性相关（有需要就自己设置，没有直接默认就行）
- `sleep_between_images_sec`：每张图间隔
- `sleep_between_pages_sec`：每页间隔
- `retry_times`：失败重试次数
- `retry_delay_sec`：重试等待
- `max_consecutive_skips`：连续跳过多少张后自动停止
---

如果你也只是想把收藏图放到本地，
这套目前已经够用了。

# —— 记录完毕 ——
