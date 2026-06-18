// 修复迁移损坏：CPAMS.md / generalcompute-free-api.md 的正文被折叠进 frontmatter（编号字符键）。
// 从干净的 Fuwari 源重新派生这两篇，套用与 migrate-fuwari.mjs 相同的转换。一次性脚本。
import fs from 'node:fs';
import matter from 'gray-matter';

const SRC_DIR = 'D:/Fuwari-个人博客/fuwari-main/src/content/posts';
const DEST_DIR = 'D:/Desktop/newblog/src/content/posts';

function toNaive(d) {
  if (!(d instanceof Date)) return d;
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}
function normImg(s) {
  if (!s) return s;
  return String(s)
    .replace(/(?:\.\.\/)+(?:src\/content\/)?assets\/blogimg\//, '/blogimg/')
    .replace(/^(?:src\/content\/)?assets\/blogimg\//, '/blogimg/');
}

function fix(file, extra) {
  const raw = fs.readFileSync(`${SRC_DIR}/${file}`, 'utf8');
  const { data, content } = matter(raw);
  delete data.prevTitle; delete data.prevSlug; delete data.nextTitle; delete data.nextSlug;
  data.lang = data.lang === 'en' ? 'en' : 'zh';
  if (data.category === '日志') data.category = '手记';
  if (data.description == null) data.description = '';
  data.published = toNaive(data.published);
  if (data.updated) data.updated = toNaive(data.updated);
  data.image = normImg(data.image);
  if (!data.image) delete data.image;

  let body = content
    .replace(/(?:\.\.\/)+(?:src\/content\/)?assets\/blogimg\//g, '/blogimg/')
    .replace(/(?:src\/content\/)?assets\/blogimg\//g, '/blogimg/')
    .replace(/`#`/g, '');
  // 源文件 frontmatter 关闭后紧跟一个多余的 '---'(水平线)，去掉
  body = body.replace(/^\s*---\s*\n+/, '');
  if (extra) body = extra(body);
  body = '\n' + body.replace(/^\n+/, '');

  const out = matter.stringify(body, data);
  fs.writeFileSync(`${DEST_DIR}/${file}`, out, 'utf8');
  console.log('fixed:', file, '| body chars:', body.length);
}

fix('generalcompute-free-api.md');
// CPAMS：丢弃 Fuwari 专有的 ::github{} 指令（新站无该插件，会渲染成字面量）；其仓库/镜像 URL 保留在紧随其后的 <details> 里
fix('CPAMS.md', (b) => b.replace(/^\s*::github\{[^}]*\}\s*\n/m, ''));

console.log('done');
