import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: 'RuneByte · Tyr',
    description: '项目复盘与折腾记录',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      link: `/blog/${post.id}/`,
      customData: `<language>${post.data.lang === 'en' ? 'en' : 'zh-CN'}</language>`,
    })),
  });
}
