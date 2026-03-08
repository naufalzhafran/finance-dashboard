from datetime import datetime
from pydantic import BaseModel


class AssetSchema(BaseModel):
    id: int
    symbol: str
    name: str | None
    asset_type: str
    currency: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class AssetListResponse(BaseModel):
    assets: list[AssetSchema]
    total: int
