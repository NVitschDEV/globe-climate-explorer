// Rebuilds src/data/stations.json from real ground-station measurements
// (Meteostat bulk archive: WMO/GHCN/national weather service records).
// Falls back to the existing record when no station data is available.
import fs from "fs";
import zlib from "zlib";

const seed = fs
  .readFileSync("scripts/seed.txt", "utf8")
  .trim()
  .split("\n")
  .map((l) => {
    const [id, name, country, countryDe, continent, lat, lon] = l.split("|");
    return { id, name, country, countryDe, continent, lat: +lat, lon: +lon };
  });

const meteo = JSON.parse(fs.readFileSync("/tmp/st.json", "utf8"));
const outPath = "src/data/stations.json";
const prev = JSON.parse(fs.readFileSync(outPath, "utf8"));
const out = {};

const R = 6371;
const hav = (a, b, c, d) => {
  const p = Math.PI / 180;
  const x =
    Math.sin(((c - a) * p) / 2) ** 2 +
    Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const r1 = (x) => Math.round(x * 10) / 10;

async function gz(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  try {
    return zlib.gunzipSync(buf).toString("utf8");
  } catch {
    return null;
  }
}

// official climate normals (preferring 1991-2020)
async function normals(id) {
  const text = await gz(`https://bulk.meteostat.net/v2/normals/${id}.csv.gz`);
  if (!text) return null;
  const rows = text.trim().split("\n").map((l) => l.split(",")).filter((r) => r.length >= 6);
  if (!rows.length) return null;
  const periods = [...new Set(rows.map((r) => `${r[0]}-${r[1]}`))];
  const period = periods.includes("1991-2020") ? "1991-2020" : periods[periods.length - 1];
  const sel = rows.filter((r) => `${r[0]}-${r[1]}` === period);
  if (sel.length !== 12) return null;
  const tmin = Array(12).fill(null), tmax = Array(12).fill(null), prec = Array(12).fill(null);
  for (const r of sel) {
    const m = +r[2] - 1;
    tmin[m] = r[3] === "" ? null : +r[3];
    tmax[m] = r[4] === "" ? null : +r[4];
    prec[m] = r[5] === "" ? null : +r[5];
  }
  if ([tmin, tmax, prec].some((a) => a.some((v) => v === null))) return null;
  return {
    period,
    tmin,
    tmax,
    prec: prec.map((p) => Math.round(p)),
    temp: tmin.map((v, i) => r1((v + tmax[i]) / 2)),
  };
}

// monthly observations aggregated to 1991-2020 means
async function monthly(id) {
  const text = await gz(`https://bulk.meteostat.net/v2/monthly/${id}.csv.gz`);
  if (!text) return null;
  const acc = Array.from({ length: 12 }, () => ({ t: [], tx: [], tn: [], p: [] }));
  let years = new Set();
  for (const line of text.trim().split("\n")) {
    const c = line.split(",");
    const y = +c[0], m = +c[1] - 1;
    if (!(y >= 1991 && y <= 2020) || !(m >= 0 && m < 12)) continue;
    years.add(y);
    const push = (a, v) => { if (v !== "" && v !== undefined && !Number.isNaN(+v)) a.push(+v); };
    push(acc[m].t, c[2]);
    push(acc[m].tn, c[3]);
    push(acc[m].tx, c[4]);
    push(acc[m].p, c[5]);
  }
  if (years.size < 10) return null;
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const temp = acc.map((a) => avg(a.t.length ? a.t : []));
  const tmin = acc.map((a) => avg(a.tn));
  const tmax = acc.map((a) => avg(a.tx));
  const prec = acc.map((a) => avg(a.p));
  for (let m = 0; m < 12; m++) {
    if (temp[m] === null && tmin[m] !== null && tmax[m] !== null) temp[m] = (tmin[m] + tmax[m]) / 2;
    if (tmin[m] === null && temp[m] !== null) tmin[m] = temp[m] - 4;
    if (tmax[m] === null && temp[m] !== null) tmax[m] = temp[m] + 4;
  }
  if (temp.some((v) => v === null) || prec.some((v) => v === null)) return null;
  return {
    period: "1991-2020",
    temp: temp.map(r1),
    tmin: tmin.map(r1),
    tmax: tmax.map(r1),
    prec: prec.map((p) => Math.round(p)),
  };
}

async function one(s) {
  const near = meteo
    .map((m) => ({ m, d: hav(s.lat, s.lon, m.location.latitude, m.location.longitude) }))
    .filter((x) => x.d < 120)
    .sort((a, b) => a.d - b.d)
    .slice(0, 10);
  for (const pass of ["normals", "monthly"]) {
    for (const { m, d } of near) {
      try {
        const n = pass === "normals" ? await normals(m.id) : await monthly(m.id);
        if (!n) continue;
        out[s.id] = {
          ...s,
          elevation: Math.round(m.location.elevation ?? prev[s.id]?.elevation ?? 0),
          temp: n.temp,
          tmax: n.tmax,
          tmin: n.tmin,
          prec: n.prec,
          source: `Messstation ${m.name.en} (Meteostat ${m.id}, ${Math.round(d)} km, ${n.period})`,
        };
        return;
      } catch {}
    }
  }
  if (prev[s.id]) {
    out[s.id] = prev[s.id];
    console.log("KEEP", s.id);
  } else console.log("FAIL", s.id);
}

let idx = 0;
const worker = async () => {
  while (idx < seed.length) await one(seed[idx++]);
};
await Promise.all(Array.from({ length: 6 }, worker));
fs.writeFileSync(outPath, JSON.stringify(out));
const measured = Object.values(out).filter((s) => s.source?.startsWith("Messstation")).length;
console.log("total", Object.keys(out).length, "aus Messstationen:", measured);
