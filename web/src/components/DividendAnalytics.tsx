"use client";

import { FundamentalData } from "@/lib/db";

interface DividendAnalyticsProps {
  data: FundamentalData | null;
  loading?: boolean;
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

const getPayoutHealth = (
  ratio: number | null,
): { label: string; color: string } => {
  if (ratio === null) return { label: "N/A", color: "text-muted-foreground" };

  if (ratio < 0.3) return { label: "Low", color: "text-blue-400" };
  if (ratio < 0.6) return { label: "Healthy", color: "text-emerald-400" };
  if (ratio < 0.8) return { label: "High", color: "text-amber-400" };
  return { label: "Unsustainable", color: "text-rose-400" };
};

export default function DividendAnalytics({
  data,
  loading,
  currency = "USD",
}: DividendAnalyticsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-muted/50 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Check if stock has any dividend data
  const hasDividendData =
    data.dividend_yield !== null ||
    data.dividend_rate !== null ||
    data.payout_ratio !== null;

  if (!hasDividendData) {
    return (
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-green-400">💰</span> Dividend Analytics
        </h3>
        <div className="p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 text-center">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-muted-foreground text-sm">
            This stock does not pay dividends or dividend data is unavailable.
          </p>
        </div>
      </section>
    );
  }

  const locale = currencyLocales[currency] || "en-US";

  // Yahoo Finance returns dividend_yield and five_year_avg_dividend_yield
  // BOTH as percentage values (e.g., 4.24 = 4.24%), not decimals
  // So we display them directly without multiplying by 100
  const formatDividendPercent = (val: number | null) => {
    if (val === null || val === undefined) return "—";
    return `${val.toFixed(2)}%`;
  };

  // For payout_ratio, Yahoo Finance returns it as a decimal (0.50 = 50%)
  const formatPercent = (val: number | null) => {
    if (val === null || val === undefined) return "—";
    return `${(val * 100).toFixed(2)}%`;
  };

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return "—";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const payoutHealth = getPayoutHealth(data.payout_ratio);

  // Calculate comparison to 5-year average
  // Both values are already in percentage format (e.g., 4.24 = 4.24%)
  const yieldComparison = (() => {
    if (
      data.dividend_yield === null ||
      data.five_year_avg_dividend_yield === null
    ) {
      return null;
    }
    const diff = data.dividend_yield - data.five_year_avg_dividend_yield;
    const pctChange = (diff / data.five_year_avg_dividend_yield) * 100;
    return {
      isAbove: diff > 0,
      pctChange: Math.abs(pctChange).toFixed(1),
    };
  })();

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="text-green-400">💰</span> Dividend Analytics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dividend Yield Card */}
        <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Dividend Yield
            </span>
            {yieldComparison && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${
                  yieldComparison.isAbove ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {yieldComparison.isAbove ? "↑" : "↓"}{" "}
                {yieldComparison.pctChange}% vs Avg
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {formatDividendPercent(data.dividend_yield)}
          </div>
          <div className="text-xs text-muted-foreground">
            5Y Avg: {formatDividendPercent(data.five_year_avg_dividend_yield)}
          </div>

          {/* Comparison visual */}
          {data.dividend_yield !== null &&
            data.five_year_avg_dividend_yield !== null && (
              <div className="relative h-3 rounded-full bg-muted/30 overflow-visible">
                {/* 5-year average marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                  style={{
                    left: `${Math.min(90, (data.five_year_avg_dividend_yield / 10) * 100)}%`,
                  }}
                />
                {/* Current yield bar */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{
                    width: `${Math.min(100, (data.dividend_yield / 10) * 100)}%`,
                  }}
                />
              </div>
            )}
        </div>

        {/* Dividend Rate Card */}
        <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 space-y-3">
          <span className="text-sm text-muted-foreground">Annual Dividend</span>
          <div className="text-2xl font-bold">
            {formatCurrency(data.dividend_rate)}
          </div>
          <div className="text-xs text-muted-foreground">
            Per share, per year
          </div>
        </div>

        {/* Payout Ratio Card */}
        <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payout Ratio</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 ${payoutHealth.color}`}
            >
              {payoutHealth.label}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {formatPercent(data.payout_ratio)}
          </div>
          <div className="text-xs text-muted-foreground">
            % of earnings paid as dividends
          </div>

          {/* Payout ratio bar */}
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (data.payout_ratio ?? 0) > 0.8
                  ? "bg-rose-400"
                  : (data.payout_ratio ?? 0) > 0.6
                    ? "bg-amber-400"
                    : "bg-emerald-400"
              }`}
              style={{
                width: `${Math.min(100, (data.payout_ratio ?? 0) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
