from datetime import date
from sqlalchemy import Date, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Fundamentals(Base):
    __tablename__ = "fundamentals"
    __table_args__ = (UniqueConstraint("asset_id", "date", name="uq_fundamentals_asset_date"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    market_cap: Mapped[float | None] = mapped_column(Float)
    enterprise_value: Mapped[float | None] = mapped_column(Float)
    trailing_pe: Mapped[float | None] = mapped_column(Float)
    forward_pe: Mapped[float | None] = mapped_column(Float)
    peg_ratio: Mapped[float | None] = mapped_column(Float)
    price_to_book: Mapped[float | None] = mapped_column(Float)
    profit_margins: Mapped[float | None] = mapped_column(Float)
    operating_margins: Mapped[float | None] = mapped_column(Float)
    return_on_assets: Mapped[float | None] = mapped_column(Float)
    return_on_equity: Mapped[float | None] = mapped_column(Float)
    revenue_growth: Mapped[float | None] = mapped_column(Float)
    earnings_growth: Mapped[float | None] = mapped_column(Float)
    debt_to_equity: Mapped[float | None] = mapped_column(Float)
    total_cash: Mapped[float | None] = mapped_column(Float)
    total_debt: Mapped[float | None] = mapped_column(Float)
    total_revenue: Mapped[float | None] = mapped_column(Float)
    gross_profits: Mapped[float | None] = mapped_column(Float)
    free_cashflow: Mapped[float | None] = mapped_column(Float)
    operating_cashflow: Mapped[float | None] = mapped_column(Float)
    trailing_eps: Mapped[float | None] = mapped_column(Float)
    forward_eps: Mapped[float | None] = mapped_column(Float)
    price_to_sales: Mapped[float | None] = mapped_column(Float)
    dividend_yield: Mapped[float | None] = mapped_column(Float)
    dividend_rate: Mapped[float | None] = mapped_column(Float)
    payout_ratio: Mapped[float | None] = mapped_column(Float)
    five_year_avg_dividend_yield: Mapped[float | None] = mapped_column(Float)

    asset = relationship("Asset", back_populates="fundamentals")
