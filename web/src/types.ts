/**
 * Shared TypeScript types for the Finance Dashboard application.
 * All common interfaces should be defined here to avoid duplication.
 */

// ============================================================================
// Asset Types
// ============================================================================

export interface Asset {
  id: number;
  symbol: string;
  name: string | null;
  asset_type: string;
  currency: string;
  created_at?: string;
}

// ============================================================================
// Price Data Types
// ============================================================================

/**
 * Complete price data with OHLCV (Open, High, Low, Close, Volume)
 */
export interface PriceData {
  id?: number;
  asset_id?: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Simplified price data for charts that only need date and close price
 */
export interface SimplePriceData {
  date: string;
  close: number;
}

// ============================================================================
// Time Range Types
// ============================================================================

export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "YTD";

// ============================================================================
// Fundamental Data Types
// ============================================================================

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
  price_to_sales?: number | null;
  dividend_yield?: number | null;
  dividend_rate?: number | null;
  payout_ratio?: number | null;
  five_year_avg_dividend_yield?: number | null;
}

// ============================================================================
// Financial Statement Types
// ============================================================================

export interface FinancialsIncome {
  id: number;
  asset_id: number;
  date: string;
  period_type: string;
  total_revenue: number | null;
  operating_revenue: number | null;
  cost_of_revenue: number | null;
  gross_profit: number | null;
  operating_expense: number | null;
  operating_income: number | null;
  net_interest_income: number | null;
  interest_expense: number | null;
  interest_income: number | null;
  pretax_income: number | null;
  tax_provision: number | null;
  net_income_common_stockholders: number | null;
  net_income: number | null;
  basic_eps: number | null;
  diluted_eps: number | null;
  basic_average_shares: number | null;
  diluted_average_shares: number | null;
  ebitda: number | null;
  reconciled_depreciation: number | null;
}

export interface FinancialsBalance {
  id: number;
  asset_id: number;
  date: string;
  period_type: string;
  total_assets: number | null;
  current_assets: number | null;
  cash_and_cash_equivalents: number | null;
  inventory: number | null;
  receivables: number | null;
  total_non_current_assets: number | null;
  net_ppe: number | null;
  goodwill_and_other_intangible_assets: number | null;
  total_liabilities_net_minority_interest: number | null;
  current_liabilities: number | null;
  payables: number | null;
  total_non_current_liabilities_net_minority_interest: number | null;
  long_term_debt: number | null;
  total_equity_gross_minority_interest: number | null;
  stockholders_equity: number | null;
  common_stock: number | null;
  retained_earnings: number | null;
  ordinary_shares_number: number | null;
  total_debt: number | null;
  net_debt: number | null;
  working_capital: number | null;
  invested_capital: number | null;
  tangible_book_value: number | null;
}

export interface FinancialsCashflow {
  id: number;
  asset_id: number;
  date: string;
  period_type: string;
  operating_cash_flow: number | null;
  investing_cash_flow: number | null;
  financing_cash_flow: number | null;
  end_cash_position: number | null;
  capital_expenditure: number | null;
  issuance_of_capital_stock: number | null;
  issuance_of_debt: number | null;
  repayment_of_debt: number | null;
  repurchase_of_capital_stock: number | null;
  free_cash_flow: number | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PriceResponse {
  asset: Asset;
  latestPrice?: PriceData;
  prices: PriceData[];
  count: number;
}

export interface FundamentalsResponse {
  asset: Asset;
  fundamentals: FundamentalData | null;
}

// ============================================================================
// Technical Analysis Types
// ============================================================================

export interface CrossoverSignal {
  date: string;
  type: "golden_cross" | "death_cross";
  price: number;
}

export interface MACDData {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export interface BollingerBandsData {
  middle: number[];
  upper: number[];
  lower: number[];
}

export interface MaxDrawdownResult {
  maxDrawdown: number;
  maxDrawdownDate: string;
  peakDate: string;
  peakValue: number;
  troughValue: number;
}

export interface FiftyTwoWeekHighLow {
  high: number;
  highDate: string;
  low: number;
  lowDate: string;
  currentVsHigh: number;
  currentVsLow: number;
}
