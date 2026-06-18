---
title: 近期 v2rayN 与 Xray 兼容性问题记录：allowInsecure 与 TUN
published: '2026-06-04T18:12:00'
description: >-
  复盘近期两类 v2rayN 与 Xray 兼容性问题：旧订阅中的 allowInsecure 让新版 Xray Core 启动失败，以及旧版 Xray
  内核让新版 TUN 无法正常工作。
image: /blogimg/xray-core.webp
category: 开发调优
tags:
  - v2rayN
  - Xray
  - TUN
  - allowInsecure
  - 问题记录
draft: false
lang: zh
---

> 记录时间：2026 年 6 月 4 日  
> 后续版本可能已经修复或调整，阅读时请以当前发布说明为准。

# 起因

最近使用 v2rayN 时，我连续遇到了两类问题。

第一次是 `allowInsecure` 导致 Core 启动失败，第二次是 Xray TUN 网卡只能取得 `169.254.x.x` 地址，进而导致 Codex Remote Control 无法连接。

表面上看，这些问题都发生在 v2rayN 中，很容易让人认为是 v2rayN 本身不稳定。

那么，为什么同一个客户端会在短时间内出现两种看似相反的问题？复盘以后可以发现，v2rayN、代理内核和订阅配置实际上是三套独立更新的组件，问题不能简单归因于其中某一个。

```text
v2rayN：负责界面和配置生成
Xray / sing-box：负责真正建立代理连接
订阅配置：负责提供节点和证书参数
```

只要其中一个没有跟上，最后都可能变成一句很笼统的：

```text
运行 Core 失败，请查看提示信息
```

# 问题一：allowInsecure 导致 Core 启动失败

有些旧节点配置中会出现：

```json
{
  "allowInsecure": true
}
```

它的作用是跳过 TLS 证书验证，虽然可以绕过部分证书问题，但安全风险也很明确。

Xray 在 `v26.2.6` 中移除了这个配置，并将硬性禁用时间延后到 **2026 年 6 月 1 日**。时间一到，旧订阅仍然生成 `allowInsecure` 时，Core 就可能直接启动失败：

```text
The feature "allowInsecure" has been removed
```

v2rayN `7.22.5` 临时恢复了过渡支持，但只持续到 **2026 年 8 月 1 日**，而且发布说明特别强调需要全新下载并覆盖更新。

因此，这只能作为临时过渡方案。长期仍应由服务商修复证书，或提供正确的证书指纹配置。

# 问题二：新版 v2rayN，旧版 Xray TUN

另一件事发生在我排查 Codex 手机远程连接时。

我开启了 v2rayN TUN 模式，系统里也出现了 `xray_tun` 网卡，但它的地址却是：

```text
169.254.x.x
```

这代表网卡虽然创建了，但没有正常初始化。

检查后发现，我的 v2rayN 已经是 `7.22.5`，实际运行的 Xray 仍然是：

```text
Xray 26.3.27
```

而 v2rayN `7.21.3` 的发布说明已经注明，Windows Xray TUN 需要 Xray-core 至少为 `v26.4.17`。

最后我将下面这个文件更新为 Xray `26.6.1`：

```text
D:\v2rayN-windows-64-desktop\v2rayN-windows-64\bin\Xray\xray.exe
```

更新后，TUN 网卡恢复为：

```text
xray_tun: 172.18.0.1/30
```

Codex 的远程连接也随即成功。

# 两类问题的共同原因

这两次问题分别来自两个相反方向的兼容性变化：

```text
第一次：Xray 内核太新，旧订阅配置不兼容
第二次：Xray 内核太旧，新版 TUN 配置不兼容
```

你可能只更新了 v2rayN 界面，没有更新 `bin` 目录里的内核；也可能更新了内核，却还在使用服务商生成的旧订阅配置。

因此，每个组件单独看都可能没有明显异常，但组合后仍然会出现无法使用的情况。

# 实操：如何排查

遇到 Core 启动失败或 TUN 异常时，可以先检查以下信息：

```powershell
<你的 v2rayN 目录>\bin\Xray\xray.exe version

Get-NetIPAddress -InterfaceAlias xray_tun -AddressFamily IPv4
```

然后再确认：

- v2rayN 发布说明是否要求全新下载覆盖更新
- 订阅是否仍然生成 `allowInsecure`
- TUN 网卡是否出现 `169.254.x.x`
- 电脑里是否存在多个 v2rayN 目录，实际运行的并不是刚更新的那个

# 注意事项

`allowInsecure` 的临时兼容不是长期方案，Xray `26.6.1` 也不是永远的标准答案。后续更新时，还是应该先看 v2rayN 和 Xray 当前的发布说明。

# 总结

v2rayN 仍然是一个实用的客户端，但近期 Xray 的安全策略和 TUN 功能变化较快，已经不能只根据 v2rayN 界面中的版本号判断整个运行环境是否正常。

排查时，应分别确认以下三项：

```text
v2rayN 版本
Xray 内核版本
订阅配置版本
```

# 参考资料

- [Xray v26.2.6：移除 allowInsecure](https://github.com/XTLS/Xray-core/releases/tag/v26.2.6)
- [v2rayN Discussion #9460：关于 allowInsecure 的迁移说明](https://github.com/2dust/v2rayN/discussions/9460)
- [v2rayN 7.22.5 发布说明](https://github.com/2dust/v2rayN/releases/tag/7.22.5)
- [v2rayN 7.21.3 发布说明：Windows Xray TUN](https://github.com/2dust/v2rayN/releases/tag/7.21.3)
- [v2rayN Issue #9312：TUN 网卡出现 169 地址](https://github.com/2dust/v2rayN/issues/9312)
