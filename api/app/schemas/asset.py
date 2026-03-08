from datetime import datetime
from pydantic import BaseModel


class AssetSchema(BaseModel):
    id: int
    symbol: str
    name: str | None
    asset_type: str
    currency: str
    yahoo_symbol: str | None = None
    tracked: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class AssetListResponse(BaseModel):
    assets: list[AssetSchema]
    total: int


class TickerCreate(BaseModel):
    yahoo_symbol: str
    asset_type: str = "stock"
    currency: str = "USD"
