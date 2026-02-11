#!/bin/bash

# setup.sh: A script to set up the Smart Queue Management System environment on Linux and macOS.

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Smart Queue Management System setup...${NC}"

# --- Check for Python ---
if ! command -v python3 &> /dev/null
then
    echo -e "${RED}Error: python3 could not be found.${NC}"
    echo -e "${YELLOW}Please install Python 3.11 or higher and ensure it's in your PATH.${NC}"
    exit 1
fi

# --- Run the Python Setup Script ---
echo "Executing setup.py..."
python3 setup.py

# --- Final Message ---
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Setup script completed successfully.${NC}"
else
    echo -e "${RED}Setup script encountered errors.${NC}"
fi

