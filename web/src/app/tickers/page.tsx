"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import ResponsiveHeader from "@/components/ResponsiveHeader";
import type { Asset, TickerCreate } from "@/types";

const ASSET_TYPES = ["stock", "index", "commodity", "currency", "crypto"] as const;
type AssetType = (typeof ASSET_TYPES)[number];

const TYPE_LABELS: Record<AssetType, string> = {
  stock: "Stock",
  index: "Index",
  commodity: "Commodity",
  currency: "Currency",
  crypto: "Crypto",
};

const TYPE_COLORS: Record<AssetType, string> = {
  stock: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  index: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  commodity: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  currency: "bg-green-500/10 text-green-400 border-green-500/20",
  crypto: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

type Status = { type: "success" | "error"; message: string } | null;

export default function TickersPage() {
  const [tickers, setTickers] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<TickerCreate>({ yahoo_symbol: "", asset_type: "stock", currency: "USD" });
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [filterType, setFilterType] = useState<string>("all");

  async function fetchTickers() {
    setLoading(true);
    try {
      const res = await fetch("/api/tickers");
      if (!res.ok) throw new Error("Failed to load tickers");
      setTickers(await res.json());
    } catch {
      setStatus({ type: "error", message: "Failed to load tickers." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTickers(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.yahoo_symbol.trim()) return;
    setAdding(true);
    setStatus(null);
    try {
      const res = await fetch("/api/tickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add ticker");
      setTickers((prev) => [data, ...prev]);
      setForm({ yahoo_symbol: "", asset_type: "stock", currency: "USD" });
      setStatus({ type: "success", message: `${data.symbol} added — fetching historical data in the background.` });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(symbol: string) {
    setRemoving(symbol);
    setStatus(null);
    try {
      const res = await fetch(`/api/tickers/${encodeURIComponent(symbol)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to remove ticker");
      setTickers((prev) => prev.filter((t) => t.symbol !== symbol));
      setStatus({ type: "success", message: `${symbol} untracked. Historical data retained.` });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setRemoving(null);
    }
  }

  const grouped = ASSET_TYPES.reduce<Record<string, Asset[]>>((acc, type) => {
    const items = tickers.filter((t) => t.asset_type === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  const filtered = filterType === "all" ? grouped : Object.fromEntries(
    Object.entries(grouped).filter(([type]) => type === filterType)
  );

  const totalCount = tickers.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ResponsiveHeader title="Manage Tickers" subtitle="Add or remove tracked assets" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Add Ticker Card */}
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
          <h2 className="text-base font-semibold mb-4">Add New Ticker</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Yahoo Finance symbol (e.g. BBCA.JK, NVDA, GC=F)"
              value={form.yahoo_symbol}
              onChange={(e) => setForm((f) => ({ ...f, yahoo_symbol: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              disabled={adding}
            />
            <select
              value={form.asset_type}
              onChange={(e) => setForm((f) => ({ ...f, asset_type: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-background border border-border/60 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              disabled={adding}
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Currency"
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
              className="w-28 px-3 py-2 rounded-lg bg-background border border-border/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              disabled={adding}
            />
            <button
              type="submit"
              disabled={adding || !form.yahoo_symbol.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </button>
          </form>

          {status && (
            <div className={`mt-3 flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
              status.type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}>
              {status.type === "success"
                ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
              {status.message}
            </div>
          )}
        </div>

        {/* Ticker List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Tracked Assets
              <span className="ml-2 text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {totalCount}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-background border border-border/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="all">All types</option>
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              <button
                onClick={fetchTickers}
                disabled={loading}
                className="p-1.5 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading tickers...
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No tracked tickers yet. Add one above.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(filtered).map(([type, assets]) => (
                <div key={type}>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium mb-3 ${TYPE_COLORS[type as AssetType]}`}>
                    {TYPE_LABELS[type as AssetType]}
                    <span className="opacity-60">({assets.length})</span>
                  </div>

                  <div className="rounded-xl border border-border/40 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/40 bg-secondary/20">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Symbol</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Yahoo Symbol</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Currency</th>
                          <th className="px-4 py-2.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((asset, i) => (
                          <tr
                            key={asset.symbol}
                            className={`${i < assets.length - 1 ? "border-b border-border/30" : ""} hover:bg-secondary/10 transition-colors`}
                          >
                            <td className="px-4 py-3 font-mono font-medium text-foreground">{asset.symbol}</td>
                            <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{asset.name ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">{asset.yahoo_symbol ?? "—"}</td>
                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{asset.currency}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleRemove(asset.symbol)}
                                disabled={removing === asset.symbol}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
                                title={`Untrack ${asset.symbol}`}
                              >
                                {removing === asset.symbol
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
