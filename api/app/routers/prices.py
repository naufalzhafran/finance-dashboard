from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.models.price_history import PriceHistory
from app.schemas.price import PriceResponse, PriceSchema

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/{symbol}", response_model=PriceResponse)
def get_prices(
    symbol: str,
    start: date | None = Query(default=None),
    end: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{symbol}' not found")

    if end is None:
        end = date.today()
    if start is None:
        start = end - timedelta(days=365)

    prices = (
        db.query(PriceHistory)
        .filter(
            PriceHistory.asset_id == asset.id,
            PriceHistory.date >= start,
            PriceHistory.date <= end,
        )
        .order_by(PriceHistory.date.asc())
        .all()
    )

    latest = (
        db.query(PriceHistory)
        .filter(PriceHistory.asset_id == asset.id)
        .order_by(PriceHistory.date.desc())
        .first()
    )

    return PriceResponse(
        asset=asset,
        latest_price=latest,
        prices=prices,
        count=len(prices),
    )
