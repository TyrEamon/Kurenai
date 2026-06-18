// 一次性迁移脚本：旧 Fuwari(RuneByte) → 新站
// 用法：node scripts/migrate-fuwari.mjs  （需先浅克隆旧仓库到 CLONE 路径）
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CLONE = 'D:/Desktop/Claude/_fuwari-tmp';
const DEST = 'D:/Desktop/newblog';
const postsSrc = path.join(CLONE, 'src/content/posts');
const strayFiles = [path.join(CLONE, 'src/content/2026-01-09.md')];
const imgSrc = path.join(CLONE, 'src/content/assets/blogimg');
const imgDest = path.join(DEST, 'public/blogimg');
const postsDest = path.join(DEST, 'src/content/posts');

const SKIP = /^journal-demo/i; // 测试文不迁

fs.mkdirSync(imgDest, { recursive: true });
fs.mkdirSync(postsDest, { recursive: true });

// 1) 图片：改安全名 + 拷贝，建 原名→新名 映射
function sanitize(name) {
  const ext = path.extname(name).toLowerCase();
  let base = path
    .basename(name, path.extname(name))
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!base) base = 'img';
  return base + ext;
}
const imgMap = new Map();
const used = new Set();
if (fs.existsSync(imgSrc)) {
  for (const f of fs.readdirSync(imgSrc)) {
    const full = path.join(imgSrc, f);
    if (!fs.statSync(full).isFile()) continue;
    let nw = sanitize(f);
    if (used.has(nw)) {
      const ext = path.extname(nw);
      const b = path.basename(nw, ext);
      let i = 2;
      while (used.has(`${b}-${i}${ext}`)) i++;
      nw = `${b}-${i}${ext}`;
    }
    used.add(nw);
    imgMap.set(f, nw);
    fs.copyFileSync(full, path.join(imgDest, nw));
  }
}

// 防时区漂移：js-yaml 把无时区时间戳当 UTC；用 UTC getter 还原为 naive 字符串
function toNaive(d) {
  if (!(d instanceof Date)) return d;
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

function normImg(s) {
  if (!s) return s;
  let img = String(s)
    .replace(/(?:\.\.\/)+(?:src\/content\/)?assets\/blogimg\//, '/blogimg/')
    .replace(/^(?:src\/content\/)?assets\/blogimg\//, '/blogimg/');
  const m = img.match(/^\/blogimg\/(.+)$/);
  if (m && imgMap.has(m[1])) img = '/blogimg/' + imgMap.get(m[1]);
  return img;
}

function migrate(file, srcPath) {
  const raw = fs.readFileSync(srcPath, 'utf8');
  const { data, content } = matter(raw);
  if (!data.title || !data.published) {
    console.log('  跳过(无 title/published):', file);
    return false;
  }
  // frontmatter 转换
  delete data.prevTitle;
  delete data.prevSlug;
  delete data.nextTitle;
  delete data.nextSlug;
  data.lang = data.lang === 'en' ? 'en' : 'zh';
  if (data.category === '日志') data.category = '手记';
  if (data.description == null) data.description = '';
  data.published = toNaive(data.published);
  if (data.updated) data.updated = toNaive(data.updated);
  data.image = normImg(data.image);
  if (!data.image) delete data.image;

  // 正文图片路径归一 + 改名 + 清理怪异 token
  let body = content
    .replace(/(?:\.\.\/)+(?:src\/content\/)?assets\/blogimg\//g, '/blogimg/')
    .replace(/(?:src\/content\/)?assets\/blogimg\//g, '/blogimg/')
    .replace(/`#`/g, '');
  for (const [orig, nw] of imgMap) body = body.split('/blogimg/' + orig).join('/blogimg/' + nw);

  const out = matter.stringify(body, data);
  fs.writeFileSync(path.join(postsDest, file), out, 'utf8');
  return true;
}

let n = 0;
for (const f of fs.readdirSync(postsSrc)) {
  if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue;
  if (SKIP.test(f)) {
    console.log('  跳过 demo:', f);
    continue;
  }
  if (migrate(f, path.join(postsSrc, f))) n++;
}
for (const sp of strayFiles) {
  if (fs.existsSync(sp)) {
    if (migrate(path.basename(sp), sp)) n++;
  }
}

console.log(`\n迁移完成：${n} 篇文章，${imgMap.size} 张图片 → public/blogimg/`);
