# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Indonesia Economy Dashboard — a full-stack app for tracking IDX stocks, global indices, FX rates, commodities, and crypto. Monorepo with a FastAPI backend (`api/`) and Next.js frontend (`web/`).

## Development Commands

### Infrastructure
```bash
docker compose up postgres -d    # Start PostgreSQL only
docker compose up --build        # Start all services (API + Web + DB)
```

### Backend (`api/`)
```bash
uv sync                          # Install Python dependencies
uv run alembic upgrade head      # Run DB migrations
uv run uvicorn app.main:app --reload  # Dev server → http://localhost:8000/docs
```

### Data Ingestion
```bash
uv run ingest                                      # All tracked assets (10-year historical)
uv run ingest --days 3                             # All tracked assets (last 3 days, for cron)
uv run ingest --symbols BBCA.JK TLKM.JK           # Specific symbols
uv run ingest --years 1                            # 1 year of history
```

> **Inside Docker container:** The container uses `pip`, not `uv`. Use `python -m` instead:
> ```bash
> docker compose exec api python -m ingestion.ingest
> docker compose exec api python -m ingestion.ingest --days 3
> docker compose exec api python -m ingestion.ingest --symbols BBCA.JK TLKM.JK
> ```

### Frontend (`web/`)
```bash
npm install
npm run dev                      # Dev server → http://localhost:3000
npm run build && npm start       # Production build
npm run lint                     # ESLint
```

## Architecture

### Backend (FastAPI + SQLAlchemy)

```
api/
├── app/
│   ├── main.py          # FastAPI app setup, CORS, route registration
│   ├── config.py        # Settings (DATABASE_URL, ALLOWED_ORIGINS)
│   ├── database.py      # SQLAlchemy engine, SessionLocal, get_db dependency
│   ├── models/          # ORM models: Asset, PriceHistory, Fundamentals, Financials
│   ├── schemas/         # Pydantic request/response schemas
│   └── routers/         # Route handlers: assets, prices, fundamentals, financials
└── ingestion/           # yfinance data fetching + ingest CLI entry point
```

**Data flow:** `ingest` CLI → yfinance → PostgreSQL → FastAPI REST API → Next.js frontend

**Key models:**
- `Asset` — symbol, name, type (IDX/global), currency, yahoo_symbol, tracked status
- `PriceHistory` — OHLCV with unique constraint on (asset_id, date)
- `Fundamentals` — 24 financial metrics (P/E, ROE, market cap, etc.)
- `Financials` — income/balance/cashflow statements (annual + quarterly)

### Frontend (Next.js App Router)

```
web/src/
├── app/
│   ├── page.tsx                   # Dashboard home
│   ├── asset/[symbol]/page.tsx    # Asset detail page
│   ├── tickers/                   # Ticker management
│   ├── glossary/                  # Financial glossary
│   └── api/                       # Next.js API routes (proxies to FastAPI)
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── StockChart.tsx             # Main price chart (Recharts)
│   ├── TechnicalIndicators.tsx    # RSI, MACD, Volatility, Drawdown
│   ├── FundamentalsGrid.tsx       # P/E, ROE, debt ratios
│   ├── FinancialsView.tsx         # Income/balance/cashflow statements
│   └── ...                        # Other chart and analytics components
└── lib/                           # Utility functions
```

**API proxying:** Next.js `app/api/` routes proxy requests to the FastAPI backend (configured via `API_URL` env var). Frontend never calls FastAPI directly.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui (Radix UI) |
| Charts | Recharts |
| Backend | Python 3.11+, FastAPI, uvicorn |
| ORM | SQLAlchemy 2.0+ with Alembic migrations |
| Database | PostgreSQL 16 |
| Data source | yfinance (Yahoo Finance) |
| Python pkg mgr | uv |

## Environment Setup

Copy `.env.example` to `.env` (root, for Docker) and `api/.env`. Frontend reads `web/.env.local`. Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `ALLOWED_ORIGINS` — CORS origins for FastAPI
- `API_URL` — FastAPI base URL for Next.js API routes

## Database Migrations

```bash
cd api
uv run alembic revision --autogenerate -m "description"  # Generate migration
uv run alembic upgrade head                               # Apply migrations
uv run alembic downgrade -1                              # Rollback one step
```
