import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { STATIONS } from "@/data/stations";
import { CONTINENTS, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function TopBar({
  continent,
  zoneGroup,
  onContinent,
  onZoneGroup,
  onSelect,
  count,
}: {
  continent: string;
  zoneGroup: string;
  onContinent: (v: string) => void;
  onZoneGroup: (v: string) => void;
  onSelect: (id: string) => void;
  count: number;
}) {
  const { lang, setLang, t } = useLang();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.country.toLowerCase().includes(term) ||
        s.countryDe.toLowerCase().includes(term),
    ).slice(0, 8);
  }, [q]);

  const selectClass =
    "rounded-md border border-border bg-secondary/50 px-2.5 py-2 text-sm text-foreground outline-none";

  return (
    <header className="pointer-events-auto flex flex-wrap items-center gap-3 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl">
      <Link to="/" className="mr-2 flex items-baseline gap-2">
        <span className="font-display text-xl tracking-tight text-foreground">{t("title")}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">{t("subtitle")}</span>
      </Link>

      <div className="relative min-w-52 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
          className="w-full rounded-md border border-border bg-secondary/50 py-2 pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
        />
        {results.length > 0 && (
          <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-xl">
            {results.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    onSelect(s.id);
                    setQ("");
                  }}
                  className="flex w-full items-baseline justify-between gap-2 px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent"
                >
                  <span>{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {lang === "de" ? s.countryDe : s.country}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {q.trim().length >= 2 && results.length === 0 && (
          <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-muted-foreground">
            {t("noResults")}
          </div>
        )}
      </div>

      <select value={continent} onChange={(e) => onContinent(e.target.value)} className={selectClass}>
        <option value="">{t("allContinents")}</option>
        {Object.entries(CONTINENTS).map(([key, label]) => (
          <option key={key} value={key}>
            {label[lang]}
          </option>
        ))}
      </select>

      <select value={zoneGroup} onChange={(e) => onZoneGroup(e.target.value)} className={selectClass}>
        <option value="">{t("allZones")}</option>
        <option value="A">A · {lang === "de" ? "Tropisch" : "Tropical"}</option>
        <option value="B">B · {lang === "de" ? "Trocken" : "Dry"}</option>
        <option value="C">C · {lang === "de" ? "Warmgemäßigt" : "Temperate"}</option>
        <option value="D">D · {lang === "de" ? "Kalt" : "Continental"}</option>
        <option value="E">E · {lang === "de" ? "Polar" : "Polar"}</option>
      </select>

      <span className="hidden text-xs text-muted-foreground md:inline">
        {count} {t("stations")}
      </span>

      <nav className="flex items-center gap-1 text-sm">
        <Link
          to="/klimazonen"
          className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {t("climateZones")}
        </Link>
        <Link
          to="/ueber"
          className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {t("about")}
        </Link>
      </nav>

      <div className="inline-flex rounded-md border border-border bg-secondary/50 p-0.5 text-xs">
        {(["de", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "rounded px-2 py-1 uppercase transition-colors",
              lang === l ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </header>
  );
}
