"use client";

import { useMemo, useState } from "react";
import SiteNav from "@/components/SiteNav";
import { dashuTable, formatCount, formatRate, successTone } from "@/lib/dashu";

export default function DashuCalculator() {
  const [total, setTotal] = useState(10);
  const [special, setSpecial] = useState(1);
  const safeTotal = Math.max(1, Math.min(24, total));
  const safeSpecial = Math.max(0, Math.min(safeTotal, special));
  const rows = useMemo(() => dashuTable(safeTotal, safeSpecial), [safeTotal, safeSpecial]);
  const keep = safeTotal > 0 ? 1 - safeSpecial / safeTotal : 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="text-center">
        <p className="text-sm tracking-[0.3em] text-amber-800/70">召唤兽工具</p>
        <h1 className="mt-1 font-serif text-3xl text-amber-950">宝宝打书概率计算器</h1>
        <div className="mt-3">
          <SiteNav />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
          <h2 className="font-serif text-lg text-amber-950">输入项</h2>
          <label className="mt-3 block text-sm text-stone-600">宝宝总技能</label>
          <input
            type="number"
            min={1}
            max={24}
            value={total}
            onChange={(e) => setTotal(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-full border border-stone-200 px-4 py-2 text-sm outline-none focus:border-amber-400"
          />
          <label className="mt-3 block text-sm text-stone-600">特殊技能</label>
          <input
            type="number"
            min={0}
            max={24}
            value={special}
            onChange={(e) => setSpecial(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-full border border-stone-200 px-4 py-2 text-sm outline-none focus:border-amber-400"
          />
          <p className="mt-3 text-sm text-stone-600">
            可打普通技能 {Math.max(0, safeTotal - safeSpecial)} · 每次保留特殊技能 {formatRate(keep)}
          </p>
          <a
            href="/%E5%AE%9D%E5%AE%9D%E6%89%93%E4%B9%A6%E6%A6%82%E7%8E%87%E8%AE%A1%E7%AE%97%E5%99%A8.xlsx"
            className="mt-3 inline-block text-sm text-amber-800 underline"
          >
            下载原表格
          </a>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 text-sm text-stone-700 shadow-sm">
          <h2 className="font-serif text-lg text-amber-950">说明</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>循环率 = 已经打入的普通技能 ÷ 可打普通技能总数</li>
            <li>第 X 本期望次数 = 1 ÷ (1 − 循环率)</li>
            <li>累计期望次数 = 截至当前技能的期望打书次数之和</li>
            <li>截图算法成功率 = 每次保留特殊技能的概率 ^ 累计期望次数</li>
          </ul>
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-amber-100 bg-white/80 shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-amber-50 text-amber-950">
            <tr>
              <th className="px-3 py-2 font-medium">打技能个数</th>
              <th className="px-3 py-2 font-medium">循环率</th>
              <th className="px-3 py-2 font-medium">第X本打书期望次数</th>
              <th className="px-3 py-2 font-medium">累计打书期望次数</th>
              <th className="px-3 py-2 font-medium">成功率</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.index} className="border-t border-amber-100">
                <td className="px-3 py-2">第{row.index}个</td>
                <td className="px-3 py-2">{formatRate(Number.isFinite(row.cycleRate) ? row.cycleRate : null)}</td>
                <td className="px-3 py-2">{formatCount(row.expected)}</td>
                <td className="px-3 py-2">{formatCount(row.cumulative)}</td>
                <td className={`px-3 py-2 font-medium ${successTone(row.success)}`}>{formatRate(row.success)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
