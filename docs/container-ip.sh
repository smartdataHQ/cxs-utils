#!/bin/bash

echo "🔍 Finding Docker container IP addresses..."
echo ""

# Check if docker command is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Get all running containers
CONTAINERS=$(docker ps --format "{{.ID}}\t{{.Names}}\t{{.Image}}" | grep "cxs-utils-docs")

if [ -z "$CONTAINERS" ]; then
    echo "❌ No running containers with 'cxs-utils-docs' in the image name found."
    echo "   Make sure your container is running with:"
    echo "   docker run -d -p 3000:3000 --name docs-container cxs-utils-docs:local"
    exit 1
fi

echo "📋 Found the following containers:"
echo ""
echo "CONTAINER ID    NAME               IP ADDRESS       IMAGE"
echo "------------    ---------------    --------------   ----------------"

# For each container, get its IP address
while IFS=$'\t' read -r ID NAME IMAGE; do
    # Get container IP address
    IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$ID")
    
    echo "$ID    $NAME    $IP    $IMAGE"
    
    # Store for later use
    CONTAINER_IDS+=("$ID")
    CONTAINER_NAMES+=("$NAME")
    CONTAINER_IPS+=("$IP")
    CONTAINER_IMAGES+=("$IMAGE")
done <<< "$CONTAINERS"

echo ""
echo "✅ You can access your application at:"
echo ""

# Print access URLs for each container
for i in "${!CONTAINER_IPS[@]}"; do
    echo "   Container: ${CONTAINER_NAMES[$i]}"
    echo "   • http://${CONTAINER_IPS[$i]}:3000"
    echo "   • http://${CONTAINER_IPS[$i]}:3000/docs"
    echo ""
done

echo "🔧 If you can't access the application, make sure:"
echo "   1. The container is running (docker ps)"
echo "   2. The application is binding to all interfaces (0.0.0.0)"
echo "   3. No firewall is blocking access to the container"
echo "   4. You're on the same network as the Docker host"
echo ""
echo "💡 To check container logs: docker logs CONTAINER_ID"