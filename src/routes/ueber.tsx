import { createFileRoute, Link } from "@tanstack/react-router";
import { STATIONS } from "@/data/stations";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/ueber")({
  head: () => ({
    meta: [
      { title: "Über das Projekt und die Datenquellen — Klimadiagramme" },
      {
        name: "description",
        content:
          "Woher die Klimadaten stammen, wie die Diagramme entstehen und Dank an klimadiagramme.de von Bernhard Mühr.",
      },
      { property: "og:title", content: "Über Klimadiagramme" },
      {
        property: "og:description",
        content: "Datenquellen, Methodik und Hintergrund des interaktiven Klimaglobus.",
      },
    ],
  }),
  component: About,
});

function About() {
  const { lang, t } = useLang();
  const de = lang === "de";

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← {t("globe")}
        </Link>
        <h1 className="font-display mt-4 text-3xl text-foreground">{t("about")}</h1>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            {de
              ? `Dieser Globus zeigt ${STATIONS.length} Klimastationen weltweit. Jeder Punkt ist nach seiner Köppen-Geiger-Klimazone eingefärbt; ein Klick öffnet die Monatswerte als modernes Diagramm oder als klassisches Walter-Lieth-Klimadiagramm.`
              : `This globe shows ${STATIONS.length} climate stations worldwide. Each point is coloured by its Köppen-Geiger climate type; clicking one opens the monthly values as a modern chart or as a classic Walter-Lieth climate diagram.`}
          </p>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {de ? "Datenquellen" : "Data sources"}
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                {de ? "Klimanormalwerte 1991–2020: " : "Climate normals 1991–2020: "}
                <a className="text-foreground underline" href="https://power.larc.nasa.gov" target="_blank" rel="noreferrer">
                  NASA POWER
                </a>
                {de ? " (MERRA-2, jeweils an den exakten Koordinaten)" : " (MERRA-2, at each location's exact coordinates)"}
              </li>
              <li>
                {de ? "Aktuelles Jahr und Reanalyse: " : "Current year and reanalysis: "}
                <a className="text-foreground underline" href="https://open-meteo.com" target="_blank" rel="noreferrer">
                  Open-Meteo
                </a>{" "}
                (ERA5)
              </li>
              <li>{de ? "Erdtextur: NASA Blue Marble" : "Earth texture: NASA Blue Marble"}</li>
            </ul>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{de ? "Vorbild" : "Inspiration"}</h2>
            <p className="mt-2">
              {de
                ? "Inspiriert von der Sammlung klimadiagramme.de von Bernhard Mühr, die seit vielen Jahren Klimadiagramme aus aller Welt zusammenträgt."
                : "Inspired by klimadiagramme.de by Bernhard Mühr, a long-running collection of climate diagrams from around the world."}
            </p>
          </div>
          <p className="text-xs">
            {de
              ? "Hinweis: Die Normalwerte sind modellierte Rasterdaten für die jeweiligen Koordinaten. Abweichungen zu Messwerten einzelner Wetterstationen sind möglich."
              : "Note: normals are modelled gridded data for each location. They may differ from observations at individual weather stations."}
          </p>
        </div>
      </div>
    </div>
  );
}
