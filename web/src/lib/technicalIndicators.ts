/**
 * Technical Indicator Calculations for Stock Analysis
 */

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(
  data: PriceData[],
  period: number,
): (number | null)[] {
  const smaValues: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      smaValues.push(null);
      continue;
    }
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, curr) => acc + curr.close, 0);
    smaValues.push(sum / period);
  }
  return smaValues;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(
  data: PriceData[],
  period: number,
): (number | null)[] {
  const emaValues: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      emaValues.push(null);
      continue;
    }

    if (i === period - 1) {
      // First EMA is just SMA
      const sum = data
        .slice(0, period)
        .reduce((acc, curr) => acc + curr.close, 0);
      emaValues.push(sum / period);
    } else {
      // EMA = (Close - Previous EMA) * multiplier + Previous EMA
      const prevEma = emaValues[i - 1];
      if (prevEma !== null) {
        emaValues.push((data[i].close - prevEma) * multiplier + prevEma);
      } else {
        emaValues.push(null);
      }
    }
  }
  return emaValues;
}

/**
 * Calculate Relative Strength Index (RSI)
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss over period
 */
export function calculateRSI(
  data: PriceData[],
  period: number = 14,
): (number | null)[] {
  const rsiValues: (number | null)[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // First point has no RSI
  rsiValues.push(null);

  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      rsiValues.push(null);
      continue;
    }

    let avgGain: number;
    let avgLoss: number;

    if (i === period - 1) {
      // Initial averages
      avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    } else {
      // Smoothed averages (Wilder's smoothing)
      const prevAvgGain = calculatePrevAvg(gains, i, period);
      const prevAvgLoss = calculatePrevAvg(losses, i, period);
      avgGain = (prevAvgGain * (period - 1) + gains[i]) / period;
      avgLoss = (prevAvgLoss * (period - 1) + losses[i]) / period;
    }

    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsiValues.push(100 - 100 / (1 + rs));
    }
  }

  return rsiValues;
}

function calculatePrevAvg(
  arr: number[],
  index: number,
  period: number,
): number {
  const start = Math.max(0, index - period + 1);
  const slice = arr.slice(start, index);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

/**
 * Calculate Bollinger Bands
 * Middle Band = SMA(period)
 * Upper Band = Middle Band + (stdDev * Standard Deviation)
 * Lower Band = Middle Band - (stdDev * Standard Deviation)
 */
export interface BollingerBands {
  middle: (number | null)[];
  upper: (number | null)[];
  lower: (number | null)[];
}

export function calculateBollingerBands(
  data: PriceData[],
  period: number = 20,
  stdDevMultiplier: number = 2,
): BollingerBands {
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    const sma = middle[i];
    if (sma === null || i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }

    // Calculate standard deviation
    const slice = data.slice(i - period + 1, i + 1);
    const squaredDiffs = slice.map((d) => Math.pow(d.close - sma, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(avgSquaredDiff);

    upper.push(sma + stdDevMultiplier * stdDev);
    lower.push(sma - stdDevMultiplier * stdDev);
  }

  return { middle, upper, lower };
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * MACD Line = EMA(fast) - EMA(slow)
 * Signal Line = EMA(MACD Line, signal period)
 * Histogram = MACD Line - Signal Line
 */
export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD(
  data: PriceData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): MACDResult {
  const fastEma = calculateEMA(data, fastPeriod);
  const slowEma = calculateEMA(data, slowPeriod);

  // MACD Line
  const macd: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    const fast = fastEma[i];
    const slow = slowEma[i];
    if (fast !== null && slow !== null) {
      macd.push(fast - slow);
    } else {
      macd.push(null);
    }
  }

  // Signal Line (EMA of MACD)
  const signal: (number | null)[] = [];
  const multiplier = 2 / (signalPeriod + 1);
  let validMacdCount = 0;
  let macdSum = 0;
  let prevSignal: number | null = null;

  for (let i = 0; i < macd.length; i++) {
    const m = macd[i];
    if (m === null) {
      signal.push(null);
      continue;
    }

    validMacdCount++;
    macdSum += m;

    if (validMacdCount < signalPeriod) {
      signal.push(null);
    } else if (validMacdCount === signalPeriod) {
      prevSignal = macdSum / signalPeriod;
      signal.push(prevSignal);
    } else {
      prevSignal = (m - prevSignal!) * multiplier + prevSignal!;
      signal.push(prevSignal);
    }
  }

  // Histogram
  const histogram: (number | null)[] = [];
  for (let i = 0; i < macd.length; i++) {
    const m = macd[i];
    const s = signal[i];
    if (m !== null && s !== null) {
      histogram.push(m - s);
    } else {
      histogram.push(null);
    }
  }

  return { macd, signal, histogram };
}

/**
 * Detect Golden Cross (bullish) or Death Cross (bearish)
 * Golden Cross: SMA50 crosses above SMA200
 * Death Cross: SMA50 crosses below SMA200
 */
export interface CrossoverResult {
  type: "golden" | "death" | null;
  index: number;
  date: string;
}

export function detectCrossovers(
  data: PriceData[],
  sma50: (number | null)[],
  sma200: (number | null)[],
): CrossoverResult[] {
  const crossovers: CrossoverResult[] = [];

  for (let i = 1; i < data.length; i++) {
    const prev50 = sma50[i - 1];
    const curr50 = sma50[i];
    const prev200 = sma200[i - 1];
    const curr200 = sma200[i];

    if (
      prev50 === null ||
      curr50 === null ||
      prev200 === null ||
      curr200 === null
    ) {
      continue;
    }

    // Golden Cross: SMA50 crosses above SMA200
    if (prev50 <= prev200 && curr50 > curr200) {
      crossovers.push({
        type: "golden",
        index: i,
        date: data[i].date,
      });
    }

    // Death Cross: SMA50 crosses below SMA200
    if (prev50 >= prev200 && curr50 < curr200) {
      crossovers.push({
        type: "death",
        index: i,
        date: data[i].date,
      });
    }
  }

  return crossovers;
}

/**
 * Get RSI status
 */
export function getRSIStatus(rsi: number | null): {
  status: string;
  color: string;
} {
  if (rsi === null) return { status: "N/A", color: "gray" };
  if (rsi >= 70) return { status: "Overbought", color: "rose" };
  if (rsi <= 30) return { status: "Oversold", color: "emerald" };
  return { status: "Neutral", color: "slate" };
}

/**
 * Get MACD trend
 */
export function getMACDTrend(
  macd: number | null,
  signal: number | null,
): { trend: string; color: string } {
  if (macd === null || signal === null) return { trend: "N/A", color: "gray" };
  if (macd > signal) return { trend: "Bullish", color: "emerald" };
  if (macd < signal) return { trend: "Bearish", color: "rose" };
  return { trend: "Neutral", color: "slate" };
}

/**
 * Get Bollinger Band position
 */
export function getBollingerPosition(
  price: number,
  upper: number | null,
  lower: number | null,
): { position: string; color: string } {
  if (upper === null || lower === null)
    return { position: "N/A", color: "gray" };
  if (price >= upper) return { position: "Upper Band", color: "rose" };
  if (price <= lower) return { position: "Lower Band", color: "emerald" };
  return { position: "Middle", color: "slate" };
}

// ==========================================
// RISK & VOLATILITY ANALYTICS
// ==========================================

/**
 * Calculate Daily Returns (percentage change)
 * Return = (Close_t - Close_t-1) / Close_t-1
 */
export function calculateDailyReturns(data: PriceData[]): (number | null)[] {
  const returns: (number | null)[] = [null]; // First day has no return
  for (let i = 1; i < data.length; i++) {
    const prevClose = data[i - 1].close;
    if (prevClose === 0) {
      returns.push(null);
    } else {
      returns.push((data[i].close - prevClose) / prevClose);
    }
  }
  return returns;
}

/**
 * Calculate Log Returns
 * Log Return = ln(Close_t / Close_t-1)
 */
export function calculateLogReturns(data: PriceData[]): (number | null)[] {
  const returns: (number | null)[] = [null];
  for (let i = 1; i < data.length; i++) {
    const prevClose = data[i - 1].close;
    if (prevClose <= 0 || data[i].close <= 0) {
      returns.push(null);
    } else {
      returns.push(Math.log(data[i].close / prevClose));
    }
  }
  return returns;
}

/**
 * Calculate Historical Volatility (Rolling Standard Deviation of Returns)
 * Annualized by multiplying by sqrt(252) for daily data
 */
export function calculateHistoricalVolatility(
  returns: (number | null)[],
  period: number = 21,
  annualize: boolean = true,
): (number | null)[] {
  const volatility: (number | null)[] = [];

  for (let i = 0; i < returns.length; i++) {
    if (i < period) {
      volatility.push(null);
      continue;
    }

    // Get valid returns in window
    const window = returns
      .slice(i - period + 1, i + 1)
      .filter((r): r is number => r !== null);

    if (window.length < period * 0.8) {
      // Need at least 80% of data points
      volatility.push(null);
      continue;
    }

    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const squaredDiffs = window.map((r) => Math.pow(r - mean, 2));
    const variance =
      squaredDiffs.reduce((a, b) => a + b, 0) / (window.length - 1);
    const stdDev = Math.sqrt(variance);

    // Annualize if requested (multiply by sqrt(252 trading days))
    volatility.push(annualize ? stdDev * Math.sqrt(252) : stdDev);
  }

  return volatility;
}

/**
 * Calculate Drawdown from rolling peak
 * Drawdown = (Current Price - Peak Price) / Peak Price
 */
export interface DrawdownResult {
  drawdown: (number | null)[];
  peak: (number | null)[];
}

export function calculateDrawdown(data: PriceData[]): DrawdownResult {
  const drawdown: (number | null)[] = [];
  const peak: (number | null)[] = [];

  let rollingPeak = 0;

  for (let i = 0; i < data.length; i++) {
    const price = data[i].close;
    rollingPeak = Math.max(rollingPeak, price);
    peak.push(rollingPeak);

    if (rollingPeak === 0) {
      drawdown.push(null);
    } else {
      drawdown.push((price - rollingPeak) / rollingPeak);
    }
  }

  return { drawdown, peak };
}

/**
 * Calculate Maximum Drawdown
 */
export interface MaxDrawdownResult {
  maxDrawdown: number;
  maxDrawdownDate: string;
  peakDate: string;
  recoveryDate: string | null;
}

export function calculateMaxDrawdown(data: PriceData[]): MaxDrawdownResult {
  let maxDrawdown = 0;
  let maxDrawdownDate = data.length > 0 ? data[0].date : "";
  let peakDate = data.length > 0 ? data[0].date : "";
  let recoveryDate: string | null = null;

  let rollingPeak = 0;
  let rollingPeakDate = "";
  let inDrawdown = false;
  let currentMaxDrawdownPeakDate = "";

  for (let i = 0; i < data.length; i++) {
    const price = data[i].close;

    if (price > rollingPeak) {
      rollingPeak = price;
      rollingPeakDate = data[i].date;

      // Check for recovery
      if (inDrawdown) {
        recoveryDate = data[i].date;
        inDrawdown = false;
      }
    }

    if (rollingPeak > 0) {
      const dd = (price - rollingPeak) / rollingPeak;
      if (dd < maxDrawdown) {
        maxDrawdown = dd;
        maxDrawdownDate = data[i].date;
        currentMaxDrawdownPeakDate = rollingPeakDate;
        inDrawdown = true;
        recoveryDate = null; // Reset recovery since we have a new max
      }
    }
  }

  return {
    maxDrawdown,
    maxDrawdownDate,
    peakDate: currentMaxDrawdownPeakDate,
    recoveryDate,
  };
}

/**
 * Calculate 52-Week High and Low
 */
export interface FiftyTwoWeekHL {
  high: number;
  highDate: string;
  low: number;
  lowDate: string;
  percentFromHigh: number;
  percentFromLow: number;
}

export function calculate52WeekHighLow(
  data: PriceData[],
): FiftyTwoWeekHL | null {
  // Get last 252 trading days (roughly 1 year)
  const yearData = data.slice(-252);

  if (yearData.length === 0) return null;

  let high = yearData[0].high;
  let highDate = yearData[0].date;
  let low = yearData[0].low;
  let lowDate = yearData[0].date;

  for (const d of yearData) {
    if (d.high > high) {
      high = d.high;
      highDate = d.date;
    }
    if (d.low < low) {
      low = d.low;
      lowDate = d.date;
    }
  }

  const currentPrice = yearData[yearData.length - 1].close;

  return {
    high,
    highDate,
    low,
    lowDate,
    percentFromHigh: high > 0 ? ((currentPrice - high) / high) * 100 : 0,
    percentFromLow: low > 0 ? ((currentPrice - low) / low) * 100 : 0,
  };
}

/**
 * Calculate Beta relative to a benchmark
 * Beta = Covariance(stock, benchmark) / Variance(benchmark)
 */
export function calculateBeta(
  stockData: PriceData[],
  benchmarkData: PriceData[],
  period: number = 252,
): number | null {
  // Align data by date
  const stockMap = new Map(stockData.map((d) => [d.date, d]));
  const benchmarkMap = new Map(benchmarkData.map((d) => [d.date, d]));

  // Find common dates
  const commonDates = [...stockMap.keys()].filter((date) =>
    benchmarkMap.has(date),
  );

  if (commonDates.length < Math.min(period, 60)) {
    // Need sufficient overlapping data
    return null;
  }

  // Sort by date and take last 'period' days
  commonDates.sort();
  const dates = commonDates.slice(-period);

  // Calculate returns for each
  const stockReturns: number[] = [];
  const benchmarkReturns: number[] = [];

  for (let i = 1; i < dates.length; i++) {
    const prevDate = dates[i - 1];
    const currDate = dates[i];

    const prevStock = stockMap.get(prevDate)!;
    const currStock = stockMap.get(currDate)!;
    const prevBench = benchmarkMap.get(prevDate)!;
    const currBench = benchmarkMap.get(currDate)!;

    if (prevStock.close > 0 && prevBench.close > 0) {
      stockReturns.push((currStock.close - prevStock.close) / prevStock.close);
      benchmarkReturns.push(
        (currBench.close - prevBench.close) / prevBench.close,
      );
    }
  }

  if (stockReturns.length < 30) return null;

  // Calculate means
  const stockMean =
    stockReturns.reduce((a, b) => a + b, 0) / stockReturns.length;
  const benchMean =
    benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length;

  // Calculate covariance and variance
  let covariance = 0;
  let benchVariance = 0;

  for (let i = 0; i < stockReturns.length; i++) {
    covariance +=
      (stockReturns[i] - stockMean) * (benchmarkReturns[i] - benchMean);
    benchVariance += Math.pow(benchmarkReturns[i] - benchMean, 2);
  }

  covariance /= stockReturns.length - 1;
  benchVariance /= stockReturns.length - 1;

  if (benchVariance === 0) return null;

  return covariance / benchVariance;
}

/**
 * Get volatility status
 */
export function getVolatilityStatus(volatility: number | null): {
  status: string;
  color: string;
} {
  if (volatility === null) return { status: "N/A", color: "gray" };
  if (volatility >= 0.5) return { status: "Very High", color: "rose" };
  if (volatility >= 0.3) return { status: "High", color: "amber" };
  if (volatility >= 0.15) return { status: "Moderate", color: "slate" };
  return { status: "Low", color: "emerald" };
}

/**
 * Get Beta interpretation
 */
export function getBetaStatus(beta: number | null): {
  status: string;
  color: string;
} {
  if (beta === null) return { status: "N/A", color: "gray" };
  if (beta >= 1.5) return { status: "High Risk", color: "rose" };
  if (beta >= 1.0) return { status: "Above Market", color: "amber" };
  if (beta >= 0.5) return { status: "Below Market", color: "slate" };
  return { status: "Defensive", color: "emerald" };
}
