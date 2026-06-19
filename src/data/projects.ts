// 关于页「个人项目」数据（静态配置；star/fork 需手动更新）。
// 语言色仅作信息点缀（小圆点），不破坏黑白+红基调；新增项目往数组里加即可。
export interface Project {
  name: string;
  description: string;
  lang: string;
  langColor: string;
  stars?: number;
  forks?: number;
  url: string;
}

export const projects: Project[] = [
  {
    name: 'MtcACG-GO',
    description:
      'MtcACG 是一个围绕「收集、整理与展示二次元插画」打造的私有化生态系统。通过 Telegram Bot 从 Pixiv、Yande 等高质量源头采集，自动去重、压缩与存储，最终由 Cloudflare Workers 构建的现代前端优雅呈现——既是你的个人图床，也是对外分享的精美图站。',
    lang: 'Go',
    langColor: '#00ADD8',
    stars: 10,
    forks: 2,
    url: 'https://github.com/TyrEamon/MtcACG-GO',
  },
  {
    name: 'ImageMaster',
    description:
      '基于 Wails + Go + Vue 的本地漫画/图片下载与管理工具，支持多站点链接抓取、本地漫画库、批量解压与简繁统一搜索。',
    lang: 'Go',
    langColor: '#00ADD8',
    stars: 3,
    forks: 1,
    url: 'https://github.com/TyrEamon/ImageMaster',
  },
  {
    name: 'nicechat-bot',
    description:
      'Telegram 个人双向聊天机器人，基于 Cloudflare Workers，支持 AI 过滤、自动封禁、申诉、代笔回复、模型切换和自动联网搜索。',
    lang: 'TypeScript',
    langColor: '#3178C6',
    stars: 2,
    url: 'https://github.com/TyrEamon/nicechat-bot',
  },
  {
    name: 'MtcACG-GO-vue',
    description:
      '二次元图像站前端（Vue 3 + Vite），后端采用 Cloudflare Workers/D1。推荐「同仓库、分开部署」：前端用 Pages，后端用 Workers，各自独立发布。',
    lang: 'Vue',
    langColor: '#41B883',
    url: 'https://github.com/TyrEamon/MtcACG-GO-vue',
  },
  {
    name: 'tyr-blog-img',
    description: '博客背景随机图爬虫后端。',
    lang: 'Go',
    langColor: '#00ADD8',
    stars: 1,
    url: 'https://github.com/TyrEamon/tyr-blog-img',
  },
  {
    name: 'Fuwari-tyr',
    description: 'Fuwari 的二改博客，进行中。',
    lang: 'Astro',
    langColor: '#FF5D01',
    url: 'https://github.com/TyrEamon/Fuwari-tyr',
  },
];
