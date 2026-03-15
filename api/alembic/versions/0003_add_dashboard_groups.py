"""add dashboard_groups table

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-14
"""
import json
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

SEED_GROUPS = [
    # ── World View ──────────────────────────────────────────────────────────
    {"section": "world",     "title": "Global Indices",                   "icon": "Globe",         "color": "blue",    "sort_order": 0,  "symbols": ["^JKSE","^GSPC","^IXIC","^DJI","^N225","^FTSE","^GDAXI","^HSI","^STI","^KLSE"]},
    {"section": "world",     "title": "IDR Exchange Rates",               "icon": "Banknote",      "color": "amber",   "sort_order": 1,  "symbols": ["USDIDR=X","EURIDR=X","GBPIDR=X","JPYIDR=X","SGDIDR=X","AUDIDR=X","CADIDR=X","CHFIDR=X"]},
    {"section": "world",     "title": "Commodities",                      "icon": "Flame",         "color": "orange",  "sort_order": 2,  "symbols": ["GC=F","SI=F","CL=F","BZ=F","NG=F","HG=F","ZC=F","ZS=F","KC=F","CPO=F"]},
    {"section": "world",     "title": "Crypto",                           "icon": "TrendingUp",    "color": "purple",  "sort_order": 3,  "symbols": ["BTC-USD","ETH-USD"]},
    # ── Indonesia ───────────────────────────────────────────────────────────
    {"section": "indonesia", "title": "Banking",                          "icon": "Landmark",      "color": "emerald", "sort_order": 4,  "symbols": ["BBCA","BBRI","BMRI","BBNI","BRIS","MEGA","BTPN","BNGA"]},
    {"section": "indonesia", "title": "Energy & Mining",                  "icon": "Flame",         "color": "orange",  "sort_order": 5,  "symbols": ["ADRO","ITMG","PTBA","BYAN","HRUM","GEMS","MBAP","UNTR","MEDC","PGAS"]},
    {"section": "indonesia", "title": "Metals & Minerals",                "icon": "Factory",       "color": "slate",   "sort_order": 6,  "symbols": ["ANTM","INCO","TINS","MDKA","NCKL","AMMN","CUAN","BRMS"]},
    {"section": "indonesia", "title": "State-Owned Enterprises (BUMN)",   "icon": "Building2",     "color": "red",     "sort_order": 7,  "symbols": ["TLKM","BBRI","BMRI","BBNI","SMGR","JSMR","BBTN","WIKA","PTPP","GIAA"]},
    {"section": "indonesia", "title": "Consumer Goods",                   "icon": "ShoppingCart",  "color": "pink",    "sort_order": 8,  "symbols": ["UNVR","ICBP","INDF","KLBF","HMSP","GGRM","MYOR","ULTJ","SIDO","MLBI"]},
    {"section": "indonesia", "title": "Agriculture & Plantations",        "icon": "Leaf",          "color": "lime",    "sort_order": 9,  "symbols": ["AALI","LSIP","SIMP","SGRO","DSNG","BWPT","SSMS","PALM","TAPG"]},
    {"section": "indonesia", "title": "Infrastructure & Construction",     "icon": "Building2",     "color": "cyan",    "sort_order": 10, "symbols": ["JSMR","WIKA","WSKT","PTPP","ADHI","TOTL","WTON","SSIA"]},
    {"section": "indonesia", "title": "Technology",                       "icon": "Cpu",           "color": "violet",  "sort_order": 11, "symbols": ["BUKA","GOTO","EMTK","DCII","MTDL","DNET","BREN"]},
    {"section": "indonesia", "title": "Transportation & Logistics",       "icon": "Ship",          "color": "sky",     "sort_order": 12, "symbols": ["GIAA","BIRD","ASSA","SMDR","HITS","PORT","SHIP"]},
    {"section": "indonesia", "title": "Healthcare",                       "icon": "HeartPulse",    "color": "rose",    "sort_order": 13, "symbols": ["KLBF","KAEF","MIKA","SILO","HEAL","TSPC","DVLA","PYFA"]},
    {"section": "indonesia", "title": "Automotive & Heavy Equipment",     "icon": "Factory",       "color": "zinc",    "sort_order": 14, "symbols": ["ASII","AUTO","GJTL","SMSM","UNTR","IMAS","MPMX"]},
]


def upgrade() -> None:
    op.create_table(
        "dashboard_groups",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("section", sa.String(50), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("icon", sa.String(50), nullable=False),
        sa.Column("color", sa.String(50), nullable=False),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("symbols", sa.JSON, nullable=False, server_default="[]"),
    )

    table = sa.table(
        "dashboard_groups",
        sa.column("section", sa.String),
        sa.column("title", sa.String),
        sa.column("icon", sa.String),
        sa.column("color", sa.String),
        sa.column("sort_order", sa.Integer),
        sa.column("symbols", sa.JSON),
    )
    op.bulk_insert(table, SEED_GROUPS)


def downgrade() -> None:
    op.drop_table("dashboard_groups")
