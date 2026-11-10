import { NextRequest, NextResponse } from "next/server";
import { PET_SKILL_CATALOG } from "@/data/catalog";
import { defaultCifuIds, superIdForName } from "@/lib/cifu";
import { SKILL_BY_ID, petIconUrl, skillIconUrl } from "@/data/super-skills";

function parseEid(input: string) {
  const trimmed = input.trim();
  const fromPath = trimmed.match(/equip\/(\d+)\/([^/?#]+)/);
  if (fromPath) return { serverId: fromPath[1], eid: fromPath[2] };
  const fromQuery = trimmed.match(/[?&]eid=([^&]+)/);
  if (fromQuery) {
    const eid = decodeURIComponent(fromQuery[1]);
    const serverFromEid = eid.match(/^\d+-(\d+)-/);
    return { serverId: serverFromEid?.[1] ?? "", eid };
  }
  if (/^\d+-.+/.test(trimmed)) {
    const serverFromEid = trimmed.match(/^\d+-(\d+)-/);
    return { serverId: serverFromEid?.[1] ?? "", eid: trimmed };
  }
  return { serverId: "", eid: trimmed };
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://xyq-m.cbg.163.com/",
      Accept: "application/json, text/plain, */*",
    },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

function extractSkillIds(desc: string, known: Set<string>) {
  const groups = [...desc.matchAll(/(\d{3,4}(?:\|\d{3,4})+)/g)].map((match) => match[1].split("|"));
  const valid = groups.filter((group) => group.length > 0 && group.every((id) => known.has(id)));
  valid.sort((a, b) => b.length - a.length);
  return valid[0] ?? [];
}

function parseOriType(desc: string) {
  return desc.match(/"ori_type"\s*:\s*(\d+)/)?.[1] ?? "";
}

function petIconFromDesc(desc: string, equip: Record<string, unknown>) {
  const oriType = parseOriType(desc);
  if (oriType) return petIconUrl(oriType);
  const face = String(equip.equip_face_img ?? "");
  const typeId = String(equip.equip_type ?? "").replace(/\.gif$/i, "");
  const numeric = (face.replace(/\.gif$/i, "") || typeId).replace(/^1(\d{4,})$/, "$1");
  if (/^\d+$/.test(numeric) && numeric.length <= 5) return petIconUrl(numeric);
  return "";
}

function parseListedCifu(desc: string) {
  const evol = desc.match(/"EvolSkill"\s*:\s*"([^"]*)"/)?.[1] ?? "";
  const fromEvol = evol
    .split(/[|,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const fromIds = [...desc.matchAll(/55\d{3}/g)].map((match) => match[0]);
  const raw = fromEvol.length ? fromEvol : fromIds;
  const ids: string[] = [];
  for (const token of raw) {
    if (SKILL_BY_ID[token]) {
      if (!ids.includes(token)) ids.push(token);
    } else {
      const mapped = superIdForName(token) ?? superIdForName(`超级${token}`);
      if (mapped && !ids.includes(mapped)) ids.push(mapped);
    }
    if (ids.length >= 4) break;
  }
  return ids;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url") ?? "";
  if (!url) {
    return NextResponse.json({ error: "缺少藏宝阁链接" }, { status: 400 });
  }

  const { serverId, eid } = parseEid(url);
  const endpoints = [
    `https://xyq-m.cbg.163.com/cgi/api/get_equip_detail?serverid=${serverId}&eid=${encodeURIComponent(eid)}&client_type=1`,
    `https://xyq-m.cbg.163.com/cgi/api/get_equip_detail?eid=${encodeURIComponent(eid)}&client_type=1`,
    `https://xyq-m.cbg.163.com/cgi/api/get_equip_detail?serverid=${serverId}&eid=${encodeURIComponent(eid)}`,
  ];

  let payload: Record<string, unknown> | null = null;
  for (const endpoint of endpoints) {
    try {
      const json = await fetchJson(endpoint);
      if (!json || typeof json !== "object") continue;
      const record = json as Record<string, unknown>;
      if (record.status === 2 || record.status_code === "SESSION_TIMEOUT") continue;
      if (!record.equip) continue;
      payload = record;
      break;
    } catch {
      continue;
    }
  }

  if (!payload) {
    return NextResponse.json(
      { error: "藏宝阁详情拉不到（未登录或链接失效），请改用手选技能。" },
      { status: 502 },
    );
  }

  const equip = payload.equip as Record<string, unknown>;
  const otherInfo = (equip.other_info ?? {}) as Record<string, unknown>;
  const desc = String(otherInfo.desc ?? "");

  const known = new Set(PET_SKILL_CATALOG.map((skill) => String(skill.id)));
  const byId = Object.fromEntries(PET_SKILL_CATALOG.map((skill) => [String(skill.id), skill]));
  const ids = extractSkillIds(desc, known);

  const skills = ids
    .map((id) => byId[id])
    .filter(Boolean)
    .map((skill) => ({
      id: String(skill.id),
      name: skill.name,
      iconId: String(skill.iconId),
      icon: skillIconUrl(skill.iconId),
    }));

  if (skills.length === 0) {
    return NextResponse.json(
      { error: "拿到了商品，但没解析到技能，请改用手选。" },
      { status: 502 },
    );
  }

  const listedCifu = parseListedCifu(desc);
  const cifu =
    listedCifu.length > 0
      ? listedCifu
      : defaultCifuIds(skills.map((skill) => ({ name: skill.name, iconId: skill.iconId })));

  return NextResponse.json({
    eid,
    name: String(equip.equip_name ?? equip.format_equip_name ?? "藏宝阁召唤兽"),
    icon: petIconFromDesc(desc, equip),
    skills,
    cifu,
  });
}
