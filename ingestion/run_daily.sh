#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

# Activate virtual environment if it exists (adjust path if needed)
# if [ -d "../.venv" ]; then
#     source ../.venv/bin/activate
# fi

# Run the ingestion script
# Using /usr/bin/env python3 to pick up the preferred python
/usr/bin/env python3 ingest_daily.py >> daily_run.log 2>&1

# Print completion timestamp
echo "Run completed at $(date)" >> daily_run.log
