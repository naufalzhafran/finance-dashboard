#!/usr/bin/env python3
"""Indonesian Stock Exchange (IDX) Data Ingestion - PostgreSQL version (uv)."""

import argparse
import time
from datetime import date, datetime, timedelta
from typing import Optional
import math

import pandas as pd
import yfinance as yf

from finance_ingestion.db import (
    get_session, get_or_create_asset, upsert_price,
    upsert_fundamentals, upsert_financials,
)

IDX_STOCKS = [
    # Banking
    "BBCA", "BBRI", "BMRI", "BBNI", "BRIS", "BTPS", "BJTM", "BDMN", "BNII",
    "MEGA", "NISP", "PNBN", "BNGA", "BJBR", "BSIM", "AGRO", "BBYB", "BGTG",
    "BBTN", "BBKP", "BKSW", "BMAS", "BNBA", "BTPN", "DNAR", "NOBU", "SDRA",
    "ARTO", "AMAR", "BABP", "BVIC", "INPC", "MCOR",
    # Consumer Goods
    "UNVR", "ICBP", "INDF", "KLBF", "HMSP", "GGRM", "MYOR", "CINT", "DLTA",
    "ULTJ", "SIDO", "MLBI", "CLEO", "GOOD", "HOKI", "ADES", "CAMP", "FOOD",
    "STTP", "AISA", "SKBM", "SKLT", "CEKA", "PSDN", "BUDI", "ALTO", "PCAR",
    "KEJU", "TBLA", "CMRY", "IKAN",
    # Telecommunications
    "TLKM", "EXCL", "ISAT", "TOWR", "TBIG", "MTEL", "JAST", "SUPR",
    # Mining & Energy
    "ADRO", "ITMG", "PTBA", "INDY", "BUMI", "BSSR", "HRUM", "GEMS", "DOID",
    "MBAP", "KKGI", "BYAN", "UNTR", "MYOH", "DSSA", "TOBA", "MEDC", "ELSA",
    "RUIS", "ANTM", "INCO", "TINS", "MDKA", "PSAB", "FIRE", "MBMA", "BRMS",
    "CUAN", "NCKL", "ZINC", "IFSH", "NICL", "ESSA",
    # Infrastructure & Construction
    "JSMR", "WIKA", "WSKT", "PTPP", "ADHI", "TOTL", "ACST", "IDPR", "NRCA",
    "SSIA", "WTON", "WSBP", "CSIS", "MTLA", "DGIK", "MTRA",
    # Property
    "BSDE", "CTRA", "SMRA", "PWON", "LPKR", "DILD", "APLN", "ASRI", "JRPT",
    "MDLN", "KIJA", "PPRO", "GWSA", "MMLP", "DUTI", "BEST", "MKPI", "PLIN",
    "BKSL", "GPRA", "GAMA", "LPCK", "URBN", "PANI", "TRIN", "POLL", "REAL",
    # Automotive
    "ASII", "AUTO", "GJTL", "SMSM", "IMAS", "INDS", "BRAM", "LPIN", "PRAS",
    "BOLT", "DRMA", "AMIN", "MPMX",
    # Retail
    "ACES", "MAPI", "LPPF", "RALS", "ERAA", "MAPA", "AMRT", "RANC", "HERO",
    "CSAP", "MPPA", "CENT", "ECII", "KOIN", "GLOB", "MIDI", "SMAR", "TELE",
    # Healthcare
    "PYFA", "KAEF", "MIKA", "SILO", "PRDA", "HEAL", "SAME", "BMHS", "CARE",
    "SRAJ", "DVLA", "TSPC", "PEHA",
    # Media
    "SCMA", "MNCN", "VIVA", "LPLI", "KPIG", "FILM", "EMTK",
    # Chemicals
    "BRPT", "TPIA", "INKP", "TKIM", "FASW", "UNIC", "DPNS", "SRSN", "INCI",
    "EKAD", "MDKI", "IPOL",
    # Industrial
    "SMGR", "INTP", "TOTO", "CPIN", "JPFA", "MAIN", "SIPD", "SULI", "KRAS",
    "ISSP", "LION", "LMSH", "GDST", "BTON", "JKSW", "ALMI", "NIKL", "BAJA",
    # Transportation
    "GIAA", "ASSA", "BIRD", "BLTA", "CMPP", "HITS", "IPCM", "LEAD", "LRNA",
    "MBSS", "NELY", "PSSI", "RAJA", "SAFE", "SAPX", "SHIP", "SMDR", "SOCI",
    "TAMU", "TMAS", "WEHA", "ZBRA", "BPII", "KARW", "PORT",
    # Technology
    "BUKA", "GOTO", "DCII", "MTDL", "LUCK", "DNET", "PURE",
    "BREN", "CASH", "KIOS", "EDGE", "RUNS",
    # Other
    "PGAS", "AKRA", "META", "WIFI", "LINK",
    "BFIN", "ADMF", "CFIN", "VRNA", "SMMA", "TRIM", "PANS",
    "MREI", "ABMM", "PNLF", "LPGI", "ASDM", "KREN", "WOWS", "AGII",
    "AMMN", "TAPG", "SGER", "STRK",
    # Agriculture
    "LSIP", "AALI", "SIMP", "SGRO", "DSNG", "BWPT", "PALM", "SSMS", "JARR",
    "RATU", "PTRO",
]

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


def _safe_float(val) -> float | None:
    try:
        v = float(val)
        return None if math.isnan(v) else v
    except (TypeError, ValueError):
        return None


def store_financial_df(session, asset_id: int, df, period_type: str, table: str, mapping: dict):
    if df is None or df.empty:
        return
    for date_col in df.columns:
        data = {}
        for db_col, yf_keys in mapping.items():
            for key in yf_keys:
                if key in df.index:
                    val = _safe_float(df.loc[key, date_col])
                    if val is not None:
                        data[db_col] = val
                        break
        if data:
            upsert_financials(session, table, asset_id, date_col.date(), period_type, data)


def fetch_and_store_idx(symbol: str, start_date: str, end_date: str) -> int:
    yahoo_symbol = f"{symbol}.JK"
    ticker = yf.Ticker(yahoo_symbol)

    try:
        df = ticker.history(start=start_date, end=end_date)
    except Exception as e:
        print(f"    Price fetch error: {e}")
        return 0

    if df.empty:
        print(f"    No price data for {symbol}")
        return 0

    with get_session() as session:
        try:
            info = ticker.info
            name = info.get("longName") or info.get("shortName") or symbol
        except Exception:
            name = symbol

        asset_id = get_or_create_asset(session, symbol, name, "stock", "IDR")

        count = 0
        for dt, row in df.iterrows():
            upsert_price(
                session, asset_id, dt.date(),
                round(row["Open"], 4) if pd.notna(row["Open"]) else None,
                round(row["High"], 4) if pd.notna(row["High"]) else None,
                round(row["Low"], 4) if pd.notna(row["Low"]) else None,
                round(row["Close"], 4) if pd.notna(row["Close"]) else None,
                int(row["Volume"]) if pd.notna(row["Volume"]) else None,
            )
            count += 1

        # Fundamentals
        try:
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
                "price_to_sales": info.get("priceToSalesTrailing12Months"),
                "dividend_yield": info.get("dividendYield"),
                "dividend_rate": info.get("dividendRate"),
                "payout_ratio": info.get("payoutRatio"),
                "five_year_avg_dividend_yield": info.get("fiveYearAvgDividendYield"),
            }
            clean = {k: _safe_float(v) for k, v in metrics.items() if v is not None}
            if clean:
                upsert_fundamentals(session, asset_id, date.today(), clean)
        except Exception as e:
            print(f"    Fundamentals error: {e}")

        # Financials
        try:
            store_financial_df(session, asset_id, ticker.financials, "annual",
                               "financials_income", INCOME_MAPPING)
            store_financial_df(session, asset_id, ticker.balance_sheet, "annual",
                               "financials_balance", BALANCE_MAPPING)
            store_financial_df(session, asset_id, ticker.cashflow, "annual",
                               "financials_cashflow", CF_MAPPING)
            store_financial_df(session, asset_id, ticker.quarterly_financials, "quarterly",
                               "financials_income", INCOME_MAPPING)
            store_financial_df(session, asset_id, ticker.quarterly_balance_sheet, "quarterly",
                               "financials_balance", BALANCE_MAPPING)
            store_financial_df(session, asset_id, ticker.quarterly_cashflow, "quarterly",
                               "financials_cashflow", CF_MAPPING)
        except Exception as e:
            print(f"    Financials error: {e}")

    return count


def run(start_date: str, end_date: str, symbols: Optional[list[str]] = None,
        delay: float = 0.5) -> bool:
    if not symbols:
        symbols = sorted(set(IDX_STOCKS))

    print("=" * 60)
    print("IDX Stock Data Ingestion → PostgreSQL")
    print(f"Date Range: {start_date} to {end_date}")
    print(f"Stocks: {len(symbols)}")
    print("=" * 60)

    total, ok, fail = 0, 0, []
    for i, symbol in enumerate(symbols, 1):
        print(f"\n[{i}/{len(symbols)}] {symbol}...")
        try:
            rows = fetch_and_store_idx(symbol, start_date, end_date)
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
    parser = argparse.ArgumentParser(description="Ingest IDX stocks into PostgreSQL")
    parser.add_argument("--symbols", nargs="+")
    parser.add_argument("--years", type=int, default=10)
    parser.add_argument("--start", type=str)
    parser.add_argument("--end", type=str)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--delay", type=float, default=0.5)
    args = parser.parse_args()

    end_date = args.end or datetime.now().strftime("%Y-%m-%d")
    start_date = args.start or (datetime.now() - timedelta(days=args.years * 365)).strftime("%Y-%m-%d")
    symbols = [s.upper() for s in args.symbols] if args.symbols else None
    if args.limit and symbols:
        symbols = symbols[: args.limit]

    run(start_date, end_date, symbols, args.delay)


if __name__ == "__main__":
    main()
