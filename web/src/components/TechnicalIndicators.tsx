import { Card } from "@/components/ui/card";
import {
  getRSIStatus,
  getMACDTrend,
  getBollingerPosition,
  CrossoverResult,
} from "@/lib/technicalIndicators";
import { InfoTooltip, INDICATOR_HELP } from "@/components/InfoTooltip";

interface TechnicalIndicatorsProps {
  rsi: number | null;
  macd: number | null;
  signal: number | null;
  currentPrice: number;
  bollingerUpper: number | null;
  bollingerLower: number | null;
  sma50: number | null;
  sma200: number | null;
  latestCrossover: CrossoverResult | null;
}

export default function TechnicalIndicators({
  rsi,
  macd,
  signal,
  currentPrice,
  bollingerUpper,
  bollingerLower,
  sma50,
  sma200,
  latestCrossover,
}: TechnicalIndicatorsProps) {
  const rsiStatus = getRSIStatus(rsi);
  const macdTrend = getMACDTrend(macd, signal);
  const bollingerPos = getBollingerPosition(
    currentPrice,
    bollingerUpper,
    bollingerLower,
  );

  // Determine MA trend
  const maTrend = (() => {
    if (sma50 === null || sma200 === null)
      return { trend: "N/A", color: "slate" };
    if (sma50 > sma200) return { trend: "Bullish", color: "emerald" };
    return { trend: "Bearish", color: "rose" };
  })();

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    slate: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    gray: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-4">Technical Indicators</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* RSI */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm flex items-center">
              RSI (14)
              <InfoTooltip {...INDICATOR_HELP.rsi} />
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[rsiStatus.color]}`}
            >
              {rsiStatus.status}
            </span>
          </div>
          <p
            className={`font-mono text-2xl font-semibold ${
              rsiStatus.color === "rose"
                ? "text-rose-400"
                : rsiStatus.color === "emerald"
                  ? "text-emerald-400"
                  : "text-slate-200"
            }`}
          >
            {rsi !== null ? rsi.toFixed(1) : "N/A"}
          </p>
        </div>

        {/* MACD */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm flex items-center">
              MACD
              <InfoTooltip {...INDICATOR_HELP.macd} />
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[macdTrend.color]}`}
            >
              {macdTrend.trend}
            </span>
          </div>
          <p
            className={`font-mono text-2xl font-semibold ${
              macdTrend.color === "rose"
                ? "text-rose-400"
                : macdTrend.color === "emerald"
                  ? "text-emerald-400"
                  : "text-slate-200"
            }`}
          >
            {macd !== null ? macd.toFixed(2) : "N/A"}
          </p>
        </div>

        {/* Bollinger Band Position */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm flex items-center">
              Bollinger
              <InfoTooltip {...INDICATOR_HELP.bollinger} />
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[bollingerPos.color]}`}
            >
              {bollingerPos.position}
            </span>
          </div>
          <p className="text-slate-400 text-sm font-mono">
            {bollingerUpper !== null && bollingerLower !== null ? (
              <>
                U: {bollingerUpper.toFixed(0)} / L: {bollingerLower.toFixed(0)}
              </>
            ) : (
              "N/A"
            )}
          </p>
        </div>

        {/* MA Trend */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm flex items-center">
              MA Trend
              <InfoTooltip {...INDICATOR_HELP.maTrend} />
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${colorMap[maTrend.color]}`}
            >
              {maTrend.trend}
            </span>
          </div>
          <p className="text-slate-400 text-sm font-mono">
            {sma50 !== null ? `50d: ${sma50.toFixed(0)}` : "N/A"}
            {sma200 !== null ? ` / 200d: ${sma200.toFixed(0)}` : ""}
          </p>
        </div>
      </div>

      {/* Golden/Death Cross Alert */}
      {latestCrossover && (
        <div
          className={`mt-4 p-4 rounded-xl border ${
            latestCrossover.type === "golden"
              ? "bg-amber-500/10 border-amber-500/30"
              : "bg-purple-500/10 border-purple-500/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {latestCrossover.type === "golden" ? "✨" : "💀"}
            </span>
            <div className="flex-1">
              <p
                className={`font-semibold flex items-center ${
                  latestCrossover.type === "golden"
                    ? "text-amber-400"
                    : "text-purple-400"
                }`}
              >
                {latestCrossover.type === "golden"
                  ? "Golden Cross"
                  : "Death Cross"}{" "}
                Detected
                <InfoTooltip
                  {...(latestCrossover.type === "golden"
                    ? INDICATOR_HELP.goldenCross
                    : INDICATOR_HELP.deathCross)}
                />
              </p>
              <p className="text-sm text-slate-400">
                SMA 50 crossed{" "}
                {latestCrossover.type === "golden" ? "above" : "below"} SMA 200
                on {latestCrossover.date}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
