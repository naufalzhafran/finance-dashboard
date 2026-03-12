import datetime
from pydantic import BaseModel
from app.schemas.asset import AssetSchema


class PriceSchema(BaseModel):
    id: int | None = None
    asset_id: int | None = None
    date: datetime.date
    open: float | None = None
    high: float | None = None
    low: float | None = None
    close: float | None = None
    volume: int | None = None

    model_config = {"from_attributes": True}


class SimplePriceSchema(BaseModel):
    date: datetime.date
    close: float | None = None

    model_config = {"from_attributes": True}


class PriceResponse(BaseModel):
    asset: AssetSchema
    latest_price: PriceSchema | None = None
    prices: list[PriceSchema]
    count: int
