"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_TREE_PRICES,
  DEFAULT_TREE_QTY,
  adviseTree,
  expectedSuccessCost,
  mhbToRmb,
  thisRunCost,
  type TreePrices,
  type TreeQty,
} from "@/lib/jinjie";

type Branch = { from: number; action: string; sum: number | string; tone?: string };

const COLS: { title: string; branches: Branch[] }[] = [
  {
    title: "第一个",
    branches: [
      { from: 50, action: "吃中6", sum: 56 },
      { from: 50, action: "吃中6", sum: 57 },
      { from: 50, action: "吃中6", sum: 58 },
    ],
  },
  {
    title: "第二个",
    branches: [
      { from: 56, action: "吃葫芦", sum: "回50", tone: "wash" },
      { from: 57, action: "吃葫芦", sum: "回50", tone: "wash" },
      { from: 58, action: "吃8", sum: "66/67/68" },
    ],
  },
  {
    title: "第三个",
    branches: [
      { from: 66, action: "吃8", sum: 74 },
      { from: 67, action: "吃7", sum: 75 },
      { from: 68, action: "吃6", sum: 76 },
    ],
  },
  {
    title: "第四个",
    branches: [
      { from: 74, action: "吃8", sum: 82 },
      { from: 75, action: "吃7", sum: 83 },
      { from: 76, action: "吃6", sum: 84 },
    ],
  },
  {
    title: "第五个",
    branches: [
      { from: 82, action: "吃8", sum: 90 },
      { from: 83, action: "吃7", sum: 91 },
      { from: 84, action: "吃6", sum: 92 },
    ],
  },
];

const SIXTH: Branch[] = [
  { from: 90, action: "吃8", sum: 98, tone: "pink" },
  { from: 91, action: "吃7", sum: 99, tone: "pink" },
  { from: 92, action: "吃6", sum: 100, tone: "pink" },
];

const SEVENTH = [
  { from: 98, action: "失败", spirit: 108, end: "失败", after: "喜乐虫来", tone: "fail" },
  { from: 99, action: "失败", spirit: 109, end: "失败", after: "喜乐虫来", tone: "fail" },
  { from: 100, action: "吃8", spirit: 110, end: "成功", after: "恭喜", tone: "win" },
];

function numTone(on: boolean) {
  return on ? "rounded bg-amber-200 px-1 font-semibold ring-2 ring-amber-600" : "";
}

function actionTone(on: boolean) {
  return on ? "rounded bg-amber-200 px-1 font-semibold ring-2 ring-amber-600" : "text-stone-500";
}

function StepCell({ from, action, spirit }: { from: number; action: string; spirit: number }) {
  const on = spirit === from;
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-1">
      <span className={numTone(on)}>{from}</span>
      <span className={actionTone(on)}>{action}</span>
    </span>
  );
}

export default function JinjieTree({ spirit, feedsUsed }: { spirit: number; feedsUsed: number }) {
  const advice = useMemo(() => adviseTree(spirit, feedsUsed), [spirit, feedsUsed]);
  const [prices, setPrices] = useState<TreePrices>(DEFAULT_TREE_PRICES);
  const [qty, setQty] = useState<TreeQty>(DEFAULT_TREE_QTY);
  const run = thisRunCost(prices, qty);
  const expect = expectedSuccessCost(prices);

  function setPrice(key: keyof TreePrices, value: string) {
    setPrices((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  }
  function setCount(key: keyof TreeQty, value: string) {
    setQty((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  }

  return (
    <section className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-amber-950">进阶 110 决策树</h2>
          <p className="text-xs text-stone-500">
            作者：南瓜炮 / 沂水雪山 · 黄=当前该吃什么 · 当前累计 {spirit}
          </p>
        </div>
        <p className="rounded-full bg-amber-800 px-3 py-1 text-sm text-amber-50">
          当前建议：{advice.label}
        </p>
      </div>
      <p className="mb-3 text-sm text-stone-600">{advice.detail}</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-center text-xs sm:text-sm">
          <thead>
            <tr>
              {COLS.map((col) => (
                <th key={col.title} className="border border-amber-100 bg-amber-50 px-2 py-1">
                  {col.title}
                </th>
              ))}
              <th className="border border-amber-100 bg-amber-50 px-2 py-1">第六个</th>
              <th className="border border-amber-100 bg-amber-50 px-2 py-1">第七个 · 进阶</th>
              <th className="min-w-[7.5rem] border border-amber-100 bg-violet-100 px-2 py-1">结局 · 后续</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((row) => (
              <tr key={row}>
                {COLS.map((col) => {
                  const branch = col.branches[row];
                  return (
                    <td
                      key={`${col.title}-${row}`}
                      className={`border border-amber-100 px-2 py-1 ${branch.tone === "wash" ? "bg-amber-50" : "bg-white"}`}
                    >
                      <StepCell from={branch.from} action={branch.action} spirit={spirit} />
                    </td>
                  );
                })}
                <td className="border border-amber-100 bg-rose-50 px-2 py-1">
                  <StepCell from={SIXTH[row].from} action={SIXTH[row].action} spirit={spirit} />
                </td>
                <td className={`border border-amber-100 px-2 py-1 ${SEVENTH[row].tone === "win" ? "bg-emerald-50" : "bg-stone-50"}`}>
                  <StepCell from={SEVENTH[row].from} action={SEVENTH[row].action} spirit={spirit} />
                </td>
                <td className={`border border-amber-100 px-2 py-1 ${SEVENTH[row].tone === "win" ? "bg-emerald-100" : "bg-stone-100"}`}>
                  {SEVENTH[row].end} · {SEVENTH[row].after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 overflow-x-auto">
        <h3 className="mb-2 font-serif text-amber-950">成本计算器</h3>
        <table className="w-full min-w-[720px] border-collapse text-center text-sm">
          <thead>
            <tr className="bg-amber-50">
              <th className="border border-amber-100 px-2 py-1">瓶子</th>
              <th className="border border-amber-100 px-2 py-1">中6</th>
              <th className="border border-amber-100 px-2 py-1">高6</th>
              <th className="border border-amber-100 px-2 py-1">高7</th>
              <th className="border border-amber-100 px-2 py-1">高8</th>
              <th className="border border-amber-100 px-2 py-1">葫芦</th>
              <th className="border border-amber-100 px-2 py-1">菜价格</th>
              <th className="border border-amber-100 px-2 py-1">结果</th>
              <th className="border border-amber-100 px-2 py-1">本次成本</th>
              <th className="border border-amber-100 px-2 py-1">成功期望成本</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-amber-100 px-2 py-1">价格</td>
              {(["mid6", "high6", "high7", "high8", "yuhu", "dish"] as const).map((key) => (
                <td key={key} className="border border-amber-100 bg-emerald-50 p-1">
                  <input
                    type="number"
                    value={prices[key]}
                    onChange={(e) => setPrice(key, e.target.value)}
                    className="w-16 bg-transparent text-center outline-none"
                  />
                </td>
              ))}
              <td className="border border-amber-100 px-2 py-1">MHB</td>
              <td className="border border-amber-100 px-2 py-1">{run}</td>
              <td className="border border-amber-100 px-2 py-1">{Math.round(expect)}</td>
            </tr>
            <tr>
              <td className="border border-amber-100 px-2 py-1">数量</td>
              {(["mid6", "high6", "high7", "high8", "yuhu"] as const).map((key) => (
                <td key={key} className="border border-amber-100 bg-emerald-50 p-1">
                  <input
                    type="number"
                    value={qty[key]}
                    onChange={(e) => setCount(key, e.target.value)}
                    className="w-16 bg-transparent text-center outline-none"
                  />
                </td>
              ))}
              <td className="border border-amber-100 px-2 py-1" />
              <td className="border border-amber-100 px-2 py-1">RMB</td>
              <td className="border border-amber-100 px-2 py-1">{mhbToRmb(run, prices.dish).toFixed(0)}</td>
              <td className="border border-amber-100 px-2 py-1">{mhbToRmb(expect, prices.dish).toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 space-y-1 text-xs leading-relaxed text-stone-600">
        <p>本方案是无脑冲 110：起手中6，前两个不爆 8 就洗。第三个起按轨道吃高 8/7/6。最省的是 68 → 6666 → 8。</p>
        <p>成功一次大约要冲 9 次 100、3 次 110。吃一个 6 之后狂吃几个 8 的做法不可取。</p>
      </div>
    </section>
  );
}
