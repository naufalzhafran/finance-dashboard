"use client";

import { useMemo } from "react";
import { YAxis, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceData {
  date: string;
  close: number;
}

interface MiniStockChartProps {
  data: PriceData[];
  symbol: string;
  name?: string;
  currency?: string;
  color?: string;
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

export default function MiniStockChart({
  data,
  symbol,
  name,
  currency = "USD",
}: MiniStockChartProps) {
  const router = useRouter();

  const { priceChangePercent, isPositive, lastPrice } = useMemo(() => {
    if (data.length === 0)
      return {
        priceChange: 0,
        priceChangePercent: "0.00",
        isPositive: true,
        lastPrice: 0,
      };
    const first = data[0].close;
    const last = data[data.length - 1].close;
    const change = last - first;
    return {
      priceChange: change,
      priceChangePercent: ((change / first) * 100).toFixed(2),
      isPositive: change >= 0,
      lastPrice: last,
    };
  }, [data]);

  const locale = currencyLocales[currency] || "en-US";
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);

  if (data.length === 0) {
    return (
      <Card className="p-4 h-32 flex items-center justify-center bg-card/80 border-border/50">
        <span className="text-muted-foreground text-xs">No Data</span>
      </Card>
    );
  }

  return (
    <Card
      className={`p-4 bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer transition-all duration-300 hover:border-border group ${
        isPositive ? "hover:glow-emerald" : "hover:glow-rose"
      }`}
      onClick={() => router.push(`/asset/${encodeURIComponent(symbol)}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors duration-200">
            {symbol}
          </h3>
          <p
            className="text-xs text-muted-foreground truncate max-w-[120px]"
            title={name}
          >
            {name}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold">
            {formatPrice(lastPrice)}
          </p>
          <p
            className={`text-xs font-medium flex items-center justify-end gap-0.5 ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? "+" : ""}
            {priceChangePercent}%
          </p>
        </div>
      </div>

      <div className="h-16 w-full opacity-80 group-hover:opacity-100 transition-opacity duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`gradient-${symbol}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={isPositive ? "#22C55E" : "#F43F5E"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#22C55E" : "#F43F5E"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <YAxis domain={["auto", "auto"]} hide />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? "#22C55E" : "#F43F5E"}
              strokeWidth={1.5}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
