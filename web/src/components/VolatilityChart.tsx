import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";

interface VolatilityDataPoint {
  date: string;
  fullDate: string;
  volatility: number | null;
}

interface VolatilityChartProps {
  data: VolatilityDataPoint[];
}

export default function VolatilityChart({ data }: VolatilityChartProps) {
  const validData = data.filter((d) => d.volatility !== null);

  if (validData.length === 0) {
    return (
      <Card className="p-6 bg-background/50 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">
          Historical Volatility (21-day)
        </h3>
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Insufficient data for volatility calculation
          </p>
        </div>
      </Card>
    );
  }

  // Calculate average volatility for reference line
  const avgVol =
    validData.reduce((sum, d) => sum + (d.volatility || 0), 0) /
    validData.length;

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: VolatilityDataPoint }>;
  }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const vol = d.volatility;

      return (
        <Card className="p-3 !bg-background/95 border-border shadow-xl">
          <p className="text-muted-foreground text-sm mb-1">{d.fullDate}</p>
          <p className="font-mono text-lg font-semibold text-amber-400">
            Volatility: {vol !== null ? `${(vol * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-slate-500">Annualized</p>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4">
        Historical Volatility (21-day)
      </h3>
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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

            {/* Average volatility reference */}
            <ReferenceLine
              y={avgVol}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />

            <Line
              type="monotone"
              dataKey="volatility"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#f59e0b" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-amber-500" />
          <span className="text-slate-400">21-day Rolling Volatility</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-0.5 bg-amber-500/50"
            style={{ borderTop: "2px dashed" }}
          />
          <span className="text-slate-400">
            Average ({(avgVol * 100).toFixed(0)}%)
          </span>
        </div>
      </div>
    </Card>
  );
}
