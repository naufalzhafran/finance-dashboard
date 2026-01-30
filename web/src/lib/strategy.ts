import { FundamentalData } from "@/lib/db";
import {
  calculateSMA,
  calculateRSI,
  calculateMACD,
} from "./technicalIndicators";

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type AnalysisAction =
  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export interface AnalysisReason {
  type: "positive" | "negative" | "neutral";
  text: string;
}

export interface AnalysisResult {
  action: AnalysisAction;
  score: number; // 0 to 100
  summary: string;
  reasons: AnalysisReason[];
  metrics: {
    trendScore: number;
    valueScore: number;
    momentumScore: number;
  };
}

export function analyzeStock(
  prices: PriceData[],
  fundamentals: FundamentalData | null,
): AnalysisResult {
  if (!prices || prices.length < 200) {
    return {
      action: "HOLD",
      score: 50,
      summary: "Insufficient data for detailed analysis.",
      reasons: [
        {
          type: "neutral",
          text: "Not enough historical price data (need 200+ days)",
        },
      ],
      metrics: { trendScore: 50, valueScore: 50, momentumScore: 50 },
    };
  }

  const currentPrice = prices[prices.length - 1].close;
  const reasons: AnalysisReason[] = [];

  // --- 1. TREND ANALYSIS (40% Weight) ---
  let trendScore = 50;

  // SMA 50 & 200
  const sma50 = calculateSMA(prices, 50);
  const sma200 = calculateSMA(prices, 200);
  const currentSMA50 = sma50[sma50.length - 1];
  const currentSMA200 = sma200[sma200.length - 1];

  if (currentSMA50 && currentSMA200) {
    if (currentPrice > currentSMA50 && currentPrice > currentSMA200) {
      trendScore += 20;
      reasons.push({
        type: "positive",
        text: "Price is above both SMA50 and SMA200 (Bullish trend)",
      });
    } else if (currentPrice < currentSMA50 && currentPrice < currentSMA200) {
      trendScore -= 20;
      reasons.push({
        type: "negative",
        text: "Price is below both SMA50 and SMA200 (Bearish trend)",
      });
    } else if (currentPrice > currentSMA200) {
      trendScore += 10;
      reasons.push({
        type: "positive",
        text: "Price is above long-term trend (SMA200)",
      });
    } else {
      trendScore -= 10;
      reasons.push({
        type: "negative",
        text: "Price is below long-term trend (SMA200)",
      });
    }

    // Golden/Death Cross
    if (currentSMA50 > currentSMA200) {
      trendScore += 10;
      reasons.push({
        type: "positive",
        text: "Golden Cross active (SMA50 > SMA200)",
      });
    } else {
      trendScore -= 10;
      reasons.push({
        type: "negative",
        text: "Death Cross active (SMA50 < SMA200)",
      });
    }
  }

  // Cap trend score
  trendScore = Math.max(0, Math.min(100, trendScore));

  // --- 2. MOMENTUM ANALYSIS (30% Weight) ---
  let momentumScore = 50;

  // RSI
  const rsi = calculateRSI(prices, 14);
  const currentRSI = rsi[rsi.length - 1];

  if (currentRSI !== null) {
    if (currentRSI < 30) {
      momentumScore += 30; // Oversold -> Potential Buy
      reasons.push({
        type: "positive",
        text: `RSI is Oversold (${currentRSI.toFixed(1)}), suggesting a rebound`,
      });
    } else if (currentRSI > 70) {
      momentumScore -= 20; // Overbought -> Potential Sell
      reasons.push({
        type: "negative",
        text: `RSI is Overbought (${currentRSI.toFixed(1)}), suggesting a correction`,
      });
    } else if (currentRSI > 50) {
      momentumScore += 10;
      reasons.push({
        type: "positive",
        text: "RSI indicates positive momentum",
      });
    }
  }

  // MACD
  const macd = calculateMACD(prices);
  const currentMACD = macd.histogram[macd.histogram.length - 1];
  const prevMACD = macd.histogram[macd.histogram.length - 2];

  if (currentMACD !== null && prevMACD !== null) {
    if (currentMACD > 0 && currentMACD > prevMACD) {
      momentumScore += 10;
      reasons.push({
        type: "positive",
        text: "MACD Histogram is gaining positive momentum",
      });
    } else if (currentMACD < 0 && currentMACD < prevMACD) {
      momentumScore -= 10;
      reasons.push({
        type: "negative",
        text: "MACD Histogram is gaining negative momentum",
      });
    }
  }

  momentumScore = Math.max(0, Math.min(100, momentumScore));

  // --- 3. VALUE / FUNDAMENTAL ANALYSIS (30% Weight) ---
  let valueScore = 50; // Default neutral if no data

  if (fundamentals) {
    // PE Ratio
    if (fundamentals.trailing_pe) {
      if (fundamentals.trailing_pe > 0 && fundamentals.trailing_pe < 15) {
        valueScore += 20;
        reasons.push({
          type: "positive",
          text: `P/E Ratio of ${fundamentals.trailing_pe.toFixed(1)} is attractive`,
        });
      } else if (fundamentals.trailing_pe > 30) {
        valueScore -= 15;
        reasons.push({
          type: "negative",
          text: `P/E Ratio of ${fundamentals.trailing_pe.toFixed(1)} is high relative to market average`,
        });
      } else {
        reasons.push({
          type: "neutral",
          text: `P/E Ratio of ${fundamentals.trailing_pe.toFixed(1)} is fair`,
        });
      }
    }

    // PEG Ratio (Best indicator for value/growth)
    if (fundamentals.peg_ratio) {
      if (fundamentals.peg_ratio < 1.0) {
        valueScore += 20;
        reasons.push({
          type: "positive",
          text: `PEG Ratio (${fundamentals.peg_ratio.toFixed(2)}) indicates undervalued growth`,
        });
      } else if (fundamentals.peg_ratio > 2.0) {
        valueScore -= 10;
        reasons.push({
          type: "negative",
          text: `PEG Ratio (${fundamentals.peg_ratio.toFixed(2)}) suggests overvaluation`,
        });
      }
    } else {
      // Fallback if PEG missing: Check growth directly
      if (fundamentals.revenue_growth && fundamentals.revenue_growth > 0.15) {
        valueScore += 10;
        reasons.push({
          type: "positive",
          text: "Strong Revenue Growth (>15%)",
        });
      }
    }

    // Margins
    if (fundamentals.profit_margins && fundamentals.profit_margins > 0.15) {
      valueScore += 10;
      reasons.push({ type: "positive", text: "Healthy Profit Margins (>15%)" });
    }

    // Dividend is a bonus
    if (fundamentals.dividend_yield && fundamentals.dividend_yield > 1.0) {
      valueScore += 5; // Slight bonus
      reasons.push({
        type: "positive",
        text: `Good Dividend Yield (${fundamentals.dividend_yield.toFixed(2)}%)`,
      });
    }
  } else {
    reasons.push({
      type: "neutral",
      text: "No fundamental data available for valuation analysis.",
    });
  }

  valueScore = Math.max(0, Math.min(100, valueScore));

  // --- FINAL SCORE CALCULATION ---
  const weightedScore =
    trendScore * 0.4 + momentumScore * 0.3 + valueScore * 0.3;

  let action: AnalysisAction = "HOLD";
  if (weightedScore >= 75) action = "STRONG_BUY";
  else if (weightedScore >= 60) action = "BUY";
  else if (weightedScore <= 25) action = "STRONG_SELL";
  else if (weightedScore <= 40) action = "SELL";

  let summary = "";
  if (action.includes("BUY")) {
    summary = `Bullish outlook driven by ${trendScore > 60 ? "strong trend" : ""} ${momentumScore > 60 ? "and momentum" : ""} factors.`;
  } else if (action.includes("SELL")) {
    summary = `Bearish signals detected in ${trendScore < 40 ? "techincal trend" : ""} ${valueScore < 40 ? "and valuation" : ""}.`;
  } else {
    summary =
      "Market signals are mixed. Waiting for a clearer trend definition or better valuation entry.";
  }

  return {
    action,
    score: Math.round(weightedScore),
    summary,
    reasons: reasons.sort((a) => (a.type === "positive" ? -1 : 1)), // Put positives first
    metrics: {
      trendScore: Math.round(trendScore),
      momentumScore: Math.round(momentumScore),
      valueScore: Math.round(valueScore),
    },
  };
}
