from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetSchema

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("", response_model=list[AssetSchema])
def get_assets(
    asset_type: str | None = None,
    db: Session = Depends(get_db),
):
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
