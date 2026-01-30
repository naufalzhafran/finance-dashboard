import { Card } from "@/components/ui/card";
import {
  getVolatilityStatus,
  getBetaStatus,
  MaxDrawdownResult,
  FiftyTwoWeekHL,
} from "@/lib/technicalIndicators";
import { InfoTooltip, INDICATOR_HELP } from "@/components/InfoTooltip";

interface RiskAnalyticsProps {
  volatility: number | null;
  maxDrawdown: MaxDrawdownResult | null;
  beta: number | null;
  fiftyTwoWeekHL: FiftyTwoWeekHL | null;
  currency?: string;
}

const currencyLocales: Record<string, string> = {
  IDR: "id-ID",
  USD: "en-US",
  JPY: "ja-JP",
  GBP: "en-GB",
  EUR: "de-DE",
};

export default function RiskAnalytics({
  volatility,
  maxDrawdown,
  beta,
  fiftyTwoWeekHL,
  currency = "USD",
}: RiskAnalyticsProps) {
  const volStatus = getVolatilityStatus(volatility);
  const betaStatus = getBetaStatus(beta);

  const locale = currencyLocales[currency] || "en-US";
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    slate: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    gray: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4">Risk & Volatility</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Volatility */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm flex items-center">
              Volatility (21d)
              <InfoTooltip {...INDICATOR_HELP.volatility} />
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[volStatus.color]}`}
            >
              {volStatus.status}
            </span>
          </div>
          <p
            className={`font-mono text-2xl font-semibold ${
              volStatus.color === "rose"
                ? "text-rose-400"
                : volStatus.color === "amber"
                  ? "text-amber-400"
                  : volStatus.color === "emerald"
                    ? "text-emerald-400"
                    : "text-slate-200"
            }`}
          >
            {volatility !== null ? `${(volatility * 100).toFixed(1)}%` : "N/A"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Annualized</p>
        </div>

        {/* Max Drawdown */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm flex items-center">
              Max Drawdown
              <InfoTooltip {...INDICATOR_HELP.maxDrawdown} />
            </p>
          </div>
          <p className="font-mono text-2xl font-semibold text-rose-400">
            {maxDrawdown
              ? `${(maxDrawdown.maxDrawdown * 100).toFixed(1)}%`
              : "N/A"}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {maxDrawdown?.maxDrawdownDate || ""}
          </p>
        </div>

        {/* Beta */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm flex items-center">
              Beta (vs IHSG)
              <InfoTooltip {...INDICATOR_HELP.beta} />
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[betaStatus.color]}`}
            >
              {betaStatus.status}
            </span>
          </div>
          <p
            className={`font-mono text-2xl font-semibold ${
              betaStatus.color === "rose"
                ? "text-rose-400"
                : betaStatus.color === "amber"
                  ? "text-amber-400"
                  : betaStatus.color === "emerald"
                    ? "text-emerald-400"
                    : "text-slate-200"
            }`}
          >
            {beta !== null ? beta.toFixed(2) : "N/A"}
          </p>
          <p className="text-xs text-slate-500 mt-1">1Y correlation</p>
        </div>

        {/* 52-Week Range */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-2 flex items-center">
            52-Week Range
            <InfoTooltip {...INDICATOR_HELP.fiftyTwoWeekRange} />
          </p>
          {fiftyTwoWeekHL ? (
            <>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-rose-400">
                  {formatPrice(fiftyTwoWeekHL.low)}
                </span>
                <span className="text-emerald-400">
                  {formatPrice(fiftyTwoWeekHL.high)}
                </span>
              </div>
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-rose-500 to-emerald-500"
                  style={{ width: "100%" }}
                />
                <div
                  className="absolute w-1 h-full bg-white rounded-full"
                  style={{
                    left: `${Math.max(
                      0,
                      Math.min(
                        100,
                        (fiftyTwoWeekHL.percentFromLow /
                          (fiftyTwoWeekHL.percentFromLow -
                            fiftyTwoWeekHL.percentFromHigh)) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {fiftyTwoWeekHL.percentFromHigh.toFixed(1)}% from high
              </p>
            </>
          ) : (
            <p className="text-slate-500 text-sm">N/A</p>
          )}
        </div>
      </div>
    </Card>
  );
}
