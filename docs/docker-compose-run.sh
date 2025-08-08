#!/bin/bash

echo "🚀 Running the docs application with Docker Compose..."

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed or not in PATH"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env.docker exists and create it if it doesn't
if [ ! -f ".env.docker" ]; then
    echo "⚠️ No .env.docker file found. Creating one from .env.docker.example..."
    
    if [ -f ".env.docker.example" ]; then
        cp .env.docker.example .env.docker
        echo "✅ Created .env.docker from example file."
        echo "⚠️ Please edit .env.docker to add your actual API keys and configuration values."
        echo "   You can do this now in another terminal window."
        read -p "Press Enter to continue or Ctrl+C to abort..."
    else
        echo "❌ .env.docker.example not found. Please create a .env.docker file manually."
        exit 1
    fi
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down

# Start the application
echo "🚀 Starting the application..."
docker-compose up -d

# Check if the application started successfully
if [ $? -eq 0 ]; then
    echo "✅ Application started successfully!"
    echo "🌐 You can access it at: http://localhost:3000"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs: docker-compose logs"
    echo "   - Follow logs: docker-compose logs -f"
    echo "   - Stop the application: docker-compose down"
    echo "   - Restart the application: docker-compose restart"
else
    echo "❌ Failed to start the application."
    echo "📋 Check the logs for more information: docker-compose logs"
fi