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
    next: { revalidate: 300 },
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
