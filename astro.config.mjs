// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import rehypeCallouts from 'rehype-callouts';
import remarkDirective from 'remark-directive';
import remarkLegacyDirectives from './src/plugins/remark-legacy-directives.mjs';

// 部署：Cloudflare Pages / Vercel，自定义域名（D-8）。绑定域名后把 site 改成正式域名。
// 根域名部署 → base: '/'（无 GitHub Pages 的 /newblog 前缀）。
export default defineConfig({
  site: 'https://runebyte.pages.dev',
  base: '/',
  integrations: [mdx(), sitemap(), icon()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    // 旧 Fuwari 自定义指令兼容层：remark-directive 解析 ::name{} 语法，
    // remark-legacy-directives 把 ::github/::music/::v 转成新主题 HTML（运行时逻辑在 LegacyEmbeds.astro）。
    remarkPlugins: [remarkDirective, remarkLegacyDirectives],
    // GitHub/Obsidian 风格提示框 [!NOTE]/[!TIP]/[!IMPORTANT]/[!WARNING]/[!CAUTION]
    // 自带主题 CSS 用 .dark 选择器（与本站 [data-theme] 不符），故不引入其 CSS，样式在 global.css 自定义。
    rehypePlugins: [
      [
        rehypeCallouts,
        {
          theme: 'github',
          callouts: {
            note: { title: '笔记' },
            tip: { title: '提示' },
            important: { title: '重要' },
            warning: { title: '警告' },
            caution: { title: '注意' },
          },
        },
      ],
    ],
  },
});
