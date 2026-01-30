"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import StockChart from "@/components/StockChart";
import DashboardControls from "@/components/DashboardControls";
import FundamentalsGrid from "@/components/FundamentalsGrid";
import FinancialsView from "@/components/FinancialsView";
import { Asset } from "@/types";
import { FundamentalData } from "@/lib/db";
import { Card } from "@/components/ui/card";

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceResponse {
  asset: Asset;
  prices: PriceData[];
  count: number;
}

interface FundamentalsResponse {
  asset: Asset;
  fundamentals: FundamentalData | null;
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "YTD";

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
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(
    initialSymbol,
  );
  const [priceData, setPriceData] = useState<PriceData[]>([]);
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

  // Fetch price data when symbol or range changes
  const fetchPrices = useCallback(async (symbol: string, range: TimeRange) => {
    setPriceLoading(true);
    setError(null);
    try {
      const displayStart = getStartDate(range);
      // Fetch extra 4 months of data for MA calculation (buffer)
      const fetchStart = getStartDate(range, 4);
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

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-background/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Finance Dashboard
              </h1>
              <p className="text-muted-foreground text-xs">
                Asset Intelligence Control Center
              </p>
            </div>
          </div>
        </div>
      </header>

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
                currency={
                  assets.find((a) => a.symbol === selectedSymbol)?.currency
                }
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

          {/* Fundamentals Section */}
          {selectedSymbol && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Fundamentals</h2>
              </div>
              <FundamentalsGrid
                data={fundamentals}
                loading={fundamentalsLoading}
                currency={
                  assets.find((a) => a.symbol === selectedSymbol)?.currency
                }
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
                currency={
                  assets.find((a) => a.symbol === selectedSymbol)?.currency
                }
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
