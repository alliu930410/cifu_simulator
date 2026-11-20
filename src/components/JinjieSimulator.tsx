"use client";

import { useMemo, useState } from "react";
import SiteNav from "@/components/SiteNav";
import JinjieTree from "@/components/JinjieTree";
import {
  GRADE_LABEL,
  MAX_FEEDS,
  SPIRIT_AFTER_YIJING,
  SPIRIT_CAP,
  SPIRIT_TRAIT_UNLOCK,
  type Dew,
  type DewGrade,
  canFeed,
  dewKey,
  dewLabel,
  feedDew,
  feedHint,
  openBottles,
  potentialFromSpirit,
  resetWithYuhu,
} from "@/lib/jinjie";

type Stack = Dew & { count: number };
type FeedLog = { label: string; burst: number; gained: number; spirit: number };

const ITEM_ICON = {
  yuhu: "/assets/items/yuhu.png",
  ping: "/assets/items/qingling_ping.png",
  low: "/assets/items/dew_low.png",
  mid: "/assets/items/dew_mid.png",
  high: "/assets/items/dew_high.png",
} as const;

function ItemSlot({
  icon,
  label,
  qty,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  qty: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className="item-slot" onClick={onClick} disabled={disabled} title={label}>
      <span className="item-qty">{qty}</span>
      <img src={icon} alt={label} />
      <span className="item-name">{label}</span>
    </button>
  );
}

function addToBag(bag: Stack[], dewList: Dew[]): Stack[] {
  const next = [...bag];
  for (const dew of dewList) {
    const index = next.findIndex((item) => item.grade === dew.grade && item.qi === dew.qi);
    if (index >= 0) next[index] = { ...next[index], count: next[index].count + 1 };
    else next.push({ ...dew, count: 1 });
  }
  const order: DewGrade[] = ["high", "mid", "low"];
  next.sort((a, b) => order.indexOf(a.grade) - order.indexOf(b.grade) || b.qi - a.qi);
  return next;
}

function takeFromBag(bag: Stack[], dew: Dew): Stack[] {
  return bag
    .map((item) =>
      item.grade === dew.grade && item.qi === dew.qi ? { ...item, count: item.count - 1 } : item,
    )
    .filter((item) => item.count > 0);
}

export default function JinjieSimulator() {
  const [spirit, setSpirit] = useState(SPIRIT_AFTER_YIJING);
  const [bestSpirit, setBestSpirit] = useState(SPIRIT_AFTER_YIJING);
  const [feedsUsed, setFeedsUsed] = useState(0);
  const [bag, setBag] = useState<Stack[]>([]);
  const [lastOpen, setLastOpen] = useState<Dew[]>([]);
  const [log, setLog] = useState<FeedLog[]>([]);
  const [hint, setHint] = useState("");
  const [bottles, setBottles] = useState(0);
  const [yuhu, setYuhu] = useState(0);
  const [hits110, setHits110] = useState(0);

  const potential = potentialFromSpirit(Math.max(spirit, bestSpirit));
  const hintText = feedHint(spirit, feedsUsed);

  const lastCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const dew of lastOpen) map.set(dewKey(dew), (map.get(dewKey(dew)) ?? 0) + 1);
    return [...map.entries()]
      .map(([key, count]) => {
        const [grade, qi] = key.split("-") as [DewGrade, string];
        return { grade, qi: Number(qi), count, label: dewLabel({ grade, qi: Number(qi) }) };
      })
      .sort((a, b) => b.count - a.count);
  }, [lastOpen]);

  function open(count: number) {
    const dewList = openBottles(count);
    setLastOpen(dewList);
    setBag((prev) => addToBag(prev, dewList));
    setBottles((n) => n + count);
    setHint(`开了 ${count} 个清灵净瓶`);
  }

  function feed(dew: Dew) {
    const result = feedDew(spirit, feedsUsed, dew);
    if (!result.ok) {
      setHint(result.reason);
      return;
    }
    setBag((prev) => takeFromBag(prev, dew));
    setSpirit(result.spirit);
    setFeedsUsed(result.feedsUsed);
    setBestSpirit((prev) => Math.max(prev, result.spirit));
    if (result.spirit === SPIRIT_CAP) setHits110((n) => n + 1);
    setLog((prev) => [
      {
        label: dewLabel(dew),
        burst: result.burst,
        gained: result.gained,
        spirit: result.spirit,
      },
      ...prev,
    ].slice(0, 24));
    setHint(`${dewLabel(dew)} → +${result.gained}（灵气 ${dew.qi}，波动 +${result.burst}）灵性 ${result.spirit}`);
  }

  function yuhuReset() {
    const result = resetWithYuhu(spirit);
    if (!result.ok) {
      setHint(result.reason);
      return;
    }
    setSpirit(result.spirit);
    setFeedsUsed(0);
    setYuhu((n) => n + 1);
    setLog([]);
    setHint("玉葫灵髓：灵性回到 50，次数清零。历史最高灵性对应的潜能保留，特性也保留。");
  }

  function resetAll() {
    setSpirit(SPIRIT_AFTER_YIJING);
    setBestSpirit(SPIRIT_AFTER_YIJING);
    setFeedsUsed(0);
    setBag([]);
    setLastOpen([]);
    setLog([]);
    setHint("");
    setBottles(0);
    setYuhu(0);
    setHits110(0);
  }

  const canEat = canFeed(spirit, feedsUsed);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="text-center">
        <p className="text-sm tracking-[0.3em] text-amber-800/70">召唤兽工具</p>
        <h1 className="mt-1 font-serif text-3xl text-amber-950">进阶模拟器</h1>
        <div className="mt-3">
          <SiteNav />
        </div>
      </header>

      <JinjieTree spirit={spirit} feedsUsed={feedsUsed} />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="cifu-window overflow-hidden rounded-xl">
          <div className="cifu-titlebar px-4 py-2 text-center text-lg">清灵仙露</div>
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <div className="cifu-panel rounded-lg p-4 text-center text-[#2b2450]">
              <p className="text-sm text-[#f7e7a8]/90">当前灵性</p>
              <p className="font-serif text-5xl text-amber-100">
                {spirit}
                <span className="text-lg text-amber-200/80"> / {SPIRIT_CAP}</span>
              </p>
              <p className="mt-2 text-sm text-amber-50/90">
                已吃 {feedsUsed}/{MAX_FEEDS} · 潜能 {potential}（历史最高灵性 {bestSpirit}）
              </p>
              <p className="mt-1 text-xs text-amber-100/80">
                {spirit >= SPIRIT_TRAIT_UNLOCK ? "已可领悟特性（易经丹）" : "灵性 80 后可领悟特性"}
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#3d446e]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-200 to-amber-500"
                  style={{ width: `${(spirit / SPIRIT_CAP) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <button type="button" className="cifu-action flex items-center justify-center gap-2 rounded-md px-4 py-2" onClick={() => open(1)}>
                <img src={ITEM_ICON.ping} alt="" className="h-8 w-8 image-pixelated" />
                开 1 个清灵净瓶
              </button>
              <button type="button" className="cifu-action rounded-md px-4 py-2" onClick={() => open(10)}>
                开 10 个
              </button>
              <button type="button" className="cifu-action rounded-md px-4 py-2" onClick={() => open(50)}>
                开 50 个
              </button>
              <button type="button" className="cifu-action rounded-md px-4 py-2" onClick={resetAll}>
                全部重置
              </button>
            </div>
          </div>
          {hintText || hint ? (
            <p className="px-4 pb-4 text-sm text-amber-100/90">
              {hint}
              {hint && hintText ? " · " : ""}
              {hintText}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
          <h2 className="font-serif text-lg text-amber-950">统计</h2>
          <ul className="mt-2 space-y-1 text-sm text-stone-700">
            <li>已开净瓶：{bottles}</li>
            <li>玉葫灵髓：{yuhu}</li>
            <li>吃到 110：{hits110} 次</li>
            <li>背包仙露：{bag.reduce((sum, item) => sum + item.count, 0)}</li>
          </ul>
          {lastCounts.length ? (
            <div className="mt-3">
              <p className="text-xs text-stone-500">上次开出</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {lastCounts.map((item) => (
                  <span key={`${item.grade}-${item.qi}`} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">
                    {item.label} ×{item.count}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-serif text-lg text-amber-950">背包</h2>
          <p className="text-xs text-stone-500">第一格玉葫无限 · 点仙露喂食</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ItemSlot icon={ITEM_ICON.yuhu} label="玉葫灵髓" qty="∞" onClick={yuhuReset} />
          {bag.map((item) => (
            <ItemSlot
              key={dewKey(item)}
              icon={ITEM_ICON[item.grade]}
              label={dewLabel(item)}
              qty={String(item.count)}
              onClick={() => feed(item)}
              disabled={!canEat}
            />
          ))}
        </div>
        {bag.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">先开清灵净瓶。仙露会进背包：绿初级、橙中级、紫高级。</p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
          <h2 className="font-serif text-lg text-amber-950">喂食记录</h2>
          {log.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">还没吃过仙露。</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {log.map((item, index) => (
                <li key={`${item.label}-${index}`} className="flex justify-between gap-3">
                  <span>
                    {item.label} 波动 +{item.burst}
                  </span>
                  <span className="text-stone-600">
                    +{item.gained} → {item.spirit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 text-sm text-stone-700 shadow-sm">
          <h2 className="font-serif text-lg text-amber-950">规则（按官方 + 实测）</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>5 颗易经丹固定到 50 灵性、换造型；本页从 50 开始。</li>
            <li>50 后只能吃清灵仙露，最多 7 次；灵性 &gt; 100 不能再吃；上限 110。</li>
            <li>1 灵性 = 2 潜能。80 灵性后可用易经丹随机特性。</li>
            <li>玉葫灵髓：灵性回 50、次数重置，特性保留；潜能按历史最高灵性算。</li>
            <li>开瓶：初级 62%、中级 25%、高级 13%（400 瓶实测）。</li>
            <li>灵气：初级 0–4、中级 2–6 均匀；高级 4–8，高7约 15%、高8约 6%（占高级）。</li>
            <li>喂食实际加成 = 灵气 + 0/1/2，高级更容易爆高。</li>
          </ul>
          <p className="mt-2 text-xs text-stone-500">
            官方未公布精确概率。开瓶比例来自 400 瓶样本；喂食波动按攻略「高级 &gt; 中级 &gt; 初级」估算。
          </p>
        </div>
      </section>
    </div>
  );
}
