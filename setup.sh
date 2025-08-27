#!/bin/bash

echo "🚀 Setting up Project B..."

# Check if we're in the right directory
if [ ! -f "setup.sh" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Setting up backend..."
cd backend

# Remove existing venv if it exists
if [ -d "venv" ]; then
    echo "🧹 Removing existing virtual environment..."
    rm -rf venv
fi

# Create new virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment and install dependencies
echo "📥 Installing Python dependencies..."
source venv/bin/activate

# Upgrade pip first
pip install --upgrade pip

# Install dependencies with pre-built wheels when possible
pip install --only-binary=:all: fastapi uvicorn sqlalchemy pydantic python-multipart aiofiles bcrypt PyJWT
pip install --only-binary=:all: paramiko asyncssh

# Try to install remaining dependencies
echo "🔧 Installing remaining dependencies..."
pip install -r requirements.txt

# Install playwright browsers
echo "🎭 Installing playwright browsers..."
playwright install

cd ..

echo "📦 Setting up frontend..."
cd frontend

# Remove existing node_modules if they exist
if [ -d "node_modules" ]; then
    echo "🧹 Removing existing node_modules..."
    rm -rf node_modules package-lock.json
fi

# Install frontend dependencies
echo "📥 Installing Node.js dependencies..."
npm install

cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application:"
echo "Backend: cd backend && ./run.sh"
echo "Frontend: cd frontend && npm run dev"