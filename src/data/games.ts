// 关于页「喜欢的游戏」数据（静态配置）。
// cover：默认用 Steam 竖版库海报 CDN（library_600x900，2:3）。
//   想本地化就把图下到 public/site/games/，把 cover 改成 'site/games/xxx.webp'（http 开头走外链，否则拼 BASE_URL）。
// 想换/加游戏：找到它的 Steam appid，套用下面的 steamCover()/steamStore() 即可。
export interface Game {
  title: string;
  note: string; // 一句话：为什么喜欢 / 平台 / 标签
  cover?: string; // 可选封面；http 外链或相对 BASE_URL
  url?: string; // 可选外链（商店页/官网）
}

const steamCover = (appid: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`;
const steamStore = (appid: number) => `https://store.steampowered.com/app/${appid}/`;

const steam = (title: string, note: string, appid: number): Game => ({
  title,
  note,
  cover: steamCover(appid),
  url: steamStore(appid),
});

export const games: Game[] = [
  steam('Counter-Strike 2', 'FPS · 老 CSGO 玩家的主场', 730),
  steam('杀戮尖塔', 'Roguelike 卡牌 · 爬塔上瘾', 646570),
  steam('杀戮尖塔 2', '续作 · 继续爬', 2868840),
  steam('只狼', '魂系 · 弹反一线天，受苦快感', 814380),
  steam('艾尔登法环', '开放世界魂系 · 受苦也上头', 1245620),
  steam('魔女的夜宴', 'Galgame · YUZUSOFT 名作', 888790),
  steam('猫娘乐园', 'Galgame · 治愈系猫娘日常', 333600),
  steam('火山的女儿', '养成 · 养女儿模拟器', 1669980),
  steam('星露谷物语', '种田治愈 · 摸鱼神器', 413150),
  steam('永劫无间', '武侠吃鸡 · 多人竞技', 1203220),
  steam('绝地求生', '战术竞技 · 大逃杀鼻祖', 578080),
  steam('极限竞速：地平线 4', '竞速 · 英伦开放世界飙车', 1293830),
  steam('虚拟桌宠模拟器', '桌面宠物 · 摸鱼陪伴', 1920960),
  steam('月圆之夜', 'Roguelike 卡牌 · 国产爬塔', 2592550),
];
