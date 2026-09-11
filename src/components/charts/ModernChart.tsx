import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MONTHS, useLang } from "@/lib/i18n";

interface Props {
  temp: number[];
  prec: number[];
  compareTemp?: number[] | undefined;
  compareName?: string | undefined;
  currentTemp?: number[] | undefined;
}

export default function ModernChart({ temp, prec, compareTemp, compareName, currentTemp }: Props) {
  const { lang, t } = useLang();
  const data = MONTHS[lang].map((m, i) => ({
    month: m,
    temp: temp[i],
    prec: prec[i],
    compare: compareTemp?.[i],
    current: currentTemp?.[i],
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" strokeOpacity={0.4} />
          <YAxis yAxisId="p" orientation="right" tick={{ fontSize: 11 }} stroke="#3aa8c9" />
          <YAxis yAxisId="t" tick={{ fontSize: 11 }} stroke="#e0562a" />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--card-foreground)",
            }}
          />
          <Bar yAxisId="p" dataKey="prec" name={t("precipitation")} fill="#3aa8c9" radius={[3, 3, 0, 0]} />
          <Line
            yAxisId="t"
            type="monotone"
            dataKey="temp"
            name={t("temperature")}
            stroke="#e0562a"
            strokeWidth={2.5}
            dot={false}
          />
          {currentTemp && (
            <Line
              yAxisId="t"
              type="monotone"
              dataKey="current"
              name={t("thisYear")}
              stroke="#f2c14c"
              strokeWidth={2}
              strokeDasharray="4 3"
              dot={false}
            />
          )}
          {compareTemp && (
            <Line
              yAxisId="t"
              type="monotone"
              dataKey="compare"
              name={compareName ?? t("compare")}
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="2 3"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
