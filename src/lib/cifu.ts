import { SUPER_SKILLS } from "@/data/super-skills";

export const CIFU_SLOT_COUNT = 4;
export const MAX_LOCKS = 2;
export const WASH_MS = 1000;
export const CHAIN_COUNT = 5;

export type PetSkill = {
  name: string;
  iconId: string;
};

export function wanziCost(lockCount: number) {
  if (lockCount >= 2) return 25;
  if (lockCount === 1) return 5;
  return 1;
}

export function pickUnique<T>(pool: T[], count: number): T[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function rollCifu(previous: string[], lockedIds: string[]): string[] {
  const locked = new Set(lockedIds.filter(Boolean).slice(0, MAX_LOCKS));
  const used = new Set<string>();
  const result = Array.from({ length: CIFU_SLOT_COUNT }, (_, index) => {
    const id = previous[index];
    if (id && locked.has(id)) {
      used.add(id);
      return id;
    }
    return "";
  });

  const emptySlots = result
    .map((id, index) => (id ? -1 : index))
    .filter((index) => index >= 0);
  const pool = SUPER_SKILLS.map((skill) => skill.id).filter((id) => !used.has(id));
  const picks = pickUnique(pool, emptySlots.length);
  emptySlots.forEach((slot, i) => {
    result[slot] = picks[i];
  });
  return result;
}

export function skillBaseName(name: string) {
  return name.replace(/^超级/, "").replace(/^高级/, "");
}

export function superIdForName(name: string) {
  const base = skillBaseName(name)
    .replace("金蝉脱壳", "金蝉蜕壳")
    .replace("进击法爆", "进击法暴");
  return SUPER_SKILLS.find((skill) => skillBaseName(skill.name) === base)?.id;
}

export function iconIdFromUrl(url: string) {
  const match = url.match(/skillicon\/(\d+)\.(?:gif|png)/i);
  return match?.[1] ?? "";
}

export function cifuAbleSkills(petSkills: PetSkill[]) {
  return petSkills.filter((skill) => Boolean(superIdForName(skill.name)));
}

export function defaultCifuIds(petSkills: PetSkill[]) {
  const ids: string[] = [];
  for (const skill of cifuAbleSkills(petSkills)) {
    const id = superIdForName(skill.name);
    if (id && !ids.includes(id)) ids.push(id);
    if (ids.length >= CIFU_SLOT_COUNT) break;
  }
  return ids;
}

export function cifuUnableSkills(petSkills: PetSkill[]) {
  return petSkills.filter((skill) => !superIdForName(skill.name));
}

export function matchCount(rolledIds: string[], petSkills: PetSkill[]) {
  const able = new Set(
    cifuAbleSkills(petSkills)
      .map((skill) => superIdForName(skill.name))
      .filter(Boolean) as string[],
  );
  return rolledIds.filter((id) => able.has(id)).length;
}
