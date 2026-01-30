#!/usr/bin/env python3
"""
Daily Finance Data Update Script

This script orchestrates the daily update of financial data.
It runs the ingestion scripts for both IDX stocks and Global assets.
By default, it fetches data for the last 3 days to ensure any missed runs are covered.

Usage:
    python ingest_daily.py              # Update with 3-day lookback
    python ingest_daily.py --days 1     # Update only yesterday/today
"""

import argparse
import sys
from datetime import datetime, timedelta
import ingest_idx
import ingest_global


def main():
    parser = argparse.ArgumentParser(description="Daily Financial Data Update")
    parser.add_argument(
        "--days", 
        type=int, 
        default=3, 
        help="Number of days to look back (default: 3)"
    )
    args = parser.parse_args()
    
    # Calculate date range
    today = datetime.now().date()
    start_date = (today - timedelta(days=args.days)).isoformat()
    end_date = today.isoformat()
    
    print("=" * 60)
    print(f"FINANCE DASHBOARD DAILY UPDATE")
    print(f"Date: {today}")
    print(f"Window: {args.days} days ({start_date} to {end_date})")
    print("=" * 60)
    print("\n")
    
    # Track success of each module
    idx_success = False
    global_success = False
    
    # 1. Update IDX Data
    print(">>> STARTING IDX UPDATE")
    try:
        idx_success = ingest_idx.run(start_date, end_date)
    except Exception as e:
        print(f"❌ Error running ingest_idx: {e}")
        
    print("\n")
    
    # 2. Update Global Data
    print(">>> STARTING GLOBAL UPDATE")
    try:
        global_success = ingest_global.run(start_date, end_date)
    except Exception as e:
        print(f"❌ Error running ingest_global: {e}")
        
    print("\n" + "=" * 60)
    if idx_success and global_success:
        print("🎉 DAILY UPDATE COMPLETED SUCCESSFULLY")
        sys.exit(0)
    else:
        if not idx_success:
            print("⚠️ IDX UPDATE FAILED (or had partial errors)")
        if not global_success:
            print("⚠️ GLOBAL UPDATE FAILED (or had partial errors)")
        print("⚠️ COMPLETED WITH ISSUES")
        sys.exit(1)


if __name__ == "__main__":
    main()
