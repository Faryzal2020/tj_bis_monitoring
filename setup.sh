#!/bin/bash

# Check if Bun is installed
if command -v bun &> /dev/null; then
    echo "Bun is installed. Checking for bun.lock..."
    if [ -f "bun.lock" ]; then
        echo "bun.lock found. Installing dependencies with Bun..."
        bun install
    else
        echo "bun.lock not found, but Bun is installed. Installing dependencies with Bun..."
        bun install
    fi
    
    echo "Starting development server with Bun..."
    bun run dev
elif command -v npm &> /dev/null; then
    echo "Bun is not installed, but npm is. Using npm."
    echo "Installing dependencies with npm..."
    npm install
    
    echo "Starting development server with npm..."
    npm run dev
else
    echo "Neither Bun nor npm is installed. Please install one of them to proceed."
    exit 1
fi
