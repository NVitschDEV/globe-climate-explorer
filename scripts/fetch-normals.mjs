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
let out = {};
try {
  out = JSON.parse(fs.readFileSync(outPath, "utf8"));
} catch {}

const R = 6371;
const hav = (a, b, c, d) => {
  const p = Math.PI / 180;
  const x = Math.sin(((c - a) * p) / 2) ** 2 +
    Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

async function normals(id) {
  const res = await fetch(`https://bulk.meteostat.net/v2/normals/${id}.csv.gz`);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  let text;
  try {
    text = zlib.gunzipSync(buf).toString("utf8");
  } catch {
    return null;
  }
  const rows = text
    .trim()
    .split("\n")
    .map((l) => l.split(","))
    .filter((r) => r.length >= 6);
  if (!rows.length) return null;
  const periods = [...new Set(rows.map((r) => `${r[0]}-${r[1]}`))];
  const period = periods.includes("1991-2020") ? "1991-2020" : periods[periods.length - 1];
  const sel = rows.filter((r) => `${r[0]}-${r[1]}` === period);
  if (sel.length !== 12) return null;
  const tmin = Array(12).fill(null);
  const tmax = Array(12).fill(null);
  const prec = Array(12).fill(null);
  for (const r of sel) {
    const m = +r[2] - 1;
    tmin[m] = r[3] === "" ? null : +r[3];
    tmax[m] = r[4] === "" ? null : +r[4];
    prec[m] = r[5] === "" ? null : +r[5];
  }
  if (tmin.some((v) => v === null) || tmax.some((v) => v === null) || prec.some((v) => v === null))
    return null;
  const r1 = (x) => Math.round(x * 10) / 10;
  return {
    period,
    tmin,
    tmax,
    prec: prec.map((p) => Math.round(p)),
    temp: tmin.map((v, i) => r1((v + tmax[i]) / 2)),
  };
}

const todo = seed.filter((s) => !out[s.id]);
console.log("todo", todo.length);

async function one(s) {
  const near = meteo
    .map((m) => ({ m, d: hav(s.lat, s.lon, m.location.latitude, m.location.longitude) }))
    .filter((x) => x.d < 150)
    .sort((a, b) => a.d - b.d)
    .slice(0, 8);
  for (const { m, d } of near) {
    try {
      const n = await normals(m.id);
      if (!n) continue;
      out[s.id] = {
        ...s,
        elevation: Math.round(m.location.elevation ?? 0),
        temp: n.temp,
        tmax: n.tmax,
        tmin: n.tmin,
        prec: n.prec,
        source: `Meteostat ${m.id} (${m.name.en}, ${Math.round(d)} km, ${n.period})`,
      };
      return;
    } catch {}
  }
  console.log("FAIL", s.id);
}

let idx = 0;
async function worker() {
  while (idx < todo.length) {
    await one(todo[idx++]);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
fs.writeFileSync(outPath, JSON.stringify(out));
console.log("stored", Object.keys(out).length);
