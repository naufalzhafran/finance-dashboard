import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PercentageBadgeProps {
  value: number | null | undefined;
}

export function PercentageBadge({ value }: PercentageBadgeProps) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  // Multiply by 100 to display as percentage if the raw value is a ratio (e.g. 0.05 -> 5%)
  const percentage = value * 100;
  const isPositive = percentage > 0;
  const isNegative = percentage < 0;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono px-2 py-0.5 border-0",
        isPositive && "bg-emerald-500/10 text-emerald-500",
        isNegative && "bg-rose-500/10 text-rose-500",
        !isPositive && !isNegative && "bg-muted text-muted-foreground",
      )}
    >
      {isPositive && "+"}
      {percentage.toFixed(2)}%
    </Badge>
  );
}
