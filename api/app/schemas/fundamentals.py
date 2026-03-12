from __future__ import annotations

from datetime import date
from typing import Optional
from pydantic import BaseModel
from app.schemas.asset import AssetSchema


class FundamentalsSchema(BaseModel):
    id: Optional[int] = None
    asset_id: Optional[int] = None
    date: Optional[date] = None
    market_cap: Optional[float] = None
    enterprise_value: Optional[float] = None
    trailing_pe: Optional[float] = None
    forward_pe: Optional[float] = None
    peg_ratio: Optional[float] = None
    price_to_book: Optional[float] = None
    profit_margins: Optional[float] = None
    operating_margins: Optional[float] = None
    return_on_assets: Optional[float] = None
    return_on_equity: Optional[float] = None
    revenue_growth: Optional[float] = None
    earnings_growth: Optional[float] = None
    debt_to_equity: Optional[float] = None
    total_cash: Optional[float] = None
    total_debt: Optional[float] = None
    total_revenue: Optional[float] = None
    gross_profits: Optional[float] = None
    free_cashflow: Optional[float] = None
    operating_cashflow: Optional[float] = None
    trailing_eps: Optional[float] = None
    forward_eps: Optional[float] = None
    price_to_sales: Optional[float] = None
    dividend_yield: Optional[float] = None
    dividend_rate: Optional[float] = None
    payout_ratio: Optional[float] = None
    five_year_avg_dividend_yield: Optional[float] = None

    model_config = {"from_attributes": True}


class FundamentalsResponse(BaseModel):
    asset: AssetSchema
    fundamentals: Optional[FundamentalsSchema]
