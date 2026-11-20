export const DASHU_ROWS = 12;

export type DashuRow = {
  index: number;
  cycleRate: number;
  expected: number | null;
  cumulative: number | null;
  success: number | null;
};

export function dashuTable(totalSkills: number, specialSkills: number): DashuRow[] {
  const normal = totalSkills - specialSkills;
  const keep = totalSkills > 0 ? 1 - specialSkills / totalSkills : 0;
  const rows: DashuRow[] = [];
  let cumulative = 0;
  for (let index = 1; index <= DASHU_ROWS; index += 1) {
    const cycleRate = normal > 0 ? (index - 1) / normal : Number.POSITIVE_INFINITY;
    const expected = cycleRate < 1 ? 1 / (1 - cycleRate) : null;
    if (expected == null) {
      rows.push({ index, cycleRate, expected: null, cumulative: null, success: null });
      continue;
    }
    cumulative += expected;
    const success = Number.isFinite(keep) ? keep ** cumulative : null;
    rows.push({ index, cycleRate, expected, cumulative, success });
  }
  return rows;
}

export function formatRate(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(2)}%`;
}

export function formatCount(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(3);
}

export function successTone(value: number | null): string {
  if (value == null) return "bg-stone-100 text-stone-400";
  if (value >= 0.66) return "bg-[#d9ead3] text-emerald-900";
  if (value >= 0.33) return "bg-[#fff2cc] text-amber-900";
  return "bg-[#f4cccc] text-red-900";
}
