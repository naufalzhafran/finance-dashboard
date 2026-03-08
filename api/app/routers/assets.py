from datetime import datetime, timedelta

import yfinance as yf
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetSchema, TickerCreate

router = APIRouter(prefix="/assets", tags=["assets"])
tickers_router = APIRouter(prefix="/tickers", tags=["tickers"])


# ---------------------------------------------------------------------------
# Assets
# ---------------------------------------------------------------------------

@router.get("", response_model=list[AssetSchema])
def get_assets(asset_type: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Asset).order_by(Asset.symbol)
    if asset_type:
        query = query.filter(Asset.asset_type == asset_type)
    return query.all()


@router.get("/{symbol}", response_model=AssetSchema)
def get_asset(symbol: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{symbol}' not found")
    return asset


# ---------------------------------------------------------------------------
# Tickers (tracked asset management)
# ---------------------------------------------------------------------------

def _derive_symbol(yahoo_symbol: str) -> str:
    return yahoo_symbol.removesuffix(".JK").upper()


def _validate_and_fetch_info(yahoo_symbol: str) -> dict:
    try:
        ticker = yf.Ticker(yahoo_symbol)
        info = ticker.fast_info
        if not hasattr(info, "last_price") or info.last_price is None:
            raise ValueError("no price data")
        return {
            "name": getattr(ticker.info, "longName", None)
                    or getattr(ticker.info, "shortName", None)
                    or yahoo_symbol,
        }
    except Exception:
        try:
            i = yf.Ticker(yahoo_symbol).info
            if not i or (i.get("trailingPegRatio") is None and not i.get("symbol")):
                raise ValueError("invalid")
            return {"name": i.get("longName") or i.get("shortName") or yahoo_symbol}
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Yahoo Finance symbol '{yahoo_symbol}' not found or has no data.",
            )


def _background_fetch(yahoo_symbol: str, asset_type: str):
    from ingestion.ingest import fetch_idx, fetch_global
    end = datetime.now().strftime("%Y-%m-%d")
    start = (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d")
    if yahoo_symbol.endswith(".JK"):
        fetch_idx(yahoo_symbol.removesuffix(".JK").upper(), start, end)
    else:
        fetch_global(yahoo_symbol, start, end)


@tickers_router.get("", response_model=list[AssetSchema])
def list_tickers(asset_type: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Asset).filter(Asset.tracked == True).order_by(Asset.asset_type, Asset.symbol)  # noqa: E712
    if asset_type:
        query = query.filter(Asset.asset_type == asset_type)
    return query.all()


@tickers_router.post("", response_model=AssetSchema, status_code=status.HTTP_201_CREATED)
def add_ticker(body: TickerCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    yahoo_symbol = body.yahoo_symbol.strip()
    symbol = _derive_symbol(yahoo_symbol)

    existing = db.query(Asset).filter(Asset.symbol == symbol).first()
    if existing:
        if existing.tracked:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail=f"'{symbol}' is already being tracked.")
        existing.tracked = True
        existing.yahoo_symbol = yahoo_symbol
        db.commit()
        db.refresh(existing)
        background_tasks.add_task(_background_fetch, yahoo_symbol, body.asset_type)
        return existing

    info = _validate_and_fetch_info(yahoo_symbol)
    asset = Asset(
        symbol=symbol,
        name=info["name"],
        asset_type=body.asset_type,
        currency=body.currency.upper(),
        yahoo_symbol=yahoo_symbol,
        tracked=True,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    background_tasks.add_task(_background_fetch, yahoo_symbol, body.asset_type)
    return asset


@tickers_router.delete("/{symbol}", status_code=status.HTTP_200_OK)
def remove_ticker(symbol: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"'{symbol}' not found.")
    asset.tracked = False
    db.commit()
    return {"detail": f"'{symbol}' untracked. Historical data retained."}
