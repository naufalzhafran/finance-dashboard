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
  TrendingUp,
  TrendingDown,
  Cpu,
  Ship,
  ShoppingCart,
  HeartPulse,
  Factory,
  Leaf,
  LucideIcon,
} from "lucide-react";
import MiniStockChart from "@/components/MiniStockChart";
import DashboardControls from "@/components/DashboardControls";
import ResponsiveHeader from "@/components/ResponsiveHeader";
import { Asset, DashboardGroup, SimplePriceData, TimeRange } from "@/types";

// Map icon name strings (stored in DB) to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Globe, Banknote, Landmark, Flame, Building2, TrendingUp, TrendingDown,
  Cpu, Ship, ShoppingCart, HeartPulse, Factory, Leaf, BarChart3,
};

const COLOR_MAP: Record<string, { icon: string; badge: string }> = {
  blue:    { icon: "text-blue-400",    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  amber:   { icon: "text-amber-400",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  orange:  { icon: "text-orange-400",  badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  purple:  { icon: "text-purple-400",  badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  emerald: { icon: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  slate:   { icon: "text-slate-400",   badge: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  red:     { icon: "text-red-400",     badge: "bg-red-500/10 text-red-400 border-red-500/20" },
  pink:    { icon: "text-pink-400",    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  lime:    { icon: "text-lime-400",    badge: "bg-lime-500/10 text-lime-400 border-lime-500/20" },
  cyan:    { icon: "text-cyan-400",    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  violet:  { icon: "text-violet-400",  badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  sky:     { icon: "text-sky-400",     badge: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  rose:    { icon: "text-rose-400",    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  zinc:    { icon: "text-zinc-400",    badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

function getStartDate(range: TimeRange): string {
  const now = new Date();
  const d = new Date();
  if (range === "1M") d.setMonth(now.getMonth() - 1);
  else if (range === "3M") d.setMonth(now.getMonth() - 3);
  else if (range === "6M") d.setMonth(now.getMonth() - 6);
  else if (range === "1Y") d.setFullYear(now.getFullYear() - 1);
  else if (range === "YTD") d.setMonth(0, 1);
  return d.toISOString().split("T")[0];
}

export default function Home() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [groups, setGroups] = useState<DashboardGroup[]>([]);
  const [marketData, setMarketData] = useState<Record<string, SimplePriceData[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("3M");
  const [activeSection, setActiveSection] = useState<"all" | "world" | "indonesia">("all");

  // Fetch assets and groups in parallel
  useEffect(() => {
    Promise.all([
      fetch("/api/assets").then((r) => r.json()),
      fetch("/api/groups").then((r) => r.json()),
    ])
      .then(([assetData, groupData]: [Asset[], DashboardGroup[]]) => {
        setAssets(assetData);
        setGroups(groupData);
      })
      .catch(console.error);
  }, []);

  // Fetch prices when assets or range changes
  useEffect(() => {
    if (assets.length === 0 || groups.length === 0) return;
    setLoading(true);

    const symbolsToShow = new Set(groups.flatMap((g) => g.symbols));
    const available = assets.filter((a) => symbolsToShow.has(a.symbol)).map((a) => a.symbol);
    const end = new Date().toISOString().split("T")[0];
    const start = getStartDate(selectedRange);

    Promise.all(
      available.map(async (symbol) => {
        try {
          const res = await fetch(`/api/prices/${encodeURIComponent(symbol)}?start=${start}&end=${end}`);
          if (!res.ok) return { symbol, prices: [] };
          const data = await res.json();
          return { symbol, prices: data.prices as SimplePriceData[] };
        } catch {
          return { symbol, prices: [] };
        }
      }),
    ).then((results) => {
      const map: Record<string, SimplePriceData[]> = {};
      results.forEach((r) => { if (r.prices.length > 0) map[r.symbol] = r.prices; });
      setMarketData(map);
      setLoading(false);
    });
  }, [assets, groups, selectedRange]);

  const filteredGroups = groups.filter(
    (g) => activeSection === "all" || g.section === activeSection,
  );

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      </div>

      <ResponsiveHeader title="Indonesia Economy" subtitle="Market Intelligence Dashboard" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Hero Banner */}
        <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Data
                </span>
                <span className="text-xs text-muted-foreground">Yahoo Finance</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Indonesia Economy Dashboard
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Comprehensive view of IDX markets, global indices, FX rates, and commodities
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tracking</p>
                <p className="text-2xl font-bold text-primary">{assets.length}</p>
                <p className="text-xs text-muted-foreground">assets</p>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Controls */}
        <section className="max-w-2xl mx-auto">
          <DashboardControls
            assets={assets}
            selectedSymbol={null}
            onSelectAsset={(s) => router.push(`/asset/${encodeURIComponent(s)}`)}
            timeRange={selectedRange}
            onTimeRangeChange={(r) => setSelectedRange(r as TimeRange)}
            loading={false}
          />
        </section>

        {/* Section Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(["all", "world", "indonesia"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeSection === s
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {s === "all" && <BarChart3 className="w-4 h-4" />}
              {s === "world" && <Globe className="w-4 h-4" />}
              {s === "indonesia" && <Building2 className="w-4 h-4" />}
              {s === "all" ? "All Markets" : s === "world" ? "World View" : "Indonesia"}
            </button>
          ))}
        </div>

        {/* Section Labels */}
        {activeSection === "all" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-muted-foreground font-medium">World View</span>
            </div>
            <div className="h-px flex-1 bg-border/50" />
          </div>
        )}

        {/* Loading State */}
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
            {filteredGroups.map((group, groupIndex) => {
              const visibleSymbols = group.symbols.filter((s) =>
                assets.some((a) => a.symbol === s),
              );
              if (visibleSymbols.length === 0) return null;

              const Icon = ICON_MAP[group.icon] ?? BarChart3;
              const colors = COLOR_MAP[group.color] ?? COLOR_MAP.blue;

              const isFirstIndonesia =
                activeSection === "all" &&
                group.section === "indonesia" &&
                filteredGroups.filter((g) => g.section === "indonesia")[0] === group;

              return (
                <div key={group.id}>
                  {isFirstIndonesia && (
                    <div className="flex items-center gap-4 mt-6 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-muted-foreground font-medium">Indonesia</span>
                      </div>
                      <div className="h-px flex-1 bg-border/50" />
                    </div>
                  )}
                  <section
                    className="animate-fade-in space-y-4"
                    style={{ animationDelay: `${groupIndex * 60}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-7 h-7 rounded-lg border ${colors.badge}`}>
                        <Icon className={`w-4 h-4 ${colors.icon}`} />
                      </span>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {group.title}
                      </h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${colors.badge}`}>
                        {visibleSymbols.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                      {visibleSymbols.map((symbol) => {
                        const asset = assets.find((a) => a.symbol === symbol);
                        return (
                          <div
                            key={symbol}
                            className={loading ? "opacity-50 transition-opacity" : "opacity-100 transition-opacity"}
                          >
                            <MiniStockChart
                              symbol={symbol}
                              name={asset?.name || symbol}
                              data={marketData[symbol] || []}
                              currency={asset?.currency}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              );
            })}

            {!loading && Object.keys(marketData).length === 0 && (
              <div className="text-center p-12 border border-dashed border-border rounded-xl bg-card/50">
                <p className="text-muted-foreground">
                  No market data available. Run ingestion scripts to populate the dashboard.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="relative z-10 border-t border-border/50 mt-12 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-muted-foreground text-sm">
            Indonesia Economy Dashboard • Data from Yahoo Finance
          </p>
          <p className="text-muted-foreground text-xs">
            Next.js + FastAPI + PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  );
}
