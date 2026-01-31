"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MiniStockChart from "@/components/MiniStockChart";
import DashboardControls from "@/components/DashboardControls";
import { Asset, SimplePriceData, TimeRange } from "@/types";
import { ChevronDown } from "lucide-react";

// Group definitions for the dashboard
// Group definitions for the dashboard
const DASHBOARD_GROUPS = [
  {
    title: "Market Overview",
    symbols: ["^JKSE", "^GSPC", "^IXIC", "^N225", "BTC-USD"],
  },
  {
    title: "Currencies (vs IDR)",
    symbols: ["USDIDR=X", "EURIDR=X", "GBPIDR=X", "JPYIDR=X", "SGDIDR=X"],
  },
  {
    title: "Commodities",
    symbols: ["GC=F", "CL=F", "CPO=F", "HG=F", "NG=F"],
  },
  {
    title: "Indonesian Banking",
    symbols: ["BBCA", "BBRI", "BMRI", "BBNI", "BRIS"],
  },
  {
    title: "Indonesian Energy & Resources",
    symbols: ["ADRO", "ITMG", "PTBA", "UNTR", "MEDC", "ANTM", "INCO", "PGAS"],
  },
  {
    title: "Indonesian BUMN",
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
    <div className="min-h-screen bg-transparent relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-background/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Finance Dashboard
              </h1>
              <p className="text-muted-foreground text-xs">Market Overview</p>
            </div>
          </div>

          {/* Time Window Selector */}
          <div className="relative">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as TimeRange)}
              className="appearance-none bg-background/50 hover:bg-muted/50 border border-border rounded-lg pl-3 pr-9 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
              <option value="YTD">Year to Date</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Quick Search Section */}
        <section className="max-w-2xl mx-auto">
          <DashboardControls
            assets={assets}
            selectedSymbol={null}
            onSelectAsset={handleAssetSelect}
            startDate=""
            endDate=""
            onDateChange={() => {}}
            loading={false}
            hideDateControls={true}
          />
        </section>

        {loading && Object.keys(marketData).length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : (
          <>
            {DASHBOARD_GROUPS.map((group) => {
              // Filter symbols that exist in our loaded assets AND have data
              const visibleSymbols = group.symbols.filter((s) =>
                assets.some((a) => a.symbol === s),
              );

              if (visibleSymbols.length === 0) return null;

              return (
                <section key={group.title} className="animate-fade-in">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
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
              <div className="text-center p-12 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">
                  No market data available. Run ingestion scripts to populate
                  the dashboard.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
