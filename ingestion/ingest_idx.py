#!/usr/bin/env python3
"""
Indonesian Stock Exchange (IDX) Data Ingestion Script

Fetches historical stock data for all Indonesian stocks from Yahoo Finance
and stores it in a local SQLite database.

Usage:
    python ingest_idx.py                    # Fetch all IDX stocks (10 years)
    python ingest_idx.py --years 5          # Fetch 5 years of data
    python ingest_idx.py --limit 10         # Fetch only first 10 stocks (for testing)
    python ingest_idx.py --symbols BBCA BBRI BMRI  # Fetch specific stocks only
"""

import argparse
import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

import pandas as pd
import yfinance as yf

# Database path - relative to this script
DB_PATH = Path(__file__).parent / "finance_data.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"

# Complete list of IDX stocks (Indonesia Stock Exchange)
# Note: These are the stock codes without the .JK suffix
# The list includes stocks from various sectors on IDX
IDX_STOCKS = [
    # Banking
    "BBCA", "BBRI", "BMRI", "BBNI", "BRIS", "BTPS", "BJTM", "BDMN", "BNII",
    "MEGA", "NISP", "PNBN", "BNGA", "BJBR", "BSIM", "AGRO", "BBYB", "BGTG",
    "BBTN", "BBKP", "BKSW", "BMAS", "BNBA", "BTPN", "DNAR", "NOBU", "SDRA",
    
    # Consumer Goods
    "UNVR", "ICBP", "INDF", "KLBF", "HMSP", "GGRM", "MYOR", "CINT", "DLTA",
    "ULTJ", "SIDO", "MLBI", "CLEO", "GOOD", "HOKI", "ADES", "CAMP", "FOOD",
    "STTP", "AISA", "SKBM", "SKLT", "CEKA", "PSDN", "BUDI", "ALTO", "PCAR",
    
    # Telecommunications
    "TLKM", "EXCL", "ISAT", "TOWR", "TBIG", "MTEL", "JAST",
    
    # Mining & Energy
    "ADRO", "ITMG", "PTBA", "INDY", "BUMI", "BSSR", "HRUM", "GEMS", "DOID",
    "MBAP", "KKGI", "BYAN", "UNTR", "MYOH", "DSSA", "TOBA", "MEDC", "ELSA",
    "RUIS", "ANTM", "INCO", "TINS", "MDKA", "PSAB", "FIRE",
    
    # Infrastructure & Construction
    "JSMR", "WIKA", "WSKT", "PTPP", "ADHI", "TOTL", "ACST", "IDPR", "NRCA",
    "SSIA", "WTON", "WSBP", "CSIS", "MTLA", "DGIK", "MTRA",
    
    # Property & Real Estate
    "BSDE", "CTRA", "SMRA", "PWON", "LPKR", "DILD", "APLN", "ASRI", "JRPT",
    "MDLN", "KIJA", "PPRO", "GWSA", "MMLP", "DUTI", "BEST", "MKPI", "PLIN",
    "BKSL", "GPRA", "GAMA", "LPCK", "URBN",
    
    # Automotive & Components
    "ASII", "AUTO", "GJTL", "SMSM", "IMAS", "INDS", "BRAM", "LPIN", "PRAS",
    "BOLT", "DRMA", "AMIN",
    
    # Retail & Trade
    "ACES", "MAPI", "LPPF", "RALS", "ERAA", "MAPA", "AMRT", "RANC", "HERO",
    "CSAP", "MPPA", "CENT", "ECII", "KOIN", "GLOB", "MIDI",
    
    # Healthcare & Pharmaceuticals
    "SIDO", "PYFA", "KAEF", "MIKA", "SILO", "PRDA", "HEAL", "SAME", "BMHS",
    
    # Media & Entertainment
    "SCMA", "MNCN", "VIVA", "LPLI", "KPIG", "FILM", "EMTK",
    
    # Chemicals & Basic Materials
    "BRPT", "TPIA", "INKP", "TKIM", "FASW", "UNIC", "DPNS", "SRSN", "INCI",
    "EKAD", "MDKI", "IPOL",
    
    # Industrial Goods
    "SMGR", "INTP", "TOTO", "CPIN", "JPFA", "MAIN", "SIPD", "SULI", "KRAS",
    "ISSP", "LION", "LMSH", "GDST", "BTON", "JKSW", "ALMI", "NIKL", "BAJA",
    
    # Transportation & Logistics
    "GIAA", "ASSA", "BIRD", "BLTA", "CMPP", "HITS", "IPCM", "LEAD", "LRNA",
    "MBSS", "NELY", "PSSI", "RAJA", "SAFE", "SAPX", "SHIP", "SMDR", "SOCI",
    "TAMU", "TMAS", "WEHA", "ZBRA", "BPII", "KARW", "PORT",
    
    # Technology
    "BUKA", "GOTO", "EMTK", "DCII", "MTDL", "LUCK", "DNET", "PURE",
    
    # Food & Beverage
    "MYOR", "ICBP", "INDF", "CLEO", "ULTJ", "MLBI", "DLTA", "GOOD",
    
    # Other Notable Stocks
    "PGAS", "PEHA", "AKRA", "BKDP", "META", "WIFI", "LINK",
    "BFIN", "ADMF", "CFIN", "VRNA", "SMMA", "BTPN", "TRIM", "PANS",
    "MREI", "ABMM", "PNLF", "LPGI", "ASDM", "KREN", "WOWS", "AGII",
]

def init_database() -> sqlite3.Connection:
    """Initialize the database with schema if not exists."""
    conn = sqlite3.connect(DB_PATH)
    
    # Read and execute schema
    if SCHEMA_PATH.exists():
        with open(SCHEMA_PATH, "r") as f:
            conn.executescript(f.read())
    
    return conn


def get_or_create_asset(conn: sqlite3.Connection, symbol: str, yahoo_symbol: str) -> int:
    """Get asset ID, creating the asset if it doesn't exist."""
    cursor = conn.cursor()
    
    # Try to get existing asset
    cursor.execute("SELECT id FROM assets WHERE symbol = ?", (symbol.upper(),))
    result = cursor.fetchone()
    
    if result:
        # Update currency if asset exists (in case schema was updated)
        cursor.execute(
            "UPDATE assets SET currency = ? WHERE symbol = ?",
            ("IDR", symbol.upper())
        )
        conn.commit()
        return result[0]
    
    # Fetch asset info from Yahoo Finance
    try:
        ticker = yf.Ticker(yahoo_symbol)
        info = ticker.info
        name = info.get("longName") or info.get("shortName") or symbol
        asset_type = "stock"  # All IDX listings are stocks
    except Exception:
        name = symbol
        asset_type = "stock"
    
    # Insert new asset with IDR currency (Indonesian stocks)
    cursor.execute(
        "INSERT INTO assets (symbol, name, asset_type, currency) VALUES (?, ?, ?, ?)",
        (symbol.upper(), name, asset_type, "IDR")
    )
    conn.commit()
    
    return cursor.lastrowid


def fetch_and_store_historical_financials(conn: sqlite3.Connection, symbol: str, ticker: yf.Ticker) -> bool:
    """Fetch annual and quarterly historical financials and store in database."""
    cursor = conn.cursor()
    
    # Get asset ID
    cursor.execute("SELECT id FROM assets WHERE symbol = ?", (symbol.upper(),))
    result = cursor.fetchone()
    if not result:
        print(f"    Asset {symbol} not found for financials")
        return False
    asset_id = result[0]
    
    def safe_get(df, idx):
        try:
            val = df.loc[idx]
            # If it's a Series (multiple dates), we handle it in loop
            # If it's missing, return None
            return val
        except KeyError:
            return None

    def store_dataframe(df, period_type, table_name, mapping):
        if df is None or df.empty:
            return
            
        # yfinance columns are dates
        for date_col in df.columns:
            date_str = date_col.strftime("%Y-%m-%d")
            
            # Map values
            col_names = ["asset_id", "date", "period_type"]
            col_vals = [asset_id, date_str, period_type]
            placeholders = ["?", "?", "?"]
            
            for db_col, yf_rows in mapping.items():
                val = None
                # Try multiple possible row names (aliases)
                if isinstance(yf_rows, str):
                    yf_rows = [yf_rows]
                
                for row_name in yf_rows:
                    if row_name in df.index:
                        try:
                            val = float(df.loc[row_name, date_col])
                            # Check for NaN
                            if val != val: # NaN check
                                val = None
                            else:
                                break # Found a value
                        except Exception:
                            pass
                
                col_names.append(db_col)
                col_vals.append(val)
                placeholders.append("?")
            
            # Construct Query
            query = f"""
                INSERT OR REPLACE INTO {table_name} 
                ({', '.join(col_names)}) 
                VALUES ({', '.join(placeholders)})
            """
            
            try:
                cursor.execute(query, tuple(col_vals))
            except sqlite3.Error as e:
                print(f"    Error inserting {period_type} {table_name} for {date_str}: {e}")

    # --- Income Statement ---
    income_mapping = {
        "total_revenue": ["Total Revenue"],
        "operating_revenue": ["Operating Revenue"],
        "cost_of_revenue": ["Cost Of Revenue"],
        "gross_profit": ["Gross Profit"],
        "operating_expense": ["Operating Expense"],
        "operating_income": ["Operating Income"],
        "net_interest_income": ["Net Interest Income"],
        "interest_expense": ["Interest Expense"],
        "interest_income": ["Interest Income"],
        "pretax_income": ["Pretax Income"],
        "tax_provision": ["Tax Provision"],
        "net_income_common_stockholders": ["Net Income Common Stockholders"],
        "net_income": ["Net Income"],
        "basic_eps": ["Basic EPS"],
        "diluted_eps": ["Diluted EPS"],
        "basic_average_shares": ["Basic Average Shares"],
        "diluted_average_shares": ["Diluted Average Shares"],
        "ebitda": ["EBITDA", "Normalized EBITDA"],
        "reconciled_depreciation": ["Reconciled Depreciation"]
    }
    
    # --- Balance Sheet ---
    balance_mapping = {
        "total_assets": ["Total Assets"],
        "current_assets": ["Current Assets"],
        "cash_and_cash_equivalents": ["Cash And Cash Equivalents"],
        "inventory": ["Inventory"],
        "receivables": ["Receivables", "Accounts Receivable"],
        "total_non_current_assets": ["Total Non Current Assets"],
        "net_ppe": ["Net PPE"],
        "goodwill_and_other_intangible_assets": ["Goodwill And Other Intangible Assets"],
        "total_liabilities_net_minority_interest": ["Total Liabilities Net Minority Interest"],
        "current_liabilities": ["Current Liabilities"],
        "payables": ["Payables", "Accounts Payable"],
        "total_non_current_liabilities_net_minority_interest": ["Total Non Current Liabilities Net Minority Interest"],
        "long_term_debt": ["Long Term Debt"],
        "total_equity_gross_minority_interest": ["Total Equity Gross Minority Interest"],
        "stockholders_equity": ["Stockholders Equity"],
        "common_stock": ["Common Stock"],
        "retained_earnings": ["Retained Earnings"],
        "ordinary_shares_number": ["Ordinary Shares Number"],
        "total_debt": ["Total Debt"],
        "net_debt": ["Net Debt"],
        "working_capital": ["Working Capital"],
        "invested_capital": ["Invested Capital"],
        "tangible_book_value": ["Tangible Book Value"]
    }

    # --- Cash Flow ---
    cf_mapping = {
        "operating_cash_flow": ["Operating Cash Flow"],
        "investing_cash_flow": ["Investing Cash Flow"],
        "financing_cash_flow": ["Financing Cash Flow"],
        "end_cash_position": ["End Cash Position"],
        "capital_expenditure": ["Capital Expenditure"],
        "issuance_of_capital_stock": ["Issuance Of Capital Stock"],
        "issuance_of_debt": ["Issuance Of Debt"],
        "repayment_of_debt": ["Repayment Of Debt"],
        "repurchase_of_capital_stock": ["Repurchase Of Capital Stock"],
        "free_cash_flow": ["Free Cash Flow"]
    }

    try:
        # Annual
        store_dataframe(ticker.financials, "annual", "financials_income", income_mapping)
        store_dataframe(ticker.balance_sheet, "annual", "financials_balance", balance_mapping)
        store_dataframe(ticker.cashflow, "annual", "financials_cashflow", cf_mapping)
        
        # Quarterly
        store_dataframe(ticker.quarterly_financials, "quarterly", "financials_income", income_mapping)
        store_dataframe(ticker.quarterly_balance_sheet, "quarterly", "financials_balance", balance_mapping)
        store_dataframe(ticker.quarterly_cashflow, "quarterly", "financials_cashflow", cf_mapping)

        conn.commit()
        print(f"    Stored historical financials for {symbol}")
        return True

    except Exception as e:
        print(f"    Error storing historical financials for {symbol}: {e}")
        return False


def fetch_and_store_fundamentals(conn: sqlite3.Connection, symbol: str, ticker: yf.Ticker) -> bool:
    """Fetch fundamental data from Yahoo Finance and store in database."""
    try:
        info = ticker.info
        
        # Get asset ID
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM assets WHERE symbol = ?", (symbol.upper(),))
        result = cursor.fetchone()
        if not result:
            print(f"    Asset {symbol} not found in database for fundamentals")
            return False
        asset_id = result[0]

        # Extract metrics
        metrics = {
            "market_cap": info.get("marketCap"),
            "enterprise_value": info.get("enterpriseValue"),
            "trailing_pe": info.get("trailingPE"),
            "forward_pe": info.get("forwardPE"),
            "peg_ratio": info.get("pegRatio"),
            "price_to_book": info.get("priceToBook"),
            "profit_margins": info.get("profitMargins"),
            "operating_margins": info.get("operatingMargins"),
            "return_on_assets": info.get("returnOnAssets"),
            "return_on_equity": info.get("returnOnEquity"),
            "revenue_growth": info.get("revenueGrowth"),
            "earnings_growth": info.get("earningsGrowth"),
            "debt_to_equity": info.get("debtToEquity"),
            "total_cash": info.get("totalCash"),
            "total_debt": info.get("totalDebt"),
            "total_revenue": info.get("totalRevenue"),
            "gross_profits": info.get("grossProfits"),
            "free_cashflow": info.get("freeCashflow"),
            "operating_cashflow": info.get("operatingCashflow"),
            "trailing_eps": info.get("trailingEps"),
            "forward_eps": info.get("forwardEps"),
            # New dividend and valuation fields
            "price_to_sales": info.get("priceToSalesTrailing12Months"),
            "dividend_yield": info.get("dividendYield"),
            "dividend_rate": info.get("dividendRate"),
            "payout_ratio": info.get("payoutRatio"),
            "five_year_avg_dividend_yield": info.get("fiveYearAvgDividendYield"),
        }
        
        # Current date for snapshot
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Insert into fundamentals
        cursor.execute(
            """
            INSERT OR REPLACE INTO fundamentals 
            (asset_id, date, market_cap, enterprise_value, trailing_pe, forward_pe, 
             peg_ratio, price_to_book, profit_margins, operating_margins, 
             return_on_assets, return_on_equity, revenue_growth, earnings_growth, 
             debt_to_equity, total_cash, total_debt, total_revenue, gross_profits, 
             free_cashflow, operating_cashflow, trailing_eps, forward_eps,
             price_to_sales, dividend_yield, dividend_rate, payout_ratio, five_year_avg_dividend_yield)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                asset_id, today,
                metrics["market_cap"], metrics["enterprise_value"], metrics["trailing_pe"],
                metrics["forward_pe"], metrics["peg_ratio"], metrics["price_to_book"],
                metrics["profit_margins"], metrics["operating_margins"], metrics["return_on_assets"],
                metrics["return_on_equity"], metrics["revenue_growth"], metrics["earnings_growth"],
                metrics["debt_to_equity"], metrics["total_cash"], metrics["total_debt"],
                metrics["total_revenue"], metrics["gross_profits"], metrics["free_cashflow"],
                metrics["operating_cashflow"], metrics["trailing_eps"], metrics["forward_eps"],
                metrics["price_to_sales"], metrics["dividend_yield"], metrics["dividend_rate"],
                metrics["payout_ratio"], metrics["five_year_avg_dividend_yield"]
            )
        )
        conn.commit()
        print(f"    Stored fundamentals for {symbol}")
        return True
        
    except Exception as e:
        print(f"    Error storing fundamentals for {symbol}: {e}")
        return False


def fetch_and_store_prices(
    conn: sqlite3.Connection,
    symbol: str,
    start_date: str,
    end_date: str
) -> int:
    """Fetch price data from Yahoo Finance and store in database."""
    yahoo_symbol = f"{symbol}.JK"  # Add .JK suffix for IDX stocks
    asset_id = get_or_create_asset(conn, symbol, yahoo_symbol)
    
    # Fetch historical data
    print(f"  Fetching data for {symbol} ({yahoo_symbol})...")
    ticker = yf.Ticker(yahoo_symbol)
    
    try:
        df = ticker.history(start=start_date, end=end_date)
    except Exception as e:
        print(f"    Error fetching: {e}")
        return 0
    
    if df.empty:
        print(f"    No data found for {symbol}")
        return 0
    
    # Prepare data for insertion
    cursor = conn.cursor()
    rows_inserted = 0
    
    for date, row in df.iterrows():
        try:
            cursor.execute(
                """
                INSERT OR REPLACE INTO price_history 
                (asset_id, date, open, high, low, close, volume)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    asset_id,
                    date.strftime("%Y-%m-%d"),
                    round(row["Open"], 4),
                    round(row["High"], 4),
                    round(row["Low"], 4),
                    round(row["Close"], 4),
                    int(row["Volume"])
                )
            )
            rows_inserted += 1
        except sqlite3.Error as e:
            print(f"    Error inserting row for {date}: {e}")
    
    conn.commit()
    print(f"    Inserted/updated {rows_inserted} rows")
    return rows_inserted


def fetch_all_idx_symbols() -> List[str]:
    """
    Returns the list of all known IDX stock symbols.
    
    Note: For a more dynamic list, you could scrape from IDX website
    or use other data sources. This static list covers major stocks.
    """
    # Remove duplicates and return sorted list
    return sorted(list(set(IDX_STOCKS)))



def run(
    start_date: str, 
    end_date: str, 
    symbols: Optional[List[str]] = None, 
    delay: float = 0.5
) -> bool:
    """
    Run the ingestion process for IDX stocks.
    
    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        symbols: Optional list of symbols to process. If None, process all.
        delay: Delay between requests in seconds
        
    Returns:
        True if process completed (even with individual failures), False if critical error.
    """
    # Get symbols to process
    if not symbols:
        symbols = fetch_all_idx_symbols()
    
    print("=" * 60)
    print("Indonesian Stock Exchange (IDX) Data Ingestion")
    print("=" * 60)
    print(f"Date Range: {start_date} to {end_date}")
    print(f"Stocks to process: {len(symbols)}")
    print(f"Database: {DB_PATH}")
    print("=" * 60)
    
    # Initialize database
    try:
        conn = init_database()
    except Exception as e:
        print(f"Critical Error initializing database: {e}")
        return False
    
    # Fetch data for each symbol
    total_rows = 0
    successful = 0
    failed = 0
    failed_symbols = []
    
    for i, symbol in enumerate(symbols, 1):
        print(f"\n[{i}/{len(symbols)}] Processing {symbol}...")
        try:
            rows = fetch_and_store_prices(conn, symbol, start_date, end_date)
            total_rows += rows
            
            # Fetch fundamentals
            yahoo_symbol = f"{symbol}.JK"
            ticker = yf.Ticker(yahoo_symbol)
            fetch_and_store_fundamentals(conn, symbol, ticker)
            
            # Fetch historical financials
            fetch_and_store_historical_financials(conn, symbol, ticker)

            if rows > 0:
                successful += 1
            else:
                 failed += 1
                 failed_symbols.append(symbol)
        except KeyboardInterrupt:
            print("\nAborted by user.")
            conn.close()
            return False
        except Exception as e:
            print(f"    Error processing {symbol}: {e}")
            failed += 1
            failed_symbols.append(symbol)
        
        # Add delay to avoid rate limiting
        if i < len(symbols):
            time.sleep(delay)
    
    conn.close()
    
    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total stocks processed: {len(symbols)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Total rows inserted/updated: {total_rows}")
    print(f"Database location: {DB_PATH}")
    
    if failed_symbols:
        print(f"\nFailed symbols ({len(failed_symbols)}):")
        for symbol in failed_symbols:
            print(f"  - {symbol}")
    
    print("\nDone!")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Fetch Indonesian stock data from Yahoo Finance into SQLite"
    )
    parser.add_argument(
        "--symbols",
        nargs="+",
        help="Specific stock symbols to fetch (without .JK suffix). If not provided, fetches all IDX stocks."
    )
    parser.add_argument(
        "--years",
        type=int,
        default=10,
        help="Number of years of history to fetch (default: 10)"
    )
    parser.add_argument(
        "--start",
        type=str,
        help="Start date (YYYY-MM-DD), overrides --years"
    )
    parser.add_argument(
        "--end",
        type=str,
        help="End date (YYYY-MM-DD), defaults to today"
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limit number of stocks to fetch (for testing)"
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.5,
        help="Delay between requests in seconds (default: 0.5)"
    )
    parser.add_argument(
        "--list-only",
        action="store_true",
        help="Only list available IDX symbols, don't fetch data"
    )
    
    args = parser.parse_args()
    
    # Get symbols to process
    if args.symbols:
        symbols = [s.upper() for s in args.symbols]
    else:
        symbols = fetch_all_idx_symbols()
    
    # Apply limit if specified
    if args.limit:
        symbols = symbols[:args.limit]
    
    # If list-only mode, just print symbols and exit
    if args.list_only:
        print(f"Available IDX symbols ({len(symbols)}):")
        for i, symbol in enumerate(symbols, 1):
            print(f"  {i:3d}. {symbol}")
        return
    
    # Calculate date range
    end_date = args.end or datetime.now().strftime("%Y-%m-%d")
    if args.start:
        start_date = args.start
    else:
        start_date = (datetime.now() - timedelta(days=args.years * 365)).strftime("%Y-%m-%d")

    run(start_date, end_date, symbols, args.delay)


if __name__ == "__main__":
    main()
