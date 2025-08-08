#!/bin/bash

echo "🚀 Running the docs Docker image locally..."

# Check if .env.docker exists and use it if available
if [ -f ".env.docker" ]; then
    echo "📄 Using environment variables from .env.docker"
    docker run -p 3000:3000 --env-file .env.docker --name docs-local cxs-utils-docs:local
else
    echo "⚠️ No .env.docker file found. The application may not function correctly."
    echo "💡 Consider creating one from .env.docker.example first:"
    echo "    cp .env.docker.example .env.docker"
    echo "    nano .env.docker  # Edit with your values"
    echo ""
    echo "🔄 Continuing without environment variables..."
    docker run -p 3000:3000 --name docs-local cxs-utils-docs:local
fi

echo ""
echo "✅ If the container started successfully, the application should be available at:"
echo "   http://localhost:3000"
echo ""
echo "📋 To view logs: docker logs docs-local"
echo "🛑 To stop: docker stop docs-local"
echo "🗑️ To remove: docker rm docs-local"