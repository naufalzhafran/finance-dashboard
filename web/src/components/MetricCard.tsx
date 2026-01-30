import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  subValue?: ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "p-4 flex flex-col gap-1 bg-background/50 backdrop-blur-sm",
        className,
      )}
    >
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
      <div className="font-semibold text-lg truncate">{value}</div>
      {subValue && <div className="text-sm mt-1">{subValue}</div>}
    </Card>
  );
}
