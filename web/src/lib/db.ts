import Database from "better-sqlite3";
import path from "path";

// Database path - points to the ingestion directory
const DB_PATH = path.join(process.cwd(), "..", "ingestion", "finance_data.db");

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true });
  }
  return db;
}

// Types
export interface Asset {
  id: number;
  symbol: string;
  name: string | null;
  asset_type: string;
  currency: string;
  created_at: string;
}

export interface PriceData {
  id: number;
  asset_id: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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

// Query functions
export function getAllAssets(): Asset[] {
  const db = getDatabase();
  return db.prepare("SELECT * FROM assets ORDER BY symbol").all() as Asset[];
}

export function getAssetBySymbol(symbol: string): Asset | undefined {
  const db = getDatabase();
  return db
    .prepare("SELECT * FROM assets WHERE symbol = ?")
    .get(symbol.toUpperCase()) as Asset | undefined;
}

export function getPriceHistory(
  symbol: string,
  startDate?: string,
  endDate?: string,
): PriceData[] {
  const db = getDatabase();
  const asset = getAssetBySymbol(symbol);

  if (!asset) {
    return [];
  }

  let query = "SELECT * FROM price_history WHERE asset_id = ?";
  const params: (number | string)[] = [asset.id];

  if (startDate) {
    query += " AND date >= ?";
    params.push(startDate);
  }

  if (endDate) {
    query += " AND date <= ?";
    params.push(endDate);
  }

  query += " ORDER BY date ASC";

  return db.prepare(query).all(...params) as PriceData[];
}

export function getLatestPrice(symbol: string): PriceData | undefined {
  const db = getDatabase();
  const asset = getAssetBySymbol(symbol);

  if (!asset) {
    return undefined;
  }

  return db
    .prepare(
      "SELECT * FROM price_history WHERE asset_id = ? ORDER BY date DESC LIMIT 1",
    )
    .get(asset.id) as PriceData | undefined;
}

export function getFundamentals(symbol: string): FundamentalData | undefined {
  const db = getDatabase();
  const asset = getAssetBySymbol(symbol);

  if (!asset) {
    return undefined;
  }

  return db
    .prepare(
      "SELECT * FROM fundamentals WHERE asset_id = ? ORDER BY date DESC LIMIT 1",
    )
    .get(asset.id) as FundamentalData | undefined;
}

export function getFinancials(
  symbol: string,
  type: "income" | "balance" | "cashflow",
  period: "annual" | "quarterly" = "annual",
): (FinancialsIncome | FinancialsBalance | FinancialsCashflow)[] {
  const db = getDatabase();
  const asset = getAssetBySymbol(symbol);

  if (!asset) {
    return [];
  }

  let table = "";
  if (type === "income") table = "financials_income";
  else if (type === "balance") table = "financials_balance";
  else if (type === "cashflow") table = "financials_cashflow";

  return db
    .prepare(
      `SELECT * FROM ${table} WHERE asset_id = ? AND period_type = ? ORDER BY date DESC`,
    )
    .all(asset.id, period) as (
    | FinancialsIncome
    | FinancialsBalance
    | FinancialsCashflow
  )[];
}
