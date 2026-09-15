import fs from "fs";

const seed = fs
  .readFileSync("scripts/seed.txt", "utf8")
  .trim()
  .split("\n")
  .map((l) => {
    const [id, name, country, countryDe, continent, lat, lon] = l.split("|");
    return { id, name, country, countryDe, continent, lat: +lat, lon: +lon };
  });

const outPath = "src/data/stations.json";
let out = {};
try {
  out = JSON.parse(fs.readFileSync(outPath, "utf8"));
} catch {}

const limit = Number(process.argv[2] ?? 40);
const todo = seed.filter((s) => !out[s.id]).slice(0, limit);
console.log("remaining total", seed.filter((s) => !out[s.id]).length, "this run", todo.length);

const save = () => fs.writeFileSync(outPath, JSON.stringify(out, null, 0));

async function one(s) {
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${s.lat}&longitude=${s.lon}` +
    `&start_date=1991-01-01&end_date=2020-12-31` +
    `&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=UTC`;
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(url);
      if (!r.ok) {
        await new Promise((z) => setTimeout(z, 8000 * (a + 1)));
        continue;
      }
      const j = await r.json();
      const d = j.daily;
      const acc = Array.from({ length: 12 }, () => ({
        t: 0, tc: 0, mx: 0, mxc: 0, mn: 0, mnc: 0, p: 0, years: new Set(),
      }));
      for (let i = 0; i < d.time.length; i++) {
        const m = +d.time[i].slice(5, 7) - 1;
        const A = acc[m];
        if (d.temperature_2m_mean[i] != null) { A.t += d.temperature_2m_mean[i]; A.tc++; }
        if (d.temperature_2m_max[i] != null) { A.mx += d.temperature_2m_max[i]; A.mxc++; }
        if (d.temperature_2m_min[i] != null) { A.mn += d.temperature_2m_min[i]; A.mnc++; }
        if (d.precipitation_sum[i] != null) { A.p += d.precipitation_sum[i]; A.years.add(d.time[i].slice(0, 4)); }
      }
      const r1 = (x) => Math.round(x * 10) / 10;
      out[s.id] = {
        ...s,
        elevation: Math.round(j.elevation),
        temp: acc.map((A) => r1(A.t / A.tc)),
        tmax: acc.map((A) => r1(A.mx / A.mxc)),
        tmin: acc.map((A) => r1(A.mn / A.mnc)),
        prec: acc.map((A) => Math.round(A.p / A.years.size)),
      };
      return;
    } catch {
      await new Promise((z) => setTimeout(z, 8000 * (a + 1)));
    }
  }
  console.log("FAIL", s.id);
}

let idx = 0;
async function worker() {
  while (idx < todo.length) {
    const s = todo[idx++];
    await one(s);
    save();
  }
}
await Promise.all(Array.from({ length: 3 }, worker));
save();
console.log("stored", Object.keys(out).length);
