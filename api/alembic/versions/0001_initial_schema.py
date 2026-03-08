"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-03-08
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("symbol", sa.String(50), nullable=False),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("asset_type", sa.String(50), nullable=False, server_default="stock"),
        sa.Column("currency", sa.String(10), nullable=False, server_default="USD"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("symbol", name="uq_assets_symbol"),
    )
    op.create_index("ix_assets_id", "assets", ["id"])
    op.create_index("ix_assets_symbol", "assets", ["symbol"])

    op.create_table(
        "price_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("open", sa.Float(), nullable=True),
        sa.Column("high", sa.Float(), nullable=True),
        sa.Column("low", sa.Float(), nullable=True),
        sa.Column("close", sa.Float(), nullable=True),
        sa.Column("volume", sa.BigInteger(), nullable=True),
        sa.ForeignKeyConstraint(["asset_id"], ["assets.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("asset_id", "date", name="uq_price_asset_date"),
    )
    op.create_index("ix_price_history_id", "price_history", ["id"])
    op.create_index("ix_price_history_asset_id", "price_history", ["asset_id"])
    op.create_index("ix_price_history_date", "price_history", ["date"])

    op.create_table(
        "fundamentals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("market_cap", sa.Float(), nullable=True),
        sa.Column("enterprise_value", sa.Float(), nullable=True),
        sa.Column("trailing_pe", sa.Float(), nullable=True),
        sa.Column("forward_pe", sa.Float(), nullable=True),
        sa.Column("peg_ratio", sa.Float(), nullable=True),
        sa.Column("price_to_book", sa.Float(), nullable=True),
        sa.Column("profit_margins", sa.Float(), nullable=True),
        sa.Column("operating_margins", sa.Float(), nullable=True),
        sa.Column("return_on_assets", sa.Float(), nullable=True),
        sa.Column("return_on_equity", sa.Float(), nullable=True),
        sa.Column("revenue_growth", sa.Float(), nullable=True),
        sa.Column("earnings_growth", sa.Float(), nullable=True),
        sa.Column("debt_to_equity", sa.Float(), nullable=True),
        sa.Column("total_cash", sa.Float(), nullable=True),
        sa.Column("total_debt", sa.Float(), nullable=True),
        sa.Column("total_revenue", sa.Float(), nullable=True),
        sa.Column("gross_profits", sa.Float(), nullable=True),
        sa.Column("free_cashflow", sa.Float(), nullable=True),
        sa.Column("operating_cashflow", sa.Float(), nullable=True),
        sa.Column("trailing_eps", sa.Float(), nullable=True),
        sa.Column("forward_eps", sa.Float(), nullable=True),
        sa.Column("price_to_sales", sa.Float(), nullable=True),
        sa.Column("dividend_yield", sa.Float(), nullable=True),
        sa.Column("dividend_rate", sa.Float(), nullable=True),
        sa.Column("payout_ratio", sa.Float(), nullable=True),
        sa.Column("five_year_avg_dividend_yield", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["asset_id"], ["assets.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("asset_id", "date", name="uq_fundamentals_asset_date"),
    )
    op.create_index("ix_fundamentals_id", "fundamentals", ["id"])
    op.create_index("ix_fundamentals_asset_id", "fundamentals", ["asset_id"])

    op.create_table(
        "financials_income",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("period_type", sa.String(20), nullable=False),
        sa.Column("total_revenue", sa.Float(), nullable=True),
        sa.Column("operating_revenue", sa.Float(), nullable=True),
        sa.Column("cost_of_revenue", sa.Float(), nullable=True),
        sa.Column("gross_profit", sa.Float(), nullable=True),
        sa.Column("operating_expense", sa.Float(), nullable=True),
        sa.Column("operating_income", sa.Float(), nullable=True),
        sa.Column("net_interest_income", sa.Float(), nullable=True),
        sa.Column("interest_expense", sa.Float(), nullable=True),
        sa.Column("interest_income", sa.Float(), nullable=True),
        sa.Column("pretax_income", sa.Float(), nullable=True),
        sa.Column("tax_provision", sa.Float(), nullable=True),
        sa.Column("net_income_common_stockholders", sa.Float(), nullable=True),
        sa.Column("net_income", sa.Float(), nullable=True),
        sa.Column("basic_eps", sa.Float(), nullable=True),
        sa.Column("diluted_eps", sa.Float(), nullable=True),
        sa.Column("basic_average_shares", sa.Float(), nullable=True),
        sa.Column("diluted_average_shares", sa.Float(), nullable=True),
        sa.Column("ebitda", sa.Float(), nullable=True),
        sa.Column("reconciled_depreciation", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["asset_id"], ["assets.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("asset_id", "date", "period_type", name="uq_income_asset_date_period"),
    )
    op.create_index("ix_financials_income_id", "financials_income", ["id"])
    op.create_index("ix_financials_income_asset_id", "financials_income", ["asset_id"])

    op.create_table(
        "financials_balance",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("period_type", sa.String(20), nullable=False),
        sa.Column("total_assets", sa.Float(), nullable=True),
        sa.Column("current_assets", sa.Float(), nullable=True),
        sa.Column("cash_and_cash_equivalents", sa.Float(), nullable=True),
        sa.Column("inventory", sa.Float(), nullable=True),
        sa.Column("receivables", sa.Float(), nullable=True),
        sa.Column("total_non_current_assets", sa.Float(), nullable=True),
        sa.Column("net_ppe", sa.Float(), nullable=True),
        sa.Column("goodwill_and_other_intangible_assets", sa.Float(), nullable=True),
        sa.Column("total_liabilities_net_minority_interest", sa.Float(), nullable=True),
        sa.Column("current_liabilities", sa.Float(), nullable=True),
        sa.Column("payables", sa.Float(), nullable=True),
        sa.Column("total_non_current_liabilities_net_minority_interest", sa.Float(), nullable=True),
        sa.Column("long_term_debt", sa.Float(), nullable=True),
        sa.Column("total_equity_gross_minority_interest", sa.Float(), nullable=True),
        sa.Column("stockholders_equity", sa.Float(), nullable=True),
        sa.Column("common_stock", sa.Float(), nullable=True),
        sa.Column("retained_earnings", sa.Float(), nullable=True),
        sa.Column("ordinary_shares_number", sa.Float(), nullable=True),
        sa.Column("total_debt", sa.Float(), nullable=True),
        sa.Column("net_debt", sa.Float(), nullable=True),
        sa.Column("working_capital", sa.Float(), nullable=True),
        sa.Column("invested_capital", sa.Float(), nullable=True),
        sa.Column("tangible_book_value", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["asset_id"], ["assets.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("asset_id", "date", "period_type", name="uq_balance_asset_date_period"),
    )
    op.create_index("ix_financials_balance_id", "financials_balance", ["id"])
    op.create_index("ix_financials_balance_asset_id", "financials_balance", ["asset_id"])

    op.create_table(
        "financials_cashflow",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("period_type", sa.String(20), nullable=False),
        sa.Column("operating_cash_flow", sa.Float(), nullable=True),
        sa.Column("investing_cash_flow", sa.Float(), nullable=True),
        sa.Column("financing_cash_flow", sa.Float(), nullable=True),
        sa.Column("end_cash_position", sa.Float(), nullable=True),
        sa.Column("capital_expenditure", sa.Float(), nullable=True),
        sa.Column("issuance_of_capital_stock", sa.Float(), nullable=True),
        sa.Column("issuance_of_debt", sa.Float(), nullable=True),
        sa.Column("repayment_of_debt", sa.Float(), nullable=True),
        sa.Column("repurchase_of_capital_stock", sa.Float(), nullable=True),
        sa.Column("free_cash_flow", sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(["asset_id"], ["assets.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("asset_id", "date", "period_type", name="uq_cashflow_asset_date_period"),
    )
    op.create_index("ix_financials_cashflow_id", "financials_cashflow", ["id"])
    op.create_index("ix_financials_cashflow_asset_id", "financials_cashflow", ["asset_id"])


def downgrade() -> None:
    op.drop_table("financials_cashflow")
    op.drop_table("financials_balance")
    op.drop_table("financials_income")
    op.drop_table("fundamentals")
    op.drop_table("price_history")
    op.drop_table("assets")
