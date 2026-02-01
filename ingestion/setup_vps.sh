#!/bin/bash

# Exit on error
set -e

echo "======================================"
echo "   Finance Dashboard - VPS Setup      "
echo "======================================"

# Determine the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "[1/3] Checking dependencies..."
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 could not be found. Please install Python 3."
    exit 1
fi

echo "[2/3] Installing Python requirements..."
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
else
    echo "Warning: requirements.txt not found!"
fi

echo "[3/3] Setting up database..."
python3 setup_db.py

echo "======================================"
echo "   Setup Completed Successfully!      "
echo "======================================"
echo "You can now run ingestion scripts:"
echo "  python3 ingest_daily.py"
