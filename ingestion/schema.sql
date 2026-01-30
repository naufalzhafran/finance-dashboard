-- SQLite schema for Finance Dashboard
-- Run: sqlite3 finance_data.db < schema.sql

-- Assets table: stores tracked symbols
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT,
    asset_type TEXT DEFAULT 'stock',
    currency TEXT DEFAULT 'USD',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Price history table: OHLCV data
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    date DATE NOT NULL,
    open REAL,
    high REAL,
    low REAL,
    close REAL,
    volume INTEGER,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    UNIQUE(asset_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date);
CREATE INDEX IF NOT EXISTS idx_price_history_asset_date ON price_history(asset_id, date);
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON assets(symbol);

-- Fundamentals table: stores key financial metrics
CREATE TABLE IF NOT EXISTS fundamentals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    date DATE NOT NULL,
    market_cap REAL,
    enterprise_value REAL,
    trailing_pe REAL,
    forward_pe REAL,
    peg_ratio REAL,
    price_to_book REAL,
    profit_margins REAL,
    operating_margins REAL,
    return_on_assets REAL,
    return_on_equity REAL,
    revenue_growth REAL,
    earnings_growth REAL,
    debt_to_equity REAL,
    total_cash REAL,
    total_debt REAL,
    total_revenue REAL,
    gross_profits REAL,
    free_cashflow REAL,
    operating_cashflow REAL,
    trailing_eps REAL,
    forward_eps REAL,
    price_to_sales REAL,
    dividend_yield REAL,
    dividend_rate REAL,
    payout_ratio REAL,
    five_year_avg_dividend_yield REAL,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    UNIQUE(asset_id, date)
);

CREATE INDEX IF NOT EXISTS idx_fundamentals_asset_date ON fundamentals(asset_id, date);

-- Income Statement table
CREATE TABLE IF NOT EXISTS financials_income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    date DATE NOT NULL,
    period_type TEXT NOT NULL, -- 'annual' or 'quarterly'
    total_revenue REAL,
    operating_revenue REAL,
    cost_of_revenue REAL,
    gross_profit REAL,
    operating_expense REAL,
    operating_income REAL,
    net_interest_income REAL,
    interest_expense REAL,
    interest_income REAL,
    pretax_income REAL,
    tax_provision REAL,
    net_income_common_stockholders REAL,
    net_income REAL,
    basic_eps REAL,
    diluted_eps REAL,
    basic_average_shares REAL,
    diluted_average_shares REAL,
    ebitda REAL,
    reconciled_depreciation REAL,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    UNIQUE(asset_id, date, period_type)
);
CREATE INDEX IF NOT EXISTS idx_financials_income_asset_date ON financials_income(asset_id, date);

-- Balance Sheet table
CREATE TABLE IF NOT EXISTS financials_balance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    date DATE NOT NULL,
    period_type TEXT NOT NULL,
    total_assets REAL,
    current_assets REAL,
    cash_and_cash_equivalents REAL,
    inventory REAL,
    receivables REAL,
    total_non_current_assets REAL,
    net_ppe REAL, -- Property, Plant, Equipment
    goodwill_and_other_intangible_assets REAL,
    total_liabilities_net_minority_interest REAL, -- Total Liabilities
    current_liabilities REAL,
    payables REAL,
    total_non_current_liabilities_net_minority_interest REAL, -- Long Term Liab
    long_term_debt REAL,
    total_equity_gross_minority_interest REAL, -- Total Equity
    stockholders_equity REAL,
    common_stock REAL,
    retained_earnings REAL,
    ordinary_shares_number REAL, -- Shares Issued
    total_debt REAL,
    net_debt REAL,
    working_capital REAL,
    invested_capital REAL,
    tangible_book_value REAL,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    UNIQUE(asset_id, date, period_type)
);
CREATE INDEX IF NOT EXISTS idx_financials_balance_asset_date ON financials_balance(asset_id, date);

-- Cash Flow table
CREATE TABLE IF NOT EXISTS financials_cashflow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    date DATE NOT NULL,
    period_type TEXT NOT NULL,
    operating_cash_flow REAL,
    investing_cash_flow REAL,
    financing_cash_flow REAL,
    end_cash_position REAL,
    capital_expenditure REAL,
    issuance_of_capital_stock REAL,
    issuance_of_debt REAL,
    repayment_of_debt REAL,
    repurchase_of_capital_stock REAL,
    free_cash_flow REAL,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    UNIQUE(asset_id, date, period_type)
);
CREATE INDEX IF NOT EXISTS idx_financials_cashflow_asset_date ON financials_cashflow(asset_id, date);
