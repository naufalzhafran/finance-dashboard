"use client";

import { useState, useEffect, useCallback, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import ResponsiveHeader from "@/components/ResponsiveHeader";
import StockChart from "@/components/StockChart";
import DashboardControls from "@/components/DashboardControls";
import FundamentalsGrid from "@/components/FundamentalsGrid";
import ValuationRatios from "@/components/ValuationRatios";
import DividendAnalytics from "@/components/DividendAnalytics";
import EPSTrendChart from "@/components/EPSTrendChart";
import FinancialsView from "@/components/FinancialsView";
import TechnicalIndicators from "@/components/TechnicalIndicators";
import RSIChart from "@/components/RSIChart";
import MACDChart from "@/components/MACDChart";
import RiskAnalytics from "@/components/RiskAnalytics";
import VolatilityChart from "@/components/VolatilityChart";
import DrawdownChart from "@/components/DrawdownChart";
import StrategyCard from "@/components/StrategyCard";
import { analyzeStock } from "@/lib/strategy";
import { Asset, FundamentalData, PriceData } from "@/types";
import { Card } from "@/components/ui/card";
import {
  calculateSMA,
  calculateRSI,
  calculateBollingerBands,
  calculateMACD,
  detectCrossovers,
  calculateDailyReturns,
  calculateHistoricalVolatility,
  calculateDrawdown,
  calculateMaxDrawdown,
  calculate52WeekHighLow,
  calculateBeta,
} from "@/lib/technicalIndicators";

import type { PriceResponse, FundamentalsResponse, TimeRange } from "@/types";

const getStartDate = (range: TimeRange, bufferMonths = 0) => {
  const now = new Date();
  const d = new Date();
  switch (range) {
    case "1M":
      d.setMonth(now.getMonth() - 1 - bufferMonths);
      break;
    case "3M":
      d.setMonth(now.getMonth() - 3 - bufferMonths);
      break;
    case "6M":
      d.setMonth(now.getMonth() - 6 - bufferMonths);
      break;
    case "1Y":
      d.setFullYear(now.getFullYear() - 1);
      d.setMonth(d.getMonth() - bufferMonths);
      break;
    case "YTD":
      d.setMonth(0, 1); // Jan 1st of current year
      d.setMonth(d.getMonth() - bufferMonths);
      break;
  }
  return d.toISOString().split("T")[0];
};

export default function AssetDetail({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const router = useRouter();
  // Unwrap params using React.use()
  const { symbol: symbolParam } = use(params);
  // Decode URL encoded symbol (e.g. %5EGSPC -> ^GSPC)
  const initialSymbol = decodeURIComponent(symbolParam);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedSymbol] = useState<string | null>(initialSymbol);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<PriceData[]>([]);
  const [fundamentals, setFundamentals] = useState<FundamentalData | null>(
    null,
  );

  // Time Range State (Default 3M)
  const [selectedRange, setSelectedRange] = useState<TimeRange>("3M");

  const [loading, setLoading] = useState(true);
  const [priceLoading, setPriceLoading] = useState(false);
  const [fundamentalsLoading, setFundamentalsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minDate, setMinDate] = useState<string | null>(null);

  // Get the asset's currency
  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol);
  const isIDRStock = selectedAsset?.currency === "IDR";

  // Calculate technical indicators from price data
  const technicalData = useMemo(() => {
    if (priceData.length === 0) {
      return {
        rsi: [],
        macd: { macd: [], signal: [], histogram: [] },
        sma50: [],
        sma200: [],
        bollinger: { middle: [], upper: [], lower: [] },
        crossovers: [],
        chartData: [],
      };
    }

    const rsi = calculateRSI(priceData, 14);
    const macd = calculateMACD(priceData, 12, 26, 9);
    const sma50 = calculateSMA(priceData, 50);
    const sma200 = calculateSMA(priceData, 200);
    const bollinger = calculateBollingerBands(priceData, 20, 2);
    const crossovers = detectCrossovers(priceData, sma50, sma200);

    // Format data for RSI and MACD charts (filtered by minDate for display)
    const chartData = priceData
      .map((d, i) => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: d.date,
        rsi: rsi[i],
        macd: macd.macd[i],
        signal: macd.signal[i],
        histogram: macd.histogram[i],
      }))
      .filter((d) => !minDate || d.fullDate >= minDate);

    return {
      rsi,
      macd,
      sma50,
      sma200,
      bollinger,
      crossovers,
      chartData,
    };
  }, [priceData, minDate]);

  // Calculate risk analytics
  const riskData = useMemo(() => {
    if (priceData.length === 0) {
      return {
        volatility: null,
        maxDrawdown: null,
        fiftyTwoWeekHL: null,
        beta: null,
        volatilityChartData: [],
        drawdownChartData: [],
      };
    }

    const dailyReturns = calculateDailyReturns(priceData);
    const volatilityArray = calculateHistoricalVolatility(
      dailyReturns,
      21,
      true,
    );
    const { drawdown } = calculateDrawdown(priceData);
    const maxDrawdownResult = calculateMaxDrawdown(priceData);
    const fiftyTwoWeekHL = calculate52WeekHighLow(priceData);

    // Calculate beta only for IDR stocks with benchmark data
    const beta =
      isIDRStock && benchmarkData.length > 0
        ? calculateBeta(priceData, benchmarkData, 252)
        : null;

    // Current volatility (last value)
    const lastVolIndex = volatilityArray.length - 1;
    const volatility = lastVolIndex >= 0 ? volatilityArray[lastVolIndex] : null;

    // Format data for charts (filtered by minDate for display)
    const volatilityChartData = priceData
      .map((d, i) => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: d.date,
        volatility: volatilityArray[i],
      }))
      .filter((d) => !minDate || d.fullDate >= minDate);

    const drawdownChartData = priceData
      .map((d, i) => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: d.date,
        drawdown: drawdown[i],
      }))
      .filter((d) => !minDate || d.fullDate >= minDate);

    return {
      volatility,
      maxDrawdown: maxDrawdownResult,
      fiftyTwoWeekHL,
      beta,
      volatilityChartData,
      drawdownChartData,
    };
  }, [priceData, benchmarkData, isIDRStock, minDate]);

  // Get latest values for summary card
  const latestIndicators = useMemo(() => {
    const lastIndex = priceData.length - 1;
    if (lastIndex < 0) {
      return {
        rsi: null,
        macd: null,
        signal: null,
        currentPrice: 0,
        bollingerUpper: null,
        bollingerLower: null,
        sma50: null,
        sma200: null,
        latestCrossover: null,
      };
    }

    // Find latest crossover within displayed range
    const displayedCrossovers = technicalData.crossovers.filter(
      (c) => !minDate || c.date >= minDate,
    );
    const latestCrossover =
      displayedCrossovers.length > 0
        ? displayedCrossovers[displayedCrossovers.length - 1]
        : null;

    return {
      rsi: technicalData.rsi[lastIndex],
      macd: technicalData.macd.macd[lastIndex],
      signal: technicalData.macd.signal[lastIndex],
      currentPrice: priceData[lastIndex].close,
      bollingerUpper: technicalData.bollinger.upper[lastIndex],
      bollingerLower: technicalData.bollinger.lower[lastIndex],
      sma50: technicalData.sma50[lastIndex],
      sma200: technicalData.sma200[lastIndex],
      latestCrossover,
    };
  }, [priceData, technicalData, minDate]);

  // Calculate Strategy
  const strategyResult = useMemo(() => {
    return analyzeStock(priceData, fundamentals);
  }, [priceData, fundamentals]);

  // Fetch assets on mount
  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("/api/assets");
        if (!res.ok) throw new Error("Failed to fetch assets");
        const data = await res.json();
        setAssets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch assets");
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  // Fetch IHSG benchmark data for Beta calculation (for IDR stocks)
  const fetchBenchmark = useCallback(async () => {
    try {
      // Fetch 1 year of IHSG data for beta calculation
      const end = new Date().toISOString().split("T")[0];
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);

      const query = new URLSearchParams({
        start: start.toISOString().split("T")[0],
        end,
      });
      const res = await fetch(`/api/prices/%5EJKSE?${query.toString()}`);
      if (res.ok) {
        const data: PriceResponse = await res.json();
        setBenchmarkData(data.prices);
      }
    } catch (err) {
      console.error("Failed to fetch benchmark data:", err);
    }
  }, []);

  // Fetch price data when symbol or range changes
  const fetchPrices = useCallback(async (symbol: string, range: TimeRange) => {
    setPriceLoading(true);
    setError(null);
    try {
      const displayStart = getStartDate(range);
      // Fetch extra 12 months of data for SMA 200 calculation (buffer)
      const fetchStart = getStartDate(range, 12);
      const end = new Date().toISOString().split("T")[0];
      setMinDate(displayStart);

      const query = new URLSearchParams({ start: fetchStart, end });
      // Handle special characters in symbol for API call URL
      const encodedSymbol = encodeURIComponent(symbol);
      const res = await fetch(
        `/api/prices/${encodedSymbol}?${query.toString()}`,
      );
      if (!res.ok) throw new Error(`Failed to fetch prices for ${symbol}`);
      const data: PriceResponse = await res.json();
      setPriceData(data.prices);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch price data",
      );
      setPriceData([]);
    } finally {
      setPriceLoading(false);
    }
  }, []);

  // Fetch fundamentals when symbol changes
  const fetchFundamentals = useCallback(async (symbol: string) => {
    setFundamentalsLoading(true);
    try {
      const encodedSymbol = encodeURIComponent(symbol);
      const res = await fetch(`/api/fundamentals/${encodedSymbol}`);
      if (!res.ok)
        throw new Error(`Failed to fetch fundamentals for ${symbol}`);
      const data: FundamentalsResponse = await res.json();
      setFundamentals(data.fundamentals);
    } catch (err) {
      console.error(err);
      setFundamentals(null);
    } finally {
      setFundamentalsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      fetchPrices(selectedSymbol, selectedRange);
      fetchFundamentals(selectedSymbol);
    }
  }, [selectedSymbol, selectedRange, fetchPrices, fetchFundamentals]);

  // Fetch benchmark data when we have an IDR stock selected
  useEffect(() => {
    if (isIDRStock && benchmarkData.length === 0) {
      fetchBenchmark();
    }
  }, [isIDRStock, benchmarkData.length, fetchBenchmark]);

  const handleAssetSelect = (symbol: string) => {
    // Navigate to the new asset page
    router.push(`/asset/${encodeURIComponent(symbol)}`);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
      </div>

      <ResponsiveHeader
        title={selectedSymbol || "Asset Detail"}
        subtitle={
          assets.find((a) => a.symbol === selectedSymbol)?.name ||
          "Stock Analysis"
        }
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-fade-in">
            <p className="text-destructive flex items-center gap-2 font-medium">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        <DashboardControls
          assets={assets}
          selectedSymbol={selectedSymbol}
          onSelectAsset={handleAssetSelect}
          timeRange={selectedRange}
          onTimeRangeChange={(val) => setSelectedRange(val as TimeRange)}
          loading={loading}
        />

        <div className="space-y-8 animate-fade-in">
          {/* Chart Section */}
          <div>
            {priceLoading ? (
              <Card className="h-[500px] flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-muted-foreground font-medium tracking-wide">
                    Analysing market data...
                  </p>
                </div>
              </Card>
            ) : selectedSymbol ? (
              <StockChart
                data={priceData}
                symbol={selectedSymbol}
                currency={selectedAsset?.currency}
                minDate={minDate || undefined}
              />
            ) : (
              <Card className="h-[500px] flex items-center justify-center text-center p-8 bg-background/50 backdrop-blur-sm">
                <div className="max-w-md">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10">
                    <span className="text-4xl grayscale opacity-50">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Select an Asset
                  </h3>
                  <p className="text-muted-foreground">
                    Use the search bar above to select a stock or ETF and
                    visualize its performance.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Strategy Section */}
          {selectedSymbol && !loading && (
            <div className="animate-fade-in">
              <StrategyCard
                analysis={strategyResult}
                loading={priceLoading || fundamentalsLoading}
              />
            </div>
          )}

          {/* Technical Indicators Section */}
          {selectedSymbol && !priceLoading && priceData.length > 0 && (
            <>
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Technical Analysis</h2>
                </div>
                <TechnicalIndicators
                  rsi={latestIndicators.rsi}
                  macd={latestIndicators.macd}
                  signal={latestIndicators.signal}
                  currentPrice={latestIndicators.currentPrice}
                  bollingerUpper={latestIndicators.bollingerUpper}
                  bollingerLower={latestIndicators.bollingerLower}
                  sma50={latestIndicators.sma50}
                  sma200={latestIndicators.sma200}
                  latestCrossover={latestIndicators.latestCrossover}
                />
              </div>

              {/* RSI Chart */}
              <div className="animate-fade-in">
                <RSIChart data={technicalData.chartData} />
              </div>

              {/* MACD Chart */}
              <div className="animate-fade-in">
                <MACDChart data={technicalData.chartData} />
              </div>
            </>
          )}

          {/* Risk & Volatility Section */}
          {selectedSymbol && !priceLoading && priceData.length > 0 && (
            <>
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Risk & Volatility</h2>
                </div>
                <RiskAnalytics
                  volatility={riskData.volatility}
                  maxDrawdown={riskData.maxDrawdown}
                  beta={riskData.beta}
                  fiftyTwoWeekHL={riskData.fiftyTwoWeekHL}
                  currency={selectedAsset?.currency}
                />
              </div>

              {/* Volatility Chart */}
              <div className="animate-fade-in">
                <VolatilityChart data={riskData.volatilityChartData} />
              </div>

              {/* Drawdown Chart */}
              <div className="animate-fade-in">
                <DrawdownChart
                  data={riskData.drawdownChartData}
                  maxDrawdown={
                    riskData.maxDrawdown
                      ? {
                          value: riskData.maxDrawdown.maxDrawdown,
                          date: riskData.maxDrawdown.maxDrawdownDate,
                        }
                      : null
                  }
                />
              </div>
            </>
          )}

          {/* Fundamentals Section */}
          {selectedSymbol && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Fundamentals</h2>
              </div>

              {/* Fair Value Tracker */}
              <ValuationRatios
                data={fundamentals}
                loading={fundamentalsLoading}
              />

              {/* Dividend Analytics */}
              <DividendAnalytics
                data={fundamentals}
                loading={fundamentalsLoading}
                currency={selectedAsset?.currency}
              />

              {/* EPS Trend Chart */}
              <EPSTrendChart
                symbol={selectedSymbol}
                currency={selectedAsset?.currency}
              />

              {/* Original Fundamentals Grid */}
              <FundamentalsGrid
                data={fundamentals}
                loading={fundamentalsLoading}
                currency={selectedAsset?.currency}
              />
            </div>
          )}

          {/* Financial Statements Section */}
          {selectedSymbol && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Financial Statements</h2>
              </div>
              <FinancialsView
                symbol={selectedSymbol}
                currency={selectedAsset?.currency}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-12 bg-background/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-muted-foreground text-sm text-center">
            Antigravity Finance Dashboard • Data from Yahoo Finance
          </p>
        </div>
      </footer>
    </div>
  );
}
