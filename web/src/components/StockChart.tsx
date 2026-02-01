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
  ErrorBar,
  Rectangle,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  calculateSMA,
  calculateBollingerBands,
} from "@/lib/technicalIndicators";
import { InfoTooltip, INDICATOR_HELP } from "@/components/InfoTooltip";

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Candlestick dataKey functions
const candlestickBodyDataKey = (entry: any): [number, number] => [
  Math.min(entry.close, entry.open),
  Math.max(entry.close, entry.open),
];

const candlestickWhiskerDataKey = (entry: any): [number, number] => {
  const highEnd = Math.max(entry.close, entry.open);
  return [highEnd - entry.low, entry.high - highEnd];
};

// Candlestick shape component
const Candlestick = (props: any) => {
  const color = props.open < props.close ? "#10b981" : "#f43f5e";
  return <Rectangle {...props} fill={color} />;
};

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
  const [showBollinger, setShowBollinger] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(true);

  if (data.length === 0) {
    return (
      <Card className="flex items-center justify-center h-96 bg-background/50 backdrop-blur-sm">
        <p className="text-muted-foreground">No price data available</p>
      </Card>
    );
  }

  // Calculate SMAs (50 and 200 day for Golden Cross detection)
  const sma50 = calculateSMA(data, 50);
  const sma200 = calculateSMA(data, 200);

  // Calculate Bollinger Bands (20-day with 2 std dev)
  const bollinger = calculateBollingerBands(data, 20, 2);

  // Format data for charts
  const chartData = data
    .map((d, i) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: d.date,
      sma50: sma50[i],
      sma200: sma200[i],
      bollingerUpper: bollinger.upper[i],
      bollingerMiddle: bollinger.middle[i],
      bollingerLower: bollinger.lower[i],
    }))
    .filter((d) => !minDate || d.fullDate >= minDate);

  // Calculate price change
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
  }: {
    active?: boolean;
    payload?: Array<{
      payload: PriceData & {
        fullDate: string;
        sma50?: number;
        sma200?: number;
        bollingerUpper?: number;
        bollingerLower?: number;
      };
    }>;
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
            {d.sma50 && (
              <>
                <span className="text-muted-foreground">SMA 50:</span>
                <span className="text-orange-400 font-mono text-right">
                  {formatPrice(d.sma50)}
                </span>
              </>
            )}
            {d.sma200 && (
              <>
                <span className="text-muted-foreground">SMA 200:</span>
                <span className="text-cyan-400 font-mono text-right">
                  {formatPrice(d.sma200)}
                </span>
              </>
            )}
            {showBollinger && d.bollingerUpper && d.bollingerLower && (
              <>
                <span className="text-muted-foreground">BB Upper:</span>
                <span className="text-purple-400 font-mono text-right">
                  {formatPrice(d.bollingerUpper)}
                </span>
                <span className="text-muted-foreground">BB Lower:</span>
                <span className="text-purple-400 font-mono text-right">
                  {formatPrice(d.bollingerLower)}
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

        {/* Chart Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {/* Indicator Toggles */}
          <div className="flex gap-1 shrink-0">
            <Button
              variant={showSMA50 ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowSMA50(!showSMA50)}
              className="text-xs"
              title="Toggle SMA 50"
            >
              <span className="text-orange-400">SMA50</span>
            </Button>
            <Button
              variant={showSMA200 ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowSMA200(!showSMA200)}
              className="text-xs"
              title="Toggle SMA 200"
            >
              <span className="text-cyan-400">SMA200</span>
            </Button>
            <Button
              variant={showBollinger ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowBollinger(!showBollinger)}
              className="text-xs"
              title="Toggle Bollinger Bands"
            >
              BB
            </Button>
          </div>

          {/* Chart Type Selector */}
          <div className="flex p-1 bg-muted rounded-lg border border-border overflow-x-auto max-w-full">
            {(["line", "area", "candlestick"] as ChartType[]).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType(type)}
                className="capitalize shrink-0"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[400px] w-full mb-8">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <defs>
                <linearGradient
                  id="bollingerGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
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
              {/* Bollinger Bands */}
              {showBollinger && (
                <>
                  <Area
                    type="monotone"
                    dataKey="bollingerUpper"
                    stroke="none"
                    fill="url(#bollingerGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="bollingerUpper"
                    stroke="#a78bfa"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                  <Line
                    type="monotone"
                    dataKey="bollingerLower"
                    stroke="#a78bfa"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                </>
              )}
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
              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#fb923c"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  strokeDasharray="5 5"
                />
              )}
              {showSMA200 && (
                <Line
                  type="monotone"
                  dataKey="sma200"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  strokeDasharray="5 5"
                />
              )}
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
                <linearGradient
                  id="bollingerGradientArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
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
              {/* Bollinger Bands */}
              {showBollinger && (
                <>
                  <Area
                    type="monotone"
                    dataKey="bollingerUpper"
                    stroke="#a78bfa"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                    fill="url(#bollingerGradientArea)"
                  />
                  <Line
                    type="monotone"
                    dataKey="bollingerLower"
                    stroke="#a78bfa"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                </>
              )}
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "#10b981" : "#f43f5e"}
                strokeWidth={2}
                fill="url(#colorGradient)"
              />
              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#fb923c"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  strokeDasharray="5 5"
                />
              )}
              {showSMA200 && (
                <Line
                  type="monotone"
                  dataKey="sma200"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  strokeDasharray="5 5"
                />
              )}
            </AreaChart>
          ) : (
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient
                  id="bollingerGradientCandle"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.05} />
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
              {/* Bollinger Bands */}
              {showBollinger && (
                <>
                  <Area
                    type="monotone"
                    dataKey="bollingerUpper"
                    yAxisId="price"
                    stroke="#a78bfa"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                    fill="url(#bollingerGradientCandle)"
                  />
                  <Line
                    type="monotone"
                    dataKey="bollingerLower"
                    yAxisId="price"
                    stroke="#a78bfa"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                </>
              )}
              <Bar
                dataKey="volume"
                yAxisId="volume"
                fill="#3b82f6"
                opacity={0.3}
                barSize={4}
              />
              <Bar
                dataKey={candlestickBodyDataKey}
                yAxisId="price"
                shape={Candlestick}
                barSize={8}
              >
                <ErrorBar
                  dataKey={candlestickWhiskerDataKey}
                  width={0}
                  strokeWidth={1}
                  stroke="#64748b"
                />
              </Bar>
              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  yAxisId="price"
                  stroke="#fb923c"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  strokeDasharray="5 5"
                />
              )}
              {showSMA200 && (
                <Line
                  type="monotone"
                  dataKey="sma200"
                  yAxisId="price"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={false}
                  strokeDasharray="5 5"
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm">
        {showSMA50 && (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-0.5 bg-orange-400"
              style={{ borderTop: "2px dashed" }}
            />
            <span className="text-slate-400">SMA 50</span>
          </div>
        )}
        {showSMA200 && (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-0.5 bg-cyan-400"
              style={{ borderTop: "2px dashed" }}
            />
            <span className="text-slate-400">SMA 200</span>
          </div>
        )}
        {showBollinger && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-purple-500/20 border border-purple-500/50 rounded-sm" />
            <span className="text-slate-400">Bollinger Bands</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1 flex items-center">
            High
            <InfoTooltip {...INDICATOR_HELP.high} />
          </p>
          <p className="text-emerald-400 font-mono text-xl font-semibold tracking-tight">
            {formatPrice(Math.max(...data.map((d) => d.high)))}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1 flex items-center">
            Low
            <InfoTooltip {...INDICATOR_HELP.low} />
          </p>
          <p className="text-rose-400 font-mono text-xl font-semibold tracking-tight">
            {formatPrice(Math.min(...data.map((d) => d.low)))}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1 flex items-center">
            Avg Volume
            <InfoTooltip {...INDICATOR_HELP.avgVolume} />
          </p>
          <p className="text-blue-400 font-mono text-xl font-semibold tracking-tight">
            {formatVolume(
              data.reduce((sum, d) => sum + d.volume, 0) / data.length,
            )}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1 flex items-center">
            Data Points
            <InfoTooltip {...INDICATOR_HELP.dataPoints} />
          </p>
          <p className="text-purple-400 font-mono text-xl font-semibold tracking-tight">
            {data.length}
          </p>
        </div>
      </div>
    </Card>
  );
}
