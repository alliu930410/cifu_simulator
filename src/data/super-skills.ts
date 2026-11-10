export type SkillCategory = "物理" | "法术" | "生存";

export type SuperSkill = {
  id: string;
  name: string;
  iconId: string;
  category: SkillCategory;
  effect: string;
};

export function skillIconUrl(iconId: string) {
  return `/assets/skillicon/${iconId}.gif`;
}

export function petIconUrl(petId: string) {
  return `/assets/peticon/${petId}.png`;
}

/** Super skills extracted from https://mhxy.uk/tools/pet 技能库 */
export const SUPER_SKILLS: SuperSkill[] = [
  { id: "ye-zhan", name: "超级夜战", iconId: "55401", category: "物理", effect: "造成物理伤害提高10%；夜间物理伤害效果不会减少，物理躲避能力增加20%，且在攻击时显示目标的气血条。" },
  { id: "fan-ji", name: "超级反击", iconId: "55402", category: "物理", effect: "受普通物理攻击后30%几率反击；在场时主人首次被敌方物理攻击时，必定反击。" },
  { id: "fan-zhen", name: "超级反震", iconId: "55403", category: "物理", effect: "受到物理攻击时30%反震对方，反震伤害为所受伤害的60%；避免被敌人连击。" },
  { id: "xi-xue", name: "超级吸血", iconId: "55404", category: "物理", effect: "物理攻击时获得对方损失气血的30%；溢出气血的50%转化为护盾。攻击鬼魂无效。" },
  { id: "lian-ji", name: "超级连击", iconId: "55405", category: "物理", effect: "普通攻击时55%几率攻击2次，触发连击时有15%几率额外攻击1次；物理伤害降低20%。无法连击有反震的敌人。" },
  { id: "fei-xing", name: "超级飞行", iconId: "55406", category: "物理", effect: "物理命中增加20%；物理躲避提高30%；躲避率提高10%；天气为风时物理伤害提升20%。" },
  { id: "yin-shen", name: "超级隐身", iconId: "55407", category: "生存", effect: "进入战斗后获得修罗隐身3~5回合；隐身时不会被攻击；物理攻击降低10%；受到伤害也降低10%；隐身时不能施法。" },
  { id: "gan-zhi", name: "超级感知", iconId: "55408", category: "生存", effect: "可攻击修罗隐身、楚楚可怜之敌；物理躲避提高10%；在场时主人也获得感知，最多5回合。" },
  { id: "zai-sheng", name: "超级再生", iconId: "55409", category: "生存", effect: "每回合恢复自身等级×1的气血；有10%几率回复自身等级×12的气血。" },
  { id: "ming-si", name: "超级冥思", iconId: "55410", category: "生存", effect: "每回合恢复自身等级/2的魔法；在场时主人获得冥思，最多5回合。" },
  { id: "qu-gui", name: "超级驱鬼", iconId: "55413", category: "生存", effect: "对鬼魂之敌物法伤害增加100%；可将鬼魂击飞使其不能复活；双方场上鬼魂单位伤害降低20%。" },
  { id: "du", name: "超级毒", iconId: "55414", category: "物理", effect: "自身对毒免疫；物理攻击后20%几率使敌人中毒，并随机降低中毒目标的攻击、防御、法伤或法防。" },
  { id: "hui-gen", name: "超级慧根", iconId: "55415", category: "法术", effect: "用法术消耗魔法降为50%，且有15%几率不消耗魔法。" },
  { id: "bi-sha", name: "超级必杀", iconId: "55416", category: "物理", effect: "物理必杀几率增加20%；必杀时有25%几率造成3-4倍必杀伤害。" },
  { id: "xing-yun", name: "超级幸运", iconId: "55417", category: "生存", effect: "受到的物法暴击倍率降低50%；且有5%概率免疫受到的攻击。" },
  { id: "jing-shen", name: "超级精神集中", iconId: "55418", category: "生存", effect: "抵御封类异常，躲避力提高10%，物理攻击降低20%；受到的伤害随机降低1%~10%。" },
  { id: "shen-ji", name: "超级神迹", iconId: "55419", category: "生存", effect: "不受除日月乾坤外的异常状态影响；回合结束时若主人倒地，尝试复活并解封后自己离场。" },
  { id: "zhao-jia", name: "超级招架", iconId: "55420", category: "生存", effect: "每回合第一次物理伤害减免20%；进战斗时获得一层金身。" },
  { id: "yong-heng", name: "超级永恒", iconId: "55421", category: "生存", effect: "主动法术：消耗全部魔法，回合结束时气血魔法回复至使用时状态，冷却150回合；辅助法术持续回合增加100%，最多+6。" },
  { id: "min-jie", name: "超级敏捷", iconId: "55422", category: "物理", effect: "速度增加20%；5%概率额外行动一次。" },
  { id: "fou-ding", name: "超级否定信仰", iconId: "55423", category: "生存", effect: "不受一切异常和增益影响；其它超级技能失效，且每个超级技能提高气血与伤害、降低双防。" },
  { id: "mo-zhi-xin", name: "超级魔之心", iconId: "55424", category: "法术", effect: "法术伤害效果提高25%。" },
  { id: "tou-xi", name: "超级偷袭", iconId: "55425", category: "物理", effect: "避免被反击和反震；物理伤害效果提升15%。" },
  { id: "ben-lei", name: "超级奔雷咒", iconId: "55426", category: "法术", effect: "超级雷属性群体法术；对主目标伤害提高10%，25%附弱点雷两回合。最多3人。" },
  { id: "tai-shan", name: "超级泰山压顶", iconId: "55427", category: "法术", effect: "超级土属性群体法术；对主目标伤害提高10%，25%附弱点土两回合。最多3人。" },
  { id: "shui-man", name: "超级水漫金山", iconId: "55428", category: "法术", effect: "超级水属性群体法术；对主目标伤害提高10%，25%附弱点水两回合。最多3人。" },
  { id: "di-yu", name: "超级地狱烈火", iconId: "55429", category: "法术", effect: "超级火属性群体法术；对主目标伤害提高10%，25%附弱点火两回合。最多3人。" },
  { id: "lei-xi", name: "超级雷属性吸收", iconId: "55430", category: "生存", effect: "必定免受雷属性法术伤害，并按应受伤害等量恢复气血。" },
  { id: "tu-xi", name: "超级土属性吸收", iconId: "55431", category: "生存", effect: "必定免受土属性法术伤害，并按应受伤害等量恢复气血。" },
  { id: "shui-xi", name: "超级水属性吸收", iconId: "55432", category: "生存", effect: "必定免受水属性法术伤害，并按应受伤害等量恢复气血。" },
  { id: "huo-xi", name: "超级火属性吸收", iconId: "55433", category: "生存", effect: "必定免受火属性法术伤害，并按应受伤害等量恢复气血。" },
  { id: "qiang-li", name: "超级强力", iconId: "55434", category: "物理", effect: "物理攻击能力增加等级×0.7；攻击招架类技能不减伤；对超级防御伤害减少20%。" },
  { id: "fang-yu", name: "超级防御", iconId: "55435", category: "生存", effect: "提高自身等级×1的防御。" },
  { id: "jin-ji-bi-sha", name: "超级进击必杀", iconId: "55438", category: "物理", effect: "第2回合及以后进场，提升30%必杀几率并增加50%必杀倍率，持续5回合且逐回合衰减。" },
  { id: "jin-ji-fa-bao", name: "超级进击法暴", iconId: "55439", category: "法术", effect: "第2回合及以后进场，提升20%法暴几率并增加50%法暴倍率，持续5回合且逐回合衰减。" },
  { id: "yi-zhi", name: "超级遗志", iconId: "55443", category: "生存", effect: "替代原召唤兽进场获得遗志：造成伤害提升15%，并可继承原召唤兽遗志（最多两层）。" },
  { id: "jin-chan", name: "超级金蝉蜕壳", iconId: "55493", category: "生存", effect: "召唤未参与本场战斗的另一只召唤兽替代自己进场，并使其获得等级×3的护盾。" },
  { id: "lie-huo-jt", name: "超级烈火精通", iconId: "55494", category: "法术", effect: "主动使用烈火伤害提高30%，携带其它超级精通时额外提高20%。" },
  { id: "lei-ji-jt", name: "超级雷击精通", iconId: "55495", category: "法术", effect: "主动使用雷击伤害提高30%，携带其它超级精通时额外提高20%。" },
  { id: "shui-gong-jt", name: "超级水攻精通", iconId: "55496", category: "法术", effect: "主动使用水攻伤害提高30%，携带其它超级精通时额外提高20%。" },
  { id: "luo-yan-jt", name: "超级落岩精通", iconId: "55497", category: "法术", effect: "主动使用落岩伤害提高30%，携带其它超级精通时额外提高20%。" },
  { id: "fa-lian", name: "超级法术连击", iconId: "55573", category: "法术", effect: "法术攻击时30%几率攻击2次；第二次伤害降低25%。" },
  { id: "fa-bao", name: "超级法术暴击", iconId: "55577", category: "法术", effect: "法术攻击时20%几率暴击；暴击时有10%几率造成3-4倍暴击伤害。" },
  { id: "fa-bo", name: "超级法术波动", iconId: "55578", category: "法术", effect: "法术伤害效果巨幅波动；避免被敌人法术反震。" },
  { id: "bi-lei", name: "超级壁垒击破", iconId: "55595", category: "物理", effect: "发动物理攻击并略提高伤害；若敌人防御则伤害巨幅提高；忽视等级×1.2的防御。" },
  { id: "fa-di", name: "超级法术抵抗", iconId: "55627", category: "生存", effect: "减少10%所受法术伤害；进场时额外减少50%法术伤害，持续两回合。" },
  { id: "dun-qi", name: "超级盾气", iconId: "55629", category: "生存", effect: "第2回合及以后进场增加等级×2防御，持续5回合且逐回合衰减。在场时主人获得盾气。隐身不触发。" },
  { id: "he-zong", name: "超级合纵", iconId: "55641", category: "物理", effect: "本方有1/2/3/4种不同召唤兽时，提高2%/8%/18%/32%物理伤害，并增加等级×0.25/0.5/0.75/1的伤害结果。" },
];

export const SKILL_BY_ID = Object.fromEntries(
  SUPER_SKILLS.map((skill) => [skill.id, skill]),
) as Record<string, SuperSkill>;
