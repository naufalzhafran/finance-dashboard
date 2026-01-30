"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

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

  const { priceChange, priceChangePercent, isPositive, lastPrice } =
    useMemo(() => {
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
      <Card className="p-4 h-32 flex items-center justify-center bg-background/50 backdrop-blur-sm">
        <span className="text-muted-foreground text-xs">No Data</span>
      </Card>
    );
  }

  return (
    <Card
      className="p-4 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors cursor-pointer border-border/50 hover:border-border"
      onClick={() => router.push(`/asset/${encodeURIComponent(symbol)}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-sm tracking-tight">{symbol}</h3>
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
            className={`text-xs font-medium ${
              isPositive ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {priceChangePercent}%
          </p>
        </div>
      </div>

      <div className="h-16 w-full opacity-80">
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
                  stopColor={isPositive ? "#10b981" : "#f43f5e"}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#10b981" : "#f43f5e"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <YAxis domain={["auto", "auto"]} hide />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? "#10b981" : "#f43f5e"}
              strokeWidth={1.5}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
