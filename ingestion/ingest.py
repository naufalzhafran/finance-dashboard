#!/usr/bin/env python3
"""
Finance Data Ingestion Script

Fetches stock data from Yahoo Finance and stores it in a local SQLite database.

Usage:
    python ingest.py --symbols AAPL MSFT GOOGL --days 365
    python ingest.py --symbols AAPL --start 2024-01-01 --end 2024-12-31
"""

import argparse
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import yfinance as yf


# Database path - relative to this script
DB_PATH = Path(__file__).parent / "finance_data.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def init_database() -> sqlite3.Connection:
    """Initialize the database with schema if not exists."""
    conn = sqlite3.connect(DB_PATH)
    
    # Read and execute schema
    if SCHEMA_PATH.exists():
        with open(SCHEMA_PATH, "r") as f:
            conn.executescript(f.read())
    
    return conn


def get_or_create_asset(conn: sqlite3.Connection, symbol: str) -> int:
    """Get asset ID, creating the asset if it doesn't exist."""
    cursor = conn.cursor()
    
    # Try to get existing asset
    cursor.execute("SELECT id FROM assets WHERE symbol = ?", (symbol.upper(),))
    result = cursor.fetchone()
    
    if result:
        return result[0]
    
    # Fetch asset info from Yahoo Finance
    ticker = yf.Ticker(symbol)
    info = ticker.info
    name = info.get("longName") or info.get("shortName") or symbol
    asset_type = info.get("quoteType", "stock").lower()
    
    # Insert new asset
    cursor.execute(
        "INSERT INTO assets (symbol, name, asset_type) VALUES (?, ?, ?)",
        (symbol.upper(), name, asset_type)
    )
    conn.commit()
    
    return cursor.lastrowid


def fetch_and_store_prices(
    conn: sqlite3.Connection,
    symbol: str,
    start_date: str,
    end_date: str
) -> int:
    """Fetch price data from Yahoo Finance and store in database."""
    asset_id = get_or_create_asset(conn, symbol)
    
    # Fetch historical data
    print(f"Fetching data for {symbol} from {start_date} to {end_date}...")
    ticker = yf.Ticker(symbol)
    df = ticker.history(start=start_date, end=end_date)
    
    if df.empty:
        print(f"  No data found for {symbol}")
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
            print(f"  Error inserting row for {date}: {e}")
    
    conn.commit()
    print(f"  Inserted/updated {rows_inserted} rows for {symbol}")
    return rows_inserted


def main():
    parser = argparse.ArgumentParser(
        description="Fetch stock data from Yahoo Finance into SQLite"
    )
    parser.add_argument(
        "--symbols",
        nargs="+",
        required=True,
        help="Stock symbols to fetch (e.g., AAPL MSFT GOOGL)"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=365,
        help="Number of days of history to fetch (default: 365)"
    )
    parser.add_argument(
        "--start",
        type=str,
        help="Start date (YYYY-MM-DD), overrides --days"
    )
    parser.add_argument(
        "--end",
        type=str,
        help="End date (YYYY-MM-DD), defaults to today"
    )
    
    args = parser.parse_args()
    
    # Calculate date range
    end_date = args.end or datetime.now().strftime("%Y-%m-%d")
    if args.start:
        start_date = args.start
    else:
        start_date = (datetime.now() - timedelta(days=args.days)).strftime("%Y-%m-%d")
    
    # Initialize database
    print(f"Initializing database at {DB_PATH}")
    conn = init_database()
    
    # Fetch data for each symbol
    total_rows = 0
    for symbol in args.symbols:
        try:
            rows = fetch_and_store_prices(conn, symbol, start_date, end_date)
            total_rows += rows
        except Exception as e:
            print(f"Error processing {symbol}: {e}")
    
    conn.close()
    print(f"\nDone! Total rows inserted/updated: {total_rows}")
    print(f"Database location: {DB_PATH}")


if __name__ == "__main__":
    main()
