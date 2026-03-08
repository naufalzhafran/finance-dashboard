from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.models.fundamentals import Fundamentals
from app.schemas.fundamentals import FundamentalsResponse

router = APIRouter(prefix="/fundamentals", tags=["fundamentals"])


@router.get("/{symbol}", response_model=FundamentalsResponse)
def get_fundamentals(symbol: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{symbol}' not found")

    fundamentals = (
        db.query(Fundamentals)
        .filter(Fundamentals.asset_id == asset.id)
        .order_by(Fundamentals.date.desc())
        .first()
    )

    return FundamentalsResponse(asset=asset, fundamentals=fundamentals)
