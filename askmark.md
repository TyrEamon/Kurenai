# 旧博客导航跳转与展开逻辑调查

调查对象：`D:\Fuwari-个人博客\fuwari-main`。

## 相关文件

- `src/config.ts`：导航数据源，`navBarConfig.links` 定义顶栏项目。
- `src/types/config.ts`：`NavBarLink` 类型，支持 `children` 子菜单。
- `src/constants/link-presets.ts`：预设链接，如首页、归档。
- `src/components/Navbar.astro`：桌面端顶栏与手机端菜单按钮入口。
- `src/components/widget/NavMenuPanel.astro`：手机端浮层菜单与折叠展开逻辑。
- `src/layouts/Layout.astro`：全局点击外部关闭浮层逻辑。
- `src/styles/main.css`：`float-panel`、`float-panel-closed`、`btn-plain` 等通用交互样式。

## 数据结构

旧博客把普通链接和下拉链接统一放在 `navBarConfig.links` 里。

```ts
export type NavBarLink = {
  name: string;
  url: string;
  external?: boolean;
  icon?: string;
  description?: string;
  hideInNavMenu?: boolean;
  children?: (NavBarLink | LinkPreset)[];
};
```

本次截图中的两项来自 `src/config.ts`：

```ts
{
  name: "统计",
  url: "https://u.mtcacg.top/share/C8gWpSlbh6hrKEUL",
  external: true,
},
{
  name: "资源",
  url: "#",
  external: false,
  children: [
    { name: "网页导航", url: "https://www.685866.xyz/", external: true },
    { name: "图站", url: "https://b.0106010.xyz", external: true },
    { name: "CFW 面板", url: "https://proxylink.mtcacg.top", external: true },
  ],
}
```

`统计` 是普通外链：点击直接打开 Umami share 页面，新标签打开，并显示外链图标。  
`资源` 是带 `children` 的分组：自身不跳转，桌面端 hover/focus 展开，手机端点击展开。

## 迁移用链接清单

新博客迁移这组导航时，链接值直接按下面填：

| 项目 | URL | 类型 | 备注 |
| --- | --- | --- | --- |
| 统计 | `https://u.mtcacg.top/share/C8gWpSlbh6hrKEUL` | 外链 | Umami 共享统计页，桌面端显示外链图标，新标签打开。 |
| 资源 / 网页导航 | `https://www.685866.xyz/` | 外链 | 常用网站导航与收藏入口。 |
| 资源 / 图站 | `https://b.0106010.xyz` | 外链 | 个人图站 / 图床展示页面。 |
| 资源 / CFW 面板 | `https://proxylink.mtcacg.top` | 外链 | CFW 订阅与代理面板入口。 |

对应结构建议：`统计` 作为普通顶层外链；`资源` 作为顶层分组按钮，`url` 可以继续写 `#` 或在新博客里省略跳转能力，只保留 `children`。

## 桌面端逻辑

桌面端在 `Navbar.astro` 中渲染：

- 外层：`<div class="hidden md:flex items-center space-x-1">`，即 `md` 以上显示。
- 每个链接先经过 `resolveLink`，把 `LinkPreset` 展开成完整 `NavBarLink`。
- 如果链接有可见子项：
  - 渲染成 `.nav-dropdown`。
  - 顶层是 `<button>`，不是 `<a>`，因此点击按钮本身不跳转。
  - 子项放在 `.nav-dropdown-menu > .nav-dropdown-panel` 里。
  - 子项 `<a>` 根据 `external` 决定是否使用原 URL、新标签和外链图标。
- 如果链接没有子项：
  - 直接渲染 `<a>`。
  - `external: true` 时 `target="_blank"`，并显示 `fa6-solid:arrow-up-right-from-square`。

桌面端展开完全靠 CSS：

```css
.nav-dropdown-menu {
  position: absolute;
  left: 0;
  top: 100%;
  padding-top: 0.5rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  pointer-events: none;
  transition: all 0.2s ease;
  z-index: 50;
}

.nav-dropdown:hover .nav-dropdown-menu,
.nav-dropdown:focus-within .nav-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: auto;
}

.nav-dropdown:hover .nav-dropdown-arrow,
.nav-dropdown:focus-within .nav-dropdown-arrow {
  transform: rotate(180deg);
}
```

结论：桌面端不需要 JS 管子菜单展开，hover 和键盘 focus 都能展开；箭头旋转也由 CSS 控制。

## 手机端逻辑

手机端入口在 `Navbar.astro`：

```astro
<button id="nav-menu-switch" class="... md:!hidden">
  <Icon name="material-symbols:menu-rounded" />
</button>
<NavMenuPanel links={links} />
```

按钮点击逻辑：

```js
let menuBtn = document.getElementById("nav-menu-switch");
if (menuBtn) {
  menuBtn.onclick = function () {
    let menuPanel = document.getElementById("nav-menu-panel");
    if (menuPanel) {
      menuPanel.classList.toggle("float-panel-closed");
    }
  };
}
```

`NavMenuPanel.astro` 负责手机浮层内容：

- 浮层根节点：`#nav-menu-panel`。
- 初始类包含 `float-panel float-panel-closed fixed right-4 w-40`。
- 普通链接直接渲染成 `<a>`。
- 带 `children` 的链接渲染为一组：
  - 外层：`[data-mobile-nav-group]`。
  - 触发按钮：`[data-mobile-nav-toggle]`。
  - 子菜单面板：`[data-mobile-nav-panel]`，初始 `hidden`。

手机端子菜单展开靠 JS 事件委托：

```js
menuPanel.addEventListener("click", function (event) {
  var toggle = target.closest("[data-mobile-nav-toggle]");
  if (!toggle || !menuPanel.contains(toggle)) return;

  var group = toggle.closest("[data-mobile-nav-group]");
  var panel = group.querySelector("[data-mobile-nav-panel]");
  var isOpen = !panel.classList.contains("hidden");

  for (var el of menuPanel.querySelectorAll("[data-mobile-nav-group]")) {
    el.querySelector("[data-mobile-nav-panel]").classList.add("hidden");
    el.querySelector("[data-mobile-nav-panel]").classList.remove("flex");
    el.querySelector("[data-mobile-nav-toggle]").setAttribute("aria-expanded", "false");
    el.dataset.open = "false";
  }

  if (!isOpen) {
    panel.classList.remove("hidden");
    panel.classList.add("flex");
    toggle.setAttribute("aria-expanded", "true");
    group.dataset.open = "true";
  }
});
```

关键行为：

- 点击分组按钮时展开或收起。
- 同一时间只允许一个分组展开：打开当前组前会先关闭所有组。
- 用 `aria-expanded` 同步可访问状态。
- 用 `data-open="true"` 驱动箭头旋转：

```css
.mobile-nav-group[data-open="true"] .mobile-nav-group-arrow {
  transform: rotate(180deg);
  color: var(--primary);
}
```

## 浮层打开/关闭

`float-panel` 通用样式在 `src/styles/main.css`：

```css
.float-panel {
  top: 5.25rem;
  border-radius: var(--radius-large);
  overflow: hidden;
  background: var(--float-panel-bg);
  transition: ...;
  box-shadow: ...;
}

.float-panel-closed {
  transform: translateY(-0.25rem);
  opacity: 0;
  pointer-events: none;
}
```

手机菜单的显隐只切换 `float-panel-closed`：

- 有 `float-panel-closed`：隐藏、不可点击。
- 无 `float-panel-closed`：显示、可点击。

点击外部关闭在 `src/layouts/Layout.astro` 的全局脚本里：

```js
function setClickOutsideToClose(panel, ignores) {
  document.addEventListener("click", event => {
    let panelDom = document.getElementById(panel);
    let tDom = event.target;
    if (!(tDom instanceof Node)) return;
    for (let ig of ignores) {
      let ie = document.getElementById(ig);
      if (ie == tDom || ie?.contains(tDom)) return;
    }
    panelDom.classList.add("float-panel-closed");
  });
}

setClickOutsideToClose("nav-menu-panel", ["nav-menu-panel", "nav-menu-switch"]);
```

结论：手机端菜单按钮只负责开关；点击外部关闭是全局统一处理的。

## 跳转规则

旧博客统一用 `external` 字段控制跳转方式：

- `external: true`
  - `href` 使用原始 URL。
  - 桌面端使用 `target="_blank"`。
  - 手机端使用 `target="_blank" rel="noopener noreferrer"`。
  - 显示外链图标。
- `external: false` 或省略
  - `href` 经过 `url(link.url)` 包装。
  - 当前页跳转。
  - 手机端显示右箭头图标。
- 有 `children`
  - 桌面端顶层是按钮，不跳转，只展开。
  - 手机端顶层也是按钮，不跳转，只展开。
  - 子项自己按 `external` 决定跳转方式。

## 给新博客迁移时的注意点

1. 数据层可以沿用 `children` 结构，不要把桌面和手机写成两套菜单数据。
2. 桌面端适合继续用 CSS hover/focus-within 展开，少写 JS，键盘也可用。
3. 手机端应该用按钮展开子菜单，不让带 children 的顶层项目跳 `#`。
4. 手机端每次只展开一个分组，体验比多个分组同时撑开更稳。
5. 外部链接记得统一加 `target="_blank" rel="noopener noreferrer"`。
6. 菜单浮层关闭建议继续用“点击外部关闭”，并把菜单按钮和菜单面板放进 ignore 列表。
7. 新博客如果已有 hamburger 菜单，可复用旧逻辑：按钮切换 panel class，panel 内用事件委托处理 `[data-mobile-nav-toggle]`。
8. 如果新博客使用 Astro view transitions，需要像旧博客一样在页面切换后重新绑定或用只绑定一次的事件委托，避免重复监听。
