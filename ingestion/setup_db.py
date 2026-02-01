#!/usr/bin/env python3
"""
Database Setup Script

This script initializes the SQLite database using the schema.sql file.
It is safe to run multiple times (idempotent).
"""

import sqlite3
from pathlib import Path
import sys

# Define paths
BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "finance_data.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"

def init_db():
    """Initialize the database with schema."""
    print(f"Initializing database at {DB_PATH}...")
    
    if not SCHEMA_PATH.exists():
        print(f"Error: Schema file not found at {SCHEMA_PATH}")
        sys.exit(1)
        
    try:
        conn = sqlite3.connect(DB_PATH)
        
        with open(SCHEMA_PATH, "r") as f:
            schema_script = f.read()
            
        conn.executescript(schema_script)
        conn.commit()
        conn.close()
        
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
