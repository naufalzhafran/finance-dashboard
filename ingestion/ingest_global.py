#!/usr/bin/env python3
"""
Global Market Data Ingestion Script

Fetches global market data including:
- Currency exchange rates (IDR/USD)
- Gold prices
- Bitcoin prices  
- Major international indices

Uses Yahoo Finance API and stores data in the local SQLite database.

Usage:
    python ingest_global.py                 # Fetch all global assets (5 years)
    python ingest_global.py --years 3       # Fetch 3 years of data
    python ingest_global.py --symbols ^GSPC BTC-USD  # Fetch specific symbols
"""

import argparse
import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd
import yfinance as yf


# Database path - relative to this script
DB_PATH = Path(__file__).parent / "finance_data.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"

# Global assets to track
GLOBAL_ASSETS = {
    # ==================== INDONESIAN INDEX ====================
    # IHSG (Jakarta Composite Index)
    "^JKSE": {"name": "IDX Composite (IHSG)", "type": "index", "currency": "IDR"},
    
    # ==================== IDR CURRENCY PAIRS ====================
    # IDR vs Major Currencies
    "USDIDR=X": {"name": "USD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "EURIDR=X": {"name": "EUR/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "GBPIDR=X": {"name": "GBP/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "JPYIDR=X": {"name": "JPY/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "CNYIDR=X": {"name": "CNY/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "SGDIDR=X": {"name": "SGD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "AUDIDR=X": {"name": "AUD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "HKDIDR=X": {"name": "HKD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "CHFIDR=X": {"name": "CHF/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "CADIDR=X": {"name": "CAD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "NZDIDR=X": {"name": "NZD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "KRWIDR=X": {"name": "KRW/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "MYRIDR=X": {"name": "MYR/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "THBIDR=X": {"name": "THB/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "INRIDR=X": {"name": "INR/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    
    # ==================== COMMODITIES ====================
    # Precious Metals
    "GC=F": {"name": "Gold Futures (CME)", "type": "commodity", "currency": "USD"},
    "SI=F": {"name": "Silver Futures (CME)", "type": "commodity", "currency": "USD"},
    "PL=F": {"name": "Platinum Futures (CME)", "type": "commodity", "currency": "USD"},
    "PA=F": {"name": "Palladium Futures (CME)", "type": "commodity", "currency": "USD"},
    
    # Energy
    "CL=F": {"name": "Crude Oil WTI Futures", "type": "commodity", "currency": "USD"},
    "BZ=F": {"name": "Brent Crude Oil Futures", "type": "commodity", "currency": "USD"},
    "NG=F": {"name": "Natural Gas Futures", "type": "commodity", "currency": "USD"},
    "RB=F": {"name": "RBOB Gasoline Futures", "type": "commodity", "currency": "USD"},
    "HO=F": {"name": "Heating Oil Futures", "type": "commodity", "currency": "USD"},
    
    # Industrial Metals
    "HG=F": {"name": "Copper Futures", "type": "commodity", "currency": "USD"},
    "ALI=F": {"name": "Aluminum Futures", "type": "commodity", "currency": "USD"},
    
    # Agricultural
    "ZC=F": {"name": "Corn Futures", "type": "commodity", "currency": "USD"},
    "ZS=F": {"name": "Soybean Futures", "type": "commodity", "currency": "USD"},
    "ZW=F": {"name": "Wheat Futures", "type": "commodity", "currency": "USD"},
    "KC=F": {"name": "Coffee Futures", "type": "commodity", "currency": "USD"},
    "SB=F": {"name": "Sugar Futures", "type": "commodity", "currency": "USD"},
    "CC=F": {"name": "Cocoa Futures", "type": "commodity", "currency": "USD"},
    "CT=F": {"name": "Cotton Futures", "type": "commodity", "currency": "USD"},
    "CPO=F": {"name": "Crude Palm Oil Futures", "type": "commodity", "currency": "USD"},
    
    # ==================== CRYPTO ====================
    "BTC-USD": {"name": "Bitcoin USD", "type": "crypto", "currency": "USD"},
    "ETH-USD": {"name": "Ethereum USD", "type": "crypto", "currency": "USD"},
    
    # ==================== MAJOR INTERNATIONAL INDICES ====================
    "^GSPC": {"name": "S&P 500", "type": "index", "currency": "USD"},
    "^DJI": {"name": "Dow Jones Industrial Average", "type": "index", "currency": "USD"},
    "^IXIC": {"name": "NASDAQ Composite", "type": "index", "currency": "USD"},
    "^N225": {"name": "Nikkei 225", "type": "index", "currency": "JPY"},
    "^FTSE": {"name": "FTSE 100", "type": "index", "currency": "GBP"},
    "^GDAXI": {"name": "DAX", "type": "index", "currency": "EUR"},
    "^HSI": {"name": "Hang Seng Index", "type": "index", "currency": "HKD"},
    "000001.SS": {"name": "SSE Composite Index", "type": "index", "currency": "CNY"},
    "^STI": {"name": "Straits Times Index", "type": "index", "currency": "SGD"},
    "^KLSE": {"name": "FTSE Bursa Malaysia KLCI", "type": "index", "currency": "MYR"},
    "^SET.BK": {"name": "SET Index Thailand", "type": "index", "currency": "THB"},
}


def init_database() -> sqlite3.Connection:
    """Initialize the database with schema if not exists."""
    conn = sqlite3.connect(DB_PATH)
    
    # Read and execute schema
    if SCHEMA_PATH.exists():
        with open(SCHEMA_PATH, "r") as f:
            conn.executescript(f.read())
    
    return conn


def get_or_create_asset(
    conn: sqlite3.Connection, 
    symbol: str, 
    name: str, 
    asset_type: str,
    currency: str = "USD"
) -> int:
    """Get asset ID, creating the asset if it doesn't exist."""
    cursor = conn.cursor()
    
    # Try to get existing asset
    cursor.execute("SELECT id FROM assets WHERE symbol = ?", (symbol,))
    result = cursor.fetchone()
    
    if result:
        # Update currency if asset exists (in case schema was updated)
        cursor.execute(
            "UPDATE assets SET currency = ? WHERE symbol = ?",
            (currency, symbol)
        )
        conn.commit()
        return result[0]
    
    # Insert new asset with currency
    cursor.execute(
        "INSERT INTO assets (symbol, name, asset_type, currency) VALUES (?, ?, ?, ?)",
        (symbol, name, asset_type, currency)
    )
    conn.commit()
    
    return cursor.lastrowid


def fetch_and_store_prices(
    conn: sqlite3.Connection,
    symbol: str,
    name: str,
    asset_type: str,
    currency: str,
    start_date: str,
    end_date: str
) -> int:
    """Fetch price data from Yahoo Finance and store in database."""
    asset_id = get_or_create_asset(conn, symbol, name, asset_type, currency)
    
    # Fetch historical data
    print(f"  Fetching data for {symbol} ({name})...")
    ticker = yf.Ticker(symbol)
    
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
            # Volume might be 0 or NaN for some assets like currencies
            volume = int(row["Volume"]) if pd.notna(row["Volume"]) else 0
            
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
                    volume
                )
            )
            rows_inserted += 1
        except sqlite3.Error as e:
            print(f"    Error inserting row for {date}: {e}")
    
    conn.commit()
    print(f"    Inserted/updated {rows_inserted} rows")
    return rows_inserted


def get_available_symbols() -> List[str]:
    """Returns the list of all available global asset symbols."""
    return list(GLOBAL_ASSETS.keys())



def run(
    start_date: str,
    end_date: str,
    symbols: Optional[List[str]] = None,
    delay: float = 0.5
) -> bool:
    """
    Run the ingestion process for Global Assets.
    
    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        symbols: Optional list of symbols to process. If None, process all.
        delay: Delay between requests in seconds
        
    Returns:
        True if process completed (even with individual failures), False if critical error.
    """
    if not symbols:
         symbols = get_available_symbols()
    
    print("=" * 60)
    print("Global Market Data Ingestion")
    print("=" * 60)
    print(f"Date Range: {start_date} to {end_date}")
    print(f"Assets to process: {len(symbols)}")
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
        # Handle case where symbol might not be in GLOBAL_ASSETS if passed explicitly
        if symbol in GLOBAL_ASSETS:
            info = GLOBAL_ASSETS[symbol]
        else:
            # Fallback for unknown symbols if we allow them
            info = {"name": symbol, "type": "unknown", "currency": "USD"}
            
        print(f"\n[{i}/{len(symbols)}] Processing {symbol}...")
        
        try:
            rows = fetch_and_store_prices(
                conn, symbol, info["name"], info["type"], info["currency"],
                start_date, end_date
            )
            total_rows += rows
            
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
    print(f"Total assets processed: {len(symbols)}")
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
        description="Fetch global market data (currencies, commodities, crypto, indices) from Yahoo Finance into SQLite"
    )
    parser.add_argument(
        "--symbols",
        nargs="+",
        help="Specific symbols to fetch. If not provided, fetches all global assets."
    )
    parser.add_argument(
        "--years",
        type=int,
        default=5,
        help="Number of years of history to fetch (default: 5)"
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
        "--delay",
        type=float,
        default=0.5,
        help="Delay between requests in seconds (default: 0.5)"
    )
    parser.add_argument(
        "--list-only",
        action="store_true",
        help="Only list available symbols, don't fetch data"
    )
    
    args = parser.parse_args()
    
    # Get symbols to process
    if args.symbols:
        # Validate symbols
        valid_symbols = []
        for s in args.symbols:
            if s in GLOBAL_ASSETS:
                valid_symbols.append(s)
            else:
                print(f"Warning: Unknown symbol '{s}', skipping...")
        symbols = valid_symbols
    else:
        symbols = get_available_symbols()
    
    # If list-only mode, just print symbols and exit
    if args.list_only:
        print(f"Available global market symbols ({len(GLOBAL_ASSETS)}):")
        print()
        print("Currency:")
        for sym, info in GLOBAL_ASSETS.items():
            if info["type"] == "currency":
                print(f"  {sym:<15} - {info['name']}")
        print()
        print("Commodities:")
        for sym, info in GLOBAL_ASSETS.items():
            if info["type"] == "commodity":
                print(f"  {sym:<15} - {info['name']}")
        print()
        print("Crypto:")
        for sym, info in GLOBAL_ASSETS.items():
            if info["type"] == "crypto":
                print(f"  {sym:<15} - {info['name']}")
        print()
        print("Indices:")
        for sym, info in GLOBAL_ASSETS.items():
            if info["type"] == "index":
                print(f"  {sym:<15} - {info['name']}")
        return
    
    if not symbols:
        print("No valid symbols to process.")
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
