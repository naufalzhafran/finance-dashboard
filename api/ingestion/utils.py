"""Shared utilities for ingestion scripts."""

import math
import time
from datetime import datetime, timedelta
from typing import Callable

import pandas as pd

from ingestion.db import get_session, upsert_price, upsert_financials


def safe_float(val) -> float | None:
    try:
        v = float(val)
        return None if math.isnan(v) else v
    except (TypeError, ValueError):
        return None


def store_prices(session, asset_id: int, df, precision: int = 4) -> int:
    count = 0
    for dt, row in df.iterrows():
        upsert_price(
            session, asset_id, dt.date(),
            round(row["Open"], precision) if pd.notna(row["Open"]) else None,
            round(row["High"], precision) if pd.notna(row["High"]) else None,
            round(row["Low"], precision) if pd.notna(row["Low"]) else None,
            round(row["Close"], precision) if pd.notna(row["Close"]) else None,
            int(row["Volume"]) if pd.notna(row["Volume"]) else None,
        )
        count += 1
    return count


def store_financial_df(session, asset_id: int, df, period_type: str, table: str, mapping: dict):
    if df is None or df.empty:
        return
    for date_col in df.columns:
        data = {}
        for db_col, yf_keys in mapping.items():
            for key in yf_keys:
                if key in df.index:
                    val = safe_float(df.loc[key, date_col])
                    if val is not None:
                        data[db_col] = val
                        break
        if data:
            upsert_financials(session, table, asset_id, date_col.date(), period_type, data)


def run_loop(symbols: list[str], fetch_fn: Callable[[str], int], delay: float = 0.5) -> bool:
    """Iterate symbols, call fetch_fn(symbol), track progress and sleep between calls."""
    total, ok, fail = 0, 0, []
    for i, symbol in enumerate(symbols, 1):
        print(f"\n[{i}/{len(symbols)}] {symbol}...")
        try:
            rows = fetch_fn(symbol)
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


def parse_date_range(args, default_years: int = 10) -> tuple[str, str]:
    """Resolve start/end date strings from parsed argparse args."""
    end_date = args.end or datetime.now().strftime("%Y-%m-%d")
    years = getattr(args, "years", default_years)
    start_date = args.start or (datetime.now() - timedelta(days=years * 365)).strftime("%Y-%m-%d")
    return start_date, end_date
