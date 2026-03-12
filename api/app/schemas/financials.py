from __future__ import annotations

from datetime import date
from typing import Optional
from pydantic import BaseModel


class FinancialsIncomeSchema(BaseModel):
    id: Optional[int] = None
    asset_id: Optional[int] = None
    date: Optional[date] = None
    period_type: Optional[str] = None
    total_revenue: Optional[float] = None
    operating_revenue: Optional[float] = None
    cost_of_revenue: Optional[float] = None
    gross_profit: Optional[float] = None
    operating_expense: Optional[float] = None
    operating_income: Optional[float] = None
    net_interest_income: Optional[float] = None
    interest_expense: Optional[float] = None
    interest_income: Optional[float] = None
    pretax_income: Optional[float] = None
    tax_provision: Optional[float] = None
    net_income_common_stockholders: Optional[float] = None
    net_income: Optional[float] = None
    basic_eps: Optional[float] = None
    diluted_eps: Optional[float] = None
    basic_average_shares: Optional[float] = None
    diluted_average_shares: Optional[float] = None
    ebitda: Optional[float] = None
    reconciled_depreciation: Optional[float] = None

    model_config = {"from_attributes": True}


class FinancialsBalanceSchema(BaseModel):
    id: Optional[int] = None
    asset_id: Optional[int] = None
    date: Optional[date] = None
    period_type: Optional[str] = None
    total_assets: Optional[float] = None
    current_assets: Optional[float] = None
    cash_and_cash_equivalents: Optional[float] = None
    inventory: Optional[float] = None
    receivables: Optional[float] = None
    total_non_current_assets: Optional[float] = None
    net_ppe: Optional[float] = None
    goodwill_and_other_intangible_assets: Optional[float] = None
    total_liabilities_net_minority_interest: Optional[float] = None
    current_liabilities: Optional[float] = None
    payables: Optional[float] = None
    total_non_current_liabilities_net_minority_interest: Optional[float] = None
    long_term_debt: Optional[float] = None
    total_equity_gross_minority_interest: Optional[float] = None
    stockholders_equity: Optional[float] = None
    common_stock: Optional[float] = None
    retained_earnings: Optional[float] = None
    ordinary_shares_number: Optional[float] = None
    total_debt: Optional[float] = None
    net_debt: Optional[float] = None
    working_capital: Optional[float] = None
    invested_capital: Optional[float] = None
    tangible_book_value: Optional[float] = None

    model_config = {"from_attributes": True}


class FinancialsCashflowSchema(BaseModel):
    id: Optional[int] = None
    asset_id: Optional[int] = None
    date: Optional[date] = None
    period_type: Optional[str] = None
    operating_cash_flow: Optional[float] = None
    investing_cash_flow: Optional[float] = None
    financing_cash_flow: Optional[float] = None
    end_cash_position: Optional[float] = None
    capital_expenditure: Optional[float] = None
    issuance_of_capital_stock: Optional[float] = None
    issuance_of_debt: Optional[float] = None
    repayment_of_debt: Optional[float] = None
    repurchase_of_capital_stock: Optional[float] = None
    free_cash_flow: Optional[float] = None

    model_config = {"from_attributes": True}
