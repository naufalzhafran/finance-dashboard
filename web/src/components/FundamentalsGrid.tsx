import { Gem, Wallet, HeartPulse, Rocket } from "lucide-react";
import { FundamentalData } from "@/lib/db";
import { MetricCard } from "./MetricCard";
import { PercentageBadge } from "./PercentageBadge";

interface FundamentalsGridProps {
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

export default function FundamentalsGrid({
  data,
  loading,
  currency = "USD",
}: FundamentalsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-secondary/50 rounded-xl animate-shimmer"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm">
        <p className="text-muted-foreground">
          No fundamental data available for this asset.
        </p>
      </div>
    );
  }

  const locale = currencyLocales[currency] || "en-US";
  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return "—";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNumber = (val: number | null) => {
    if (val === null || val === undefined) return "—";
    return val.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-8">
      {/* Valuation Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10">
            <Gem className="w-4 h-4 text-blue-400" />
          </span>
          Valuation
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Market Cap"
            value={formatCurrency(data.market_cap)}
          />
          <MetricCard
            label="Enterprise Value"
            value={formatCurrency(data.enterprise_value)}
          />
          <MetricCard
            label="Trailing P/E"
            value={formatNumber(data.trailing_pe)}
          />
          <MetricCard
            label="Forward P/E"
            value={formatNumber(data.forward_pe)}
          />
          <MetricCard label="PEG Ratio" value={formatNumber(data.peg_ratio)} />
          <MetricCard
            label="Price/Book"
            value={formatNumber(data.price_to_book)}
          />
          <MetricCard
            label="Trailing EPS"
            value={formatNumber(data.trailing_eps)}
          />
          <MetricCard
            label="Forward EPS"
            value={formatNumber(data.forward_eps)}
          />
        </div>
      </section>

      {/* Profitability */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10">
            <Wallet className="w-4 h-4 text-emerald-400" />
          </span>
          Profitability
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Profit Margin"
            value={<PercentageBadge value={data.profit_margins} />}
          />
          <MetricCard
            label="Operating Margin"
            value={<PercentageBadge value={data.operating_margins} />}
          />
          <MetricCard
            label="ROA"
            value={<PercentageBadge value={data.return_on_assets} />}
          />
          <MetricCard
            label="ROE"
            value={<PercentageBadge value={data.return_on_equity} />}
          />
          <MetricCard
            label="Gross Profits"
            value={formatCurrency(data.gross_profits)}
          />
          <MetricCard
            label="Total Revenue"
            value={formatCurrency(data.total_revenue)}
          />
        </div>
      </section>

      {/* Financial Health */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10">
            <HeartPulse className="w-4 h-4 text-rose-400" />
          </span>
          Health & Cash Flow
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Cash"
            value={formatCurrency(data.total_cash)}
          />
          <MetricCard
            label="Total Debt"
            value={formatCurrency(data.total_debt)}
          />
          <MetricCard
            label="Debt/Equity"
            value={formatNumber(data.debt_to_equity)}
          />
          <MetricCard
            label="Operating Cashflow"
            value={formatCurrency(data.operating_cashflow)}
          />
          <MetricCard
            label="Free Cashflow"
            value={formatCurrency(data.free_cashflow)}
          />
        </div>
      </section>

      {/* Growth */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10">
            <Rocket className="w-4 h-4 text-amber-400" />
          </span>
          Growth
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Revenue Growth"
            value={<PercentageBadge value={data.revenue_growth} />}
          />
          <MetricCard
            label="Earnings Growth"
            value={<PercentageBadge value={data.earnings_growth} />}
          />
        </div>
      </section>

      <div className="text-xs text-muted-foreground text-right">
        Data updated: {new Date(data.date).toLocaleDateString()}
      </div>
    </div>
  );
}
