import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Card } from "@/components/ui/card";

interface RSIDataPoint {
  date: string;
  fullDate: string;
  rsi: number | null;
}

interface RSIChartProps {
  data: RSIDataPoint[];
}

export default function RSIChart({ data }: RSIChartProps) {
  const validData = data.filter((d) => d.rsi !== null);

  if (validData.length === 0) {
    return (
      <Card className="p-6 bg-background/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">RSI (14)</h3>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Insufficient data for RSI calculation
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
    payload?: Array<{ payload: RSIDataPoint }>;
  }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const rsiValue = d.rsi;
      const status =
        rsiValue !== null
          ? rsiValue >= 70
            ? "Overbought"
            : rsiValue <= 30
              ? "Oversold"
              : "Neutral"
          : "N/A";
      const color =
        rsiValue !== null
          ? rsiValue >= 70
            ? "text-rose-400"
            : rsiValue <= 30
              ? "text-emerald-400"
              : "text-slate-200"
          : "text-slate-400";

      return (
        <Card className="p-3 !bg-background/95 border-border shadow-xl">
          <p className="text-muted-foreground text-sm mb-2">{d.fullDate}</p>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-lg font-semibold ${color}`}>
              RSI: {rsiValue?.toFixed(1) ?? "N/A"}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                status === "Overbought"
                  ? "bg-rose-500/20 text-rose-400"
                  : status === "Oversold"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-500/20 text-slate-400"
              }`}
            >
              {status}
            </span>
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4">RSI (14)</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            {/* Overbought zone (70-100) */}
            <ReferenceArea y1={70} y2={100} fill="#f43f5e" fillOpacity={0.1} />
            {/* Oversold zone (0-30) */}
            <ReferenceArea y1={0} y2={30} fill="#10b981" fillOpacity={0.1} />

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
              domain={[0, 100]}
              ticks={[0, 30, 50, 70, 100]}
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

            {/* Reference lines */}
            <ReferenceLine
              y={70}
              stroke="#f43f5e"
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
            <ReferenceLine
              y={30}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeOpacity={0.7}
            />
            <ReferenceLine
              y={50}
              stroke="#64748b"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />

            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#a78bfa" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5 bg-rose-500/70"
            style={{ borderTop: "2px dashed" }}
          />
          <span className="text-slate-400">Overbought (70)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5 bg-emerald-500/70"
            style={{ borderTop: "2px dashed" }}
          />
          <span className="text-slate-400">Oversold (30)</span>
        </div>
      </div>
    </Card>
  );
}
