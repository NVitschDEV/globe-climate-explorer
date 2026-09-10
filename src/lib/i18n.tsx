import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "de" | "en";

const STRINGS = {
  title: { de: "Klimadiagramme", en: "Climate Diagrams" },
  subtitle: { de: "Das Weltklima auf dem Globus", en: "World climate on a globe" },
  search: { de: "Station suchen …", en: "Search station …" },
  noResults: { de: "Keine Station gefunden", en: "No station found" },
  allContinents: { de: "Alle Kontinente", en: "All continents" },
  allZones: { de: "Alle Klimazonen", en: "All climate zones" },
  stations: { de: "Stationen", en: "stations" },
  modernView: { de: "Modern", en: "Modern" },
  classicView: { de: "Klassisch", en: "Classic" },
  temperature: { de: "Temperatur", en: "Temperature" },
  precipitation: { de: "Niederschlag", en: "Precipitation" },
  annualMean: { de: "Jahresmittel", en: "Annual mean" },
  annualPrec: { de: "Jahresniederschlag", en: "Annual precipitation" },
  warmestMonth: { de: "Wärmster Monat", en: "Warmest month" },
  coldestMonth: { de: "Kältester Monat", en: "Coldest month" },
  elevation: { de: "Höhe", en: "Elevation" },
  coordinates: { de: "Koordinaten", en: "Coordinates" },
  climateZone: { de: "Klimazone", en: "Climate zone" },
  normals: { de: "Mittel 1991–2020", en: "Normals 1991–2020" },
  thisYear: { de: "Aktuelles Jahr", en: "Current year" },
  loadingCurrent: { de: "Lade aktuelle Werte …", en: "Loading current values …" },
  currentUnavailable: { de: "Aktuelle Werte derzeit nicht verfügbar.", en: "Current values unavailable right now." },
  compare: { de: "Vergleichen", en: "Compare" },
  compareWith: { de: "Station vergleichen …", en: "Compare station …" },
  clearCompare: { de: "Vergleich beenden", en: "End comparison" },
  copyLink: { de: "Link kopieren", en: "Copy link" },
  linkCopied: { de: "Link kopiert", en: "Link copied" },
  close: { de: "Schließen", en: "Close" },
  climateZones: { de: "Klimazonen", en: "Climate zones" },
  about: { de: "Über", en: "About" },
  globe: { de: "Globus", en: "Globe" },
  hint: { de: "Ziehen zum Drehen · Scrollen zum Zoomen · Punkt anklicken", en: "Drag to rotate · scroll to zoom · click a point" },
  aridPeriod: { de: "Aride Periode", en: "Arid period" },
  humidPeriod: { de: "Humide Periode", en: "Humid period" },
  walterLiethNote: {
    de: "Walter-Lieth-Diagramm: 10 °C entsprechen 20 mm Niederschlag.",
    en: "Walter-Lieth diagram: 10 °C corresponds to 20 mm of precipitation.",
  },
  dailyMax: { de: "Mittl. Tagesmaximum", en: "Mean daily max" },
  dailyMin: { de: "Mittl. Tagesminimum", en: "Mean daily min" },
} as const;

export type StringKey = keyof typeof STRINGS;

export const MONTHS = {
  de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
} as const;

export const CONTINENTS = {
  europe: { de: "Europa", en: "Europe" },
  asia: { de: "Asien", en: "Asia" },
  africa: { de: "Afrika", en: "Africa" },
  "north-america": { de: "Nordamerika", en: "North America" },
  "central-america": { de: "Mittelamerika", en: "Central America" },
  "south-america": { de: "Südamerika", en: "South America" },
  australia: { de: "Australien / Ozeanien", en: "Australia / Oceania" },
  antarctica: { de: "Antarktis", en: "Antarctic" },
} as const;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: StringKey) => string;
}

const Ctx = createContext<LangCtx>({ lang: "de", setLang: () => {}, t: (k) => STRINGS[k].de });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    const stored = window.localStorage.getItem("kd-lang");
    if (stored === "de" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("kd-lang", l);
  }, []);

  const value = useMemo<LangCtx>(
    () => ({ lang, setLang, t: (k: StringKey) => STRINGS[k][lang] }),
    [lang, setLang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}
