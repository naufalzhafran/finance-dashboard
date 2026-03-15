from sqlalchemy import String, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DashboardGroup(Base):
    __tablename__ = "dashboard_groups"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    section: Mapped[str] = mapped_column(String(50), nullable=False)   # 'world' | 'indonesia'
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), nullable=False)       # Lucide icon name
    color: Mapped[str] = mapped_column(String(50), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    symbols: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
