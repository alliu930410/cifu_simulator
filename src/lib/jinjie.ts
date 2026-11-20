export type DewGrade = "low" | "mid" | "high";

export type Dew = {
  grade: DewGrade;
  qi: number;
};

export const SPIRIT_AFTER_YIJING = 50;
export const SPIRIT_TRAIT_UNLOCK = 80;
export const SPIRIT_FEED_MAX = 100;
export const SPIRIT_CAP = 110;
export const MAX_FEEDS = 7;
export const QI_PER_SPIRIT_POTENTIAL = 2;

/** 400 瓶实测：初级 62% / 中级 25% / 高级 13%。 */
export const GRADE_WEIGHTS: { grade: DewGrade; weight: number }[] = [
  { grade: "low", weight: 62 },
  { grade: "mid", weight: 25 },
  { grade: "high", weight: 13 },
];

/** 初级、中级按攻略「分布均匀」；高级按 400 瓶：高7≈15%、高8≈6%。 */
export const QI_WEIGHTS: Record<DewGrade, { qi: number; weight: number }[]> = {
  low: [
    { qi: 0, weight: 1 },
    { qi: 1, weight: 1 },
    { qi: 2, weight: 1 },
    { qi: 3, weight: 1 },
    { qi: 4, weight: 1 },
  ],
  mid: [
    { qi: 2, weight: 1 },
    { qi: 3, weight: 1 },
    { qi: 4, weight: 1 },
    { qi: 5, weight: 1 },
    { qi: 6, weight: 1 },
  ],
  high: [
    { qi: 4, weight: 32 },
    { qi: 5, weight: 27 },
    { qi: 6, weight: 20 },
    { qi: 7, weight: 15 },
    { qi: 8, weight: 6 },
  ],
};

/** 喂食波动：实际灵性 = 灵气 + 0/1/2。高级爆高 > 中级 > 初级。 */
export const BURST_WEIGHTS: Record<DewGrade, number[]> = {
  low: [62, 28, 10],
  mid: [50, 32, 18],
  high: [34, 33, 33],
};

export const GRADE_LABEL: Record<DewGrade, string> = {
  low: "初级",
  mid: "中级",
  high: "高级",
};

export function dewKey(dew: Dew): string {
  return `${dew.grade}-${dew.qi}`;
}

export function dewLabel(dew: Dew): string {
  return `${GRADE_LABEL[dew.grade]}${dew.qi}`;
}

function pickWeighted<T>(items: { item: T; weight: number }[], rng: () => number): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll < 0) return item.item;
  }
  return items[items.length - 1].item;
}

export function openBottle(rng: () => number = Math.random): Dew {
  const grade = pickWeighted(
    GRADE_WEIGHTS.map((item) => ({ item: item.grade, weight: item.weight })),
    rng,
  );
  const qi = pickWeighted(
    QI_WEIGHTS[grade].map((item) => ({ item: item.qi, weight: item.weight })),
    rng,
  );
  return { grade, qi };
}

export function openBottles(count: number, rng: () => number = Math.random): Dew[] {
  return Array.from({ length: count }, () => openBottle(rng));
}

export function rollBurst(grade: DewGrade, rng: () => number = Math.random): 0 | 1 | 2 {
  return pickWeighted(
    BURST_WEIGHTS[grade].map((weight, bonus) => ({ item: bonus as 0 | 1 | 2, weight })),
    rng,
  );
}

export function canFeed(spirit: number, feedsUsed: number): boolean {
  return feedsUsed < MAX_FEEDS && spirit >= SPIRIT_AFTER_YIJING && spirit <= SPIRIT_FEED_MAX;
}

export function feedDew(
  spirit: number,
  feedsUsed: number,
  dew: Dew,
  rng: () => number = Math.random,
): { ok: false; reason: string } | { ok: true; burst: 0 | 1 | 2; gained: number; spirit: number; feedsUsed: number } {
  if (!canFeed(spirit, feedsUsed)) {
    if (feedsUsed >= MAX_FEEDS) return { ok: false, reason: "这只召唤兽已经吃满 7 次清灵仙露" };
    if (spirit > SPIRIT_FEED_MAX) return { ok: false, reason: "灵性大于 100 后不能再吃仙露" };
    return { ok: false, reason: "需要先用易经丹把灵性吃到 50" };
  }
  const burst = rollBurst(dew.grade, rng);
  const raw = dew.qi + burst;
  const gained = Math.min(SPIRIT_CAP - spirit, raw);
  return {
    ok: true,
    burst,
    gained,
    spirit: spirit + gained,
    feedsUsed: feedsUsed + 1,
  };
}

export function potentialFromSpirit(spirit: number): number {
  return spirit * QI_PER_SPIRIT_POTENTIAL;
}

export function resetWithYuhu(spirit: number): { ok: false; reason: string } | { ok: true; spirit: number } {
  if (spirit <= SPIRIT_AFTER_YIJING) return { ok: false, reason: "灵性需要高于 50 才能用玉葫灵髓" };
  return { ok: true, spirit: SPIRIT_AFTER_YIJING };
}

export function feedHint(spirit: number, feedsUsed: number): string {
  if (!canFeed(spirit, feedsUsed)) {
    if (spirit >= SPIRIT_CAP) return "已满灵 110。";
    if (spirit > SPIRIT_FEED_MAX) return "灵性已超过 100，不能再吃。可用玉葫灵髓洗回 50 再冲。";
    if (feedsUsed >= MAX_FEEDS) return "7 次已用完。用玉葫灵髓重置次数（灵性回 50，特性保留）。";
    return "";
  }
  const remain = MAX_FEEDS - feedsUsed;
  if (remain === 2) {
    const need = SPIRIT_FEED_MAX - spirit;
    if (need <= 0) return "第 6 次已到 100，第 7 次吃高级 8 冲 106–110。";
    if (need >= 8 && need <= 10) return `差 ${need} 到 100：第 6 次吃高级 ${need - 2}（保底到 100）。`;
    if (need > 10) return `还差 ${need} 到 100，第 6 次尽量吃高级 7/8。`;
    return `还差 ${need} 到 100，第 6 次可用中级/高级对准。`;
  }
  if (remain === 1) {
    if (spirit === SPIRIT_FEED_MAX) return "第 7 次吃高级 8：最差 106，爆 +2 才到 110。";
    return `当前 ${spirit}，第 7 次已无法到 110。可用玉葫灵髓重来。`;
  }
  if (spirit < SPIRIT_TRAIT_UNLOCK) return "先冲到 80 灵性才能用易经丹领悟特性。";
  return "前几次用高级 7/8 把灵性铺到 91–94，再精准对准 100。";
}

export type TreeAdvice = {
  action: "mid6" | "high6" | "high7" | "high8" | "yuhu" | "done" | "fail";
  label: string;
  detail: string;
  hereColumn: number | null;
  nextColumn: number | null;
  row: number | null;
};

/** 三行轨道累计：低 / 中 / 高。 */
export const TREE_RAILS = [
  [56, 66, 74, 82, 90, 98, 108],
  [57, 67, 75, 83, 91, 99, 109],
  [58, 68, 76, 84, 92, 100, 110],
] as const;

export function locateSpirit(spirit: number): { column: number; row: number } | null {
  for (let column = 0; column < TREE_RAILS[0].length; column += 1) {
    for (let row = 0; row < TREE_RAILS.length; row += 1) {
      if (TREE_RAILS[row][column] === spirit) return { column, row };
    }
  }
  return null;
}

const NEXT_MOVE: { label: string; action: TreeAdvice["action"] }[][] = [
  [
    { label: "吃葫芦", action: "yuhu" },
    { label: "吃葫芦", action: "yuhu" },
    { label: "吃8", action: "high8" },
  ],
  [
    { label: "吃8", action: "high8" },
    { label: "吃7", action: "high7" },
    { label: "吃6", action: "high6" },
  ],
  [
    { label: "吃8", action: "high8" },
    { label: "吃7", action: "high7" },
    { label: "吃6", action: "high6" },
  ],
  [
    { label: "吃8", action: "high8" },
    { label: "吃7", action: "high7" },
    { label: "吃6", action: "high6" },
  ],
  [
    { label: "吃8", action: "high8" },
    { label: "吃7", action: "high7" },
    { label: "吃6", action: "high6" },
  ],
  [
    { label: "失败 · 吃葫芦", action: "fail" },
    { label: "失败 · 吃葫芦", action: "fail" },
    { label: "吃8", action: "high8" },
  ],
];

/** 南瓜炮 / 沂水雪山 进阶110 表：累计数字对应当前所在格，下一步看右边一格。 */
export function adviseTree(spirit: number, _feedsUsed: number): TreeAdvice {
  if (spirit <= SPIRIT_AFTER_YIJING) {
    return {
      action: "mid6",
      label: "吃中6",
      detail: "当前 50，起手吃中6。吃完对准 56/57/58。",
      hereColumn: null,
      nextColumn: 0,
      row: null,
    };
  }
  const here = locateSpirit(spirit);
  if (!here) {
    return {
      action: "yuhu",
      label: "吃葫芦",
      detail: `当前 ${spirit} 对不上表上的累计，按表应洗了再来。`,
      hereColumn: null,
      nextColumn: null,
      row: null,
    };
  }
  if (here.column >= 6) {
    if (spirit >= SPIRIT_CAP) {
      return { action: "done", label: "恭喜", detail: "当前 110，成功。", hereColumn: 6, nextColumn: 6, row: 2 };
    }
    return {
      action: "fail",
      label: "失败 · 吃葫芦",
      detail: `当前 ${spirit}，没到 110。`,
      hereColumn: here.column,
      nextColumn: 6,
      row: here.row,
    };
  }
  const move = NEXT_MOVE[here.column][here.row];
  return {
    action: move.action,
    label: move.label,
    detail: `当前累计 ${spirit}，下一步 ${move.label}。`,
    hereColumn: here.column,
    nextColumn: here.column + 1,
    row: here.row,
  };
}

export function thisRunCost(prices: TreePrices, qty: TreeQty): number {
  return (
    prices.mid6 * qty.mid6 +
    prices.high6 * qty.high6 +
    prices.high7 * qty.high7 +
    prices.high8 * qty.high8 +
    prices.yuhu * qty.yuhu
  );
}

/** 表中 J12：=(中6*3+100+高8+(高6+高7+高8)/3*4)*9+高8*3 */
export function expectedSuccessCost(prices: TreePrices): number {
  return (prices.mid6 * 3 + 100 + prices.high8 + ((prices.high6 + prices.high7 + prices.high8) / 3) * 4) * 9 + prices.high8 * 3;
}

export function mhbToRmb(mhb: number, dishPrice: number): number {
  return dishPrice <= 0 ? 0 : (mhb / 3000) * dishPrice;
}

export type TreePrices = {
  mid6: number;
  high6: number;
  high7: number;
  high8: number;
  yuhu: number;
  dish: number;
};

export type TreeQty = {
  mid6: number;
  high6: number;
  high7: number;
  high8: number;
  yuhu: number;
};

export const DEFAULT_TREE_PRICES: TreePrices = {
  mid6: 50,
  high6: 100,
  high7: 500,
  high8: 1000,
  yuhu: 50,
  dish: 220,
};

export const DEFAULT_TREE_QTY: TreeQty = {
  mid6: 1,
  high6: 2,
  high7: 1,
  high8: 3,
  yuhu: 2,
};
