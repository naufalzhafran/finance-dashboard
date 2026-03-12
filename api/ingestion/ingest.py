#!/usr/bin/env python3
"""Data ingestion CLI — all tracked assets."""

import argparse
from datetime import date, datetime, timedelta

import yfinance as yf

from ingestion.db import get_session, get_or_create_asset, get_tracked_assets, upsert_fundamentals
from ingestion.utils import safe_float, store_prices, store_financial_df, run_loop

FUNDAMENTALS_MAPPING = {
    "market_cap": "marketCap",
    "enterprise_value": "enterpriseValue",
    "trailing_pe": "trailingPE",
    "forward_pe": "forwardPE",
    "peg_ratio": "pegRatio",
    "price_to_book": "priceToBook",
    "profit_margins": "profitMargins",
    "operating_margins": "operatingMargins",
    "return_on_assets": "returnOnAssets",
    "return_on_equity": "returnOnEquity",
    "revenue_growth": "revenueGrowth",
    "earnings_growth": "earningsGrowth",
    "debt_to_equity": "debtToEquity",
    "total_cash": "totalCash",
    "total_debt": "totalDebt",
    "total_revenue": "totalRevenue",
    "gross_profits": "grossProfits",
    "free_cashflow": "freeCashflow",
    "operating_cashflow": "operatingCashflow",
    "trailing_eps": "trailingEps",
    "forward_eps": "forwardEps",
    "price_to_sales": "priceToSalesTrailing12Months",
    "dividend_yield": "dividendYield",
    "dividend_rate": "dividendRate",
    "payout_ratio": "payoutRatio",
    "five_year_avg_dividend_yield": "fiveYearAvgDividendYield",
}

INCOME_MAPPING = {
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
    "reconciled_depreciation": ["Reconciled Depreciation"],
}

BALANCE_MAPPING = {
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
    "total_non_current_liabilities_net_minority_interest": [
        "Total Non Current Liabilities Net Minority Interest"
    ],
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
    "tangible_book_value": ["Tangible Book Value"],
}

CF_MAPPING = {
    "operating_cash_flow": ["Operating Cash Flow"],
    "investing_cash_flow": ["Investing Cash Flow"],
    "financing_cash_flow": ["Financing Cash Flow"],
    "end_cash_position": ["End Cash Position"],
    "capital_expenditure": ["Capital Expenditure"],
    "issuance_of_capital_stock": ["Issuance Of Capital Stock"],
    "issuance_of_debt": ["Issuance Of Debt"],
    "repayment_of_debt": ["Repayment Of Debt"],
    "repurchase_of_capital_stock": ["Repurchase Of Capital Stock"],
    "free_cash_flow": ["Free Cash Flow"],
}


def fetch_asset(yahoo_symbol: str, start_date: str, end_date: str) -> int:
    is_idx = yahoo_symbol.endswith(".JK")
    ticker = yf.Ticker(yahoo_symbol)

    try:
        df = ticker.history(start=start_date, end=end_date)
    except Exception as e:
        print(f"    Error fetching {yahoo_symbol}: {e}")
        return 0

    if df.empty:
        print(f"    No data for {yahoo_symbol}")
        return 0

    with get_session() as session:
        if is_idx:
            symbol = yahoo_symbol.removesuffix(".JK")
            try:
                info = ticker.info
                name = info.get("longName") or info.get("shortName") or symbol
            except Exception:
                info, name = {}, symbol

            asset_id = get_or_create_asset(session, symbol, name, "stock", "IDR", yahoo_symbol=yahoo_symbol)
            count = store_prices(session, asset_id, df, precision=4)

            try:
                clean = {k: safe_float(info.get(yf_key)) for k, yf_key in FUNDAMENTALS_MAPPING.items()
                         if info.get(yf_key) is not None}
                if clean:
                    upsert_fundamentals(session, asset_id, date.today(), clean)
            except Exception as e:
                print(f"    Fundamentals error: {e}")

            try:
                store_financial_df(session, asset_id, ticker.financials, "annual", "financials_income", INCOME_MAPPING)
                store_financial_df(session, asset_id, ticker.balance_sheet, "annual", "financials_balance", BALANCE_MAPPING)
                store_financial_df(session, asset_id, ticker.cashflow, "annual", "financials_cashflow", CF_MAPPING)
                store_financial_df(session, asset_id, ticker.quarterly_financials, "quarterly", "financials_income", INCOME_MAPPING)
                store_financial_df(session, asset_id, ticker.quarterly_balance_sheet, "quarterly", "financials_balance", BALANCE_MAPPING)
                store_financial_df(session, asset_id, ticker.quarterly_cashflow, "quarterly", "financials_cashflow", CF_MAPPING)
            except Exception as e:
                print(f"    Financials error: {e}")
        else:
            asset_id = get_or_create_asset(
                session, yahoo_symbol, yahoo_symbol, "unknown", "USD", yahoo_symbol=yahoo_symbol
            )
            count = store_prices(session, asset_id, df, precision=6)

    return count


def run_all(start_date: str, end_date: str, symbols: list[str] = None,
            delay: float = 0.5) -> bool:
    if not symbols:
        with get_session() as session:
            assets = get_tracked_assets(session)

        if not assets:
            print("No tracked assets in DB. Add assets manually via API.")
            return True

        symbols = [a["yahoo_symbol"] or a["symbol"] for a in assets]

    if not symbols:
        print("No tracked assets in DB. Add assets manually via API.")
        return True

    print("=" * 60)
    print("Asset Data Ingestion → PostgreSQL")
    print(f"Date Range: {start_date} to {end_date}  |  Assets: {len(symbols)}")
    print("=" * 60)
    return run_loop(symbols, lambda s: fetch_asset(s, start_date, end_date), delay)


def main():
    parser = argparse.ArgumentParser(description="Finance data ingestion")
    parser.add_argument("--symbols", nargs="+", help="Specific symbols to fetch")
    parser.add_argument("--years", type=int, default=10, help="Years of historical data")
    parser.add_argument("--start", type=str, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end", type=str, help="End date (YYYY-MM-DD)")
    parser.add_argument("--days", type=int, help="Override years with number of days")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay between requests")

    args = parser.parse_args()

    end = args.end or datetime.now().strftime("%Y-%m-%d")
    if args.days:
        start = (datetime.now() - timedelta(days=args.days)).strftime("%Y-%m-%d")
    else:
        start = args.start or (datetime.now() - timedelta(days=args.years * 365)).strftime("%Y-%m-%d")

    symbols = [s.upper() for s in args.symbols] if args.symbols else None
    run_all(start, end, symbols, args.delay)
    print("\nDone.")


if __name__ == "__main__":
    main()
