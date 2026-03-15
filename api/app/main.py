from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import assets, prices, fundamentals, financials, groups

app = FastAPI(
    title="Indonesia Economy Dashboard API",
    description="FastAPI backend for Indonesian market data & global economy indicators",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router, prefix="/api")
app.include_router(assets.tickers_router, prefix="/api")
app.include_router(prices.router, prefix="/api")
app.include_router(fundamentals.router, prefix="/api")
app.include_router(financials.router, prefix="/api")
app.include_router(groups.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
