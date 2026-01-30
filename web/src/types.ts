export interface Asset {
  id: number;
  symbol: string;
  name: string | null;
  asset_type: string;
  currency: string;
}

export interface FundamentalData {
  id: number;
  asset_id: number;
  date: string;
  market_cap: number | null;
  enterprise_value: number | null;
  trailing_pe: number | null;
  forward_pe: number | null;
  peg_ratio: number | null;
  price_to_book: number | null;
  profit_margins: number | null;
  operating_margins: number | null;
  return_on_assets: number | null;
  return_on_equity: number | null;
  revenue_growth: number | null;
  earnings_growth: number | null;
  debt_to_equity: number | null;
  total_cash: number | null;
  total_debt: number | null;
  total_revenue: number | null;
  gross_profits: number | null;
  free_cashflow: number | null;
  operating_cashflow: number | null;
  trailing_eps: number | null;
  forward_eps: number | null;
}
