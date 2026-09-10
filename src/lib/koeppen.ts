export type Hemisphere = "north" | "south";

export interface KoeppenInfo {
  code: string;
  color: string;
  de: string;
  en: string;
}

const ZONE_META: Record<string, { color: string; de: string; en: string }> = {
  Af: { color: "#0d6b3f", de: "Tropisches Regenwaldklima", en: "Tropical rainforest" },
  Am: { color: "#1c8f52", de: "Tropisches Monsunklima", en: "Tropical monsoon" },
  Aw: { color: "#5aa96a", de: "Tropisches Savannenklima", en: "Tropical savanna" },
  As: { color: "#7bb87f", de: "Tropisches Savannenklima (Sommertrocken)", en: "Tropical savanna, dry summer" },
  BWh: { color: "#e0562a", de: "Heißes Wüstenklima", en: "Hot desert" },
  BWk: { color: "#e98a5c", de: "Kaltes Wüstenklima", en: "Cold desert" },
  BSh: { color: "#e0a13a", de: "Heißes Steppenklima", en: "Hot steppe" },
  BSk: { color: "#e9c073", de: "Kaltes Steppenklima", en: "Cold steppe" },
  Csa: { color: "#f2e14c", de: "Heißes Mittelmeerklima", en: "Hot-summer Mediterranean" },
  Csb: { color: "#d6cf4e", de: "Warmes Mittelmeerklima", en: "Warm-summer Mediterranean" },
  Csc: { color: "#b8b34a", de: "Kühles Mittelmeerklima", en: "Cool-summer Mediterranean" },
  Cwa: { color: "#8fd49b", de: "Feuchtes Subtropenklima, Wintertrocken", en: "Dry-winter humid subtropical" },
  Cwb: { color: "#6fc48a", de: "Subtropisches Hochlandklima", en: "Dry-winter subtropical highland" },
  Cwc: { color: "#4ea973", de: "Kühles Hochlandklima, Wintertrocken", en: "Dry-winter cold subtropical" },
  Cfa: { color: "#54c9a8", de: "Feuchtes Subtropenklima", en: "Humid subtropical" },
  Cfb: { color: "#3aa8c9", de: "Ozeanisches Klima", en: "Oceanic" },
  Cfc: { color: "#2f87ad", de: "Subpolares Ozeanklima", en: "Subpolar oceanic" },
  Dsa: { color: "#c58ad6", de: "Kontinentalklima, Sommertrocken", en: "Dry-summer continental" },
  Dsb: { color: "#a96fc4", de: "Kontinentalklima, Sommertrocken kühl", en: "Dry-summer continental, cool" },
  Dsc: { color: "#8d5aa8", de: "Subarktisch, Sommertrocken", en: "Dry-summer subarctic" },
  Dsd: { color: "#74468d", de: "Subarktisch, sehr kalt", en: "Dry-summer subarctic, severe" },
  Dwa: { color: "#8fa6e0", de: "Kontinentalklima, Wintertrocken", en: "Dry-winter continental" },
  Dwb: { color: "#6f88cf", de: "Kontinentalklima, Wintertrocken kühl", en: "Dry-winter continental, cool" },
  Dwc: { color: "#556fb8", de: "Subarktisch, Wintertrocken", en: "Dry-winter subarctic" },
  Dwd: { color: "#3f568f", de: "Subarktisch, extrem kalt", en: "Dry-winter subarctic, severe" },
  Dfa: { color: "#7ad0e6", de: "Feuchtes Kontinentalklima, heiße Sommer", en: "Hot-summer humid continental" },
  Dfb: { color: "#54b0d6", de: "Feuchtes Kontinentalklima", en: "Warm-summer humid continental" },
  Dfc: { color: "#3d8ab8", de: "Subarktisches Klima", en: "Subarctic" },
  Dfd: { color: "#2b6b93", de: "Extrem kaltes Subarktisklima", en: "Extremely cold subarctic" },
  ET: { color: "#b9c6cf", de: "Tundrenklima", en: "Tundra" },
  EF: { color: "#eaf2f7", de: "Eisklima", en: "Ice cap" },
};

export const KOEPPEN_GROUPS = [
  { key: "A", de: "Tropisch", en: "Tropical", codes: ["Af", "Am", "Aw", "As"] },
  { key: "B", de: "Trocken", en: "Dry", codes: ["BWh", "BWk", "BSh", "BSk"] },
  { key: "C", de: "Warmgemäßigt", en: "Temperate", codes: ["Csa", "Csb", "Csc", "Cwa", "Cwb", "Cwc", "Cfa", "Cfb", "Cfc"] },
  { key: "D", de: "Kalt / Kontinental", en: "Continental", codes: ["Dsa", "Dsb", "Dsc", "Dsd", "Dwa", "Dwb", "Dwc", "Dwd", "Dfa", "Dfb", "Dfc", "Dfd"] },
  { key: "E", de: "Polar", en: "Polar", codes: ["ET", "EF"] },
] as const;

export function koeppenMeta(code: string): KoeppenInfo {
  const meta = ZONE_META[code] ?? { color: "#94a3b8", de: "Unbestimmt", en: "Undetermined" };
  return { code, ...meta };
}

/** Classic Köppen-Geiger classification from monthly means. */
export function classifyKoeppen(temp: number[], prec: number[], lat: number): string {
  const tAnn = temp.reduce((a, b) => a + b, 0) / 12;
  const pAnn = prec.reduce((a, b) => a + b, 0);
  const tMax = Math.max(...temp);
  const tMin = Math.min(...temp);
  const pMin = Math.min(...prec);
  const north = lat >= 0;
  const summerIdx = north ? [3, 4, 5, 6, 7, 8] : [9, 10, 11, 0, 1, 2];
  const winterIdx = north ? [9, 10, 11, 0, 1, 2] : [3, 4, 5, 6, 7, 8];
  const sum = (idx: number[]) => idx.reduce((a, m) => a + prec[m]!, 0);
  const pSummer = sum(summerIdx);
  const pWinter = sum(winterIdx);
  const pSummerMin = Math.min(...summerIdx.map((m) => prec[m]!));
  const pWinterMin = Math.min(...winterIdx.map((m) => prec[m]!));
  const monthsAbove10 = temp.filter((t) => t >= 10).length;

  // Aridity threshold
  let offset = 0;
  if (pSummer >= 0.7 * pAnn) offset = 280;
  else if (pWinter >= 0.7 * pAnn) offset = 0;
  else offset = 140;
  const threshold = 20 * tAnn + offset;

  if (pAnn < threshold) {
    const w = pAnn < threshold / 2 ? "W" : "S";
    const h = tAnn >= 18 ? "h" : "k";
    return `B${w}${h}`;
  }

  if (tMin >= 18) {
    if (pMin >= 60) return "Af";
    if (pMin >= 100 - pAnn / 25) return "Am";
    return north ? "Aw" : "Aw";
  }

  if (tMax < 10) return tMax > 0 ? "ET" : "EF";

  const third =
    tMin >= -3
      ? "C"
      : "D";
  let second: string;
  if (pSummerMin < 40 && pSummerMin < pWinterMin / 3) second = "s";
  else if (pWinterMin < pSummerMin / 10) second = "w";
  else second = "f";

  let letter: string;
  if (tMax >= 22) letter = "a";
  else if (monthsAbove10 >= 4) letter = "b";
  else if (tMin < -38 && third === "D") letter = "d";
  else letter = "c";
  if (third === "D" && tMin < -38 && letter === "c") letter = "d";

  return `${third}${second}${letter}`;
}
