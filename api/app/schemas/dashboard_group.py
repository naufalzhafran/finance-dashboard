from pydantic import BaseModel, ConfigDict


class DashboardGroupSchema(BaseModel):
    id: int
    section: str
    title: str
    icon: str
    color: str
    sort_order: int
    symbols: list[str]

    model_config = ConfigDict(from_attributes=True)


class DashboardGroupCreate(BaseModel):
    section: str
    title: str
    icon: str
    color: str
    sort_order: int = 0
    symbols: list[str] = []


class DashboardGroupUpdate(BaseModel):
    section: str | None = None
    title: str | None = None
    icon: str | None = None
    color: str | None = None
    sort_order: int | None = None
    symbols: list[str] | None = None
