#!/bin/bash

echo "🧪 Testing Docker build and run..."

# Build the image
echo "🔨 Building Docker image..."
docker build -t cxs-utils-docs:test .

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi
echo "✅ Docker build successful!"

# Stop and remove existing container if it exists
docker stop docs-test 2>/dev/null
docker rm docs-test 2>/dev/null

# Check if .env.docker exists and use it if available
ENV_FILE_PARAM=""
if [ -f ".env.docker" ]; then
    echo "📄 Found .env.docker file, using it for environment variables..."
    ENV_FILE_PARAM="--env-file .env.docker"
else
    echo "⚠️ No .env.docker file found. Consider creating one from .env.docker.example"
    echo "   This might be why nothing shows up in the browser."
fi

# Run the container in detached mode
echo "🚀 Starting container..."
docker run -d -p 3000:3000 --name docs-test ${ENV_FILE_PARAM} cxs-utils-docs:test

# Check if container started successfully
if [ $? -ne 0 ]; then
    echo "❌ Container failed to start!"
    exit 1
fi
echo "✅ Container started successfully!"

# Wait for the application to initialize
echo "⏳ Waiting for application to initialize (10 seconds)..."
sleep 10

# Check if the application is responding
echo "🔍 Testing application response..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$response" = "200" ]; then
    echo "✅ Application is responding (HTTP 200)!"
    echo "🌐 Open http://localhost:3000 in your browser"
else
    echo "⚠️ Application returned HTTP $response"
    echo "📋 Container logs:"
    docker logs docs-test
fi

# Check for common issues
echo "🔍 Checking for common issues..."

# Check if environment variables are set
echo "Checking environment variables inside container..."
docker exec docs-test env | grep -E 'AIRTABLE|NODE_ENV'

# Check if server.js exists and has correct permissions
echo "Checking server.js file..."
docker exec docs-test ls -la /app/server.js

# Check if the server process is running
echo "Checking if server process is running..."
docker exec docs-test ps aux | grep node

echo "🧪 Test complete! Container 'docs-test' is still running."
echo "To stop and remove the container, run: docker stop docs-test && docker rm docs-test"