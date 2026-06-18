import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** 手记板块的分类名（迁移自旧站 category=日志）。 */
export const NOTE_CATEGORY = '手记';
export const isNote = (p: Post) => p.data.category === NOTE_CATEGORY;

/** 随机封面哨兵：image 等于此值的文章，封面运行时从随机图 API 取一张填充
 *  （迁移自旧站 wallpaper-sync 占位逻辑，详见 RandomCover.astro）。 */
export const RANDOM_COVER = '/wallpaper-sync-placeholder.svg';
export const isRandomCover = (image?: string): boolean => image === RANDOM_COVER;

/** pinned 优先，组内保持原有（发布时间倒序）顺序。 */
function pinnedFirst(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
    return 0;
  });
}

/** 全部已发布（文章 + 手记），按发布时间倒序。dev 显示草稿，prod 隐藏。 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) =>
    import.meta.env.PROD ? data.draft !== true : true,
  );
  return posts.sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

/** 长文文章（排除手记）。pinned 置顶，其余按发布时间倒序。 */
export async function getArticles(): Promise<Post[]> {
  return pinnedFirst((await getPublishedPosts()).filter((p) => !isNote(p)));
}

/** 手记（category=手记）。 */
export async function getNotes(): Promise<Post[]> {
  return (await getPublishedPosts()).filter(isNote);
}

/** 精选：pinned 优先，否则最新（仅长文）。 */
export async function getFeaturedPosts(limit = 5): Promise<Post[]> {
  return (await getArticles()).slice(0, limit);
}

/** 全部标签（含计数），按名称排序。默认取全部已发布。 */
export function tagsWithCount(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  posts.forEach((p) => p.data.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hans-CN'));
}

export function getAllTags(posts: Post[]): string[] {
  return tagsWithCount(posts).map((t) => t.tag);
}

/** 按年份分组（归档）。返回 [{ year, posts }] 年份倒序。 */
export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const map = new Map<number, Post[]>();
  posts.forEach((p) => {
    const y = p.data.published.getFullYear();
    (map.get(y) ?? map.set(y, []).get(y)!).push(p);
  });
  return [...map.entries()]
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => b.year - a.year);
}

/** 列表封面 ↔ 文章头图 共享元素形变用的唯一 transition:name。 */
export function coverTransitionName(id: string): string {
  return `cover-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

/** 编辑式日期：MM YYYY */
export function formatMonthYear(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${mm} ${d.getFullYear()}`;
}

/** 手记流日期：MM·DD */
export function formatDayMonth(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}·${dd}`;
}

/** 阅读时长（分钟）。中文按字/300，英文按词/200。 */
export function readingTime(body: string | undefined, lang: 'zh' | 'en' = 'zh'): number {
  if (!body) return 1;
  const chinese = (body.match(/[一-鿿]/g) || []).length;
  const words = body.split(/\s+/).filter(Boolean).length;
  const mins = lang === 'en' ? words / 200 : chinese / 300 + words / 200;
  return Math.max(1, Math.round(mins));
}

/** 字数（中文按字，英文按词）。 */
export function wordCount(body: string | undefined, lang: 'zh' | 'en' = 'zh'): number {
  if (!body) return 0;
  const chinese = (body.match(/[一-鿿]/g) || []).length;
  const words = body.split(/\s+/).filter(Boolean).length;
  return lang === 'en' ? words : chinese + words;
}

/** 1234 → "1.2k" */
export function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}
