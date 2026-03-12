from __future__ import annotations

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AssetSchema(BaseModel):
    id: int
    symbol: str
    name: Optional[str]
    asset_type: str
    currency: str
    yahoo_symbol: Optional[str] = None
    tracked: bool = True
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AssetListResponse(BaseModel):
    assets: list[AssetSchema]
    total: int


class TickerCreate(BaseModel):
    yahoo_symbol: str
    asset_type: str = "stock"
    currency: str = "USD"
