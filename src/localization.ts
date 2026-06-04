import type { MoodTag, TemperatureTag, WeatherTag } from "./movie-library";

export const NAV_LABELS = {
  archive: {
    english: "Archive",
    chinese: "档案",
  },
  collections: {
    english: "Collections",
    chinese: "收藏",
  },
} as const;

export const MOOD_LABELS: Record<MoodTag, { english: string; chinese: string }> = {
  relaxed: { english: "Relaxed", chinese: "放松" },
  lonely: { english: "Lonely", chinese: "孤独" },
  healing: { english: "Healing", chinese: "治愈" },
  excited: { english: "Excited", chinese: "兴奋" },
  nostalgic: { english: "Nostalgic", chinese: "怀旧" },
  sad: { english: "Sad", chinese: "悲伤" },
  gloomy: { english: "Gloomy", chinese: "阴郁" },
  romantic: { english: "Romantic", chinese: "浪漫" },
  tense: { english: "Tense", chinese: "紧张" },
};

const WEATHER_LABELS: Record<WeatherTag, string> = {
  clear: "晴朗",
  cloudy: "多云",
  rainy: "有雨",
  foggy: "有雾",
  snowy: "有雪",
  stormy: "雷雨",
};

const TEMPERATURE_LABELS: Record<TemperatureTag, string> = {
  cold: "寒冷",
  cool: "偏凉",
  mild: "温和",
  warm: "温暖",
  hot: "炎热",
};

type MovieChineseCopy = {
  title: string;
  overview: string;
};

const MOVIE_CHINESE_COPY: Record<number, MovieChineseCopy> = {
  843: {
    title: "花样年华",
    overview: "两个孤独的人在潮湿城市里靠近又克制，把未说出口的爱意留在雨声和走廊之间。",
  },
  872: {
    title: "雨中曲",
    overview: "一部雨天也会发光的歌舞片，轻快、明亮，像把坏天气变成一场即兴表演。",
  },
  38: {
    title: "暖暖内含光",
    overview: "一段关于记忆与失去的爱情故事，在冷冽的海边慢慢显影出仍然无法删除的温柔。",
  },
  496243: {
    title: "寄生虫",
    overview: "一场雨把阶层裂缝冲刷得更清楚，黑色幽默逐步滑向锋利而不安的现实寓言。",
  },
  129: {
    title: "千与千寻",
    overview: "女孩误入神灵浴场，在陌生世界里学习勇气、告别与重新找回自己的名字。",
  },
  4935: {
    title: "哈尔的移动城堡",
    overview: "魔法、战争与爱情交织成一场温柔冒险，让受伤的人在漂泊中重新相信自己。",
  },
  150540: {
    title: "头脑特工队",
    overview: "情绪在脑海里展开冒险，提醒我们悲伤也能成为成长里不可缺少的光。",
  },
  508442: {
    title: "心灵奇旅",
    overview: "一个灵魂在爵士与日常之间重新理解生命，发现意义常常藏在最微小的瞬间。",
  },
  354912: {
    title: "寻梦环游记",
    overview: "音乐穿过生死边界，把家族记忆、告别和热爱编织成一场明亮的归途。",
  },
  194: {
    title: "天使爱美丽",
    overview: "一个害羞女孩用细小善意改变周围人的生活，也慢慢走向自己的爱情。",
  },
  120467: {
    title: "布达佩斯大饭店",
    overview: "旧欧洲的优雅、荒诞与失落被包装成一场节奏精密的粉色冒险。",
  },
  13: {
    title: "阿甘正传",
    overview: "一个单纯的人穿过时代浪潮，用奔跑、等待和善良留下温暖的生命轨迹。",
  },
  637: {
    title: "美丽人生",
    overview: "父亲用想象保护孩子，在残酷现实里保存爱、幽默和最后的尊严。",
  },
  424: {
    title: "辛德勒的名单",
    overview: "黑白影像记录战争与救赎，一个人的选择在历史暗处照亮许多生命。",
  },
  12477: {
    title: "萤火虫之墓",
    overview: "兄妹在战火中相依为命，温柔童年被饥饿和失去一点点吞没。",
  },
  376867: {
    title: "月光男孩",
    overview: "一个男孩在孤独、亲密与自我认同之间长大，沉默里藏着柔软的力量。",
  },
  264644: {
    title: "房间",
    overview: "母子从封闭空间走向世界，在创伤之后重新学习自由和生活。",
  },
  807: {
    title: "七宗罪",
    overview: "阴雨城市里，两名警探追踪连环罪案，黑暗一步步逼近无法回头的结局。",
  },
  146233: {
    title: "囚徒",
    overview: "孩子失踪后，绝望父亲和警探各自陷入道德边界模糊的追寻。",
  },
  210577: {
    title: "消失的爱人",
    overview: "婚姻、媒体和谎言互相撕扯，一场失踪案揭开亲密关系的冷酷表演。",
  },
  745: {
    title: "灵异第六感",
    overview: "一个看见亡灵的孩子与心理医生相遇，在恐惧深处触碰未完成的告别。",
  },
  629: {
    title: "非常嫌疑犯",
    overview: "碎片化证词拼出一场犯罪迷局，真相在最后一刻改变所有人的判断。",
  },
  567: {
    title: "后窗",
    overview: "受伤摄影师从窗内窥视邻居生活，悬疑在日常细节中慢慢升温。",
  },
  78: {
    title: "银翼杀手",
    overview: "潮湿霓虹城市里，人造人与追捕者共同追问记忆、身份和生命的重量。",
  },
  335984: {
    title: "银翼杀手2049",
    overview: "孤独复制人在荒凉未来中寻找身世，也寻找自己是否拥有灵魂的答案。",
  },
  1091: {
    title: "怪形",
    overview: "极寒基地被未知生命入侵，信任瓦解成比怪物更可怕的恐惧。",
  },
  694: {
    title: "闪灵",
    overview: "封闭酒店、暴雪和家庭裂痕共同酿成一场缓慢失控的心理恐怖。",
  },
  348: {
    title: "异形",
    overview: "太空船里的黑暗角落孕育未知威胁，生存恐惧被压缩到每一次呼吸。",
  },
  603: {
    title: "黑客帝国",
    overview: "程序员发现现实背后的系统，在赛博世界里选择觉醒、反抗和重生。",
  },
  27205: {
    title: "盗梦空间",
    overview: "梦境层层折叠，记忆与悔恨在一次危险任务里不断改变现实边界。",
  },
  157336: {
    title: "星际穿越",
    overview: "人类穿越星际寻找未来，而爱与时间成为横跨宇宙的隐秘坐标。",
  },
  155: {
    title: "黑暗骑士",
    overview: "城市秩序被混乱挑战，英雄、罪犯与理想主义者都被迫面对代价。",
  },
  24428: {
    title: "复仇者联盟",
    overview: "一群截然不同的英雄被迫并肩作战，把混乱危机变成团队诞生的时刻。",
  },
  299536: {
    title: "复仇者联盟：无限战争",
    overview: "宇宙级威胁逼近，英雄们在宏大战场上面对牺牲、失败和命运的重量。",
  },
  19995: {
    title: "阿凡达",
    overview: "异星雨林展开壮阔生命图景，一个外来者在连接与战争中重新选择归属。",
  },
  85: {
    title: "夺宝奇兵",
    overview: "考古冒险、古老谜团与飞奔追逐交织成一场经典而明快的英雄旅程。",
  },
  105: {
    title: "回到未来",
    overview: "少年意外穿越时间，在改变父母命运的同时努力修正自己的未来。",
  },
  862: {
    title: "玩具总动员",
    overview: "玩具们在主人看不见的世界里经历友情、嫉妒和成长的轻快冒险。",
  },
  585: {
    title: "怪兽电力公司",
    overview: "怪兽世界因一个小女孩被彻底打乱，恐惧最终被笑声和温情取代。",
  },
  10681: {
    title: "机器人总动员",
    overview: "孤独机器人在废土上守护微小希望，并用爱唤醒沉睡的人类未来。",
  },
  120: {
    title: "指环王：护戒使者",
    overview: "一枚戒指开启漫长远征，友情与勇气在黑暗逼近时成为最可靠的火光。",
  },
  121: {
    title: "指环王：双塔奇兵",
    overview: "分散的伙伴各自迎战阴影，中土世界在战争前夜等待信念的考验。",
  },
  122: {
    title: "指环王：王者归来",
    overview: "史诗旅程走向终局，微小者的坚持决定整个世界的黎明。",
  },
  597: {
    title: "泰坦尼克号",
    overview: "巨轮沉没前的短暂爱情，在灾难和阶级裂缝中留下永恒回声。",
  },
  11036: {
    title: "恋恋笔记本",
    overview: "一段跨越岁月的爱情被重新讲述，记忆消退时情感仍然固执留存。",
  },
  313369: {
    title: "爱乐之城",
    overview: "梦想与爱情在洛杉矶的歌舞中相遇，也在现实选择里温柔错过。",
  },
  858: {
    title: "西雅图夜未眠",
    overview: "孤独与浪漫通过电波相连，两个人在城市之间等待命运推近彼此。",
  },
  37165: {
    title: "楚门的世界",
    overview: "一个人的人生被当作节目直播，他在完美布景里寻找真实的出口。",
  },
  98: {
    title: "角斗士",
    overview: "失去一切的将军成为斗士，在竞技场里用复仇和荣誉对抗帝国权力。",
  },
  28: {
    title: "现代启示录",
    overview: "战争把人带入丛林深处，也带入文明与疯狂界限崩塌的黑暗中心。",
  },
  7345: {
    title: "血色将至",
    overview: "石油、信仰和野心在荒凉土地上燃烧，最终凝结成冷酷的美国寓言。",
  },
  641: {
    title: "梦之安魂曲",
    overview: "欲望与成瘾把四个人拖向幻觉深处，梦想逐渐变成无法承受的噩梦。",
  },
  419430: {
    title: "逃出绝命镇",
    overview: "一次拜访变成危险陷阱，日常礼貌背后浮现令人窒息的种族恐怖。",
  },
  1124: {
    title: "致命魔术",
    overview: "两位魔术师的竞争不断升级，执念让舞台奇迹变成残酷代价。",
  },
};

export const getNavDisplay = (key: keyof typeof NAV_LABELS) => NAV_LABELS[key];

export const getMoodDisplay = (mood: MoodTag) => MOOD_LABELS[mood];

export const getMovieChineseCopy = (movieId: number): MovieChineseCopy => {
  return (
    MOVIE_CHINESE_COPY[movieId] || {
      title: "",
      overview: "这部影片与当前天气和心情形成呼应，适合在此刻慢慢观看。",
    }
  );
};

export const formatMovieRating = (rating: number | null | undefined) =>
  typeof rating === "number" ? `TMDB ${rating.toFixed(1)}` : "NR";

export const formatChineseRecommendationSummary = ({
  weatherTag,
  temperatureTag,
  mood,
}: {
  weatherTag: WeatherTag;
  temperatureTag: TemperatureTag;
  mood: MoodTag;
}) =>
  `天气${WEATHER_LABELS[weatherTag]}。体感${TEMPERATURE_LABELS[temperatureTag]}。心情${MOOD_LABELS[mood].chinese}。`;
