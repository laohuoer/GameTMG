/**
 * data.js — 魔兽世界扭蛋机 游戏数据配置
 * 所有奖励数据、地图数据、职业配置等均在此定义
 */

// ===================== 稀有度配置 =====================
const RARITY = {
  legendary: { label: '传说', color: '#FF8000', glow: '#FFD700', symbol: '✦', prob: 0.01 },
  epic:      { label: '史诗', color: '#A335EE', glow: '#CC88FF', symbol: '◆', prob: 0.05 },
  rare:      { label: '稀有', color: '#0070DD', glow: '#55AAFF', symbol: '●', prob: 0.20 },
  common:    { label: '普通', color: '#AAAAAA', glow: '#CCCCCC', symbol: '○', prob: 0.74 },
};

// ===================== 职业配置 =====================
const CLASS_CONFIG = {
  warrior:   { label: '战士',   role: 'tank',   color: '#C69B3A', icon: '⚔',  armor: ['plate'], weapons: ['sword', 'axe', 'mace', 'shield', 'greatsword'] },
  paladin:   { label: '圣骑士', role: 'tank',   color: '#F58CBA', icon: '🛡',  armor: ['plate'], weapons: ['sword', 'mace', 'shield', 'greatsword'] },
  deathknight:{ label: '死亡骑士', role: 'tank', color: '#C41F3B', icon: '💀', armor: ['plate'], weapons: ['sword', 'axe', 'greatsword'] },
  priest:    { label: '牧师',   role: 'healer', color: '#FFFFFF', icon: '✝',  armor: ['cloth'], weapons: ['staff', 'wand', 'tome'] },
  druid:     { label: '德鲁伊', role: 'healer', color: '#FF7D0A', icon: '🌿', armor: ['cloth', 'leather'], weapons: ['staff', 'mace'] },
  shaman:    { label: '萨满',   role: 'healer', color: '#0070DE', icon: '⚡', armor: ['leather', 'mail'], weapons: ['mace', 'staff', 'axe'] },
  mage:      { label: '法师',   role: 'dps',    color: '#69CCF0', icon: '🔮', armor: ['cloth'], weapons: ['staff', 'wand', 'tome'] },
  warlock:   { label: '术士',   role: 'dps',    color: '#9482C9', icon: '🕯',  armor: ['cloth'], weapons: ['staff', 'wand', 'tome'] },
  hunter:    { label: '猎人',   role: 'dps',    color: '#ABD473', icon: '🏹', armor: ['leather', 'mail'], weapons: ['bow', 'crossbow', 'gun'] },
  rogue:     { label: '盗贼',   role: 'dps',    color: '#FFF569', icon: '🗡',  armor: ['leather'], weapons: ['dagger', 'sword'] },
};

// ===================== 英雄数据 =====================
const HEROES = [
  // === 传说 ===
  { id: 'h001', name: '阿尔萨斯·米奈希尔', type: 'hero', rarity: 'legendary', class: 'deathknight', region: 'icecrown',
    emoji: '💀', description: '曾经的银月圣骑士王子，后成为巫妖王的代理人，驾驭霜之哀伤横扫一切敌人。',
    stats: { hp: 12000, atk: 850, def: 700, spd: 60 } },
  { id: 'h002', name: '吉安娜·普罗德摩尔', type: 'hero', rarity: 'legendary', class: 'mage', region: 'dalaran',
    emoji: '❄️', description: '达拉然大法师，掌控时空与寒冰魔法，曾是暴风城最强大的法师之一。',
    stats: { hp: 7000, atk: 1200, def: 300, spd: 90 } },
  { id: 'h003', name: '萨尔', type: 'hero', rarity: 'legendary', class: 'shaman', region: 'orgrimmar',
    emoji: '🌊', description: '元素之子，前任部落大酋长，与大地元素沟通，守护艾泽拉斯世界。',
    stats: { hp: 9500, atk: 700, def: 500, spd: 75 } },
  { id: 'h004', name: '伊利丹·怒风', type: 'hero', rarity: 'legendary', class: 'rogue', region: 'outland',
    emoji: '👁', description: '瞎眼猎魔人，背负黑暗力量但誓死守护世界，双持灵魂之刃。',
    stats: { hp: 8000, atk: 1100, def: 400, spd: 100 } },
  { id: 'h005', name: '安度因·乌瑞恩', type: 'hero', rarity: 'legendary', class: 'priest', region: 'stormwind',
    emoji: '👑', description: '暴风城年轻国王，继承圣光之力，在黑暗中为子民燃起希望。',
    stats: { hp: 8500, atk: 500, def: 600, spd: 70, heal: 900 } },

  // === 史诗 ===
  { id: 'h006', name: '瓦里安·乌瑞恩', type: 'hero', rarity: 'epic', class: 'warrior', region: 'stormwind',
    emoji: '🦁', description: '暴风城狮王，双持王者之剑，联盟的精神领袖。',
    stats: { hp: 10000, atk: 800, def: 650, spd: 65 } },
  { id: 'h007', name: '西尔瓦娜斯·风行者', type: 'hero', rarity: 'epic', class: 'hunter', region: 'undercity',
    emoji: '🏹', description: '幽暗城暗影女王，亡灵猎手，射术无双。',
    stats: { hp: 7500, atk: 950, def: 350, spd: 95 } },
  { id: 'h008', name: '卡德加', type: 'hero', rarity: 'epic', class: 'mage', region: 'dalaran',
    emoji: '🔮', description: '麦迪文的学徒，达拉然守护者，传送门魔法大师。',
    stats: { hp: 6500, atk: 1050, def: 280, spd: 85 } },
  { id: 'h009', name: '泰兰德·语风', type: 'hero', rarity: 'epic', class: 'priest', region: 'kalimdor',
    emoji: '🌙', description: '暗夜精灵大祭司，艾露恩月神的使者，同时也是出色的猎手。',
    stats: { hp: 8000, atk: 600, def: 550, spd: 80, heal: 800 } },
  { id: 'h010', name: '玛法里奥·怒风', type: 'hero', rarity: 'epic', class: 'druid', region: 'kalimdor',
    emoji: '🐻', description: '暗夜精灵大德鲁伊，与自然力量融为一体，可变身为强大的熊与猫。',
    stats: { hp: 9000, atk: 650, def: 600, spd: 72, heal: 750 } },

  // === 稀有 ===
  { id: 'h011', name: '穆拉丁·铁炉', type: 'hero', rarity: 'rare', class: 'paladin', region: 'stormwind',
    emoji: '🪓', description: '铁炉堡矮人圣骑士，圣光护盾防御力超强。',
    stats: { hp: 9500, atk: 620, def: 720, spd: 55 } },
  { id: 'h012', name: '布洛克', type: 'hero', rarity: 'rare', class: 'warrior', region: 'orgrimmar',
    emoji: '🔨', description: '部落精锐战士，冲锋陷阵，以一当十。',
    stats: { hp: 8800, atk: 700, def: 600, spd: 60 } },
  { id: 'h013', name: '加鲁什·地狱咆哮', type: 'hero', rarity: 'rare', class: 'warrior', region: 'orgrimmar',
    emoji: '💪', description: '前任部落大酋长，暴怒之力无穷，但被权力腐化。',
    stats: { hp: 10000, atk: 750, def: 580, spd: 58 } },
  { id: 'h014', name: '法力·黑风', type: 'hero', rarity: 'rare', class: 'warlock', region: 'dalaran',
    emoji: '🕯', description: '术士学者，召唤恶魔为傀儡，暗影魔法研究者。',
    stats: { hp: 6200, atk: 880, def: 260, spd: 82 } },
  { id: 'h015', name: '雷克萨', type: 'hero', rarity: 'rare', class: 'hunter', region: 'kalimdor',
    emoji: '🐯', description: '暗夜精灵猎手，与猛虎并肩战斗，弓术精准。',
    stats: { hp: 7000, atk: 820, def: 320, spd: 88 } },

  // === 普通 ===
  { id: 'h016', name: '暴风城卫兵', type: 'hero', rarity: 'common', class: 'warrior', region: 'stormwind',
    emoji: '🛡', description: '忠诚的暴风城守卫，持盾剑守护城门。',
    stats: { hp: 5000, atk: 400, def: 450, spd: 50 } },
  { id: 'h017', name: '奥格瑞玛弓手', type: 'hero', rarity: 'common', class: 'hunter', region: 'orgrimmar',
    emoji: '🏹', description: '部落精锐弓箭手，守卫奥格瑞玛城门。',
    stats: { hp: 4500, atk: 450, def: 280, spd: 72 } },
  { id: 'h018', name: '达拉然学徒', type: 'hero', rarity: 'common', class: 'mage', region: 'dalaran',
    emoji: '📚', description: '勤奋的魔法学院学生，掌握基础火球术。',
    stats: { hp: 3800, atk: 480, def: 200, spd: 78 } },
  { id: 'h019', name: '圣光见习僧', type: 'hero', rarity: 'common', class: 'priest', region: 'stormwind',
    emoji: '✝', description: '刚刚接受圣光洗礼的年轻牧师。',
    stats: { hp: 4200, atk: 280, def: 310, spd: 65, heal: 400 } },
  { id: 'h020', name: '暗影刺客', type: 'hero', rarity: 'common', class: 'rogue', region: 'stormwind',
    emoji: '🗡', description: '暗影组织的新人盗贼，擅长隐身与突袭。',
    stats: { hp: 4000, atk: 520, def: 220, spd: 90 } },
];

// ===================== 武器数据 =====================
const WEAPONS = [
  // === 传说 ===
  { id: 'w001', name: '霜之哀伤', type: 'weapon', rarity: 'legendary', weaponType: 'greatsword',
    emoji: '🗡', class_req: ['deathknight', 'warrior', 'paladin'],
    description: '巫妖王的符文长剑，汲取敌人灵魂，封印无数亡魂之力。',
    stats: { atk: 900, def: 0 } },
  { id: 'w002', name: '暴怒之刃', type: 'weapon', rarity: 'legendary', weaponType: 'sword',
    emoji: '⚔', class_req: ['warrior'],
    description: '传说中的双手战士圣器，挥舞时发出震耳欲聋的轰鸣。',
    stats: { atk: 850, def: 0 } },
  { id: 'w003', name: '塞纳留斯之杖', type: 'weapon', rarity: 'legendary', weaponType: 'staff',
    emoji: '🌿', class_req: ['druid', 'priest', 'shaman'],
    description: '上古自然神塞纳留斯遗留的神圣法杖，蕴含自然的原始力量。',
    stats: { atk: 600, def: 0, heal: 700 } },

  // === 史诗 ===
  { id: 'w004', name: '提尔之锤', type: 'weapon', rarity: 'epic', weaponType: 'mace',
    emoji: '🔨', class_req: ['paladin', 'warrior', 'shaman'],
    description: '正义之神提尔赐予的神圣战锤，对不死生物造成额外伤害。',
    stats: { atk: 700, def: 100 } },
  { id: 'w005', name: '影织长弓', type: 'weapon', rarity: 'epic', weaponType: 'bow',
    emoji: '🏹', class_req: ['hunter'],
    description: '以幽暗之弦编制，箭矢带有暗影毒素。',
    stats: { atk: 750, def: 0 } },
  { id: 'w006', name: '奥术法球', type: 'weapon', rarity: 'epic', weaponType: 'tome',
    emoji: '📕', class_req: ['mage', 'warlock', 'priest'],
    description: '记载高等奥术秘法的古籍，提升施法威力。',
    stats: { atk: 680, def: 0 } },

  // === 稀有 ===
  { id: 'w007', name: '银月长剑', type: 'weapon', rarity: 'rare', weaponType: 'sword',
    emoji: '🌙', class_req: ['warrior', 'paladin', 'rogue', 'deathknight'],
    description: '血精灵铸造的精锐长剑，轻盈锋利。',
    stats: { atk: 500, def: 50 } },
  { id: 'w008', name: '幽灵法杖', type: 'weapon', rarity: 'rare', weaponType: 'staff',
    emoji: '🔮', class_req: ['mage', 'warlock', 'priest', 'druid', 'shaman'],
    description: '凝聚冥界之力的法杖，施法时飘出幽蓝火焰。',
    stats: { atk: 520, def: 0 } },
  { id: 'w009', name: '铁炉战斧', type: 'weapon', rarity: 'rare', weaponType: 'axe',
    emoji: '🪓', class_req: ['warrior', 'shaman', 'deathknight'],
    description: '矮人工匠精锻的双头战斧，砍击力极强。',
    stats: { atk: 560, def: 0 } },
  { id: 'w010', name: '暗影匕首', type: 'weapon', rarity: 'rare', weaponType: 'dagger',
    emoji: '🗡', class_req: ['rogue'],
    description: '施有隐身魔咒的暗影匕首，背刺时伤害翻倍。',
    stats: { atk: 480, def: 0 } },

  // === 普通 ===
  { id: 'w011', name: '新兵铁剑', type: 'weapon', rarity: 'common', weaponType: 'sword',
    emoji: '🔪', class_req: ['warrior', 'paladin', 'rogue', 'deathknight'],
    description: '冒险者的入门武器，简单但耐用。',
    stats: { atk: 200, def: 0 } },
  { id: 'w012', name: '学徒木杖', type: 'weapon', rarity: 'common', weaponType: 'staff',
    emoji: '🪄', class_req: ['mage', 'warlock', 'priest', 'druid', 'shaman'],
    description: '用矮人橡木制成的简单法杖。',
    stats: { atk: 180, def: 0 } },
  { id: 'w013', name: '猎人短弓', type: 'weapon', rarity: 'common', weaponType: 'bow',
    emoji: '🏹', class_req: ['hunter'],
    description: '普通木弓，猎人学徒的第一把武器。',
    stats: { atk: 190, def: 0 } },
];

// ===================== 坐骑数据 =====================
const MOUNTS = [
  { id: 'm001', name: '天霜死龙', type: 'mount', rarity: 'legendary',
    emoji: '🐉', description: '巫妖王的死亡之龙，飞行时带着彻骨寒风，令敌人胆寒。',
    stats: { spd: 50 } },
  { id: 'm002', name: '暴风城狮鹫', type: 'mount', rarity: 'legendary',
    emoji: '🦁', description: '联盟专属的神圣狮鹫，飞行速度极快，翱翔于云端。',
    stats: { spd: 45 } },
  { id: 'm003', name: '幽暗蜘蛛马', type: 'mount', rarity: 'epic',
    emoji: '🕷', description: '幽暗城特有的蜘蛛战马，八条腿奔跑如飞。',
    stats: { spd: 35 } },
  { id: 'm004', name: '奥格瑞玛战狼', type: 'mount', rarity: 'epic',
    emoji: '🐺', description: '部落标志性坐骑，巨大的草原灰狼，忠诚且强壮。',
    stats: { spd: 32 } },
  { id: 'm005', name: '达拉然魔法地毯', type: 'mount', rarity: 'epic',
    emoji: '🪄', description: '由达拉然法师编织的悬浮地毯，静音飞行。',
    stats: { spd: 38 } },
  { id: 'm006', name: '冰霜战马', type: 'mount', rarity: 'rare',
    emoji: '🐴', description: '圣骑士专属的冰霜战马，奔跑时留下冰晶足迹。',
    stats: { spd: 25 } },
  { id: 'm007', name: '荆棘猪', type: 'mount', rarity: 'rare',
    emoji: '🐗', description: '野外驯化的荆棘野猪，皮糙肉厚。',
    stats: { spd: 22 } },
  { id: 'm008', name: '白马', type: 'mount', rarity: 'common',
    emoji: '🐎', description: '暴风城常见的白色驿马，平凡但可靠。',
    stats: { spd: 15 } },
  { id: 'm009', name: '棕色骡子', type: 'mount', rarity: 'common',
    emoji: '🫏', description: '商队运货用的骡子，慢但能装很多东西。',
    stats: { spd: 10 } },
];

// ===================== 宠物数据 =====================
const PETS = [
  { id: 'p001', name: '火焰幼龙', type: 'pet', rarity: 'legendary',
    emoji: '🔥', description: '一只年幼的红龙幼崽，喷吐火焰烧焦一切靠近的敌人。',
    stats: { atk: 200 } },
  { id: 'p002', name: '幽灵猫头鹰', type: 'pet', rarity: 'legendary',
    emoji: '🦉', description: '来自幽冥界的灵异猫头鹰，能预见敌人行动。',
    stats: { def: 150, spd: 20 } },
  { id: 'p003', name: '迷你机械龙', type: 'pet', rarity: 'epic',
    emoji: '🤖', description: '矮人工程师制作的蒸汽机械龙，偶尔会发出齿轮声。',
    stats: { atk: 150 } },
  { id: 'p004', name: '虚空精灵', type: 'pet', rarity: 'epic',
    emoji: '💜', description: '来自虚空的能量体，在主人身边飘动，提升法力。',
    stats: { atk: 120, def: 80 } },
  { id: 'p005', name: '丛林幼虎', type: 'pet', rarity: 'rare',
    emoji: '🐯', description: '从暗矛丛林带回的虎崽，正在成长中。',
    stats: { atk: 100 } },
  { id: 'p006', name: '雪球兔', type: 'pet', rarity: 'rare',
    emoji: '🐰', description: '冰冠冰川的白色雪兔，萌萌哒但偶尔会抓伤人。',
    stats: { spd: 15 } },
  { id: 'p007', name: '蜜蜂侍从', type: 'pet', rarity: 'common',
    emoji: '🐝', description: '银月城花园里驯养的大蜜蜂，勤劳可爱。',
    stats: { spd: 8 } },
  { id: 'p008', name: '小青蛙', type: 'pet', rarity: 'common',
    emoji: '🐸', description: '沼泽地里的普通青蛙，毫无战斗力但很可爱。',
    stats: { hp: 100 } },
];

// ===================== 世界地图区域 =====================
const MAP_REGIONS = [
  {
    id: 'stormwind',
    name: '暴风城',
    subtitle: '人类王国的骄傲',
    description: '艾泽拉斯最雄伟的人类城市，联盟的核心所在。白色城墙与蓝色旗帜彰显人类的荣耀。',
    color: '#4A90D9',
    x: 0.30, y: 0.55, w: 0.12, h: 0.10,
    faction: 'alliance',
    poolItems: ['h001_', 'h006', 'h011', 'h016', 'h019', 'h020', 'h005', 'w001', 'w007', 'w011', 'm008'],
    explored: false,
    emoji: '🏰',
  },
  {
    id: 'orgrimmar',
    name: '奥格瑞玛',
    subtitle: '部落的钢铁意志',
    description: '部落精神图腾，兽人、牛头人与巨魔共同守护的钢铁要塞，矗立于杜隆塔尔赤红荒原。',
    color: '#CC3300',
    x: 0.18, y: 0.35, w: 0.12, h: 0.10,
    faction: 'horde',
    poolItems: ['h003', 'h012', 'h013', 'h017', 'w009', 'w011', 'm004', 'm009'],
    explored: false,
    emoji: '🔴',
  },
  {
    id: 'dalaran',
    name: '达拉然',
    subtitle: '法师之城，悬浮于云端',
    description: '传奇的魔法都市，悬浮于诺森德上空，是全艾泽拉斯最伟大法师的聚集地。',
    color: '#9B59B6',
    x: 0.55, y: 0.25, w: 0.12, h: 0.10,
    faction: 'neutral',
    poolItems: ['h002', 'h008', 'h014', 'h018', 'w003', 'w006', 'w008', 'w012', 'm005', 'p004'],
    explored: false,
    emoji: '🔮',
  },
  {
    id: 'icecrown',
    name: '冰冠冰川',
    subtitle: '巫妖王的领地',
    description: '诺森德北端最险峻的区域，寒冰城堡矗立其中，是巫妖王阿尔萨斯的永久据点。',
    color: '#85C1E9',
    x: 0.65, y: 0.15, w: 0.13, h: 0.10,
    faction: 'scourge',
    poolItems: ['h001', 'h007', 'w001', 'w002', 'm001', 'm006', 'p001', 'p002'],
    explored: false,
    emoji: '❄️',
    isLegendaryPool: true,
  },
  {
    id: 'kalimdor',
    name: '卡利姆多',
    subtitle: '古老大陆的呼唤',
    description: '暗夜精灵的故乡，德鲁伊与自然力量在此交融，塞纳留斯的精神永存于此。',
    color: '#27AE60',
    x: 0.15, y: 0.50, w: 0.13, h: 0.12,
    faction: 'alliance',
    poolItems: ['h009', 'h010', 'h015', 'h017', 'w003', 'w013', 'm007', 'p005', 'p006'],
    explored: false,
    emoji: '🌿',
  },
  {
    id: 'undercity',
    name: '幽暗城',
    subtitle: '亡灵的不死王朝',
    description: '隐藏于洛丹伦旧都地下的不死族都市，幽灵与骷髅守卫着每一条走廊。',
    color: '#6C3483',
    x: 0.42, y: 0.42, w: 0.12, h: 0.10,
    faction: 'horde',
    poolItems: ['h004', 'h007', 'h014', 'w010', 'w012', 'm003', 'p002', 'p003'],
    explored: false,
    emoji: '💀',
  },
];

// ===================== 扭蛋池配置 =====================
const GACHA_POOLS = {
  standard: {
    name: '标准召唤池',
    desc: '包含全部英雄、武器、坐骑与宠物',
    items: [...HEROES, ...WEAPONS, ...MOUNTS, ...PETS],
  },
  region: {
    name: '区域限定池',
    desc: '根据当前选中地图区域限定掉落',
    items: [],  // 动态填充
  },
  limited: {
    name: '限时传说池',
    desc: '传说概率提升至5%，仅含传说品质',
    items: [...HEROES, ...WEAPONS, ...MOUNTS, ...PETS].filter(i => i.rarity === 'legendary' || i.rarity === 'epic'),
  },
};

// ===================== 成就配置 =====================
const ACHIEVEMENTS = [
  { id: 'first_pull', name: '初入江湖', desc: '完成第一次扭蛋', condition: (state) => state.totalPulls >= 1 },
  { id: 'hundred_pulls', name: '百转归来', desc: '累计抽取100次', condition: (state) => state.totalPulls >= 100 },
  { id: 'legendary_collector', name: '传说收藏家', desc: '收集到5个不同传说道具', condition: (state) => {
    const legendaries = new Set(state.inventory.filter(i => i.rarity === 'legendary').map(i => i.id));
    return legendaries.size >= 5;
  }},
  { id: 'full_squad', name: '兵强马壮', desc: '组建一支完整3人小队', condition: (state) => {
    return state.squads.some(sq => sq.tank && sq.healer && sq.dps);
  }},
  { id: 'explorer', name: '冒险先驱', desc: '探索全部6个地图区域', condition: (state) => {
    return state.exploredRegions.length >= MAP_REGIONS.length;
  }},
  { id: 'codex_hero', name: '英雄史诗', desc: '解锁所有英雄图鉴', condition: (state) => {
    const owned = new Set(state.inventory.filter(i => i.type === 'hero').map(i => i.id));
    return HEROES.every(h => owned.has(h.id));
  }},
];

// ===================== 初始游戏状态 =====================
const DEFAULT_STATE = {
  gold: 5000,
  gems: 100,
  tickets: 30,
  totalPulls: 0,
  pityCount: 0,
  softPityStart: 75,
  hardPity: 90,
  currentPool: 'standard',
  currentRegion: null,
  exploredRegions: [],
  inventory: [],
  inventoryMax: 200,
  characters: [],
  squads: [{ id: 1, name: '小队一', tank: null, healer: null, dps: null }],
  activeSquadId: 1,
  unlockedAchievements: [],
  settings: {},
};

// ===================== 导出 =====================
window.GAME_DATA = {
  RARITY,
  CLASS_CONFIG,
  HEROES,
  WEAPONS,
  MOUNTS,
  PETS,
  MAP_REGIONS,
  GACHA_POOLS,
  ACHIEVEMENTS,
  DEFAULT_STATE,
  ALL_ITEMS: [...HEROES, ...WEAPONS, ...MOUNTS, ...PETS],
};
