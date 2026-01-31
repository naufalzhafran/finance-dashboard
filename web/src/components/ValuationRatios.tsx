"use client";

import { FundamentalData } from "@/lib/db";

interface ValuationRatiosProps {
  data: FundamentalData | null;
  loading?: boolean;
}

// Fair value assessment based on common market benchmarks
const getValuationStatus = (
  value: number | null | undefined,
  metric: "pe" | "pb" | "ps",
): { label: string; color: string } => {
  if (value == null) return { label: "N/A", color: "text-muted-foreground" };

  // Thresholds vary by metric
  const thresholds = {
    pe: { low: 15, high: 25 },
    pb: { low: 1, high: 3 },
    ps: { low: 1, high: 5 },
  };

  const t = thresholds[metric];
  if (value < t.low) return { label: "Undervalued", color: "text-emerald-400" };
  if (value > t.high) return { label: "Overvalued", color: "text-rose-400" };
  return { label: "Fair Value", color: "text-amber-400" };
};

export default function ValuationRatios({
  data,
  loading,
}: ValuationRatiosProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const formatRatio = (val: number | null | undefined) => {
    if (val == null) return "—";
    return val.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  const peStatus = getValuationStatus(data.trailing_pe, "pe");
  const pbStatus = getValuationStatus(data.price_to_book, "pb");
  const psStatus = getValuationStatus(data.price_to_sales, "ps");

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="text-purple-400">⚖️</span> Fair Value Tracker
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* P/E Ratio Card */}
        <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">P/E Ratio</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${peStatus.color}`}
            >
              {peStatus.label}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {formatRatio(data.trailing_pe)}
          </div>
          <div className="text-xs text-muted-foreground">
            Forward P/E: {formatRatio(data.forward_pe)}
          </div>

          {/* Visual indicator bar */}
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400"
              style={{
                width: `${Math.min(100, ((data.trailing_pe ?? 20) / 40) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Cheap</span>
            <span>Expensive</span>
          </div>
        </div>

        {/* P/B Ratio Card */}
        <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">P/B Ratio</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${pbStatus.color}`}
            >
              {pbStatus.label}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {formatRatio(data.price_to_book)}
          </div>
          <div className="text-xs text-muted-foreground">
            Price vs Book Value
          </div>

          {/* Visual indicator bar */}
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400"
              style={{
                width: `${Math.min(100, ((data.price_to_book ?? 2) / 6) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Cheap</span>
            <span>Premium</span>
          </div>
        </div>

        {/* P/S Ratio Card */}
        <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">P/S Ratio</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${psStatus.color}`}
            >
              {psStatus.label}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {formatRatio(data.price_to_sales)}
          </div>
          <div className="text-xs text-muted-foreground">
            Price to Sales (TTM)
          </div>

          {/* Visual indicator bar */}
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400"
              style={{
                width: `${Math.min(100, ((data.price_to_sales ?? 2) / 10) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Cheap</span>
            <span>Expensive</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        * Fair value indicators are based on general market benchmarks. Actual
        fair value varies by industry and growth profile.
      </p>
    </section>
  );
}
