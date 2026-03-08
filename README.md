# Indonesia Economy Dashboard

All-in-one Indonesian economy dashboard with a world view. Tracks IDX stocks, global indices, FX rates, commodities, and crypto.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, React 19) |
| API | Python FastAPI + SQLAlchemy |
| Database | PostgreSQL 16 |
| Data Ingestion | Python + yfinance (managed with `uv`) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts |

## Project Structure

```
stock-analyze/
├── web/              # Next.js frontend
├── api/              # FastAPI backend (uv)
├── ingestion_pg/     # Data ingestion scripts for PostgreSQL (uv)
├── ingestion/        # Legacy SQLite ingestion (kept for reference)
├── docker-compose.yml
└── .env.example
```

## Quick Start

### 1. Prerequisites

- Node.js 22+
- Python 3.11+ with [uv](https://docs.astral.sh/uv/)
- PostgreSQL 16 (or use Docker)

### 2. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 3. Set up FastAPI backend

```bash
cd api
cp .env.example .env   # edit if needed
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

### 4. Run data ingestion

```bash
cd ingestion_pg
cp .env.example .env   # edit DATABASE_URL if needed
uv sync

# Ingest global assets (indices, FX, commodities, crypto)
uv run ingest-global --years 5

# Ingest Indonesian stocks
uv run ingest-idx --years 5

# Or run both daily
uv run ingest-daily --days 3
```

### 5. Start the frontend

```bash
cd web
cp .env.example .env.local   # set API_URL=http://localhost:8000/api
npm install
npm run dev
# → http://localhost:3000
```

## Docker Compose (all services)

```bash
cp .env.example .env
docker compose up --build
```

## Environment Variables

### API (`api/.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_db
ALLOWED_ORIGINS=http://localhost:3000
```

### Ingestion (`ingestion_pg/.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_db
```

### Frontend (`web/.env.local`)
```
API_URL=http://localhost:8000/api
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/assets` | List all tracked assets |
| GET | `/api/assets/{symbol}` | Get single asset |
| GET | `/api/prices/{symbol}` | Price history (OHLCV) |
| GET | `/api/fundamentals/{symbol}` | Key financial metrics |
| GET | `/api/financials/{symbol}/income` | Income statement |
| GET | `/api/financials/{symbol}/balance` | Balance sheet |
| GET | `/api/financials/{symbol}/cashflow` | Cash flow statement |

Full interactive docs: `http://localhost:8000/docs`

## Dashboard Sections

### World View
- Global Indices (IHSG, S&P 500, NASDAQ, Nikkei, FTSE, DAX, HSI, STI, KLSE)
- IDR Exchange Rates (USD, EUR, GBP, JPY, SGD, AUD, CAD, CHF)
- Commodities (Gold, Silver, Oil, Natural Gas, Copper, Corn, Coffee, Palm Oil)
- Crypto (BTC, ETH)

### Indonesia
- Banking (BBCA, BBRI, BMRI, BBNI, BRIS, and more)
- Energy & Mining (ADRO, ITMG, PTBA, BYAN, MEDC, PGAS)
- Metals & Minerals (ANTM, INCO, TINS, MDKA, NCKL, AMMN)
- State-Owned Enterprises / BUMN
- Consumer Goods (UNVR, ICBP, INDF, KLBF)
- Agriculture & Plantations (AALI, LSIP, SGRO)
- Infrastructure & Construction
- Technology (BUKA, GOTO, EMTK, BREN)
- Transportation & Logistics
- Healthcare (KLBF, KAEF, MIKA)
- Automotive & Heavy Equipment (ASII, AUTO, UNTR)
