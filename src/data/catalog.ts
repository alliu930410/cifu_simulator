import catalog from "./pet-skill-catalog.json";

export type CatalogSkill = {
  id: string;
  name: string;
  iconId: string;
};

export type CatalogPet = {
  id: string;
  name: string;
  iconId: string;
  baseSkills: Array<{ name: string; iconId: string }>;
  normalSkills: Array<{ name: string; iconId: string }>;
};

export const PET_SKILL_CATALOG = catalog.skills as CatalogSkill[];
export const PET_APPEARANCE_CATALOG = catalog.pets as CatalogPet[];
