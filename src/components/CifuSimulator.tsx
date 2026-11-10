"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { PET_APPEARANCE_CATALOG, PET_SKILL_CATALOG } from "@/data/catalog";
import {
  DEFAULT_CIFU_IDS,
  DEFAULT_PET_ICON,
  DEFAULT_PET_NAME,
  DEFAULT_PET_SKILLS,
} from "@/data/default-pet";
import { SUPER_SKILLS, SKILL_BY_ID, petIconUrl, skillIconUrl } from "@/data/super-skills";
import {
  CHAIN_COUNT,
  CIFU_SLOT_COUNT,
  MAX_LOCKS,
  WASH_MS,
  cifuAbleSkills,
  cifuUnableSkills,
  iconIdFromUrl,
  matchCount,
  rollCifu,
  superIdForName,
  wanziCost,
  type PetSkill,
} from "@/lib/cifu";


function WanziIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10 drop-shadow" aria-hidden>
      <ellipse cx="32" cy="40" rx="22" ry="16" fill="#e8e4d8" />
      <path d="M12 38c2-16 12-24 20-24s18 8 20 24c-6 4-14 6-20 6s-14-2-20-6z" fill="#f7f4ea" />
      <path d="M24 22c3 6 5 14 8 16 3-2 5-10 8-16" fill="none" stroke="#c9c2ae" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="32" cy="20" rx="7" ry="4" fill="#efe8d6" />
    </svg>
  );
}

function PetSkillIcon({ skill }: { skill: PetSkill }) {
  return (
    <img
      src={skillIconUrl(skill.iconId)}
      alt={skill.name}
      title={skill.name}
      className="h-11 w-11 image-pixelated"
    />
  );
}

export default function CifuSimulator() {
  const [petSkills, setPetSkills] = useState<PetSkill[]>(DEFAULT_PET_SKILLS);
  const [petName, setPetName] = useState(DEFAULT_PET_NAME);
  const [petIcon, setPetIcon] = useState(DEFAULT_PET_ICON);
  const [cbgUrl, setCbgUrl] = useState("");
  const [importHint, setImportHint] = useState("");
  const [petQuery, setPetQuery] = useState("");
  const [skillQuery, setSkillQuery] = useState("");
  const [rolled, setRolled] = useState<string[]>(DEFAULT_CIFU_IDS);
  const [display, setDisplay] = useState<string[]>(DEFAULT_CIFU_IDS);
  const [locked, setLocked] = useState<string[]>([]);
  const [rolls, setRolls] = useState(0);
  const [best, setBest] = useState(0);
  const [wanziSpent, setWanziSpent] = useState(0);
  const [fourHits, setFourHits] = useState(0);
  const [washing, setWashing] = useState(false);
  const [washKey, setWashKey] = useState(0);
  const washTimer = useRef<number>(0);
  const chainSeq = useRef(0);
  const chainWait = useRef<number>(0);
  const rolledRef = useRef(rolled);
  const lockedRef = useRef(locked);
  const petSkillsRef = useRef(petSkills);
  rolledRef.current = rolled;
  lockedRef.current = locked;
  petSkillsRef.current = petSkills;
  const [chaining, setChaining] = useState(false);
  const [pausedFour, setPausedFour] = useState(false);
  const [switchMode, setSwitchMode] = useState(false);
  const [switchSlot, setSwitchSlot] = useState<number | null>(null);

  const able = cifuAbleSkills(petSkills);
  const unable = cifuUnableSkills(petSkills);
  const wantedIds = able
    .map((skill) => superIdForName(skill.name))
    .filter(Boolean) as string[];
  const activeLocks = locked.filter((id) => rolled.includes(id));
  const cost = wanziCost(activeLocks.length);
  const hits = matchCount(display, petSkills);

  const filteredPets = useMemo(() => {
    const q = petQuery.trim();
    return PET_APPEARANCE_CATALOG.filter((pet) => !q || pet.name.includes(q)).slice(0, 24);
  }, [petQuery]);

  const filteredSkills = useMemo(() => {
    const q = skillQuery.trim();
    return PET_SKILL_CATALOG.filter((skill) => !q || skill.name.includes(q));
  }, [skillQuery]);

  useEffect(() => {
    return () => {
      window.clearTimeout(washTimer.current);
      window.clearTimeout(chainWait.current);
    };
  }, []);

  function addPetSkill(skill: PetSkill) {
    setPetSkills((prev) => {
      if (prev.some((item) => item.name === skill.name)) {
        return prev.filter((item) => item.name !== skill.name);
      }
      return [...prev, skill];
    });
  }

  function choosePet(pet: (typeof PET_APPEARANCE_CATALOG)[number]) {
    setPetName(pet.name);
    setPetIcon(petIconUrl(pet.iconId));
    const skills = [...(pet.baseSkills ?? []), ...(pet.normalSkills ?? [])].map((skill) => ({
      name: skill.name,
      iconId: skill.iconId,
    }));
    setPetSkills(skills);
  }

  async function importCbg() {
    setImportHint("导入中…");
    try {
      const response = await fetch(`/api/cbg?url=${encodeURIComponent(cbgUrl)}`);
      const data = await response.json();
      if (!response.ok) {
        setImportHint(data.error ?? "导入失败");
        return;
      }
      const imported = (data.skills as Array<{ name: string; iconId?: string; icon?: string; id?: string }>) ?? [];
      const matched = imported
        .map((item) => {
          const fromCatalog =
            PET_SKILL_CATALOG.find((skill) => skill.id === item.id || skill.name === item.name) ?? null;
          return {
            name: item.name ?? fromCatalog?.name ?? "",
            iconId: item.iconId || fromCatalog?.iconId || iconIdFromUrl(item.icon ?? "") || item.id || "",
          };
        })
        .filter((skill) => skill.name);
      if (matched.length === 0) {
        setImportHint("没解析到技能，请在下面技能库里手选。");
        return;
      }
      setPetSkills(matched);
      if (data.icon) setPetIcon(data.icon as string);
      setPetName(String(data.name ?? `藏宝阁召唤兽（${matched.length} 技能）`));
      const importedCifu = (data.cifu as string[] | undefined)?.filter((id) => SKILL_BY_ID[id]) ?? [];
      const nextCifu =
        importedCifu.length > 0
          ? importedCifu.slice(0, CIFU_SLOT_COUNT)
          : matched
              .map((skill) => superIdForName(skill.name))
              .filter((id): id is string => Boolean(id && SKILL_BY_ID[id]))
              .filter((id, index, arr) => arr.indexOf(id) === index)
              .slice(0, CIFU_SLOT_COUNT);
      if (nextCifu.length) {
        setRolled(nextCifu);
        setDisplay(nextCifu);
        rolledRef.current = nextCifu;
        setLocked([]);
        lockedRef.current = [];
      }
      setImportHint(`已导入 ${matched.length} 个技能`);
    } catch {
      setImportHint("导入失败，请手选技能。");
    }
  }

  function toggleLock(id: string) {
    if (switchMode) return;
    setLocked((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_LOCKS
          ? prev
          : [...prev, id];
      lockedRef.current = next;
      return next;
    });
  }

  function stopChain() {
    chainSeq.current += 1;
    window.clearTimeout(chainWait.current);
    setChaining(false);
  }

  function cifuOnce() {
    const current = rolledRef.current;
    const nextLocks = lockedRef.current.filter((id) => current.includes(id));
    const next = rollCifu(current, nextLocks);
    rolledRef.current = next;
    lockedRef.current = nextLocks;
    setRolled(next);
    setDisplay(next);
    setLocked(nextLocks);
    const nextHits = matchCount(next, petSkillsRef.current);
    setRolls((n) => n + 1);
    setWanziSpent((n) => n + wanziCost(nextLocks.length));
    const isFour = nextHits >= CIFU_SLOT_COUNT;
    if (isFour) setFourHits((n) => n + 1);
    setBest((b) => Math.max(b, nextHits));
    setWashing(true);
    setWashKey((key) => key + 1);
    window.clearTimeout(washTimer.current);
    washTimer.current = window.setTimeout(() => setWashing(false), WASH_MS);
    setPausedFour(isFour);
    return isFour;
  }

  function onCifuClick() {
    stopChain();
    cifuOnce();
  }

  function waitChain(ms: number, seq: number) {
    return new Promise<void>((resolve) => {
      chainWait.current = window.setTimeout(resolve, ms);
    }).then(() => {
      if (seq !== chainSeq.current) throw new Error("chain-stop");
    });
  }

  async function cifuFive() {
    if (chaining) return;
    stopChain();
    const seq = chainSeq.current;
    setChaining(true);
    setPausedFour(false);
    try {
      for (let i = 0; i < CHAIN_COUNT; i++) {
        if (seq !== chainSeq.current) return;
        const isFour = cifuOnce();
        if (isFour) {
          setChaining(false);
          return;
        }
        if (i < CHAIN_COUNT - 1) await waitChain(WASH_MS, seq);
      }
    } catch {
      return;
    }
    if (seq === chainSeq.current) setChaining(false);
  }

  function onSlotClick(index: number) {
    if (switchMode) setSwitchSlot(index);
  }

  function switchToSkill(superId: string) {
    if (switchSlot === null) return;
    const next = [...(display.length ? display : Array(CIFU_SLOT_COUNT).fill(""))];
    next[switchSlot] = superId;
    setRolled(next);
    setDisplay(next);
    setLocked((prev) => prev.filter((id) => next.includes(id)));
    setSwitchSlot(null);
  }

  function reset() {
    stopChain();
    rolledRef.current = [];
    lockedRef.current = [];
    setRolled([]);
    setDisplay([]);
    setLocked([]);
    setRolls(0);
    setBest(0);
    setWanziSpent(0);
    setFourHits(0);
    setPausedFour(false);
    setSwitchSlot(null);
  }

  const slots = display.length ? display : rolled;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="text-center">
        <p className="text-sm tracking-[0.3em] text-amber-800/70">召唤兽工具</p>
        <h1 className="mt-1 font-serif text-3xl text-amber-950">赐福模拟器</h1>
      </header>

      <section className="rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-stone-600">藏宝阁链接 / EID</label>
            <div className="flex gap-2">
              <input
                value={cbgUrl}
                onChange={(e) => setCbgUrl(e.target.value)}
                placeholder="粘贴藏宝阁召唤兽链接"
                className="w-full rounded-full border border-stone-200 px-4 py-2 text-sm outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={importCbg}
                className="shrink-0 rounded-full bg-amber-800 px-4 py-2 text-sm text-amber-50"
              >
                导入
              </button>
            </div>
            {importHint ? <p className="mt-1 text-xs text-stone-500">{importHint}</p> : null}
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm text-stone-600">或选择召唤兽造型</label>
            <input
              value={petQuery}
              onChange={(e) => setPetQuery(e.target.value)}
              placeholder="搜索造型，如 超级金猴"
              className="w-full rounded-full border border-stone-200 px-4 py-2 text-sm outline-none focus:border-amber-400"
            />
            <div className="mt-2 flex max-h-28 flex-wrap gap-2 overflow-auto">
              {filteredPets.map((pet) => (
                <button
                  type="button"
                  key={pet.id}
                  onClick={() => choosePet(pet)}
                  className="flex items-center gap-1 rounded border border-stone-200 bg-white px-2 py-1 text-xs hover:border-amber-300"
                >
                  <img src={petIconUrl(pet.iconId)} alt="" className="h-7 w-7" />
                  {pet.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="cifu-window overflow-hidden rounded-md">
        <div className="cifu-titlebar flex items-center justify-between px-4 py-1.5">
          <span className="w-16" />
          <h2 className="font-serif text-lg tracking-[0.4em]">赐福</h2>
          <label className="flex items-center gap-1 text-[11px] text-amber-100">
            指定
            <input
              type="checkbox"
              className="cifu-switch"
              checked={switchMode}
              onChange={(e) => {
                setSwitchMode(e.target.checked);
                setSwitchSlot(null);
              }}
            />
          </label>
        </div>

        <div className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="cifu-panel min-h-[220px] rounded-sm p-3">
            <div className="mb-2 flex items-center gap-2">
              {petIcon ? (
                <img src={petIcon} alt="" referrerPolicy="no-referrer" className="h-12 w-12 object-contain" />
              ) : null}
              <div>
                <div className="inline-flex items-center gap-1 rounded-sm bg-[#5d68aa] px-2 py-0.5 text-xs text-amber-100">
                  技能列表
                </div>
                <div className="mt-1 text-xs text-[#2f3560]">{petName}</div>
              </div>
            </div>
            <p className="mb-1 text-xs text-[#3d446e]">可赐福技能</p>
            <div className="mb-3 flex flex-wrap gap-1">
              {able.length ? (
                able.map((skill) => (
                  <button type="button" key={skill.name} onClick={() => addPetSkill(skill)} title={skill.name}>
                    <PetSkillIcon skill={skill} />
                  </button>
                ))
              ) : (
                <span className="text-[11px] text-[#2f3560]/70">导入或点选下方技能</span>
              )}
            </div>
            <p className="mb-1 text-xs text-[#3d446e]">不可赐福技能</p>
            <div className="flex flex-wrap gap-1">
              {unable.map((skill) => (
                <button type="button" key={skill.name} onClick={() => addPetSkill(skill)} title={skill.name}>
                  <PetSkillIcon skill={skill} />
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#2f3560]">
              <span>赐福次数 {rolls}</span>
              <span>命中 {slots.length ? `${hits}/${able.length || 0}` : "-"}</span>
              <span>最佳 {best}</span>
              <span>四赐福 {fourHits} 次</span>
              <span>
                平均{" "}
                {fourHits > 0 ? `${Math.round(wanziSpent / fourHits)} 丸子 / 四赐福` : "- 丸子 / 四赐福"}
              </span>
            </div>
          </div>

          <div className="cifu-panel flex min-w-[280px] flex-col items-center rounded-sm px-3 py-4">
            <div className="flex flex-row gap-2">
              {Array.from({ length: CIFU_SLOT_COUNT }).map((_, index) => {
                const id = slots[index];
                const skill = id ? SKILL_BY_ID[id] : undefined;
                const isHit = skill ? wantedIds.includes(skill.id) : false;
                const isLocked = skill ? locked.includes(skill.id) : false;
                const picking = switchMode && switchSlot === index;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <button
                      type="button"
                      disabled={!skill && !switchMode}
                      onClick={() => onSlotClick(index)}
                      className={`cifu-slot relative flex items-center justify-center overflow-hidden ${
                        picking ? "ring-2 ring-sky-300" : ""
                      } ${washing && !isLocked ? "is-washing" : ""}`}
                      style={washing && !isLocked ? { animationDelay: `${index * 55}ms` } : undefined}
                      title={
                        switchMode
                          ? "指定模式：点格子再点技能库替换"
                          : skill
                            ? `${skill.name}${isHit ? "（召唤兽已有）" : "（召唤兽没有）"}`
                            : "未赐福"
                      }
                    >
                      {skill ? (
                        <>
                          <span className={isHit ? "cifu-owned" : "cifu-missing"}>
                            <img
                              key={isLocked ? skill.id : `${skill.id}-${washKey}`}
                              src={skillIconUrl(skill.iconId)}
                              alt=""
                              className={`h-12 w-12 image-pixelated ${washing && !isLocked ? "cifu-wash" : ""}`}
                              style={washing && !isLocked ? { animationDelay: `${index * 55}ms` } : undefined}
                            />
                          </span>
                          {washing && !isLocked ? (
                            <span aria-hidden key={`fx-${washKey}`} className="cifu-fx" style={{ animationDelay: `${index * 55}ms` }}>
                              <span className="cifu-burst" style={{ animationDelay: `${index * 55}ms` }} />
                              <span className="cifu-sheen" style={{ animationDelay: `${index * 55}ms` }} />
                              <span className="cifu-spark" style={{ "--dx": "-18px", "--dy": "-16px", animationDelay: `${index * 55}ms` } as CSSProperties} />
                              <span className="cifu-spark" style={{ "--dx": "17px", "--dy": "-14px", animationDelay: `${80 + index * 55}ms` } as CSSProperties} />
                              <span className="cifu-spark" style={{ "--dx": "-14px", "--dy": "16px", animationDelay: `${120 + index * 55}ms` } as CSSProperties} />
                              <span className="cifu-spark" style={{ "--dx": "16px", "--dy": "15px", animationDelay: `${160 + index * 55}ms` } as CSSProperties} />
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="cifu-seal" />
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={!skill || switchMode}
                      onClick={() => skill && toggleLock(skill.id)}
                      className={`cifu-lock-btn ${isLocked ? "is-on" : ""}`}
                    >
                      锁
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col items-center">
              <WanziIcon />
              <div className="text-xs text-[#2f3560]">0 / {cost}</div>
              <div className="text-[11px] text-[#2f3560]/80">累计 {wanziSpent} 丸子</div>
              <div className="text-[11px] text-[#2f3560]/80">
                {fourHits > 0
                  ? `平均 ${Math.round(wanziSpent / fourHits)} 丸子一个四赐福`
                  : "尚未出四赐福"}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onCifuClick}
                className="cifu-action min-w-[96px] rounded-sm px-6 py-1.5 text-sm tracking-widest"
              >
                赐福
              </button>
              <button
                type="button"
                onClick={cifuFive}
                className="cifu-action min-w-[96px] rounded-sm px-4 py-1.5 text-sm tracking-widest"
              >
                {chaining ? "连赐中" : "连赐5次"}
              </button>
            </div>
            {pausedFour ? (
              <p className="mt-2 text-center text-[11px] font-medium text-[#2f3560]">出四赐福，已停下，点赐福继续</p>
            ) : null}
            <button type="button" onClick={reset} className="mt-2 text-[11px] text-[#2f3560]/70">
              重置次数
            </button>
            <p className="mt-2 text-center text-[10px] leading-4 text-[#2f3560]/70">
              {switchMode ? "指定开启：点格子再点技能替换" : "点技能下方「锁」锁定，最多 2 个"}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-lg text-amber-950">
            {switchMode ? "点选超级技能替换格子" : "点选技能加入召唤兽"}
          </h2>
          <input
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
            placeholder="搜索技能…"
            className="w-full rounded-full border border-stone-200 bg-white px-4 py-2 text-sm outline-none focus:border-amber-400 sm:w-64"
          />
        </div>
        {switchMode ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {SUPER_SKILLS.filter((skill) => !skillQuery.trim() || skill.name.includes(skillQuery.trim())).map(
              (skill) => (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => switchToSkill(skill.id)}
                  className="flex flex-col items-center gap-1 rounded-xl border border-stone-200 bg-white px-1.5 py-2 hover:border-amber-300"
                >
                  <img src={skillIconUrl(skill.iconId)} alt="" className="h-12 w-12 image-pixelated" />
                  <span className="text-[11px]">{skill.name.replace("超级", "")}</span>
                </button>
              ),
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {filteredSkills.map((skill) => {
              const selected = petSkills.some((item) => item.name === skill.name);
              return (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => addPetSkill({ name: skill.name, iconId: skill.iconId || skill.id })}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-1.5 py-2 ${
                    selected ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-white hover:border-amber-200"
                  }`}
                >
                  <img src={skillIconUrl(skill.iconId)} alt="" className="h-12 w-12 image-pixelated" />
                  <span className="text-[11px] leading-tight text-stone-700">{skill.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
