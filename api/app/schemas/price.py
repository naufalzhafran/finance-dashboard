from __future__ import annotations

from datetime import date
from typing import Optional
from pydantic import BaseModel
from app.schemas.asset import AssetSchema


class PriceSchema(BaseModel):
    id: Optional[int] = None
    asset_id: Optional[int] = None
    date: date
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None
    volume: Optional[int] = None

    model_config = {"from_attributes": True}


class SimplePriceSchema(BaseModel):
    date: date
    close: Optional[float] = None

    model_config = {"from_attributes": True}


class PriceResponse(BaseModel):
    asset: AssetSchema
    latest_price: Optional[PriceSchema] = None
    prices: list[PriceSchema]
    count: int
