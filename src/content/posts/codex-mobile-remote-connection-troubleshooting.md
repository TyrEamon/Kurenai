---
title: 手机连不上 Codex，最后竟然是 v2rayN 的 TUN 网卡坏了
published: '2026-06-04T18:15:00'
description: >-
  记录一次 Codex 手机远程连接失败的完整排查过程：从 config.toml、WebSocket 超时和系统代理，一路查到 v2rayN 的旧版
  Xray TUN 网卡初始化失败。
image: /blogimg/codexlink.png
category: 开发调优
tags:
  - Codex
  - ChatGPT
  - v2rayN
  - Xray
  - TUN
draft: false
lang: zh
---

> 记录时间：2026 年 6 月 4 日  
> 环境：Windows 11、Codex App、v2rayN 7.22.5、Xray

# 引言

最近 Codex App 支持用手机远程连接电脑。
>  - 官方详情：[Codex Remote Control](https://openai.com/index/work-with-codex-from-anywhere)

结果就是很经典的场景：电脑上的 Codex 明明在线，账号也登录了，手机却怎么都连不上。你是不是也会先怀疑二维码、账号权限，或者 `config.toml` 少了什么开关？

我一开始也是这么想的。

最后一路排查下来，真正的问题和 Codex 配置没有太大关系，而是 v2rayN 的 Xray TUN 网卡虽然显示启动，实际上根本没有正常工作。

这篇文章就把完整过程记录下来。遇到同类问题时，你可以按顺序排查，不用像我一样绕一圈。

# 先说结论

我的问题链路是这样的：

```text
手机无法连接 Codex
→ Codex Remote Control 的 WebSocket 连接超时
→ 普通系统代理没有接住这条直连
→ 需要使用 v2rayN TUN 模式
→ 旧版 Xray 26.3.27 的 TUN 初始化失败
→ xray_tun 只拿到 169.254.x.x 地址
→ 更新 Xray 26.6.1
→ xray_tun 恢复为 172.18.0.1/30
→ Codex 成功连接
```

所以，如果你只想快速解决，可以直接检查两件事：

```powershell
Get-NetIPAddress -InterfaceAlias xray_tun -AddressFamily IPv4

<你的 v2rayN 目录>\bin\Xray\xray.exe version
```

如果 TUN 地址是 `169.254.x.x`，或者 Xray 版本比较旧，那么问题大概率就在这里。

# 原理：为什么系统代理还不够

v2rayN 的“系统代理”和“TUN 模式”解决的不是同一类流量。

系统代理只对主动读取 Windows 代理设置的程序有效。TUN 模式则是在网络层接管流量，即使程序自己没有读取代理设置，也可以被送进代理内核。

Codex 的 Remote Control 需要维持一条 WebSocket 连接。浏览器能访问 ChatGPT，只能证明系统代理可用，不能证明这条 WebSocket 一定会经过代理。

所以这类问题的关键，不是“代理软件有没有打开”，而是“Codex 的实际连接路径有没有被接管”。

# 排查过程

## 1. 从 config.toml 开始，方向其实错了

网上有一种说法，是在 `~/.codex/config.toml` 的 `[features]` 中加入：

```toml
[features]
goals = true
remote_connections = true
remote_control = true
```

不过我实际修改后发现，每次启动 Codex，`remote_control` 都会被自动删除。

继续检查才知道，在我当时使用的 Codex CLI 版本中，`remote_control` 已经被标记为 `removed`。官方的 Remote Connections 使用流程也没有要求手动添加这个配置。

所以这不是解决方案。

如果你能在 Codex App 中看到手机连接入口，就不要继续和这个配置较劲了。它被删掉并不代表远程连接功能坏了。

## 2. Codex 已经注册成功，但连接就是超时

接下来我查看了 Codex 日志。

日志中已经存在远程控制注册信息，说明账号、设备注册和远程控制资格都没有问题。真正失败的是远程控制 WebSocket：

```text
wss://chatgpt.com/backend-api/wham/remote/control/server
os error 10060
```

Windows 的 `10060` 很直白，就是连接超时。

这时问题已经从“Codex 功能有没有打开”，变成了“这条网络连接到底有没有出去”。

## 3. 系统代理能用，不代表 Codex 的连接会走代理

我的 v2rayN 系统代理是：

```text
127.0.0.1:10808
```

通过代理访问 `chatgpt.com` 没有问题，但直接连接 `chatgpt.com:443` 会超时。

可以这样测试：

```powershell
Test-NetConnection chatgpt.com -Port 443

curl.exe --proxy http://127.0.0.1:10808 -I https://chatgpt.com
```

一个直连超时，一个走代理立即返回，差别就出来了。

从 Codex 当前的开源实现中，可以看到 Remote Control 使用 `tokio_tungstenite::connect_async` 建立 WebSocket。结合上面的网络测试，我判断普通“系统代理”没有接住这条连接。

那么怎么办？

需要开启 TUN 模式，让没有主动读取代理设置的程序流量也被接管。

## 4. 开了 TUN，还是不行

我手动打开 v2rayN 的 TUN 模式后，界面看起来没有报错，系统里也出现了 `xray_tun` 网卡。

不过 Codex 还是连不上。

继续检查网卡地址：

```powershell
Get-NetIPAddress -InterfaceAlias xray_tun -AddressFamily IPv4
```

结果是：

```text
169.254.x.x
```

这个地址很关键。

`169.254.0.0/16` 是 Windows 在网卡无法获得正常地址时使用的链路本地自动地址。简单来说，`xray_tun` 虽然创建出来了，但 TUN 初始化失败，没有拿到应该使用的地址，也没有正常生成路由。

所以界面上的“已开启”，并不等于真的能用。

## 5. v2rayN 是新的，Xray 内核却还是旧的

我的 v2rayN 已经是 `7.22.5`，但检查实际运行的 Xray 后发现：

```powershell
<v2rayN 目录>\bin\Xray\xray.exe version
```

输出还是：

```text
Xray 26.3.27
```

这就对上了。

v2rayN `7.21.3` 的发布说明已经写明，Windows Xray TUN 需要 Xray-core 至少达到 `v26.4.17`。v2rayN 的 Issue 中也有人遇到了完全相同的现象：TUN 网卡只有 `169.254.x.x`，更新 Xray 后恢复。

我最后将 Xray 更新到 `26.6.1`。

> 注意：`26.6.1` 在我处理问题时是 pre-release。以后阅读本文时，请优先使用 v2rayN 当前要求的兼容版本，不要永远固定在这个版本。

# 实操：正式解决

## 1. 下载新版 Xray

我使用的是：

[Xray 26.6.1 发布页](https://github.com/XTLS/Xray-core/releases/tag/v26.6.1)

Windows 64 位下载文件：

[Xray-windows-64.zip](https://github.com/XTLS/Xray-core/releases/download/v26.6.1/Xray-windows-64.zip)

当时官方提供的 SHA-256 为：

```text
0A1EE8C8A45E11E865C725DB195429C79B52EE960407065089C5BE586F343248
```

你可以校验一下：

```powershell
Get-FileHash .\Xray-windows-64.zip -Algorithm SHA256
```

## 2. 完全退出 v2rayN

这里不是关闭主窗口，而是在系统托盘中右键 v2rayN，选择“退出”。

如果 `xray.exe` 仍在运行，文件会被占用，替换不会成功。

## 3. 替换 xray.exe

压缩包中需要替换的文件是：

```text
xray.exe
```

通用目标路径：

```text
<你的 v2rayN 目录>\bin\Xray\xray.exe
```

我的实际路径是：

```text
D:\v2rayN-windows-64-desktop\v2rayN-windows-64\bin\Xray\xray.exe
```

替换前建议先备份旧文件，确认新版正常后再删除备份。

## 4. 以管理员身份启动 v2rayN

TUN 模式需要管理员权限。

如果 v2rayN 标题栏显示“以非管理员身份运行”，即使配置中已经打开 TUN，也可能无法创建正常的网卡和路由。

启动后重新检查：

```powershell
Get-NetIPAddress -InterfaceAlias xray_tun -AddressFamily IPv4
Get-NetRoute -InterfaceAlias xray_tun -AddressFamily IPv4
Test-NetConnection chatgpt.com -Port 443
```

修复后，我这里的结果变成了：

```text
xray_tun: 172.18.0.1/30
chatgpt.com:443: 连接成功
出口网卡: xray_tun
```

随后手机端 Codex 立即显示已连接。

# 踩坑

## remote_control 被删除，不是故障

在我当时的 Codex 版本中，`remote_control` 已被标记为移除。不要因为它被自动删除，就一直重复修改 `config.toml`。

先按官方流程确认 Codex App 已更新、账号已登录，并完成多因素认证。

## 系统代理和 TUN 不是一回事

系统代理只对主动读取代理设置的程序有效。

浏览器能访问 ChatGPT，不代表 Codex Remote Control 的 WebSocket 一定能访问。遇到直连超时，就需要检查 TUN、VPN 或透明代理是否真的接管了流量。

## v2rayN 版本不等于 Xray 版本

这是最容易忽略的一点。

v2rayN 是管理界面，Xray 是实际工作的内核。你更新了 v2rayN，不代表 `bin\Xray\xray.exe` 一定同步更新成功。

排障时不要只看 v2rayN 标题栏，还要执行：

```powershell
<v2rayN 目录>\bin\Xray\xray.exe version
```

## 看到 169.254.x.x 就要警惕

如果 TUN 网卡拿到的是 `169.254.x.x`，基本可以直接判断它没有正常初始化。

这时继续调路由规则、节点分流或者 Codex 配置，通常都是在错误方向上努力。

# 最终复盘

这次最绕的地方，是每一层看起来都“差不多正常”：

- Codex 有连接入口
- 手机能扫码
- v2rayN 系统代理能访问 ChatGPT
- TUN 开关也显示启用
- 系统里甚至存在 `xray_tun` 网卡

但真正决定结果的是，那张网卡有没有拿到正常地址，Codex 的 WebSocket 有没有真的从它出去。

所以以后再遇到“某个程序不走代理”的问题，我会先查网络路径，再查应用配置。就这么简单。

# 参考资料

- [Codex Remote Connections 官方文档](https://developers.openai.com/codex/remote-connections)
- [Codex Remote Control WebSocket 实现](https://github.com/openai/codex/blob/main/codex-rs/app-server-transport/src/transport/remote_control/websocket.rs)
- [v2rayN 7.21.3 发布说明](https://github.com/2dust/v2rayN/releases/tag/7.21.3)
- [v2rayN Issue #9312：TUN 网卡出现 169 地址](https://github.com/2dust/v2rayN/issues/9312)
- [v2rayN Issue #9354：新版 TUN 无法工作](https://github.com/2dust/v2rayN/issues/9354)
