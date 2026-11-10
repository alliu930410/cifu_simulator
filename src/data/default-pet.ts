import type { PetSkill } from "@/lib/cifu";

export const DEFAULT_PET_NAME = "自在心猿";
export const DEFAULT_PET_ICON = "/assets/peticon/12038.png";

export const DEFAULT_PET_SKILLS: PetSkill[] = [
  { name: "高级必杀", iconId: "416" },
  { name: "高级偷袭", iconId: "425" },
  { name: "高级强力", iconId: "434" },
  { name: "高级防御", iconId: "435" },
  { name: "高级夜战", iconId: "401" },
  { name: "高级吸血", iconId: "404" },
  { name: "高级连击", iconId: "405" },
  { name: "高级感知", iconId: "408" },
  { name: "高级神佑复生", iconId: "411" },
];

/** 默认赐福：必杀、感知、偷袭、神迹 */
export const DEFAULT_CIFU_IDS = ["bi-sha", "gan-zhi", "tou-xi", "shen-ji"];
