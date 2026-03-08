from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    symbol: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(255))
    asset_type: Mapped[str] = mapped_column(String(50), default="stock")
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    prices = relationship("PriceHistory", back_populates="asset", cascade="all, delete-orphan")
    fundamentals = relationship("Fundamentals", back_populates="asset", cascade="all, delete-orphan")
    income_statements = relationship("FinancialsIncome", back_populates="asset", cascade="all, delete-orphan")
    balance_sheets = relationship("FinancialsBalance", back_populates="asset", cascade="all, delete-orphan")
    cashflows = relationship("FinancialsCashflow", back_populates="asset", cascade="all, delete-orphan")
