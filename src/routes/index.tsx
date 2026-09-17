import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import StationPanel from "@/components/StationPanel";
import TopBar from "@/components/TopBar";
import { STATIONS } from "@/data/stations";
import { useLang } from "@/lib/i18n";

const Globe = lazy(() => import("@/components/Globe"));

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { station?: string; compare?: string } = {};
    if (typeof search["station"] === "string") out.station = search["station"];
    if (typeof search["compare"] === "string") out.compare = search["compare"];
    return out;
  },
  head: () => ({
    meta: [
      { title: "Klimadiagramme — Weltklima auf dem interaktiven Globus" },
      {
        name: "description",
        content:
          "Klimadiagramme weltweit auf einem drehbaren Globus: Station anklicken und Temperatur, Niederschlag und Walter-Lieth-Diagramm ansehen.",
      },
      { property: "og:title", content: "Klimadiagramme — Weltklima auf dem interaktiven Globus" },
      {
        property: "og:description",
        content: "Interaktiver Globus mit Klimastationen: Normalwerte 1991–2020, moderne Diagramme und klassische Walter-Lieth-Darstellung.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { station: stationId, compare } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const { t } = useLang();
  const [continent, setContinent] = useState("");
  const [zoneGroup, setZoneGroup] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const stations = useMemo(
    () =>
      STATIONS.filter(
        (s) =>
          (!continent || s.continent === continent) &&
          (!zoneGroup || s.zone.startsWith(zoneGroup)),
      ),
    [continent, zoneGroup],
  );

  const selected = stationId ? STATIONS.find((s) => s.id === stationId) : undefined;

  const setSearch = (next: { station?: string | undefined; compare?: string | undefined }) =>
    navigate({
      search: (prev) => {
        const merged: { station?: string; compare?: string } = {};
        const station = "station" in next ? next.station : prev.station;
        const compare = "compare" in next ? next.compare : prev.compare;
        if (station) merged.station = station;
        if (compare) merged.compare = compare;
        return merged;
      },
      replace: true,
    });

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      <TopBar
        continent={continent}
        zoneGroup={zoneGroup}
        onContinent={setContinent}
        onZoneGroup={setZoneGroup}
        onSelect={(id) => setSearch({ station: id })}
        count={stations.length}
      />

      <main className="relative flex min-h-0 flex-1">
        <div className="absolute inset-0">
          {mounted && (
            <Suspense fallback={null}>
              <Globe
                stations={stations}
                selectedId={selected?.id ?? null}
                onSelect={(id) => setSearch({ station: id })}
              />
            </Suspense>
          )}
        </div>

        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground">
          {t("hint")}
        </p>

        {selected && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-full max-w-md">
            <StationPanel
              station={selected}
              compareId={compare ?? null}
              onCompare={(id) => setSearch({ compare: id ?? undefined })}
              onClose={() => setSearch({ station: undefined, compare: undefined })}
            />
          </div>
        )}
      </main>
    </div>
  );
}
