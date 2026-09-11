import raw from "./stations.json";
import { classifyKoeppen } from "@/lib/koeppen";

export interface RawStation {
  id: string;
  name: string;
  country: string;
  countryDe: string;
  continent: string;
  lat: number;
  lon: number;
  elevation: number;
  temp: number[];
  tmax: number[];
  tmin: number[];
  prec: number[];
}

export interface Station extends RawStation {
  zone: string;
  tAnnual: number;
  pAnnual: number;
}

const r1 = (x: number) => Math.round(x * 10) / 10;

export const STATIONS: Station[] = (Object.values(raw) as RawStation[])
  .map((s) => ({
    ...s,
    zone: classifyKoeppen(s.temp, s.prec, s.lat),
    tAnnual: r1(s.temp.reduce((a, b) => a + b, 0) / 12),
    pAnnual: Math.round(s.prec.reduce((a, b) => a + b, 0)),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const STATION_BY_ID = new Map(STATIONS.map((s) => [s.id, s]));

export const CONTINENT_KEYS = Array.from(new Set(STATIONS.map((s) => s.continent))).sort();
