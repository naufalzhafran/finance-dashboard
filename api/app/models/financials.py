from datetime import date
from sqlalchemy import Date, Float, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FinancialsIncome(Base):
    __tablename__ = "financials_income"
    __table_args__ = (UniqueConstraint("asset_id", "date", "period_type", name="uq_income_asset_date_period"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    period_type: Mapped[str] = mapped_column(String(20), nullable=False)
    total_revenue: Mapped[float | None] = mapped_column(Float)
    operating_revenue: Mapped[float | None] = mapped_column(Float)
    cost_of_revenue: Mapped[float | None] = mapped_column(Float)
    gross_profit: Mapped[float | None] = mapped_column(Float)
    operating_expense: Mapped[float | None] = mapped_column(Float)
    operating_income: Mapped[float | None] = mapped_column(Float)
    net_interest_income: Mapped[float | None] = mapped_column(Float)
    interest_expense: Mapped[float | None] = mapped_column(Float)
    interest_income: Mapped[float | None] = mapped_column(Float)
    pretax_income: Mapped[float | None] = mapped_column(Float)
    tax_provision: Mapped[float | None] = mapped_column(Float)
    net_income_common_stockholders: Mapped[float | None] = mapped_column(Float)
    net_income: Mapped[float | None] = mapped_column(Float)
    basic_eps: Mapped[float | None] = mapped_column(Float)
    diluted_eps: Mapped[float | None] = mapped_column(Float)
    basic_average_shares: Mapped[float | None] = mapped_column(Float)
    diluted_average_shares: Mapped[float | None] = mapped_column(Float)
    ebitda: Mapped[float | None] = mapped_column(Float)
    reconciled_depreciation: Mapped[float | None] = mapped_column(Float)

    asset = relationship("Asset", back_populates="income_statements")


class FinancialsBalance(Base):
    __tablename__ = "financials_balance"
    __table_args__ = (UniqueConstraint("asset_id", "date", "period_type", name="uq_balance_asset_date_period"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    period_type: Mapped[str] = mapped_column(String(20), nullable=False)
    total_assets: Mapped[float | None] = mapped_column(Float)
    current_assets: Mapped[float | None] = mapped_column(Float)
    cash_and_cash_equivalents: Mapped[float | None] = mapped_column(Float)
    inventory: Mapped[float | None] = mapped_column(Float)
    receivables: Mapped[float | None] = mapped_column(Float)
    total_non_current_assets: Mapped[float | None] = mapped_column(Float)
    net_ppe: Mapped[float | None] = mapped_column(Float)
    goodwill_and_other_intangible_assets: Mapped[float | None] = mapped_column(Float)
    total_liabilities_net_minority_interest: Mapped[float | None] = mapped_column(Float)
    current_liabilities: Mapped[float | None] = mapped_column(Float)
    payables: Mapped[float | None] = mapped_column(Float)
    total_non_current_liabilities_net_minority_interest: Mapped[float | None] = mapped_column(Float)
    long_term_debt: Mapped[float | None] = mapped_column(Float)
    total_equity_gross_minority_interest: Mapped[float | None] = mapped_column(Float)
    stockholders_equity: Mapped[float | None] = mapped_column(Float)
    common_stock: Mapped[float | None] = mapped_column(Float)
    retained_earnings: Mapped[float | None] = mapped_column(Float)
    ordinary_shares_number: Mapped[float | None] = mapped_column(Float)
    total_debt: Mapped[float | None] = mapped_column(Float)
    net_debt: Mapped[float | None] = mapped_column(Float)
    working_capital: Mapped[float | None] = mapped_column(Float)
    invested_capital: Mapped[float | None] = mapped_column(Float)
    tangible_book_value: Mapped[float | None] = mapped_column(Float)

    asset = relationship("Asset", back_populates="balance_sheets")


class FinancialsCashflow(Base):
    __tablename__ = "financials_cashflow"
    __table_args__ = (UniqueConstraint("asset_id", "date", "period_type", name="uq_cashflow_asset_date_period"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    period_type: Mapped[str] = mapped_column(String(20), nullable=False)
    operating_cash_flow: Mapped[float | None] = mapped_column(Float)
    investing_cash_flow: Mapped[float | None] = mapped_column(Float)
    financing_cash_flow: Mapped[float | None] = mapped_column(Float)
    end_cash_position: Mapped[float | None] = mapped_column(Float)
    capital_expenditure: Mapped[float | None] = mapped_column(Float)
    issuance_of_capital_stock: Mapped[float | None] = mapped_column(Float)
    issuance_of_debt: Mapped[float | None] = mapped_column(Float)
    repayment_of_debt: Mapped[float | None] = mapped_column(Float)
    repurchase_of_capital_stock: Mapped[float | None] = mapped_column(Float)
    free_cash_flow: Mapped[float | None] = mapped_column(Float)

    asset = relationship("Asset", back_populates="cashflows")
