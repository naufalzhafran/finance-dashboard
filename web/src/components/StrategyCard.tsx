import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult } from "@/lib/strategy";

interface StrategyCardProps {
  analysis: AnalysisResult | null;
  loading?: boolean;
}

export default function StrategyCard({ analysis, loading }: StrategyCardProps) {
  if (loading) {
    return (
      <Card className="p-6 bg-background/50 backdrop-blur-sm animate-pulse">
        <div className="h-40 rounded-xl bg-muted/20" />
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    return "text-rose-500";
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "STRONG_BUY":
      case "BUY":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "STRONG_SELL":
      case "SELL":
        return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
    }
  };

  return (
    <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-white/5">
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Left: Overall Verdict */}
        <div className="text-center md:text-left space-y-4">
          <h3 className="text-lg font-medium text-muted-foreground">
            AI Strategy Verdict
          </h3>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Circular Gauge Background */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted/20"
                />
                {/* Circular Gauge Progress */}
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * analysis.score) / 100}
                  className={`${getScoreColor(analysis.score)} transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span
                  className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}
                >
                  {analysis.score}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Score
                </span>
              </div>
            </div>
            <div>
              <Badge
                className={`px-4 py-1.5 text-sm font-bold tracking-wide border-0 mb-2 ${getActionColor(analysis.action)}`}
              >
                {analysis.action.replace("_", " ")}
              </Badge>
              <p className="text-sm text-balance leading-relaxed text-muted-foreground max-w-[200px]">
                {analysis.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Component Scores */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Drivers
          </h4>
          <div className="space-y-3">
            {/* Trend */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Trend & Technicals
                </span>
                <span className="font-medium">
                  {analysis.metrics.trendScore}/100
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${analysis.metrics.trendScore}%` }}
                />
              </div>
            </div>

            {/* Momentum */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Momentum</span>
                <span className="font-medium">
                  {analysis.metrics.momentumScore}/100
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700 delay-100"
                  style={{ width: `${analysis.metrics.momentumScore}%` }}
                />
              </div>
            </div>

            {/* Value */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Value & Fundamentals
                </span>
                <span className="font-medium">
                  {analysis.metrics.valueScore}/100
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 delay-200"
                  style={{ width: `${analysis.metrics.valueScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Key Insights */}
        <div className="bg-muted/10 rounded-xl p-4 h-full border border-white/5">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Key Insights
          </h4>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
            {analysis.reasons.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No specific signals detected.
              </p>
            )}
            {analysis.reasons.map((reason, i) => (
              <div key={i} className="flex gap-2.5 items-start text-sm group">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    reason.type === "positive"
                      ? "bg-emerald-500"
                      : reason.type === "negative"
                        ? "bg-rose-500"
                        : "bg-slate-400"
                  }`}
                />
                <span
                  className={`${
                    reason.type === "positive"
                      ? "text-emerald-100"
                      : reason.type === "negative"
                        ? "text-rose-100"
                        : "text-muted-foreground"
                  }`}
                >
                  {reason.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
