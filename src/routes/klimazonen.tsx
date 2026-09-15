import { createFileRoute, Link } from "@tanstack/react-router";
import { STATIONS } from "@/data/stations";
import { useLang } from "@/lib/i18n";
import { KOEPPEN_GROUPS, koeppenMeta } from "@/lib/koeppen";

export const Route = createFileRoute("/klimazonen")({
  head: () => ({
    meta: [
      { title: "Klimazonen nach Köppen-Geiger — Klimadiagramme" },
      {
        name: "description",
        content:
          "Die Köppen-Geiger-Klimaklassifikation erklärt: alle Klimazonen mit Farblegende, deutscher und englischer Bezeichnung.",
      },
      { property: "og:title", content: "Klimazonen nach Köppen-Geiger" },
      {
        property: "og:description",
        content: "Farblegende und Erklärung aller Köppen-Geiger-Klimazonen des interaktiven Globus.",
      },
    ],
  }),
  component: Zones,
});

function Zones() {
  const { lang, t } = useLang();

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← {t("globe")}
        </Link>
        <h1 className="font-display mt-4 text-3xl text-foreground">{t("climateZones")}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {lang === "de"
            ? "Die Klassifikation nach Wladimir Köppen und Rudolf Geiger ordnet jedem Ort anhand der Monatsmittel von Temperatur und Niederschlag eine Klimazone zu. Die Farben entsprechen den Punkten auf dem Globus."
            : "The Köppen-Geiger classification assigns every place a climate type from its monthly temperature and precipitation means. The colours match the points on the globe."}
        </p>

        <div className="mt-8 space-y-8">
          {KOEPPEN_GROUPS.map((g) => (
            <section key={g.key}>
              <h2 className="text-lg font-semibold text-foreground">
                {g.key} · {lang === "de" ? g.de : g.en}
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {g.codes.map((code) => {
                  const meta = koeppenMeta(code);
                  const n = STATIONS.filter((s) => s.zone === code).length;
                  return (
                    <li
                      key={code}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2"
                    >
                      <span className="size-3.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                      <span className="text-sm font-medium text-foreground">{code}</span>
                      <span className="flex-1 text-sm text-muted-foreground">
                        {lang === "de" ? meta.de : meta.en}
                      </span>
                      {n > 0 && <span className="text-xs text-muted-foreground">{n}</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
