/// <reference types="mdast" />
// Legacy markdown 兼容层：把旧 Fuwari 文章里的自定义指令转成「新主题」HTML。
// 只产出结构 + data-* 属性；运行时逻辑（fetch / 播放器）集中在 src/components/LegacyEmbeds.astro，
// 以兼容 Astro ClientRouter（每次 astro:page-load 重新增强）。视觉一律走 global.css 的新主题样式。
//
// 支持：
//   ::github{repo="owner/repo"}            → 主题化仓库卡（客户端渐进 fetch）
//   ::music{meting="..."|netease="id"|...} → 主题化音乐播放器（原生 audio + Meting 取数）
//   ::v[d/slug] / ::v[h/slug] / ::vplayer{...} → 主题化视频播放器（Plyr + HLS/DASH，CDN 动态加载）
import { h } from 'hastscript';
import { visit } from 'unist-util-visit';

const GH_MARK =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';

const asString = (v) => (v == null ? '' : String(v).trim());

function extractText(node) {
  if (!node) return '';
  if (typeof node.value === 'string') return node.value;
  if (Array.isArray(node.children)) return node.children.map(extractText).join('');
  return '';
}

/* ----------------------------- ::github ----------------------------- */
function githubCard(attrs) {
  const repo = asString(attrs.repo);
  if (!repo.includes('/')) {
    return h('span', { class: 'legacy-directive-error' }, '::github 需要 repo="owner/repo"');
  }
  const [owner, name] = repo.split('/');
  return h(
    'a',
    {
      class: 'gh-card',
      'data-gh-repo': repo,
      href: `https://github.com/${repo}`,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    [
      h('div', { class: 'gh-card-head' }, [
        h('div', { class: 'gh-card-id' }, [
          h('span', { class: 'gh-card-owner' }, owner),
          h('span', { class: 'gh-card-sep' }, '/'),
          h('span', { class: 'gh-card-repo' }, name),
        ]),
        h('svg', { class: 'gh-card-logo', viewBox: '0 0 16 16', width: 18, height: 18, 'aria-hidden': 'true' }, [
          h('path', { d: GH_MARK }),
        ]),
      ]),
      h('div', { class: 'gh-card-desc', 'data-role': 'desc' }, 'GitHub 仓库'),
      h('div', { class: 'gh-card-meta' }, [
        h('span', { class: 'gh-card-stat', 'data-role': 'stars', hidden: true }, [
          h('span', { class: 'gh-card-ico' }, '★'),
          h('b', {}, '–'),
        ]),
        h('span', { class: 'gh-card-stat', 'data-role': 'forks', hidden: true }, [
          h('span', { class: 'gh-card-ico' }, '⑂'),
          h('b', {}, '–'),
        ]),
        h('span', { class: 'gh-card-stat', 'data-role': 'lang', hidden: true }, [
          h('i', { class: 'gh-card-dot' }),
          h('b', {}, '–'),
        ]),
      ]),
    ],
  );
}

/* ------------------------------ ::music ----------------------------- */
const METING_API = 'https://api.i-meto.com/meting/api';
function shortcutMeting(server, rawValue) {
  const raw = asString(rawValue);
  if (!raw) return '';
  let type = 'song';
  let id = raw;
  if (raw.includes(':')) {
    const [maybeType, ...rest] = raw.split(':');
    const joined = rest.join(':').trim();
    const t = maybeType.trim().toLowerCase();
    if (['song', 'playlist', 'album', 'artist'].includes(t) && joined) {
      type = t;
      id = joined;
    }
  }
  if (!id) return '';
  return `${METING_API}?${new URLSearchParams({ server, type, id }).toString()}`;
}
function resolvePath(value) {
  const v = asString(value);
  if (!v) return '';
  if (/^https?:\/\//.test(v) || v.startsWith('/')) return v;
  return `/${v}`;
}
function musicCard(attrs, children) {
  const metingUrl =
    asString(attrs.meting) ||
    shortcutMeting('netease', attrs.netease) ||
    shortcutMeting('tencent', attrs.qq) ||
    shortcutMeting('kugou', attrs.kugou);
  const title = asString(attrs.title) || (metingUrl ? '加载中…' : '未知曲目');
  const artist = asString(attrs.artist) || (metingUrl ? '' : '未知艺术家');
  const cover = resolvePath(attrs.cover);
  const audio = resolvePath(attrs.audio);
  const lrc = resolvePath(attrs.lrc);
  const inlineLyrics = (Array.isArray(children) ? children : []).map(extractText).join('\n').trim();

  return h(
    'figure',
    {
      class: 'music-card',
      'data-meting': metingUrl,
      'data-lrc': lrc,
      'data-lyrics': inlineLyrics,
      'data-init': '0',
    },
    [
      h('div', { class: 'music-cover', style: cover ? `background-image:url('${cover}')` : '' }),
      h('div', { class: 'music-info' }, [
        h('div', { class: 'music-head' }, [
          h('div', { class: 'music-title' }, title),
          h('div', { class: 'music-artist' }, artist),
        ]),
        h('div', { class: 'music-lyric', 'data-role': 'lyric' }, [
          h('div', { class: 'lyric-exit' }),
          h('div', { class: 'lyric-current' }, '♪'),
        ]),
        h('div', { class: 'music-controls' }, [
          h('button', { class: 'music-play', type: 'button', 'aria-label': '播放 / 暂停' }, [
            h('svg', { class: 'i-play', viewBox: '0 0 24 24', width: 20, height: 20, 'aria-hidden': 'true' }, [
              h('path', { d: 'M8 5v14l11-7z' }),
            ]),
            h(
              'svg',
              { class: 'i-pause', viewBox: '0 0 24 24', width: 20, height: 20, 'aria-hidden': 'true', style: 'display:none' },
              [h('path', { d: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z' })],
            ),
          ]),
          h('div', { class: 'music-progress', 'data-role': 'progress' }, [
            h('div', { class: 'music-progress-bar', 'data-role': 'bar' }),
          ]),
          h('div', { class: 'music-time', 'data-role': 'time' }, '0:00 / 0:00'),
        ]),
      ]),
      h('audio', { class: 'music-audio', src: audio, preload: 'metadata' }),
    ],
  );
}

/* -------------------------------- ::v ------------------------------- */
const DEFAULT_VIDEO_HOST = 'https://v.kaza.de5.net';
const DEFAULT_PLAYER_PATH = '/player.html';
const DEFAULT_ASPECT_RATIO = '16 / 9';
const stripTrailingSlash = (v) => v.replace(/\/+$/, '');
const ensureLeadingSlash = (v) => (!v ? '/' : v.startsWith('/') ? v : `/${v}`);
function normalizeAspectRatio(value) {
  const raw = asString(value);
  if (!raw) return DEFAULT_ASPECT_RATIO;
  const m = raw.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    return a > 0 && b > 0 ? `${a} / ${b}` : DEFAULT_ASPECT_RATIO;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? String(n) : DEFAULT_ASPECT_RATIO;
}
function normalizePlayerType(value) {
  const raw = asString(value).toLowerCase();
  if (raw === 'h' || raw === 'hls') return 'hls';
  if (raw === 'd' || raw === 'dash') return 'dash';
  return '';
}
function normalizeBool(value, fallback = false) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const raw = asString(value).toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
  if (['0', 'false', 'no', 'off'].includes(raw)) return false;
  return fallback;
}
function toAbsoluteUrl(value, host) {
  const raw = asString(value);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  return `${stripTrailingSlash(asString(host) || DEFAULT_VIDEO_HOST)}${ensureLeadingSlash(raw)}`;
}
function parseVideoTargetInput(input) {
  const raw = asString(input);
  if (!raw) return { slug: '', inferredType: '', route: '' };
  const normalized = raw.replace(/^\//, '');
  const m = normalized.match(/^(h|d)\/(.+)$/i);
  if (m) {
    const slug = asString(m[2]);
    const type = m[1].toLowerCase() === 'h' ? 'hls' : 'dash';
    return { slug, inferredType: type, route: `/${m[1].toLowerCase()}/${slug}` };
  }
  if (raw.startsWith('/')) return { slug: '', inferredType: '', route: raw };
  return { slug: raw, inferredType: '', route: '' };
}
function looksLikePlayerPageUrl(value) {
  return /(?:^|\/)player\.html(?:[?#]|$)/i.test(asString(value));
}
function buildStreamConfig(attrs, labelSlug) {
  const host = stripTrailingSlash(asString(attrs.host) || DEFAULT_VIDEO_HOST);
  const target = parseVideoTargetInput(asString(attrs.v || attrs.slug || attrs.id || labelSlug));
  const pathInput = asString(attrs.path || attrs.route || attrs.p);
  const parsedPath = pathInput ? parseVideoTargetInput(pathInput) : null;
  const slug = asString(parsedPath?.slug || target.slug);
  const routePath = asString(parsedPath?.route || target.route || pathInput);
  const type =
    normalizePlayerType(attrs.type || attrs.protocol || attrs.t) ||
    normalizePlayerType(parsedPath?.inferredType) ||
    normalizePlayerType(target.inferredType);
  let explicit = asString(attrs.manifest || attrs.playlist || attrs.m || attrs.src);
  const rawUrl = asString(attrs.url);
  if (!explicit && rawUrl && !looksLikePlayerPageUrl(rawUrl)) explicit = rawUrl;
  const streamUrl = explicit ? toAbsoluteUrl(explicit, host) : routePath ? toAbsoluteUrl(routePath, host) : '';
  const safeSlug = slug ? encodeURIComponent(slug) : '';
  return {
    host,
    slug,
    type,
    streamUrl,
    hlsUrl: safeSlug ? `${host}/h/${safeSlug}` : '',
    dashUrl: safeSlug ? `${host}/d/${safeSlug}` : '',
    catalogUrl: `${host}/catalog.json`,
    preload: asString(attrs.preload) || 'metadata',
    autoplay: normalizeBool(attrs.autoplay, false),
    muted: normalizeBool(attrs.muted, false),
    loop: normalizeBool(attrs.loop, false),
    poster: asString(attrs.poster) ? toAbsoluteUrl(attrs.poster, host) : '',
  };
}
function videoEmbed(attrs, labelText) {
  const ratio = normalizeAspectRatio(attrs.ratio || attrs.aspect);
  const slugLike = asString(attrs.v || attrs.slug || attrs.id || labelText);
  const title = asString(attrs.title) || (slugLike ? `视频 ${slugLike}` : '内嵌视频');

  // iframe 模式：::v{iframe="..."} / mode="iframe"
  const mode = asString(attrs.mode || attrs.render || attrs.kind).toLowerCase();
  const iframeUrl = asString(attrs.iframe || attrs.url);
  const useIframe = mode === 'iframe' || mode === 'page' || asString(attrs.iframe) || looksLikePlayerPageUrl(iframeUrl);
  if (useIframe && iframeUrl) {
    return h('figure', { class: 'video-embed', style: `--video-ratio:${ratio}`, 'data-embed-type': 'iframe' }, [
      h('div', { class: 'video-embed-frame' }, [
        h('iframe', {
          src: iframeUrl,
          title,
          loading: 'lazy',
          allow: 'autoplay; fullscreen; picture-in-picture',
          allowfullscreen: true,
          referrerpolicy: 'no-referrer',
        }),
      ]),
    ]);
  }

  const config = buildStreamConfig(attrs, labelText);
  if (!config.streamUrl && !config.slug) {
    return h('span', { class: 'legacy-directive-error' }, '::v 需要 [d/slug] / [h/slug] 或 manifest=');
  }
  return h(
    'figure',
    { class: 'video-embed', style: `--video-ratio:${ratio}`, 'data-embed-type': 'player' },
    [
      h('div', { class: 'video-embed-frame' }, [
        h(
          'div',
          { class: 'fv-player-root', 'data-config': JSON.stringify({ ...config, title }), 'data-init': '0' },
          [
            h('div', { class: 'fv-player-badge', 'data-role': 'badge', 'data-state': 'loading' }, [
              h('span', { class: 'dot', 'aria-hidden': 'true' }),
              h('span', { 'data-role': 'badge-text' }, 'Loading'),
            ]),
            h('div', { class: 'fv-player-overlay', 'data-role': 'overlay', 'data-hidden': 'false' }, [
              h('div', { class: 'fv-player-message', 'data-role': 'message' }, '加载播放器…'),
            ]),
            h('video', {
              class: 'fv-player-video',
              playsinline: true,
              'webkit-playsinline': 'true',
              preload: config.preload,
              crossorigin: 'anonymous',
              ...(config.poster ? { poster: config.poster } : {}),
              ...(config.autoplay ? { autoplay: true } : {}),
              ...(config.muted ? { muted: true } : {}),
              ...(config.loop ? { loop: true } : {}),
            }),
          ],
        ),
      ]),
    ],
  );
}

/* --------------------------- remark plugin -------------------------- */
const HANDLERS = {
  github: (node) => githubCard(node.attributes || {}),
  music: (node) => musicCard(node.attributes || {}, node.children),
  v: (node) => videoEmbed(node.attributes || {}, extractText({ children: node.children }).trim()),
  vplayer: (node) => videoEmbed(node.attributes || {}, extractText({ children: node.children }).trim()),
};

export default function remarkLegacyDirectives() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return;
      }
      const handler = HANDLERS[node.name];
      if (!handler) return; // 未知指令：保持原样，不报错
      const el = handler(node);
      const data = node.data || (node.data = {});
      data.hName = el.tagName;
      data.hProperties = el.properties;
      data.hChildren = el.children;
    });
  };
}
