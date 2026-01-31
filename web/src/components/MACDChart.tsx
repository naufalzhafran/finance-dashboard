import {
  ComposedChart,
  Line,
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

interface MACDDataPoint {
  date: string;
  fullDate: string;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

interface MACDChartProps {
  data: MACDDataPoint[];
}

export default function MACDChart({ data }: MACDChartProps) {
  const validData = data.filter((d) => d.macd !== null);

  if (validData.length === 0) {
    return (
      <Card className="p-6 bg-background/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">MACD (12, 26, 9)</h3>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Insufficient data for MACD calculation
          </p>
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: MACDDataPoint }>;
  }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const trend =
        d.macd !== null && d.signal !== null
          ? d.macd > d.signal
            ? "Bullish"
            : "Bearish"
          : "N/A";

      return (
        <Card className="p-3 !bg-background/95 border-border shadow-xl min-w-[180px]">
          <p className="text-muted-foreground text-sm mb-2 pb-2 border-b border-border">
            {d.fullDate}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">MACD:</span>
              <span className="font-mono text-blue-400">
                {d.macd?.toFixed(2) ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Signal:</span>
              <span className="font-mono text-orange-400">
                {d.signal?.toFixed(2) ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Histogram:</span>
              <span
                className={`font-mono ${d.histogram && d.histogram >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {d.histogram?.toFixed(2) ?? "N/A"}
              </span>
            </div>
            <div className="pt-1 border-t border-border">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  trend === "Bullish"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : trend === "Bearish"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {trend}
              </span>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4">MACD (12, 26, 9)</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
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

            {/* Zero line */}
            <ReferenceLine y={0} stroke="#64748b" strokeOpacity={0.5} />

            {/* Histogram bars */}
            <Bar dataKey="histogram" barSize={3}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.histogram !== null && entry.histogram >= 0
                      ? "#10b981"
                      : "#f43f5e"
                  }
                  fillOpacity={0.7}
                />
              ))}
            </Bar>

            {/* MACD line */}
            <Line
              type="monotone"
              dataKey="macd"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />

            {/* Signal line */}
            <Line
              type="monotone"
              dataKey="signal"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#f97316" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500" />
          <span className="text-slate-400">MACD</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-orange-500" />
          <span className="text-slate-400">Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500/70 rounded-sm" />
          <span className="text-slate-400">Histogram</span>
        </div>
      </div>
    </Card>
  );
}
