import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";

interface DrawdownDataPoint {
  date: string;
  fullDate: string;
  drawdown: number | null;
}

interface DrawdownChartProps {
  data: DrawdownDataPoint[];
  maxDrawdown?: { value: number; date: string } | null;
}

export default function DrawdownChart({
  data,
  maxDrawdown,
}: DrawdownChartProps) {
  const validData = data.filter((d) => d.drawdown !== null);

  if (validData.length === 0) {
    return (
      <Card className="p-6 bg-background/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">Drawdown</h3>
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Insufficient data for drawdown calculation
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
    payload?: Array<{ payload: DrawdownDataPoint }>;
  }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const dd = d.drawdown;

      return (
        <Card className="p-3 !bg-background/95 border-border shadow-xl">
          <p className="text-muted-foreground text-sm mb-1">{d.fullDate}</p>
          <p className="font-mono text-lg font-semibold text-rose-400">
            Drawdown: {dd !== null ? `${(dd * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-slate-500">From peak</p>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Drawdown</h3>
        {maxDrawdown && (
          <span className="text-sm text-slate-400">
            Max:{" "}
            <span className="text-rose-400 font-mono">
              {(maxDrawdown.value * 100).toFixed(1)}%
            </span>
            <span className="text-slate-500 ml-1">({maxDrawdown.date})</span>
          </span>
        )}
      </div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
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
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              domain={["auto", 0]}
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

            {/* Max drawdown reference */}
            {maxDrawdown && (
              <ReferenceLine
                y={maxDrawdown.value}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                strokeOpacity={0.7}
              />
            )}

            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-rose-500/30 border border-rose-500 rounded-sm" />
          <span className="text-slate-400">Drawdown from Peak</span>
        </div>
      </div>
    </Card>
  );
}
