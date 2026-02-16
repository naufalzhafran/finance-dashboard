"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PercentageBadgeProps {
  /** Already-computed percentage value (e.g. 5.23 for +5.23%) */
  percentage?: number | null;
  /** Raw decimal ratio (e.g. 0.0523 for 5.23%) — multiplied by 100 internally */
  value?: number | null;
  className?: string;
}

export function PercentageBadge({
  percentage,
  value,
  className,
}: PercentageBadgeProps) {
  // Support both props: `percentage` is already in % form, `value` is raw ratio
  const pct = percentage ?? (value != null ? value * 100 : null);

  if (pct === null || pct === undefined || isNaN(pct)) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "font-mono px-2 py-0.5 border-0 bg-muted text-muted-foreground",
          className,
        )}
      >
        N/A
      </Badge>
    );
  }

  const isPositive = pct > 0;
  const isNegative = pct < 0;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono px-2 py-0.5 border-0 flex items-center gap-1",
        isPositive && "bg-emerald-500/10 text-emerald-400",
        isNegative && "bg-rose-500/10 text-rose-400",
        !isPositive && !isNegative && "bg-muted text-muted-foreground",
        className,
      )}
    >
      {isPositive && <TrendingUp className="w-3 h-3" />}
      {isNegative && <TrendingDown className="w-3 h-3" />}
      {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
      {isPositive && "+"}
      {pct.toFixed(2)}%
    </Badge>
  );
}
