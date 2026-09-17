import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X, Link2, Check } from "lucide-react";
import ModernChart from "@/components/charts/ModernChart";
import WalterLieth from "@/components/charts/WalterLieth";
import { STATIONS, type Station } from "@/data/stations";
import { getCurrentYear } from "@/lib/climate.functions";
import { MONTHS, useLang } from "@/lib/i18n";
import { koeppenMeta } from "@/lib/koeppen";
import { cn } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export default function StationPanel({
  station,
  compareId,
  onCompare,
  onClose,
}: {
  station: Station;
  compareId: string | null;
  onCompare: (id: string | null) => void;
  onClose: () => void;
}) {
  const { lang, t } = useLang();
  const [view, setView] = useState<"modern" | "classic">("modern");
  const [copied, setCopied] = useState(false);
  const months = MONTHS[lang];
  const zone = koeppenMeta(station.zone);
  const compare = compareId ? STATIONS.find((s) => s.id === compareId) : undefined;

  const current = useQuery({
    queryKey: ["current", station.id],
    queryFn: () => getCurrentYear({ lat: station.lat, lon: station.lon }),
    staleTime: 1000 * 60 * 60,
  });

  const warmest = station.temp.indexOf(Math.max(...station.temp));
  const coldest = station.temp.indexOf(Math.min(...station.temp));

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/?station=${station.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <aside className="pointer-events-auto flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-background/85 backdrop-blur-xl">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-background/80 px-5 py-4 backdrop-blur">
        <div>
          <h2 className="font-display text-2xl leading-tight text-foreground">{station.name}</h2>
          <p className="text-sm text-muted-foreground">
            {lang === "de" ? station.countryDe : station.country}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyLink}
            aria-label={t("copyLink")}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
          </button>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="space-y-5 px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: zone.color }} />
          <span className="text-sm text-foreground">
            {zone.code} · {lang === "de" ? zone.de : zone.en}
          </span>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-secondary/40 p-0.5 text-sm">
          {(["modern", "classic"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                view === v ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "modern" ? t("modernView") : t("classicView")}
            </button>
          ))}
        </div>

        {view === "modern" ? (
          <>
            <ModernChart
              temp={station.temp}
              prec={station.prec}
              compareTemp={compare?.temp}
              compareName={compare?.name}
              currentTemp={
                current.data ? (current.data.temp.map((v) => v ?? NaN) as number[]) : undefined
              }
            />
            <p className="text-xs text-muted-foreground">
              {t("normals")}
              {current.isLoading && ` · ${t("loadingCurrent")}`}
              {current.isSuccess && !current.data && ` · ${t("currentUnavailable")}`}
              {current.data && ` · ${t("thisYear")} ${current.data.year}`}
            </p>
          </>
        ) : (
          <>
            <div className="text-foreground">
              <WalterLieth temp={station.temp} prec={station.prec} />
            </div>
            <p className="text-xs text-muted-foreground">{t("walterLiethNote")}</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm" style={{ background: "#3aa8c9" }} /> {t("humidPeriod")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm" style={{ background: "#e0a13a" }} /> {t("aridPeriod")}
              </span>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Stat label={t("annualMean")} value={`${station.tAnnual.toFixed(1)} °C`} />
          <Stat label={t("annualPrec")} value={`${station.pAnnual} mm`} />
          <Stat
            label={t("warmestMonth")}
            value={`${months[warmest]} · ${station.temp[warmest]!.toFixed(1)} °C`}
          />
          <Stat
            label={t("coldestMonth")}
            value={`${months[coldest]} · ${station.temp[coldest]!.toFixed(1)} °C`}
          />
          <Stat label={t("elevation")} value={`${station.elevation} m`} />
          <Stat
            label={t("coordinates")}
            value={`${station.lat.toFixed(2)}° / ${station.lon.toFixed(2)}°`}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-muted-foreground">{t("compare")}</label>
          <div className="mt-1.5 flex gap-2">
            <select
              value={compareId ?? ""}
              onChange={(e) => onCompare(e.target.value || null)}
              className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground"
            >
              <option value="">{t("compareWith")}</option>
              {STATIONS.filter((s) => s.id !== station.id).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {compareId && (
              <button
                onClick={() => onCompare(null)}
                className="whitespace-nowrap rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {t("clearCompare")}
              </button>
            )}
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-1 text-left font-medium" />
              {months.map((m) => (
                <th key={m} className="py-1 font-medium">
                  {m[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr>
              <td className="py-1 text-muted-foreground">°C</td>
              {station.temp.map((v, i) => (
                <td key={i} className="py-1 text-center tabular-nums">
                  {Math.round(v)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1 text-muted-foreground">mm</td>
              {station.prec.map((v, i) => (
                <td key={i} className="py-1 text-center tabular-nums">
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </aside>
  );
}
