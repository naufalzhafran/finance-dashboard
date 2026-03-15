/**
 * API client for the FastAPI backend.
 * All server-side data fetching goes through this module.
 */

const API_BASE = process.env.API_URL || "http://localhost:8000/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function getAssets(assetType?: string) {
  const qs = assetType ? `?asset_type=${encodeURIComponent(assetType)}` : "";
  return apiFetch<import("@/types").Asset[]>(`/assets${qs}`, {
    cache: "no-store",
  });
}

export function getAsset(symbol: string) {
  return apiFetch<import("@/types").Asset>(`/assets/${encodeURIComponent(symbol)}`, {
    next: { revalidate: 300 },
  });
}

// FastAPI returns snake_case; the Next.js route handler remaps to camelCase.
// This type matches the raw FastAPI response.
type FastAPIPriceResponse = {
  asset: import("@/types").Asset;
  latest_price: import("@/types").PriceData | null;
  prices: import("@/types").PriceData[];
  count: number;
};

export function getPrices(symbol: string, start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<FastAPIPriceResponse>(
    `/prices/${encodeURIComponent(symbol)}${qs}`,
    { next: { revalidate: 60 } },
  );
}

export function getFundamentals(symbol: string) {
  return apiFetch<import("@/types").FundamentalsResponse>(
    `/fundamentals/${encodeURIComponent(symbol)}`,
    { next: { revalidate: 3600 } },
  );
}

export function getFinancialsIncome(symbol: string, period: "annual" | "quarterly" = "annual") {
  return apiFetch<import("@/types").FinancialsIncome[]>(
    `/financials/${encodeURIComponent(symbol)}/income?period=${period}`,
    { next: { revalidate: 3600 } },
  );
}

export function getFinancialsBalance(symbol: string, period: "annual" | "quarterly" = "annual") {
  return apiFetch<import("@/types").FinancialsBalance[]>(
    `/financials/${encodeURIComponent(symbol)}/balance?period=${period}`,
    { next: { revalidate: 3600 } },
  );
}

export function getFinancialsCashflow(symbol: string, period: "annual" | "quarterly" = "annual") {
  return apiFetch<import("@/types").FinancialsCashflow[]>(
    `/financials/${encodeURIComponent(symbol)}/cashflow?period=${period}`,
    { next: { revalidate: 3600 } },
  );
}

export function getTickers() {
  return apiFetch<import("@/types").Asset[]>("/tickers", { cache: "no-store" });
}

export function addTicker(data: import("@/types").TickerCreate) {
  return apiFetch<import("@/types").Asset>("/tickers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function removeTicker(symbol: string) {
  return apiFetch<{ detail: string }>(`/tickers/${encodeURIComponent(symbol)}`, {
    method: "DELETE",
  });
}

export function getGroups() {
  return apiFetch<import("@/types").DashboardGroup[]>("/groups", { cache: "no-store" });
}

export function createGroup(data: import("@/types").DashboardGroupCreate) {
  return apiFetch<import("@/types").DashboardGroup>("/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateGroup(id: number, data: import("@/types").DashboardGroupUpdate) {
  return apiFetch<import("@/types").DashboardGroup>(`/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteGroup(id: number) {
  return apiFetch<void>(`/groups/${id}`, { method: "DELETE" });
}
