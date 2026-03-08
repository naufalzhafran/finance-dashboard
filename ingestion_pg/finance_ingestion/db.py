"""PostgreSQL database utilities for ingestion scripts."""

import os
from contextlib import contextmanager
from datetime import date

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/finance_db")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_or_create_asset(session, symbol: str, name: str, asset_type: str, currency: str) -> int:
    """Return asset id, inserting if missing."""
    row = session.execute(
        text("SELECT id FROM assets WHERE symbol = :s"), {"s": symbol.upper()}
    ).fetchone()

    if row:
        session.execute(
            text("UPDATE assets SET name = :n, currency = :c WHERE symbol = :s"),
            {"n": name, "c": currency, "s": symbol.upper()},
        )
        return row[0]

    result = session.execute(
        text(
            "INSERT INTO assets (symbol, name, asset_type, currency) "
            "VALUES (:s, :n, :t, :c) RETURNING id"
        ),
        {"s": symbol.upper(), "n": name, "t": asset_type, "c": currency},
    )
    return result.fetchone()[0]


def upsert_price(session, asset_id: int, price_date: date, open_: float | None,
                 high: float | None, low: float | None, close: float | None, volume: int | None):
    session.execute(
        text("""
            INSERT INTO price_history (asset_id, date, open, high, low, close, volume)
            VALUES (:aid, :d, :o, :h, :l, :c, :v)
            ON CONFLICT (asset_id, date) DO UPDATE SET
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                volume = EXCLUDED.volume
        """),
        {"aid": asset_id, "d": price_date, "o": open_, "h": high, "l": low, "c": close, "v": volume},
    )


def upsert_fundamentals(session, asset_id: int, today: date, metrics: dict):
    fields = list(metrics.keys())
    set_clause = ", ".join(f"{f} = EXCLUDED.{f}" for f in fields)
    columns = "asset_id, date, " + ", ".join(fields)
    placeholders = ":asset_id, :today, " + ", ".join(f":{f}" for f in fields)

    params = {"asset_id": asset_id, "today": today, **metrics}
    session.execute(
        text(f"""
            INSERT INTO fundamentals ({columns})
            VALUES ({placeholders})
            ON CONFLICT (asset_id, date) DO UPDATE SET {set_clause}
        """),
        params,
    )


def upsert_financials(session, table: str, asset_id: int, record_date: date,
                      period_type: str, data: dict):
    fields = list(data.keys())
    if not fields:
        return
    set_clause = ", ".join(f"{f} = EXCLUDED.{f}" for f in fields)
    columns = "asset_id, date, period_type, " + ", ".join(fields)
    placeholders = ":asset_id, :d, :pt, " + ", ".join(f":{f}" for f in fields)

    params = {"asset_id": asset_id, "d": record_date, "pt": period_type, **data}
    session.execute(
        text(f"""
            INSERT INTO {table} ({columns})
            VALUES ({placeholders})
            ON CONFLICT (asset_id, date, period_type) DO UPDATE SET {set_clause}
        """),
        params,
    )
