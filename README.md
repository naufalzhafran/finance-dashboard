# Indonesia Economy Dashboard

All-in-one Indonesian economy dashboard with a world view. Tracks IDX stocks, global indices, FX rates, commodities, and crypto.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, React 19) |
| Backend | Python FastAPI + SQLAlchemy |
| Database | PostgreSQL 16 |
| Data Ingestion | Python + yfinance (bundled with backend) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts |

## Project Structure

```
stock-analyze/
├── api/                    # FastAPI backend + data ingestion
│   ├── app/                # FastAPI application
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   └── schemas/
│   ├── ingestion/          # Data ingestion scripts
│   │   ├── ingest.py       # CLI entry point (idx / global / daily)
│   │   ├── db.py           # Database helpers for ingestion
│   │   └── utils.py        # Shared utilities
│   ├── alembic/            # Database migrations
│   └── pyproject.toml
├── web/                    # Next.js frontend
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Node.js 22+
- Python 3.11+ with [uv](https://docs.astral.sh/uv/)
- PostgreSQL 16 (or use Docker)

### 1. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 2. Set up the backend

```bash
cd api
cp .env.example .env        # edit if needed
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

### 3. Run data ingestion

All ingestion is handled by a single `ingest` command with subcommands:

```bash
cd api

# Ingest all IDX stocks (last 10 years)
uv run ingest idx

# Ingest all global assets (indices, FX, commodities, crypto)
uv run ingest global

# Run both — default lookback: last 3 days (for daily cron jobs)
uv run ingest daily
```

See [Ingestion CLI](#ingestion-cli) for the full reference.

### 4. Start the frontend

```bash
cd web
cp .env.example .env.local  # set API_URL=http://localhost:8000/api
npm install
npm run dev
# → http://localhost:3000
```

---

## Docker Compose (all services)

```bash
docker compose up --build
```

---

## Environment Variables

### Backend (`api/.env`)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_db
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`web/.env.local`)

```env
API_URL=http://localhost:8000/api
```

---

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

Full interactive docs available at `http://localhost:8000/docs`.

---

## Ingestion CLI

The `ingest` command lives in `api/ingestion/ingest.py` and is installed as a script via `pyproject.toml`.

### Subcommands

#### `ingest idx` — Indonesian stocks

```bash
uv run ingest idx [OPTIONS]

Options:
  --symbols SYMBOL [SYMBOL ...]   Specific symbols to ingest (default: all IDX stocks)
  --years N                       Years of history to fetch (default: 10)
  --start YYYY-MM-DD              Explicit start date (overrides --years)
  --end YYYY-MM-DD                End date (default: today)
  --limit N                       Cap number of symbols (useful for testing)
  --delay SECONDS                 Sleep between requests (default: 0.5)
```

Examples:
```bash
# Full historical load for all stocks
uv run ingest idx --years 10

# Single stock
uv run ingest idx --symbols BBCA

# A few stocks, quick test
uv run ingest idx --symbols BBCA BBRI BMRI --years 1

# Custom date range
uv run ingest idx --start 2024-01-01 --end 2024-12-31
```

#### `ingest global` — Global assets

Fetches indices, FX rates, commodities, and crypto defined in `data/tickers.py`.

```bash
uv run ingest global [OPTIONS]

Options:
  --symbols SYMBOL [SYMBOL ...]   Specific symbols to ingest (default: all global assets)
  --years N                       Years of history to fetch (default: 10)
  --start YYYY-MM-DD              Explicit start date (overrides --years)
  --end YYYY-MM-DD                End date (default: today)
  --delay SECONDS                 Sleep between requests (default: 0.5)
```

Examples:
```bash
# Full historical load
uv run ingest global --years 10

# Just gold and S&P 500
uv run ingest global --symbols "GC=F" "^GSPC"

# Custom date range
uv run ingest global --start 2020-01-01
```

#### `ingest daily` — Run both (for cron jobs)

```bash
uv run ingest daily [OPTIONS]

Options:
  --days N            Lookback window in days (default: 3)
  --start YYYY-MM-DD  Explicit start date (overrides --days)
  --end YYYY-MM-DD    End date (default: today)
  --skip-idx          Skip IDX stocks
  --skip-global       Skip global assets
  --delay SECONDS     Sleep between requests (default: 0.5)
```

Examples:
```bash
# Default daily run (last 3 days, both sources)
uv run ingest daily

# Wider window to catch missing data
uv run ingest daily --days 7

# Only global assets
uv run ingest daily --skip-idx

# Explicit range
uv run ingest daily --start 2026-03-01 --end 2026-03-08
```

### Scheduled daily runs (cron)

```cron
# Run every weekday at 18:30 WIB (11:30 UTC)
30 11 * * 1-5 cd /app && uv run ingest daily --days 3
```

### Adding new tickers

Use the dashboard at `/tickers`. Enter the Yahoo Finance symbol (e.g. `BBCA.JK`, `NVDA`, `GC=F`), select the asset type and currency, then click **Add**. Historical data is fetched automatically in the background.

---

## Dashboard Sections

### World View
- Global Indices (IHSG, S&P 500, NASDAQ, Nikkei, FTSE, DAX, HSI, STI, KLSE)
- IDR Exchange Rates (USD, EUR, GBP, JPY, SGD, AUD, HKD, CHF, CAD, NZD, KRW, MYR, THB)
- Commodities (Gold, Silver, Platinum, Crude Oil, Natural Gas, Copper, Corn, Coffee, Palm Oil)
- Crypto (BTC, ETH)

### Indonesia
- Banking (BBCA, BBRI, BMRI, BBNI, BRIS, and more)
- Energy & Mining (ADRO, ITMG, PTBA, BYAN, MEDC, PGAS)
- Metals & Minerals (ANTM, INCO, TINS, MDKA, NCKL, AMMN)
- Consumer Goods (UNVR, ICBP, INDF, KLBF, MYOR)
- Agriculture & Plantations (AALI, LSIP, SGRO, SIMP)
- Infrastructure & Construction (JSMR, WIKA, PTPP, WSKT)
- Property (BSDE, CTRA, SMRA, PWON)
- Technology (BUKA, GOTO, EMTK, BREN)
- Transportation & Logistics
- Healthcare (KLBF, KAEF, MIKA, SILO)
- Automotive & Heavy Equipment (ASII, AUTO, UNTR)
