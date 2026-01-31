import Database from "better-sqlite3";
import { getDatabasePath } from "./env";

// Re-export types from centralized types file
export type {
  Asset,
  PriceData,
  FundamentalData,
  FinancialsIncome,
  FinancialsBalance,
  FinancialsCashflow,
} from "@/types";

// Import types for internal use
import type {
  Asset,
  PriceData,
  FundamentalData,
  FinancialsIncome,
  FinancialsBalance,
  FinancialsCashflow,
} from "@/types";

// Database path - uses centralized environment config
const DB_PATH = getDatabasePath();

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true });
  }
  return db;
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
