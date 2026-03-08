from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Literal

from app.database import get_db
from app.models.asset import Asset
from app.models.financials import FinancialsIncome, FinancialsBalance, FinancialsCashflow
from app.schemas.financials import (
    FinancialsIncomeSchema,
    FinancialsBalanceSchema,
    FinancialsCashflowSchema,
)

router = APIRouter(prefix="/financials", tags=["financials"])


@router.get("/{symbol}/income", response_model=list[FinancialsIncomeSchema])
def get_income(
    symbol: str,
    period: Literal["annual", "quarterly"] = Query(default="annual"),
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{symbol}' not found")
    return (
        db.query(FinancialsIncome)
        .filter(FinancialsIncome.asset_id == asset.id, FinancialsIncome.period_type == period)
        .order_by(FinancialsIncome.date.desc())
        .all()
    )


@router.get("/{symbol}/balance", response_model=list[FinancialsBalanceSchema])
def get_balance(
    symbol: str,
    period: Literal["annual", "quarterly"] = Query(default="annual"),
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{symbol}' not found")
    return (
        db.query(FinancialsBalance)
        .filter(FinancialsBalance.asset_id == asset.id, FinancialsBalance.period_type == period)
        .order_by(FinancialsBalance.date.desc())
        .all()
    )


@router.get("/{symbol}/cashflow", response_model=list[FinancialsCashflowSchema])
def get_cashflow(
    symbol: str,
    period: Literal["annual", "quarterly"] = Query(default="annual"),
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.symbol == symbol.upper()).first()
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{symbol}' not found")
    return (
        db.query(FinancialsCashflow)
        .filter(FinancialsCashflow.asset_id == asset.id, FinancialsCashflow.period_type == period)
        .order_by(FinancialsCashflow.date.desc())
        .all()
    )
