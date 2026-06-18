---
title: Alist/OpenList 美化教程：自定义头部快速上手（背景/毛玻璃/切换按钮）
published: '2026-02-23T00:00:00'
description: 一篇实用向 OpenList 美化教程：通过自定义头部注入 CSS/JS，实现背景图、毛玻璃面板和日夜切换按钮，重点讲怎么用。
image: /blogimg/openlist-theme-cover.webp
draft: false
lang: zh
---

# Alist/OpenList 美化教程：自定义头部快速上手（背景/毛玻璃/切换按钮）

这篇就写一个简单实用版：用 Alist/OpenList 后台的 **“自定义头部（Customize head）”**，做背景图、毛玻璃和切换按钮。

重点放在怎么使用，优化过程只简单带过。

## 最终效果（这篇能做什么）

1. 白天/夜间模式不同背景图
2. 列表/卡片毛玻璃效果
3. 左下角手动切换按钮
4. 一些细节样式（导航、代码块、底部渐变）

![效果图占位-白天模式](/blogimg/openlist-theme-1.webp)
![效果图占位-夜间模式](/blogimg/openlist-theme-2.webp)

## 使用前准备

你需要准备：

1. 一份主题片段文件（`openlist-Theme.html`）
2. 背景图链接（推荐 4 张）

推荐准备 4 张图，分别对应：

1. 白天横屏
2. 白天竖屏
3. 夜间横屏
4. 夜间竖屏

没有 4 张也没关系，先用 2 张（白天/夜间各一张）也能用。

## 使用方法（重点）

1. 打开 OpenList 后台
2. 进入 `设置 -> 全局 -> 自定义头部（Customize head）`
3. 打开 `openlist-Theme.html`
4. 把里面的背景图 `url("...")` 换成你自己的图片直链
5. 将整份内容复制到 `自定义头部`
6. 保存并刷新页面

## 需要替换的地方（背景图）

在 `<style>` 里主要改这 4 处：

1. `.hope-ui-light` 的横屏背景
2. `.hope-ui-light` 里的竖屏背景（`@media (max-aspect-ratio:1)`）
3. `.hope-ui-dark` 的横屏背景
4. `.hope-ui-dark` 里的竖屏背景（`@media (max-aspect-ratio:1)`）

简单说就是把原来的：

```css
background-image: url("你的图片链接");
```

替换成自己的图床/网盘直链。

## 只想换背景，不想要按钮？

可以。

你只保留 `<style>...</style>` 部分，把按钮相关的 `<script>...</script>` 去掉就行。这样更稳，也更适合只做静态美化。

## 完整代码（可直接复制）

下面这份就是可以直接粘贴到 自定义头部 的版本（记得先把 4 个背景图链接替换成你自己的）。

`GitHub 仓库`（可直接取最新版本）：
> - https://github.com/TyrEamon/openlist-Theme

背景url修改示例（确认格式没问题）：

```html
<script src="https://polyfill.alicdn.com/v3/polyfill.min.js?features=String.prototype.replaceAll"></script>
<style>
.hope-ui-light { /* 白天背景(电脑端&手机端) */ }     /* 日：url.1=横屏 url.2=竖屏 */
.hope-ui-dark  { /* 夜间背景(电脑端&手机端) */ }     /* 夜：url.1=横屏 url.2=竖屏 */
</style>
<script>
// 日夜切换按钮逻辑（已做移动端误触修复）
</script>
```

<details>
<summary>点击展开完整代码（可直接复制）</summary>

```html
<script src="https://polyfill.alicdn.com/v3/polyfill.min.js?features=String.prototype.replaceAll"></script>
<style> .notify-render .hope-close-button {
    display:none
}
.hope-ui-light {
    background-image:url("https://pan.0106010.xyz/file/openlist-Theme/1771838991109_130584045_p0.webp") !important;
    @media (max-aspect-ratio:1) {
        background-image:url("https://pan.0106010.xyz/file/openlist-Theme/1771838999793_file_6179.webp") !important;
    }
    background-repeat:no-repeat;
    background-size:cover;
    background-attachment:fixed;
    background-position-x:center
}
.hope-ui-dark {
     background-image:url("https://pan.0106010.xyz/file/openlist-Theme/1771839006594_openlist1.webp") !important;
    @media (max-aspect-ratio:1) {
        background-image:url("https://pan.0106010.xyz/file/openlist-Theme/1771838992434_1673371139204.webp") !important;
    }
    background-repeat:no-repeat;
    background-size:cover;
    background-attachment:fixed;
    background-position-x:center
}
.hope-ui-light .obj-box.hope-stack.hope-c-dhzjXW.hope-c-PJLV.hope-c-PJLV-igScBhH-css {
    backdrop-filter: blur(1px);
    background-color:rgba(255,255,255,0.7) !important
}
.hope-ui-dark .obj-box.hope-stack.hope-c-dhzjXW.hope-c-PJLV.hope-c-PJLV-iigjoxS-css {
    backdrop-filter: blur(1px);
    background-color:rgb(0 0 0 / 50%) !important
}
.hope-ui-light .hope-c-PJLV.hope-c-PJLV-ikSuVsl-css {
    backdrop-filter: blur(1px);
    background-color:rgba(255,255,255,0.5) !important
}
.hope-ui-dark .hope-c-PJLV.hope-c-PJLV-iiuDLME-css {
    backdrop-filter: blur(1px);
    background-color:rgb(0 0 0 / 50%) !important
}
.hope-ui-light .hope-c-ivMHWx-hZistB-cv.hope-icon-button {
    backdrop-filter: blur(1px);
    background-color:rgba(255,255,255,0.5) !important
}
.hope-ui-dark .hope-c-ivMHWx-hZistB-cv.hope-icon-button {
    backdrop-filter: blur(1px);
    background-color:rgb(0 0 0 / 50%) !important
}
.hope-ui-light .hope-c-PJLV-ijgzmFG-css {
    backdrop-filter: blur(1px);
    background-color:rgba(255,255,255,0.5) !important
}
.hope-ui-dark .hope-c-PJLV-ijgzmFG-css {
    backdrop-filter: blur(1px);
    background-color:rgb(0 0 0 / 50%) !important
}
.hope-ui-light pre {
    background-color:rgba(255,255,255,0.1) !important
}
.hope-ui-dark pre {
    background-color:rgba(255,255,255,0) !important
}
.hope-ui-light .hope-c-PJLV-ieGWMbI-css {
    backdrop-filter: blur(1px);
    background:rgba(255,255,255,0.5) !important
}
.hope-ui-dark .hope-c-PJLV-ieGWMbI-css {
    backdrop-filter: blur(1px);
    background-color:rgb(0 0 0 / 50%) !important
}
.hope-ui-light .hope-c-PJLV-ihVEsOa-css {
    backdrop-filter: blur(1px);
    background:rgba(255,255,255,0.5) !important
}
.hope-ui-dark .hope-c-PJLV-ihVEsOa-css {
    backdrop-filter: blur(1px);
    background-color:rgb(0 0 0 / 50%) !important
}
#root > .header {
    background:linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0))
}
.footerd {
    width: 100vw;
    height: 5vh;
    position: fixed;
    bottom: 0;
    left: 0;
    background:linear-gradient(0deg,rgba(255,255,255,0.3),rgba(255,255,255,0))
}
.hope-ui-light .body > .nav {
    background-color:rgba(255,255,255,0.7);
    border-radius:var(--hope-radii-xl)
}
.hope-ui-dark .body > .nav {
    background-color:rgb(0 0 0 / 50%);
    border-radius:var(--hope-radii-xl)
}
.body > .nav::after {
    display:none
}
dibu {
    border-top:0px;
    position:absolute;
    bottom:0;
    width:100%;
    margin:0px;
    padding:0px
}
.App {
    min-height:85vh
}
.table {
    margin:auto
}
#canvas-basic {
    position:fixed;
    display:block;
    width:100%;
    height:100%;
    top:0;
    right:0;
    bottom:0;
    left:0;
    z-index:-999
}
.hope-image {
    filter:drop-shadow(2px 4px 8px rgb(255,255,255))
}
button#hope-menu-daynight-switch-trigger {
    position: fixed;
    bottom: 7.5vh;
    left: 2.5vw;
    z-index: 114;
    size: var(--hope-sizes-8);
}

/* fallback panel colors when OpenList hash classes change */
.hope-ui-light .obj-box {
    background-color: rgba(255,255,255,0.65) !important;
}
.hope-ui-dark .obj-box {
    background-color: rgb(0 0 0 / 50%) !important;
}
</style>
<script>
    document.write(`<div class="footerd"></div>`);
</script>
<!-- 日夜主题切换按钮 | Day/Night Switch Button -->
<script>
    function unlockScroll() {
        var docEl = document.documentElement;
        var body = document.body;
        if (docEl) {
            docEl.style.overflow = "";
            docEl.style.overflowY = "";
            docEl.style.position = "";
            docEl.style.width = "";
        }
        if (body) {
            body.style.overflow = "";
            body.style.overflowY = "";
            body.style.position = "";
            body.style.width = "";
            body.style.paddingRight = "";
            body.style.touchAction = "";
        }
    }

    function cleanupThemeSwitchUi() {
        if (document.querySelectorAll) {
            var leftovers = document.querySelectorAll(".hope-drawer__overlay, .hope-drawer__content-container, .hope-modal__overlay");
            for (var i = 0; i < leftovers.length; i++) {
                leftovers[i].style.display = "none";
                leftovers[i].style.pointerEvents = "none";
            }
        }

        unlockScroll();
        setTimeout(unlockScroll, 120);
        setTimeout(unlockScroll, 320);
    }

    function getThemeTargets() {
        if (!document.querySelectorAll) return [];
        return document.querySelectorAll(".hope-ui-light, .hope-ui-dark");
    }

    function daynightswitch(e) {
        if (e) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        }

        var targets = getThemeTargets();
        if (!targets.length) return;

        var toDark = false;
        for (var i = 0; i < targets.length; i++) {
            if (targets[i].classList.contains("hope-ui-light")) {
                toDark = true;
                break;
            }
        }

        for (var j = 0; j < targets.length; j++) {
            targets[j].classList.remove("hope-ui-light", "hope-ui-dark");
            targets[j].classList.add(toDark ? "hope-ui-dark" : "hope-ui-light");
        }

        cleanupThemeSwitchUi();
    }

    if (!document.getElementById("hope-menu-daynight-switch-trigger")) {
        document.write(`<button
    class="hope-c-bvjbhC hope-c-PJLV hope-c-PJLV-ieTGfmR-css hope-icon-button hope-button hope-c-ivMHWx hope-c-ivMHWx-kcPQpq-variant-subtle hope-c-ivMHWx-cEknLI-size-lg hope-c-ivMHWx-dvmlqS-cv hope-c-ivMHWx-hZistB-cv hope-c-PJLV hope-c-PJLV-iikaotv-css"
    type="button" role="button" id="hope-menu-daynight-switch-trigger" aria-label="switch layout"><svg t="1733225100292"
        class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4397"
        xmlns:xlink="http://www.w3.org/1999/xlink" width="1em" height="1em">
        <path
            d="M512 0c282.7776 0 512 229.2224 512 512s-229.2224 512-512 512S0 794.7776 0 512 229.2224 0 512 0z m0 51.2a460.8 460.8 0 0 0-13.568 921.3952L512 972.8v-256a204.8 204.8 0 1 0 0-409.6V51.2z m0 256v409.6a204.8 204.8 0 1 1 0-409.6z"
            fill="currentColor" p-id="4398"></path>
    </svg></button>`);
    }

    var dayNightBtn = document.getElementById("hope-menu-daynight-switch-trigger");
    if (dayNightBtn && !dayNightBtn.dataset.bound) {
        dayNightBtn.dataset.bound = "1";
        dayNightBtn.addEventListener("click", daynightswitch, true);
    }

</script>

```
</details>

## 我这次做的优化（简单带过）

我这边在原主题基础上做了几个小优化，主要是为了更好用：

1. 修复切换过程中会给页面加滚动锁导致“不刷新切换后页面不能滚动” 
2. 修复daynightswitch() 在手机端会按索引错误触发“新建文件夹/上传” 按钮
3. 修复白天模式下面板发黑（补 `light/dark` 前缀和兜底样式）
- 问题示意图
> ![问题示意占位图（白天黑面板）](/blogimg/openlist-theme-3.webp)
- 修复后示意图
> ![修复后占位图](/blogimg/openlist-theme-4.webp)

如果你只是拿来用，不需要关心太多实现细节，直接用调好的版本即可。



## 使用建议（推荐）

1. 背景图尽量用 `webp`，加载更快
2. 图片链接尽量走 CDN/图床，避免加载慢
3. 先能用，再慢慢调透明度和模糊值
4. 手机端一定要测按钮点击和滚动
5. OpenList 更新后若样式异常，优先检查 `hope-xxx` 类名是否变化

## 总结

这套 OpenList 美化的使用流程其实很简单：

1. 准备主题片段
2. 替换背景图链接
3. 粘贴到 `自定义头部`
4. 保存刷新

先用起来，再慢慢优化细节就行。

