import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
}

export function MetricCard({
  label,
  value,
  subValue,
  className,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "p-4 flex flex-col gap-1 bg-card/80 backdrop-blur-sm border-border/50 hover:border-border transition-colors duration-200",
        className,
      )}
    >
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <div className="font-semibold text-lg truncate font-mono">{value}</div>
      {subValue && <div className="text-sm mt-1">{subValue}</div>}
    </Card>
  );
}
