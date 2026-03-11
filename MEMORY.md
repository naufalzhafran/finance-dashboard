# Project Memory: Indonesia Economy Dashboard

## Stack (as of 2026-03-08)
- **Frontend**: Next.js 16 + React 19 + Tailwind 4 + shadcn/ui + Recharts
- **API**: FastAPI (Python, managed with `uv`) at `localhost:8000`
- **Database**: PostgreSQL 16 (via SQLAlchemy + Alembic)
- **Ingestion**: `ingestion_pg/` package managed with `uv`, uses psycopg2 + yfinance

## Key Architecture
- Next.js route handlers (`/api/*`) are thin proxies → FastAPI at `API_URL` env var
- Frontend data flow: page → `/api/*` (Next.js) → FastAPI → PostgreSQL
- `web/src/lib/api.ts` is the typed FastAPI client (server-side only)
- FastAPI returns `latest_price` (snake_case); route handler remaps to `latestPrice`

## Migration Notes
- Replaced `better-sqlite3` with HTTP calls to FastAPI
- Replaced `src/lib/db.ts` with stub (empty, types now from `@/types`)
- `src/lib/env.ts` no longer exports `getDatabasePath`
- All type imports from `@/lib/db` were redirected to `@/types`

## Dashboard Groups
- World: Global Indices, IDR FX rates, Commodities, Crypto
- Indonesia: Banking, Energy/Mining, Metals, BUMN, Consumer, Agriculture,
  Infrastructure, Technology, Transportation, Healthcare, Automotive (15 sectors)
- Section filter tabs: All / World / Indonesia

## uv Commands
```bash
# API
cd api && uv sync && uv run uvicorn app.main:app --reload
cd api && uv run alembic upgrade head

# Ingestion
cd ingestion_pg && uv sync
uv run ingest-global --years 5
uv run ingest-idx --years 5
uv run ingest-daily --days 3
```
