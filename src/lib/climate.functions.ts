import { createServerFn } from "@tanstack/react-start";

export interface CurrentYear {
  year: number;
  temp: (number | null)[];
  prec: (number | null)[];
}

export const getCurrentYear = createServerFn({ method: "GET" })
  .inputValidator((data: { lat: number; lon: number }) => ({
    lat: Number(data.lat),
    lon: Number(data.lon),
  }))
  .handler(async ({ data }): Promise<CurrentYear | null> => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const end = new Date(now.getTime() - 6 * 86400000);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const url =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${data.lat}&longitude=${data.lon}` +
      `&start_date=${year}-01-01&end_date=${iso(end)}` +
      `&daily=temperature_2m_mean,precipitation_sum&timezone=UTC`;

    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = (await res.json()) as {
        daily?: { time: string[]; temperature_2m_mean: (number | null)[]; precipitation_sum: (number | null)[] };
      };
      const d = json.daily;
      if (!d) return null;

      const tSum = Array(12).fill(0) as number[];
      const tCount = Array(12).fill(0) as number[];
      const pSum = Array(12).fill(0) as number[];
      const pCount = Array(12).fill(0) as number[];

      d.time.forEach((day, i) => {
        const m = Number(day.slice(5, 7)) - 1;
        const t = d.temperature_2m_mean[i];
        const p = d.precipitation_sum[i];
        if (typeof t === "number") {
          tSum[m]! += t;
          tCount[m]! += 1;
        }
        if (typeof p === "number") {
          pSum[m]! += p;
          pCount[m]! += 1;
        }
      });

      return {
        year,
        temp: tSum.map((s, i) => (tCount[i]! > 20 ? Math.round((s / tCount[i]!) * 10) / 10 : null)),
        prec: pSum.map((s, i) => (pCount[i]! > 20 ? Math.round(s) : null)),
      };
    } catch {
      return null;
    }
  });
