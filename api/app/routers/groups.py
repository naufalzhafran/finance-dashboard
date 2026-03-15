from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dashboard_group import DashboardGroup
from app.schemas.dashboard_group import DashboardGroupCreate, DashboardGroupSchema, DashboardGroupUpdate

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get("", response_model=list[DashboardGroupSchema])
def list_groups(db: Session = Depends(get_db)):
    return db.query(DashboardGroup).order_by(DashboardGroup.sort_order, DashboardGroup.id).all()


@router.post("", response_model=DashboardGroupSchema, status_code=status.HTTP_201_CREATED)
def create_group(body: DashboardGroupCreate, db: Session = Depends(get_db)):
    group = DashboardGroup(**body.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put("/{group_id}", response_model=DashboardGroupSchema)
def update_group(group_id: int, body: DashboardGroupUpdate, db: Session = Depends(get_db)):
    group = db.get(DashboardGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(group, field, value)
    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    group = db.get(DashboardGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(group)
    db.commit()
