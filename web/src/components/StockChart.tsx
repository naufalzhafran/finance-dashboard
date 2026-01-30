import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function calculateSMA(data: PriceData[], period: number): (number | null)[] {
  const smaValues: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      smaValues.push(null);
      continue;
    }
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, curr) => acc + curr.close, 0);
    smaValues.push(sum / period);
  }
  return smaValues;
}

interface StockChartProps {
  data: PriceData[];
  symbol: string;
  currency?: string;
  minDate?: string;
}

type ChartType = "line" | "area" | "candlestick";

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

export default function StockChart({
  data,
  symbol,
  currency = "USD",
  minDate,
}: StockChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  if (data.length === 0) {
    return (
      <Card className="flex items-center justify-center h-96 bg-background/50 backdrop-blur-sm">
        <p className="text-muted-foreground">No price data available</p>
      </Card>
    );
  }

  // Calculate SMAs
  const sma20 = calculateSMA(data, 20);
  const sma50 = calculateSMA(data, 50);

  // Format data for charts
  const chartData = data
    .map((d, i) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: d.date,
      sma20: sma20[i],
      sma50: sma50[i],
    }))
    .filter((d) => !minDate || d.fullDate >= minDate);

  // Calculate price change
  // Use filtered data for price change calculation to reflect visible range
  const firstPrice = chartData.length > 0 ? chartData[0].close : 0;
  const lastPrice =
    chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent =
    firstPrice !== 0 ? ((priceChange / firstPrice) * 100).toFixed(2) : "0.00";
  const isPositive = priceChange >= 0;

  const locale = currencyLocales[currency] || "en-US";
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: PriceData & { fullDate: string } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <Card className="p-3 !bg-background/95 border-border shadow-xl min-w-[200px]">
          <p className="text-muted-foreground text-sm mb-2 pb-2 border-b border-border">
            {d.fullDate}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Open:</span>
            <span className="text-foreground font-mono text-right">
              {formatPrice(d.open)}
            </span>
            <span className="text-muted-foreground">High:</span>
            <span className="text-emerald-500 font-mono text-right">
              {formatPrice(d.high)}
            </span>
            <span className="text-muted-foreground">Low:</span>
            <span className="text-rose-500 font-mono text-right">
              {formatPrice(d.low)}
            </span>
            <span className="text-muted-foreground">Close:</span>
            <span className="text-foreground font-mono text-right">
              {formatPrice(d.close)}
            </span>
            <span className="text-muted-foreground">Volume:</span>
            <span className="text-blue-500 font-mono text-right">
              {formatVolume(d.volume)}
            </span>
            {/* @ts-ignore */}
            {d.sma20 && (
              <>
                <span className="text-muted-foreground">SMA 20:</span>
                <span className="text-orange-400 font-mono text-right">
                  {/* @ts-ignore */}
                  {formatPrice(d.sma20)}
                </span>
              </>
            )}
            {/* @ts-ignore */}
            {d.sma50 && (
              <>
                <span className="text-muted-foreground">SMA 50:</span>
                <span className="text-cyan-400 font-mono text-right">
                  {/* @ts-ignore */}
                  {formatPrice(d.sma50)}
                </span>
              </>
            )}
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{symbol}</h2>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-bold tracking-tighter">
              {formatPrice(lastPrice)}
            </span>
            <span
              className={`text-lg font-medium px-2 py-0.5 rounded-md ${
                isPositive
                  ? "text-emerald-500 bg-emerald-500/10"
                  : "text-rose-500 bg-rose-500/10"
              }`}
            >
              {isPositive ? "+" : ""}
              {formatPrice(priceChange)} ({isPositive ? "+" : ""}
              {priceChangePercent}%)
            </span>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex p-1 bg-muted rounded-lg border border-border">
          {(["line", "area", "candlestick"] as ChartType[]).map((type) => (
            <Button
              key={type}
              variant={chartType === type ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[400px] w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
                domain={["auto", "auto"]}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#64748b",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "#10b981" : "#f43f5e"}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: isPositive ? "#10b981" : "#f43f5e",
                  strokeWidth: 0,
                }}
              />
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#fb923c"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#22d3ee"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
            </LineChart>
          ) : chartType === "area" ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#10b981" : "#f43f5e"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#10b981" : "#f43f5e"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
                domain={["auto", "auto"]}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#64748b",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "#10b981" : "#f43f5e"}
                strokeWidth={2}
                fill="url(#colorGradient)"
              />
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#fb923c"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#22d3ee"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          ) : (
            <ComposedChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                yAxisId="price"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
                domain={["auto", "auto"]}
                dx={-10}
              />
              <YAxis
                yAxisId="volume"
                orientation="right"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatVolume}
                dx={10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#64748b",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Bar
                dataKey="volume"
                yAxisId="volume"
                fill="#3b82f6"
                opacity={0.3}
                barSize={4}
              />
              <Line
                type="monotone"
                dataKey="high"
                yAxisId="price"
                stroke="#10b981"
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="low"
                yAxisId="price"
                stroke="#f43f5e"
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="close"
                yAxisId="price"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="sma20"
                yAxisId="price"
                stroke="#fb923c"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="sma50"
                yAxisId="price"
                stroke="#22d3ee"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">High</p>
          <p className="text-emerald-400 font-mono text-xl font-semibold tracking-tight">
            {formatPrice(Math.max(...data.map((d) => d.high)))}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Low</p>
          <p className="text-rose-400 font-mono text-xl font-semibold tracking-tight">
            {formatPrice(Math.min(...data.map((d) => d.low)))}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Avg Volume</p>
          <p className="text-blue-400 font-mono text-xl font-semibold tracking-tight">
            {formatVolume(
              data.reduce((sum, d) => sum + d.volume, 0) / data.length,
            )}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Data Points</p>
          <p className="text-purple-400 font-mono text-xl font-semibold tracking-tight">
            {data.length}
          </p>
        </div>
      </div>
    </Card>
  );
}
