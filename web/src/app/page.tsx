"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Banknote,
  Landmark,
  Flame,
  Building2,
  BarChart3,
} from "lucide-react";
import MiniStockChart from "@/components/MiniStockChart";
import DashboardControls from "@/components/DashboardControls";
import ResponsiveHeader from "@/components/ResponsiveHeader";
import { Asset, SimplePriceData, TimeRange } from "@/types";

// Group definitions for the dashboard
const DASHBOARD_GROUPS = [
  {
    title: "Market Overview",
    icon: Globe,
    symbols: ["^JKSE", "^GSPC", "^IXIC", "^N225", "BTC-USD"],
  },
  {
    title: "Currencies (vs IDR)",
    icon: Banknote,
    symbols: ["USDIDR=X", "EURIDR=X", "GBPIDR=X", "JPYIDR=X", "SGDIDR=X"],
  },
  {
    title: "Commodities",
    icon: Flame,
    symbols: ["GC=F", "CL=F", "CPO=F", "HG=F", "NG=F"],
  },
  {
    title: "Indonesian Banking",
    icon: Landmark,
    symbols: ["BBCA", "BBRI", "BMRI", "BBNI", "BRIS"],
  },
  {
    title: "Indonesian Energy & Resources",
    icon: BarChart3,
    symbols: ["ADRO", "ITMG", "PTBA", "UNTR", "MEDC", "ANTM", "INCO", "PGAS"],
  },
  {
    title: "Indonesian BUMN",
    icon: Building2,
    symbols: ["TLKM", "SMGR", "JSMR", "BBTN", "WIKA", "PTPP", "GIAA", "KRAS"],
  },
];

const getStartDate = (range: TimeRange) => {
  const now = new Date();
  const d = new Date();
  switch (range) {
    case "1M":
      d.setMonth(now.getMonth() - 1);
      break;
    case "3M":
      d.setMonth(now.getMonth() - 3);
      break;
    case "6M":
      d.setMonth(now.getMonth() - 6);
      break;
    case "1Y":
      d.setFullYear(now.getFullYear() - 1);
      break;
    case "YTD":
      d.setMonth(0, 1); // Jan 1st of current year
      break;
  }
  return d.toISOString().split("T")[0];
};

export default function Home() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [marketData, setMarketData] = useState<
    Record<string, SimplePriceData[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("3M"); // Default to 3M

  // Fetch Assets Once
  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("/api/assets");
        if (!res.ok) throw new Error("Failed");
        const allAssets: Asset[] = await res.json();
        setAssets(allAssets);
      } catch (e) {
        console.error("Asset fetch error", e);
      } finally {
        // We don't verify loading here, we wait for prices too
      }
    }
    fetchAssets();
  }, []);

  // Fetch Prices when Assets or Range changes
  useEffect(() => {
    async function fetchPrices() {
      if (assets.length === 0) return;

      setLoading(true);
      try {
        // Identify which symbols we want to show
        const symbolsToShow = new Set(
          DASHBOARD_GROUPS.flatMap((g) => g.symbols),
        );

        // Filter assets that actually exist in our DB
        const availableSymbols = assets
          .filter((a) => symbolsToShow.has(a.symbol))
          .map((a) => a.symbol);

        const endDate = new Date().toISOString().split("T")[0];
        const startStr = getStartDate(selectedRange);

        const promises = availableSymbols.map(async (symbol) => {
          try {
            const res = await fetch(
              `/api/prices/${encodeURIComponent(symbol)}?start=${startStr}&end=${endDate}`,
            );
            if (!res.ok) return { symbol, prices: [] };
            const data = await res.json();
            return { symbol, prices: data.prices };
          } catch {
            return { symbol, prices: [] };
          }
        });

        const results = await Promise.all(promises);
        const newMarketData: Record<string, SimplePriceData[]> = {};
        results.forEach((r) => {
          if (r.prices.length > 0) {
            newMarketData[r.symbol] = r.prices;
          }
        });

        setMarketData(newMarketData);
      } catch (e) {
        console.error("Price fetch error", e);
      } finally {
        setLoading(false);
      }
    }

    if (assets.length > 0) {
      fetchPrices();
    }
  }, [assets, selectedRange]);

  const handleAssetSelect = (symbol: string) => {
    router.push(`/asset/${encodeURIComponent(symbol)}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      </div>

      <ResponsiveHeader />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Quick Search Section */}
        <section className="max-w-2xl mx-auto">
          <DashboardControls
            assets={assets}
            selectedSymbol={null}
            onSelectAsset={handleAssetSelect}
            timeRange={selectedRange}
            onTimeRangeChange={(range) => setSelectedRange(range as TimeRange)}
            loading={false}
          />
        </section>

        {loading && Object.keys(marketData).length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-muted-foreground text-sm font-medium tracking-wide">
                Loading market data...
              </p>
            </div>
          </div>
        ) : (
          <>
            {DASHBOARD_GROUPS.map((group, groupIndex) => {
              // Filter symbols that exist in our loaded assets AND have data
              const visibleSymbols = group.symbols.filter((s) =>
                assets.some((a) => a.symbol === s),
              );

              if (visibleSymbols.length === 0) return null;

              const Icon = group.icon;

              return (
                <section
                  key={group.title}
                  className="animate-fade-in"
                  style={{ animationDelay: `${groupIndex * 100}ms` }}
                >
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </span>
                    {group.title}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {visibleSymbols.map((symbol) => {
                      const asset = assets.find((a) => a.symbol === symbol);
                      // Use data if available, or empty array
                      const data = marketData[symbol] || [];

                      return (
                        <div
                          key={symbol}
                          className={
                            loading
                              ? "opacity-50 transition-opacity"
                              : "opacity-100 transition-opacity"
                          }
                        >
                          <MiniStockChart
                            symbol={symbol}
                            name={asset?.name || symbol}
                            data={data}
                            currency={asset?.currency}
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* If no data at all and not loading */}
            {!loading && Object.keys(marketData).length === 0 && (
              <div className="text-center p-12 border border-dashed border-border rounded-xl bg-card/50">
                <p className="text-muted-foreground">
                  No market data available. Run ingestion scripts to populate
                  the dashboard.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-12 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-muted-foreground text-sm text-center">
            Antigravity Finance Dashboard • Data from Yahoo Finance
          </p>
        </div>
      </footer>
    </div>
  );
}
