"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  content: string;
  title?: string;
}

export function InfoTooltip({ content, title }: InfoTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none ml-1"
          aria-label="More information"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3 text-sm bg-slate-900/95 border-slate-700"
        side="top"
        sideOffset={5}
      >
        {title && <p className="font-medium text-slate-200 mb-1">{title}</p>}
        <p className="text-slate-400 leading-relaxed">{content}</p>
      </PopoverContent>
    </Popover>
  );
}

// Predefined tooltip content for all indicators
export const INDICATOR_HELP = {
  // Technical Indicators
  rsi: {
    title: "Relative Strength Index (RSI)",
    content:
      "Measures momentum on a 0-100 scale. Above 70 = overbought (may fall), below 30 = oversold (may rise). Use to identify potential reversals.",
  },
  macd: {
    title: "MACD",
    content:
      "Shows trend direction and momentum. When MACD crosses above signal line = bullish. When it crosses below = bearish. Histogram shows strength.",
  },
  bollinger: {
    title: "Bollinger Bands",
    content:
      "Volatility bands around price. Price touching upper band may indicate overbought, lower band may signal oversold. Bands widen during volatility.",
  },
  maTrend: {
    title: "Moving Average Trend",
    content:
      "Compares 50-day and 200-day SMA. When 50-day > 200-day = bullish trend. Golden Cross (50 crossing above 200) is a strong buy signal.",
  },
  goldenCross: {
    title: "Golden Cross",
    content:
      "Bullish signal when 50-day SMA crosses above 200-day SMA. Historically indicates potential long-term uptrend.",
  },
  deathCross: {
    title: "Death Cross",
    content:
      "Bearish signal when 50-day SMA crosses below 200-day SMA. Often indicates potential long-term downtrend ahead.",
  },

  // Risk & Volatility
  volatility: {
    title: "Historical Volatility",
    content:
      "21-day rolling standard deviation of returns, annualized. Higher values = more price swings. >50% is very high, <15% is low risk.",
  },
  maxDrawdown: {
    title: "Maximum Drawdown",
    content:
      "Largest peak-to-trough decline in the period. Shows worst-case loss if you bought at the peak. Important for risk assessment.",
  },
  beta: {
    title: "Beta vs IHSG",
    content:
      "Measures stock volatility relative to market. Beta=1 moves with market. >1 = more volatile. <1 = less volatile. Negative = inverse.",
  },
  fiftyTwoWeekRange: {
    title: "52-Week Range",
    content:
      "Shows highest and lowest prices in the past year. Current position indicates whether stock is near highs (potentially expensive) or lows.",
  },

  // Chart Stats
  high: {
    title: "Period High",
    content: "Highest price reached during the selected time range.",
  },
  low: {
    title: "Period Low",
    content: "Lowest price reached during the selected time range.",
  },
  avgVolume: {
    title: "Average Volume",
    content:
      "Average daily trading volume. Higher volume = more liquidity and easier to trade. Spikes may indicate important events.",
  },
  dataPoints: {
    title: "Data Points",
    content:
      "Number of trading days in the dataset. More data points provide more reliable indicator calculations.",
  },
  sma50: {
    title: "50-Day SMA",
    content:
      "Simple Moving Average of last 50 days. Short-term trend indicator. Price above SMA50 = short-term bullish.",
  },
  sma200: {
    title: "200-Day SMA",
    content:
      "Simple Moving Average of last 200 days. Long-term trend indicator. Price above SMA200 = long-term bullish.",
  },
};
