"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Banknote, Landmark, Flame, Building2, BarChart3, TrendingUp,
  Cpu, Ship, ShoppingCart, HeartPulse, Factory, Leaf, LucideIcon,
  Plus, Trash2, ChevronUp, ChevronDown, X, Check, Pencil,
  ChevronRight, AlertTriangle, RefreshCw, Search,
} from "lucide-react";
import ResponsiveHeader from "@/components/ResponsiveHeader";
import { Card } from "@/components/ui/card";
import { Asset, DashboardGroup, DashboardGroupCreate } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Globe", icon: Globe }, { name: "Banknote", icon: Banknote },
  { name: "Landmark", icon: Landmark }, { name: "Flame", icon: Flame },
  { name: "Building2", icon: Building2 }, { name: "BarChart3", icon: BarChart3 },
  { name: "TrendingUp", icon: TrendingUp }, { name: "Cpu", icon: Cpu },
  { name: "Ship", icon: Ship }, { name: "ShoppingCart", icon: ShoppingCart },
  { name: "HeartPulse", icon: HeartPulse }, { name: "Factory", icon: Factory },
  { name: "Leaf", icon: Leaf },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map(({ name, icon }) => [name, icon])
);

const COLOR_OPTIONS = [
  "blue", "amber", "orange", "purple", "emerald",
  "slate", "red", "pink", "lime", "cyan", "violet", "sky", "rose", "zinc",
];

const COLOR_CLASSES: Record<string, { dot: string; badge: string }> = {
  blue:    { dot: "bg-blue-400",    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  amber:   { dot: "bg-amber-400",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  orange:  { dot: "bg-orange-400",  badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  purple:  { dot: "bg-purple-400",  badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  emerald: { dot: "bg-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  slate:   { dot: "bg-slate-400",   badge: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  red:     { dot: "bg-red-400",     badge: "bg-red-500/10 text-red-400 border-red-500/20" },
  pink:    { dot: "bg-pink-400",    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  lime:    { dot: "bg-lime-400",    badge: "bg-lime-500/10 text-lime-400 border-lime-500/20" },
  cyan:    { dot: "bg-cyan-400",    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  violet:  { dot: "bg-violet-400",  badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  sky:     { dot: "bg-sky-400",     badge: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  rose:    { dot: "bg-rose-400",    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  zinc:    { dot: "bg-zinc-400",    badge: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
};

const EMPTY_FORM: DashboardGroupCreate = {
  section: "indonesia", title: "", icon: "BarChart3", color: "blue", symbols: [],
};

// Derive yahoo_symbol from a group symbol and section
function toYahooSymbol(symbol: string, section: string): string {
  // IDX stocks don't have special chars — global ones do (^, =, -)
  const isGlobal = section === "world" || /[\^=\-]/.test(symbol);
  return isGlobal ? symbol : `${symbol}.JK`;
}

function deriveAssetType(section: string): string {
  return section === "indonesia" ? "IDX" : "global";
}

function deriveCurrency(symbol: string, section: string): string {
  if (section === "indonesia") return "IDR";
  if (symbol.includes("IDR=X")) return "IDR";
  if (symbol.endsWith("-USD") || ["GC=F","SI=F","CL=F","BZ=F","NG=F","HG=F","ZC=F","ZS=F","KC=F","CPO=F"].includes(symbol)) return "USD";
  return "USD";
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ICON_OPTIONS.map(({ name, icon: Ic }) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          title={name}
          className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
            value === name ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          }`}
        >
          <Ic className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={c}
          className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${COLOR_CLASSES[c]?.dot ?? "bg-gray-400"} ${
            value === c ? "border-foreground scale-110" : "border-transparent"
          }`}
        />
      ))}
    </div>
  );
}

// Symbol search combobox — searches existing assets, also allows free-text
function SymbolInput({
  assets,
  existing,
  onAdd,
}: {
  assets: Asset[];
  existing: string[];
  onAdd: (symbol: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = assets
    .filter(
      (a) =>
        !existing.includes(a.symbol) &&
        (a.symbol.toLowerCase().includes(query.toLowerCase()) ||
          (a.name ?? "").toLowerCase().includes(query.toLowerCase())),
    )
    .slice(0, 8);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function commit(sym: string) {
    const s = sym.trim().toUpperCase();
    if (s && !existing.includes(s)) onAdd(s);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary uppercase placeholder:normal-case"
            placeholder="Search or type symbol…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commit(query); }
              if (e.key === "Escape") setOpen(false);
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => commit(query)}
          disabled={!query.trim()}
          className="px-3 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {open && (query.length > 0 || suggestions.length > 0) && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((a) => (
            <button
              key={a.symbol}
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary text-left cursor-pointer"
              onMouseDown={(e) => { e.preventDefault(); commit(a.symbol); }}
            >
              <span className="font-mono text-sm font-semibold w-24 shrink-0">{a.symbol}</span>
              <span className="text-xs text-muted-foreground truncate">{a.name}</span>
            </button>
          ))}
          {query.trim() && !assets.find((a) => a.symbol === query.trim().toUpperCase()) && (
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary text-left border-t border-border cursor-pointer"
              onMouseDown={(e) => { e.preventDefault(); commit(query); }}
            >
              <span className="font-mono text-sm font-semibold w-24 shrink-0 text-primary">
                {query.trim().toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">Add new symbol</span>
            </button>
          )}
          {suggestions.length === 0 && !query.trim() && (
            <p className="px-3 py-2 text-xs text-muted-foreground">Type to search assets…</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<DashboardGroup[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [saving, setSaving] = useState(false);
  const [seedingGroup, setSeedingGroup] = useState<number | null>(null);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<DashboardGroup>>({});

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<DashboardGroupCreate>(EMPTY_FORM);

  useEffect(() => {
    Promise.all([
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/assets", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([g, a]: [DashboardGroup[], Asset[]]) => {
        setGroups(g);
        setAssets(a);
      })
      .catch(console.error);
  }, []);

  const assetMap = new Map(assets.map((a) => [a.symbol, a]));

  function getMissing(group: DashboardGroup) {
    return group.symbols.filter((s) => !assetMap.has(s));
  }

  async function seedMissing(group: DashboardGroup) {
    const missing = getMissing(group);
    if (missing.length === 0) return;
    setSeedingGroup(group.id);
    const results = await Promise.allSettled(
      missing.map(async (symbol) => {
        const r = await fetch("/api/tickers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            yahoo_symbol: toYahooSymbol(symbol, group.section),
            asset_type: deriveAssetType(group.section),
            currency: deriveCurrency(symbol, group.section),
          }),
        });
        // 409 = already exists — fetch it directly and return it
        if (r.status === 409) {
          const existing = await fetch(`/api/assets/${encodeURIComponent(symbol)}`, { cache: "no-store" });
          if (existing.ok) return existing.json() as Promise<Asset>;
        }
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<Asset>;
      }),
    );
    // Merge newly seeded assets directly into state — no extra round-trip needed
    const seededAssets = results
      .filter((r): r is PromiseFulfilledResult<Asset> => r.status === "fulfilled")
      .map((r) => r.value);
    if (seededAssets.length > 0) {
      setAssets((prev) => {
        const map = new Map(prev.map((a) => [a.symbol, a]));
        seededAssets.forEach((a) => map.set(a.symbol, a));
        return Array.from(map.values());
      });
    }
    setSeedingGroup(null);
    const failed = results.length - seededAssets.length;
    if (failed > 0) alert(`${seededAssets.length} seeded, ${failed} failed (symbol may not exist on Yahoo Finance).`);
  }

  async function saveEdit(id: number) {
    setSaving(true);
    const res = await fetch(`/api/groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
      setEditingId(null);
    }
    setSaving(false);
  }

  async function deleteGroup(id: number) {
    if (!confirm("Delete this group?")) return;
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
      setExpandedIds((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }

  async function moveGroup(index: number, direction: "up" | "down") {
    const next = [...groups];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    const updated = next.map((g, i) => ({ ...g, sort_order: i }));
    setGroups(updated);
    await Promise.all([
      fetch(`/api/groups/${updated[index].id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: updated[index].sort_order }),
      }),
      fetch(`/api/groups/${updated[swapIndex].id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: updated[swapIndex].sort_order }),
      }),
    ]);
  }

  async function handleCreate() {
    if (!createForm.title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...createForm, sort_order: groups.length }),
    });
    if (res.ok) {
      const created = await res.json();
      setGroups((prev) => [...prev, created]);
      setCreateForm(EMPTY_FORM);
      setShowCreate(false);
    }
    setSaving(false);
  }

  function toggleExpand(id: number) {
    setExpandedIds((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function startEdit(group: DashboardGroup) {
    setEditingId(group.id);
    setEditForm({ ...group });
    setExpandedIds((s) => new Set([...s, group.id]));
  }

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveHeader title="Indonesia Economy" subtitle="Market Intelligence Dashboard" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Groups</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {groups.length} groups · {assets.length} assets in database
            </p>
          </div>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Group
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card className="p-5 border-primary/30 bg-card/80 space-y-4">
            <h2 className="font-semibold text-sm">New Group</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                  placeholder="e.g. Banking"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Section</label>
                <select
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                  value={createForm.section}
                  onChange={(e) => setCreateForm((f) => ({ ...f, section: e.target.value }))}
                >
                  <option value="world">World View</option>
                  <option value="indonesia">Indonesia</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
                <IconPicker value={createForm.icon} onChange={(v) => setCreateForm((f) => ({ ...f, icon: v }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                <ColorPicker value={createForm.color} onChange={(v) => setCreateForm((f) => ({ ...f, color: v }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Symbols</label>
              <SymbolInput
                assets={assets}
                existing={createForm.symbols ?? []}
                onAdd={(s) => setCreateForm((f) => ({ ...f, symbols: [...(f.symbols ?? []), s] }))}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {createForm.symbols?.map((s) => {
                  const asset = assetMap.get(s);
                  return (
                    <span key={s} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary text-xs">
                      <span className="font-mono font-semibold">{s}</span>
                      {asset && <span className="text-muted-foreground truncate max-w-[100px]">{asset.name}</span>}
                      {!asset && <span className="text-amber-400 text-[10px]">new</span>}
                      <button
                        type="button"
                        onClick={() => setCreateForm((f) => ({ ...f, symbols: (f.symbols ?? []).filter((x) => x !== s) }))}
                        className="cursor-pointer hover:text-rose-400 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !createForm.title.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                Create
              </button>
            </div>
          </Card>
        )}

        {/* Groups List */}
        <div className="space-y-2">
          {groups.map((group, index) => {
            const Icon = ICON_MAP[group.icon] ?? BarChart3;
            const colors = COLOR_CLASSES[group.color] ?? COLOR_CLASSES.blue;
            const isExpanded = expandedIds.has(group.id);
            const isEditing = editingId === group.id;
            const missing = getMissing(group);
            const isSeeding = seedingGroup === group.id;

            return (
              <Card key={group.id} className="bg-card/80 border-border/50 overflow-hidden">
                {/* Group Header Row */}
                <div className="flex items-center gap-2 px-4 py-3">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0 shrink-0">
                    <button
                      onClick={() => moveGroup(index, "up")}
                      disabled={index === 0}
                      className="p-0.5 rounded hover:bg-secondary disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveGroup(index, "down")}
                      disabled={index === groups.length - 1}
                      className="p-0.5 rounded hover:bg-secondary disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Icon + title */}
                  <button
                    onClick={() => toggleExpand(group.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 ${colors.badge}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-sm truncate">{group.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border shrink-0 ${colors.badge}`}>
                      {group.section}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {group.symbols.length} symbols
                    </span>
                    {missing.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-400 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        {missing.length} missing
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 text-muted-foreground ml-auto shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {missing.length > 0 && (
                      <button
                        onClick={() => seedMissing(group)}
                        disabled={isSeeding}
                        title="Seed missing symbols to database"
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                        Seed
                      </button>
                    )}
                    <button
                      onClick={() => isEditing ? setEditingId(null) : startEdit(group)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded: symbol list + edit form */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-4 py-3 space-y-3">
                    {isEditing ? (
                      <>
                        {/* Edit metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                            <input
                              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                              value={editForm.title ?? ""}
                              onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Section</label>
                            <select
                              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary"
                              value={editForm.section ?? "indonesia"}
                              onChange={(e) => setEditForm((f) => ({ ...f, section: e.target.value }))}
                            >
                              <option value="world">World View</option>
                              <option value="indonesia">Indonesia</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
                            <IconPicker value={editForm.icon ?? "BarChart3"} onChange={(v) => setEditForm((f) => ({ ...f, icon: v }))} />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                            <ColorPicker value={editForm.color ?? "blue"} onChange={(v) => setEditForm((f) => ({ ...f, color: v }))} />
                          </div>
                        </div>

                        {/* Symbol editor */}
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">Symbols</label>
                          <SymbolInput
                            assets={assets}
                            existing={editForm.symbols ?? []}
                            onAdd={(s) => setEditForm((f) => ({ ...f, symbols: [...(f.symbols ?? []), s] }))}
                          />
                        </div>
                      </>
                    ) : null}

                    {/* Symbol table — always shown when expanded */}
                    <div className="divide-y divide-border/30 rounded-lg border border-border/40 overflow-hidden">
                      {(isEditing ? editForm.symbols ?? [] : group.symbols).map((symbol) => {
                        const asset = assetMap.get(symbol);
                        return (
                          <div key={symbol} className="flex items-center gap-3 px-3 py-2 bg-background/30 hover:bg-background/60 transition-colors">
                            <span className="font-mono text-sm font-semibold w-28 shrink-0">{symbol}</span>
                            <span className="text-xs text-muted-foreground flex-1 truncate">
                              {asset ? (asset.name || asset.symbol) : <span className="text-amber-400">Not in database</span>}
                            </span>
                            {asset ? (
                              <span className="text-xs text-emerald-400 shrink-0">✓ tracked</span>
                            ) : (
                              <span className="text-xs text-amber-400/70 shrink-0">missing</span>
                            )}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => setEditForm((f) => ({ ...f, symbols: (f.symbols ?? []).filter((s) => s !== symbol) }))}
                                className="p-0.5 hover:text-rose-400 text-muted-foreground cursor-pointer shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {(isEditing ? editForm.symbols ?? [] : group.symbols).length === 0 && (
                        <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                          No symbols in this group yet.
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-secondary cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(group.id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No groups yet. Create one to get started.
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
