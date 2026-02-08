#!/bin/bash

# Cricket Tournament Scheduler - Quick Setup Script
# For local development (non-Docker)

echo "🏏 Cricket Tournament Scheduler - Setup"
echo "========================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. You'll need to install it."
    echo "   Visit: https://www.postgresql.org/download/"
fi

# Navigate to backend
cd backend

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo ""
echo "Installing Python dependencies..."
echo "This may take a few minutes..."
pip install -r requirements.txt

# Copy .env.example to .env
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials"
fi

echo ""
echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL database:"
echo "   createdb cricket_tournament_db"
echo ""
echo "2. Update .env file with your database credentials"
echo ""
echo "3. Activate virtual environment:"
echo "   source backend/venv/bin/activate"
echo ""
echo "4. Run the application:"
echo "   cd backend"
echo "   uvicorn app.main:app --reload"
echo ""
echo "5. Open API docs:"
echo "   http://localhost:8000/api/docs"
echo ""
echo "Or use Docker (easier):"
echo "   docker-compose up -d"
echo ""
echo "========================================"
