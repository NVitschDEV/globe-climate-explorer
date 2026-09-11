import { MONTHS, useLang } from "@/lib/i18n";

interface Props {
  temp: number[];
  prec: number[];
}

/**
 * Classic Walter-Lieth climate diagram: 10 °C == 20 mm, arid periods dotted,
 * humid periods hatched, precipitation above 100 mm compressed 1:10.
 */
export default function WalterLieth({ temp, prec }: Props) {
  const { lang } = useLang();
  const months = MONTHS[lang];

  const W = 520;
  const H = 300;
  const padL = 46;
  const padR = 46;
  const padT = 18;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const tMin = Math.min(-10, Math.floor(Math.min(...temp) / 10) * 10);
  const tMax = Math.max(50, Math.ceil(Math.max(...temp) / 10) * 10);

  // temperature scale (left): tMin..tMax
  const yT = (t: number) => padT + plotH - ((t - tMin) / (tMax - tMin)) * plotH;
  // precipitation: 2 mm per °C up to 100 mm, then compressed 1:10
  const pToT = (p: number) => (p <= 100 ? p / 2 : 50 + (p - 100) / 20);
  const yP = (p: number) => yT(pToT(p));

  const x = (i: number) => padL + (i + 0.5) * (plotW / 12);
  const line = (vals: number[], f: (v: number) => number) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${f(v)}`).join(" ");

  const areaPath = (upper: number[], lower: number[], fu: (v: number) => number, fl: (v: number) => number) =>
    `${line(upper, fu)} ` +
    lower
      .map((v, i) => `L${x(11 - i)},${fl(lower[11 - i]!)}`)
      .join(" ") +
    " Z";

  const tTicks: number[] = [];
  for (let t = tMin; t <= tMax; t += 10) tTicks.push(t);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <pattern id="wl-humid" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#3aa8c9" strokeWidth="1.6" />
        </pattern>
        <pattern id="wl-arid" width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.9" fill="#e0a13a" />
        </pattern>
        <clipPath id="wl-clip">
          <rect x={padL} y={padT} width={plotW} height={plotH} />
        </clipPath>
      </defs>

      {/* grid */}
      {tTicks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={yT(t)} y2={yT(t)} stroke="currentColor" strokeOpacity={0.12} />
          <text x={padL - 8} y={yT(t) + 4} textAnchor="end" fontSize="10" fill="currentColor" fillOpacity={0.65}>
            {t}
          </text>
          <text x={W - padR + 8} y={yT(t) + 4} fontSize="10" fill="currentColor" fillOpacity={0.65}>
            {t <= 50 ? t * 2 : 100 + (t - 50) * 20}
          </text>
        </g>
      ))}

      <g clipPath="url(#wl-clip)">
        {/* humid: precipitation above temperature */}
        <path d={areaPath(prec.map(pToT), temp, yT, yT)} fill="url(#wl-humid)" fillOpacity={0.55} />
        {/* arid: temperature above precipitation */}
        <path d={areaPath(temp, prec.map(pToT), yT, yT)} fill="url(#wl-arid)" fillOpacity={0.75} />
        <rect
          x={padL}
          y={padT}
          width={plotW}
          height={yT(50) - padT}
          fill="#3aa8c9"
          fillOpacity={0.18}
        />
      </g>

      {/* curves */}
      <path d={line(prec, yP)} fill="none" stroke="#3aa8c9" strokeWidth="2" />
      <path d={line(temp, yT)} fill="none" stroke="#e0562a" strokeWidth="2" />

      {/* axes */}
      <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="currentColor" strokeOpacity={0.4} />
      <line x1={W - padR} x2={W - padR} y1={padT} y2={padT + plotH} stroke="currentColor" strokeOpacity={0.4} />
      <line x1={padL} x2={W - padR} y1={yT(0)} y2={yT(0)} stroke="currentColor" strokeOpacity={0.35} />

      {months.map((m, i) => (
        <text
          key={m}
          x={x(i)}
          y={H - 12}
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          fillOpacity={0.7}
        >
          {m[0]}
        </text>
      ))}
      <text x={padL - 8} y={padT - 5} textAnchor="end" fontSize="10" fill="#e0562a">
        °C
      </text>
      <text x={W - padR + 8} y={padT - 5} fontSize="10" fill="#3aa8c9">
        mm
      </text>
    </svg>
  );
}
