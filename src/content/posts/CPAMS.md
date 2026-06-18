---
title: 如何使用CAPMS完全免费调用GPT、Gemini、Claude模型的API，实现Token自由
published: '2026-04-27T00:33:32'
description: >-
  一种低成本接入多模型 API 的思路：用 CPAMS / CLIProxyAPI 将 OAuth 模型通道封装成 OpenAI 兼容接口，让本地 AI
  工具更自由地调用 Gemini、Claude、GPT/Codex 等模型能力。
image: /blogimg/cliproxyapi.png
tags:
  - Claude
  - Gemini
  - Antigravity
  - Chatgpt
  - codex
  - CLIProxyAPI
  - CAMPS
  - AI-api
draft: false
lang: zh
---

::github{repo="router-for-me/CLIProxyAPI"}

<details>
  <summary>点击展开</summary>
  <p>源站：https://github.com/router-for-me/CLIProxyAPI</p>
  <p>镜像站：https://gh.kaza.de5.net/router-for-me/CLIProxyAPI</p>
</details>

---

#  引言
> - 如何使用CPAMS去中转你的codex、Gpt、Gemini、Claude等代理转成个人api，解放token，实现token自由。
> - 想必大家都听说CAPMS这个项目，这里给到一个capms项目的部署教程。
> - 对了，这里我使用的是本地部署。你也可以使用别的大佬打包好的镜像包去部署。
<p>如：

```bash
docker pull routerforme/cliproxyapi:latest
docker pull eceasy/cli-proxy-api:latest
```
```bash
docker run -d \
  --name cli-proxy-api \
  -p 8317:8317 \
  -p 8085:8085 \
  -p 1455:1455 \
  -p 54545:54545 \
  -p 51121:51121 \
  -p 11451:11451 \
  -v cli-proxy-api-data:/data \
  -e DEPLOY=cloud \
  -e PORT=8317 \
  eceasy/cli-proxy-api:latest

```

API 地址：`http://服务器IP:8317/v1`

管理页面：` http://服务器IP:8317/management.html `

---

#  正式开始

### (1)、后端二进制程序下载
- 首先我们去GitHu下载官方release文件
` https://github.com/router-for-me/CLIProxyAPI `
![capms项目](/blogimg/capms项目.webp)

- 选取适合版本的二进制程序包下到本地解压,解压后得到以下文件
![capms解压](/blogimg/capms解压.webp)

### (2)、修改配置文件yaml
注意其中的config.example.yaml，这是他的配置文件，建议修改其中的个人密钥。
```bash

host: ""
# Server port
port: 8317 #如果你8317端口被占用，可以修改为其他端口
  secret-key: "输入你自己的密钥" #用于capms页面（这个页面得自己导入，后面会提到。）得登录，该密钥后续会被进行加密，也没什么。

```
`做好上述准备，先不急运行exe程序。`

---

### (3)、安装前端资源文件

由于此仅仅为CLIProxyAPI 的后端二进制我们要去单独下载他的前端控制台资源：一个html文件。
这里我推荐的是router-for-me大佬的前端资源。
前端资源：https://github.com/router-for-me/Cli-Proxy-API-Management-Center
![capms前端资源](/blogimg/capms前端资源.webp)
下载那个management.html放到解压出来的后端二进制文件目录下。和那个exe同级就行。


---

#  运行程序更改配置
### 4、运行程序
现在我们可以运行程序了，双击或在终端中运行。
```bash
./cli-proxy-api.exe
```
会跳出终端界面，如下：
![capms-cmd](/blogimg/capms-cmd.webp)

无视即可。访问管理页面：http://服务器IP:8317

![capms页面](/blogimg/capms页面.webp)

### 5、更改配置
现在我们可以去配置面板页去更改配置了。
> - (1)`网络配置`
![capms配置1](/blogimg/capms-net.webp)
> - (2)`设置自己的apikey`
![capms配置2](/blogimg/capms-认证.webp)
> - (3)`记得保存`
![capms配置3](/blogimg/capms-保存.webp)

**后面有需求就继续配置内网穿透`ngrok`、`cloudflare-tunnel`等。实现外部访问。不过一般我都在本机进行使用，所以没有这个需求。**

### 接入你的codex、Gemini CLI、Antigravity等的OAuth
Antigravity-model
![Antigravity-model](/blogimg/Antigravity-model.webp)
codex-model
![codex-model](/blogimg/codex-model.webp)
gemini-cli-model
![gemini-cli-model](/blogimg/gemini-cli-model.webp)

---


#  注意事项 

## `**1. 注意**`

> [!WARNING]
> 注意Gemini CLI及Antigravity记得确认你的project 开启了Gemini for Google Cloud的权限。
访问：https://console.cloud.google.com/
确认你的project 开启了Gemini for Google Cloud的权限。
![gemini projest](/blogimg/gemin-projest.webp)
- `1. 点击你的My Frist Project > 确认有项目 > 记下project_id：如（gen-lang-client-0412195766）`
- `2. 点击 APIS AND SERVICES`
- `3. 选择库 > 搜索Gemini for Google Cloud`
![capms-库](/blogimg/库.webp)
- `4. 点击ENABLE`
到此权限问题解决了。

---
## `**2. 注意**`
> [!WARNING]
>OAuth接入之后，Gemini CLI、Antigravity要特殊处理一下。因为它没有提供project_id的参数。会导致连接调用失败，尽管你过了认证。
找到到这个文件，将project_id添加到文件中。
**`"C:\Users\Tyr.Eamon\.cli-proxy-api\antigravity-账号.json"`**
原文件。
```bash
{"access_token":"****","disabled":false,"email":"你的账号@gmail.com","expired":"2026-04-27T00:33:32+08:00","expires_in":3599,"refresh_token":"*******","timestamp":1777217***,"type":"antigravity"}

```
修改后的文件。 
```bash
{"access_token":"****","disabled":false,"email":"你的账号@gmail.com","expired":"2026-04-27T00:33:32+08:00","expires_in":3599,"project_id":"你的project_id","refresh_token":"*******","timestamp":1777217***,"type":"antigravity"}
```
---

## `**3. 注意**`
> [!WARNING]
>还有就是Antigravity可能要你认证。
```json
{
  "error": {
    "code": 403,
    "message": "Verify your account to continue.",
    "status": "PERMISSION_DENIED",
    "details": [
      {
        "reason": "VALIDATION_REQUIRED",
        "domain": "cloudcode-pa.googleapis.com",
        "metadata": {
          "validation_url": "https://accounts.google.com/signin/continue?[REDACTED]" # 点击这个链接进行认证
        }
      }
    ]
  }
}
```
---

#  后记
——理论上——
只要你的号够多，`号池够深够硬`理论上无限token、解放你的token限制。

- 后续我们可以用CCSwith去`统一入口`＋`融断`及`故障转移` 等管理。
