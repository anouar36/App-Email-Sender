#!/bin/bash

echo "🔧 Building Email Sender Backend..."

# Set environment variables for better-sqlite3
export PYTHON=/usr/bin/python3
export CXX=g++
export CC=gcc

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Rebuild better-sqlite3 for the target platform
echo "🔨 Rebuilding better-sqlite3 for target platform..."
npm rebuild better-sqlite3 --build-from-source

echo "✅ Backend build complete!"
