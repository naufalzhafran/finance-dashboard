from datetime import date
from pydantic import BaseModel
from app.schemas.asset import AssetSchema


class PriceSchema(BaseModel):
    id: int | None = None
    asset_id: int | None = None
    date: date
    open: float | None
    high: float | None
    low: float | None
    close: float | None
    volume: int | None

    model_config = {"from_attributes": True}


class SimplePriceSchema(BaseModel):
    date: date
    close: float | None

    model_config = {"from_attributes": True}


class PriceResponse(BaseModel):
    asset: AssetSchema
    latest_price: PriceSchema | None = None
    prices: list[PriceSchema]
    count: int
