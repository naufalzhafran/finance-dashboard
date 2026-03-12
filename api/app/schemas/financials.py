import datetime
from pydantic import BaseModel


class FinancialsIncomeSchema(BaseModel):
    id: int | None = None
    asset_id: int | None = None
    date: datetime.date | None = None
    period_type: str | None = None
    total_revenue: float | None = None
    operating_revenue: float | None = None
    cost_of_revenue: float | None = None
    gross_profit: float | None = None
    operating_expense: float | None = None
    operating_income: float | None = None
    net_interest_income: float | None = None
    interest_expense: float | None = None
    interest_income: float | None = None
    pretax_income: float | None = None
    tax_provision: float | None = None
    net_income_common_stockholders: float | None = None
    net_income: float | None = None
    basic_eps: float | None = None
    diluted_eps: float | None = None
    basic_average_shares: float | None = None
    diluted_average_shares: float | None = None
    ebitda: float | None = None
    reconciled_depreciation: float | None = None

    model_config = {"from_attributes": True}


class FinancialsBalanceSchema(BaseModel):
    id: int | None = None
    asset_id: int | None = None
    date: datetime.date | None = None
    period_type: str | None = None
    total_assets: float | None = None
    current_assets: float | None = None
    cash_and_cash_equivalents: float | None = None
    inventory: float | None = None
    receivables: float | None = None
    total_non_current_assets: float | None = None
    net_ppe: float | None = None
    goodwill_and_other_intangible_assets: float | None = None
    total_liabilities_net_minority_interest: float | None = None
    current_liabilities: float | None = None
    payables: float | None = None
    total_non_current_liabilities_net_minority_interest: float | None = None
    long_term_debt: float | None = None
    total_equity_gross_minority_interest: float | None = None
    stockholders_equity: float | None = None
    common_stock: float | None = None
    retained_earnings: float | None = None
    ordinary_shares_number: float | None = None
    total_debt: float | None = None
    net_debt: float | None = None
    working_capital: float | None = None
    invested_capital: float | None = None
    tangible_book_value: float | None = None

    model_config = {"from_attributes": True}


class FinancialsCashflowSchema(BaseModel):
    id: int | None = None
    asset_id: int | None = None
    date: datetime.date | None = None
    period_type: str | None = None
    operating_cash_flow: float | None = None
    investing_cash_flow: float | None = None
    financing_cash_flow: float | None = None
    end_cash_position: float | None = None
    capital_expenditure: float | None = None
    issuance_of_capital_stock: float | None = None
    issuance_of_debt: float | None = None
    repayment_of_debt: float | None = None
    repurchase_of_capital_stock: float | None = None
    free_cash_flow: float | None = None

    model_config = {"from_attributes": True}
