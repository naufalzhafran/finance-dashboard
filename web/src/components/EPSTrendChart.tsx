"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

interface EPSData {
  date: string;
  basic_eps: number | null;
  diluted_eps: number | null;
}

interface EPSTrendChartProps {
  symbol: string;
  currency?: string;
}

// Currency to locale mapping
const currencyLocales: Record<string, string> = {
  IDR: "id-ID",
  USD: "en-US",
  JPY: "ja-JP",
  GBP: "en-GB",
  EUR: "de-DE",
  HKD: "zh-HK",
  CNY: "zh-CN",
};

export default function EPSTrendChart({
  symbol,
  currency = "USD",
}: EPSTrendChartProps) {
  const [data, setData] = useState<EPSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEPS() {
      setLoading(true);
      setError(null);
      try {
        const encodedSymbol = encodeURIComponent(symbol);
        const res = await fetch(
          `/api/financials/${encodedSymbol}?type=income&period=quarterly`,
        );
        if (!res.ok) throw new Error("Failed to fetch EPS data");
        const result = await res.json();

        // Transform and sort by date
        const epsData = result.data
          .map(
            (d: {
              date: string;
              basic_eps: number | null;
              diluted_eps: number | null;
            }) => ({
              date: d.date,
              basic_eps: d.basic_eps,
              diluted_eps: d.diluted_eps,
            }),
          )
          .filter(
            (d: EPSData) => d.basic_eps !== null || d.diluted_eps !== null,
          )
          .sort(
            (a: EPSData, b: EPSData) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          .slice(-12); // Last 12 quarters (3 years)

        setData(epsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load EPS data",
        );
      } finally {
        setLoading(false);
      }
    }

    if (symbol) {
      fetchEPS();
    }
  }, [symbol]);

  if (loading) {
    return (
      <Card className="p-6 bg-background/50 backdrop-blur-sm border-white/5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted/50 rounded w-1/3" />
          <div className="h-64 bg-muted/50 rounded" />
        </div>
      </Card>
    );
  }

  if (error || data.length === 0) {
    return (
      <Card className="p-6 bg-background/50 backdrop-blur-sm border-white/5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <span className="text-cyan-400">📈</span> EPS Trend
        </h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          {error || "No quarterly EPS data available"}
        </div>
      </Card>
    );
  }

  const locale = currencyLocales[currency] || "en-US";

  // Calculate growth rates
  const dataWithGrowth = data.map((d, i) => {
    let yoyGrowth: number | null = null;
    // Compare to same quarter previous year (4 quarters ago)
    if (i >= 4 && data[i - 4].basic_eps && d.basic_eps) {
      yoyGrowth =
        ((d.basic_eps - data[i - 4].basic_eps!) /
          Math.abs(data[i - 4].basic_eps!)) *
        100;
    }
    return {
      ...d,
      yoyGrowth,
      formattedDate: new Date(d.date).toLocaleDateString("en-US", {
        year: "2-digit",
        month: "short",
      }),
    };
  });

  const formatEPS = (val: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Basic EPS:</span>
              <span className="font-medium">
                {d.basic_eps !== null ? formatEPS(d.basic_eps) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Diluted EPS:</span>
              <span className="font-medium">
                {d.diluted_eps !== null ? formatEPS(d.diluted_eps) : "—"}
              </span>
            </div>
            {d.yoyGrowth !== null && (
              <div className="flex justify-between gap-4 border-t border-white/10 pt-1 mt-1">
                <span className="text-muted-foreground">YoY Growth:</span>
                <span
                  className={`font-medium ${
                    d.yoyGrowth >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {d.yoyGrowth >= 0 ? "+" : ""}
                  {d.yoyGrowth.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Determine min and max for better chart scaling
  const epsValues = data
    .filter((d) => d.basic_eps !== null)
    .map((d) => d.basic_eps as number);
  const minEPS = Math.min(...epsValues);
  const maxEPS = Math.max(...epsValues);
  const padding = Math.abs(maxEPS - minEPS) * 0.1;

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-cyan-400">📈</span> EPS Trend (Quarterly)
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-cyan-400" />
            <span className="text-muted-foreground">Basic EPS</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataWithGrowth}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="formattedDate"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
              tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
              tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
              domain={[minEPS - padding, maxEPS + padding]}
              tickFormatter={(value) => {
                if (currency === "IDR") {
                  return `${(value / 1).toFixed(0)}`;
                }
                return value.toFixed(2);
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            <Bar dataKey="basic_eps" radius={[4, 4, 0, 0]}>
              {dataWithGrowth.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    (entry.basic_eps ?? 0) >= 0
                      ? "rgba(34, 211, 238, 0.8)"
                      : "rgba(251, 113, 133, 0.8)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground">Latest EPS</div>
          <div className="text-lg font-semibold">
            {data[data.length - 1]?.basic_eps !== null
              ? formatEPS(data[data.length - 1].basic_eps!)
              : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Quarters Shown</div>
          <div className="text-lg font-semibold">{data.length}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Trend</div>
          <div className="text-lg font-semibold">
            {data.length >= 2 &&
            data[data.length - 1].basic_eps !== null &&
            data[0].basic_eps !== null ? (
              <span
                className={
                  data[data.length - 1].basic_eps! > data[0].basic_eps!
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              >
                {data[data.length - 1].basic_eps! > data[0].basic_eps!
                  ? "↑ Growing"
                  : "↓ Declining"}
              </span>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
