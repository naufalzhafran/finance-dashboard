#!/usr/bin/env python3
"""Daily ingestion orchestrator - runs both IDX and global ingestion."""

import argparse
from datetime import datetime, timedelta

from finance_ingestion.ingest_idx import run as run_idx
from finance_ingestion.ingest_global import run as run_global


def main():
    parser = argparse.ArgumentParser(description="Run daily data ingestion for all assets")
    parser.add_argument("--start", type=str, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", type=str, help="End date (YYYY-MM-DD)")
    parser.add_argument("--days", type=int, default=3, help="Lookback days (default: 3)")
    parser.add_argument("--skip-idx", action="store_true", help="Skip IDX stocks")
    parser.add_argument("--skip-global", action="store_true", help="Skip global assets")
    args = parser.parse_args()

    end_date = args.end or datetime.now().strftime("%Y-%m-%d")
    start_date = args.start or (datetime.now() - timedelta(days=args.days)).strftime("%Y-%m-%d")

    print(f"\n{'=' * 60}")
    print("Daily Ingestion Run")
    print(f"Date range: {start_date} → {end_date}")
    print(f"{'=' * 60}\n")

    if not args.skip_global:
        print("\n--- Global Assets ---")
        run_global(start_date, end_date)

    if not args.skip_idx:
        print("\n--- IDX Stocks ---")
        run_idx(start_date, end_date)

    print("\nAll done.")


if __name__ == "__main__":
    main()
