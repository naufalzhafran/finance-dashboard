import datetime
from pydantic import BaseModel
from app.schemas.asset import AssetSchema


class FundamentalsSchema(BaseModel):
    id: int | None = None
    asset_id: int | None = None
    date: datetime.date | None = None
    market_cap: float | None = None
    enterprise_value: float | None = None
    trailing_pe: float | None = None
    forward_pe: float | None = None
    peg_ratio: float | None = None
    price_to_book: float | None = None
    profit_margins: float | None = None
    operating_margins: float | None = None
    return_on_assets: float | None = None
    return_on_equity: float | None = None
    revenue_growth: float | None = None
    earnings_growth: float | None = None
    debt_to_equity: float | None = None
    total_cash: float | None = None
    total_debt: float | None = None
    total_revenue: float | None = None
    gross_profits: float | None = None
    free_cashflow: float | None = None
    operating_cashflow: float | None = None
    trailing_eps: float | None = None
    forward_eps: float | None = None
    price_to_sales: float | None = None
    dividend_yield: float | None = None
    dividend_rate: float | None = None
    payout_ratio: float | None = None
    five_year_avg_dividend_yield: float | None = None

    model_config = {"from_attributes": True}


class FundamentalsResponse(BaseModel):
    asset: AssetSchema
    fundamentals: FundamentalsSchema | None
