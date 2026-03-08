#!/usr/bin/env python3
"""Global Market Data Ingestion - PostgreSQL version (uv)."""

import argparse
import time
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
import yfinance as yf

from finance_ingestion.db import get_session, get_or_create_asset, upsert_price

GLOBAL_ASSETS = {
    "^JKSE": {"name": "IDX Composite (IHSG)", "type": "index", "currency": "IDR"},
    "USDIDR=X": {"name": "USD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "EURIDR=X": {"name": "EUR/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "GBPIDR=X": {"name": "GBP/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "JPYIDR=X": {"name": "JPY/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "SGDIDR=X": {"name": "SGD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "AUDIDR=X": {"name": "AUD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "HKDIDR=X": {"name": "HKD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "CHFIDR=X": {"name": "CHF/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "CADIDR=X": {"name": "CAD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "NZDIDR=X": {"name": "NZD/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "KRWIDR=X": {"name": "KRW/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "MYRIDR=X": {"name": "MYR/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "THBIDR=X": {"name": "THB/IDR Exchange Rate", "type": "currency", "currency": "IDR"},
    "GC=F": {"name": "Gold Futures (CME)", "type": "commodity", "currency": "USD"},
    "SI=F": {"name": "Silver Futures (CME)", "type": "commodity", "currency": "USD"},
    "PL=F": {"name": "Platinum Futures (CME)", "type": "commodity", "currency": "USD"},
    "PA=F": {"name": "Palladium Futures (CME)", "type": "commodity", "currency": "USD"},
    "CL=F": {"name": "Crude Oil WTI Futures", "type": "commodity", "currency": "USD"},
    "BZ=F": {"name": "Brent Crude Oil Futures", "type": "commodity", "currency": "USD"},
    "NG=F": {"name": "Natural Gas Futures", "type": "commodity", "currency": "USD"},
    "HG=F": {"name": "Copper Futures", "type": "commodity", "currency": "USD"},
    "ALI=F": {"name": "Aluminum Futures", "type": "commodity", "currency": "USD"},
    "ZC=F": {"name": "Corn Futures", "type": "commodity", "currency": "USD"},
    "ZS=F": {"name": "Soybean Futures", "type": "commodity", "currency": "USD"},
    "ZW=F": {"name": "Wheat Futures", "type": "commodity", "currency": "USD"},
    "KC=F": {"name": "Coffee Futures", "type": "commodity", "currency": "USD"},
    "SB=F": {"name": "Sugar Futures", "type": "commodity", "currency": "USD"},
    "CC=F": {"name": "Cocoa Futures", "type": "commodity", "currency": "USD"},
    "CPO=F": {"name": "Crude Palm Oil Futures", "type": "commodity", "currency": "USD"},
    "BTC-USD": {"name": "Bitcoin USD", "type": "crypto", "currency": "USD"},
    "ETH-USD": {"name": "Ethereum USD", "type": "crypto", "currency": "USD"},
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


def fetch_and_store(symbol: str, info: dict, start_date: str, end_date: str) -> int:
    ticker = yf.Ticker(symbol)
    try:
        df = ticker.history(start=start_date, end=end_date)
    except Exception as e:
        print(f"    Error fetching {symbol}: {e}")
        return 0

    if df.empty:
        print(f"    No data for {symbol}")
        return 0

    count = 0
    with get_session() as session:
        asset_id = get_or_create_asset(
            session, symbol, info["name"], info["type"], info["currency"]
        )
        for dt, row in df.iterrows():
            volume = int(row["Volume"]) if pd.notna(row["Volume"]) else None
            upsert_price(
                session, asset_id, dt.date(),
                round(row["Open"], 6) if pd.notna(row["Open"]) else None,
                round(row["High"], 6) if pd.notna(row["High"]) else None,
                round(row["Low"], 6) if pd.notna(row["Low"]) else None,
                round(row["Close"], 6) if pd.notna(row["Close"]) else None,
                volume,
            )
            count += 1

    return count


def run(start_date: str, end_date: str, symbols: Optional[list[str]] = None,
        delay: float = 0.5) -> bool:
    if not symbols:
        symbols = list(GLOBAL_ASSETS.keys())

    print("=" * 60)
    print("Global Market Data Ingestion → PostgreSQL")
    print(f"Date Range: {start_date} to {end_date}")
    print(f"Assets: {len(symbols)}")
    print("=" * 60)

    total, ok, fail = 0, 0, []
    for i, symbol in enumerate(symbols, 1):
        info = GLOBAL_ASSETS.get(symbol, {"name": symbol, "type": "unknown", "currency": "USD"})
        print(f"\n[{i}/{len(symbols)}] {symbol}...")
        try:
            rows = fetch_and_store(symbol, info, start_date, end_date)
            total += rows
            if rows > 0:
                ok += 1
            else:
                fail.append(symbol)
        except KeyboardInterrupt:
            return False
        except Exception as e:
            print(f"    Error: {e}")
            fail.append(symbol)
        if i < len(symbols):
            time.sleep(delay)

    print(f"\nDone. Success={ok}, Failed={len(fail)}, Rows={total}")
    if fail:
        print("Failed:", fail)
    return True


def main():
    parser = argparse.ArgumentParser(description="Ingest global market data into PostgreSQL")
    parser.add_argument("--symbols", nargs="+")
    parser.add_argument("--years", type=int, default=10)
    parser.add_argument("--start", type=str)
    parser.add_argument("--end", type=str)
    parser.add_argument("--delay", type=float, default=0.5)
    args = parser.parse_args()

    end_date = args.end or datetime.now().strftime("%Y-%m-%d")
    start_date = args.start or (datetime.now() - timedelta(days=args.years * 365)).strftime("%Y-%m-%d")
    symbols = args.symbols or None

    run(start_date, end_date, symbols, args.delay)


if __name__ == "__main__":
    main()
