#!/usr/bin/env python3
import json
import pathlib
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC_SKILL = ROOT / "public" / "assets" / "skillicon"
PUBLIC_PET = ROOT / "public" / "assets" / "peticon"
DATA = ROOT / "src" / "data"
HOST = "https://cbg-1251261088.cos-website.ap-shanghai.myqcloud.com"

PUBLIC_SKILL.mkdir(parents=True, exist_ok=True)
PUBLIC_PET.mkdir(parents=True, exist_ok=True)

UA = {"User-Agent": "Mozilla/5.0"}


def get_json(url: str):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.loads(res.read())


def download(url: str, dest: pathlib.Path) -> bool:
    if dest.exists() and dest.stat().st_size > 0:
        return True
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=20) as res:
            data = res.read()
        if not data:
            return False
        dest.write_bytes(data)
        return True
    except Exception as exc:
        print("fail", url, exc)
        return False


skills = get_json("https://cbg-value.v8cloud.cn/api/pet/skill/skills")["data"]
pets = get_json("https://cbg-value.v8cloud.cn/api/pet/skill/list")["data"]

super_ids = [
    "55401", "55402", "55403", "55404", "55405", "55406", "55407", "55408",
    "55409", "55410", "55413", "55414", "55415", "55416", "55417", "55418",
    "55419", "55420", "55421", "55422", "55423", "55424", "55425", "55426",
    "55427", "55428", "55429", "55430", "55431", "55432", "55433", "55434",
    "55435", "55438", "55439", "55443", "55493", "55494", "55495", "55496",
    "55497", "55573", "55577", "55578", "55595", "55627", "55629", "55641",
]

jobs = []
for skill in skills:
    sid = str(skill["id"])
    jobs.append((f"{HOST}/skillicon/{sid}.gif", PUBLIC_SKILL / f"{sid}.gif"))
for sid in super_ids:
    jobs.append((f"{HOST}/skillicon/{sid}.gif", PUBLIC_SKILL / f"{sid}.gif"))
for pet in pets:
    pid = str(pet["id"])
    jobs.append((f"{HOST}/peticon/{pid}.png", PUBLIC_PET / f"{pid}.png"))

ok = 0
with ThreadPoolExecutor(max_workers=16) as pool:
    futs = {pool.submit(download, url, dest): dest for url, dest in jobs}
    for fut in as_completed(futs):
        if fut.result():
            ok += 1
print(f"downloaded {ok}/{len(jobs)}")


def slim_skills(arr):
    return [{"name": s["name"], "iconId": str(s.get("id") or "")} for s in arr or []]


catalog_skills = [{"id": str(s["id"]), "name": s["name"], "iconId": str(s["id"])} for s in skills]
catalog_pets = []
for pet in pets:
    catalog_pets.append(
        {
            "id": str(pet["id"]),
            "name": pet["name"],
            "iconId": str(pet["id"]),
            "baseSkills": slim_skills(pet.get("baseSkills")),
            "normalSkills": slim_skills(pet.get("normalSkills")),
        }
    )

(DATA / "pet-skill-catalog.json").write_text(
    json.dumps({"skills": catalog_skills, "pets": catalog_pets}, ensure_ascii=False, separators=(",", ":")),
    encoding="utf-8",
)
print("catalog", len(catalog_skills), "skills", len(catalog_pets), "pets")
