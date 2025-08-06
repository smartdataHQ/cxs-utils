# Docker Testing Guide

This guide provides comprehensive instructions for testing Docker builds locally and troubleshooting common issues.

## Testing Docker Builds Locally

### 1. Building the Docker Image

```bash
# Navigate to the docs directory
cd docs

# Build the image with a tag
docker build -t cxs-utils-docs:test .
```

This command builds the Docker image using the Dockerfile in the current directory and tags it as `cxs-utils-docs:test`.

### 2. Verifying the Build

```bash
# List all images to confirm your image was created
docker images | grep cxs-utils-docs
```

You should see your image listed with the tag `test`.

### 3. Running the Container

```bash
# Run the container with port mapping
docker run -p 3000:3000 --name docs-test cxs-utils-docs:test
```

This command:
- Maps port 3000 from the container to port 3000 on your host machine
- Names the container `docs-test` for easy reference
- Uses the image tagged as `cxs-utils-docs:test`

### 4. Verifying the Container is Running

```bash
# List running containers
docker ps
```

You should see your container running with the name `docs-test`.

### 5. Accessing the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### 6. Checking Container Logs

If nothing appears in the browser, check the container logs:

```bash
# View logs from the running container
docker logs docs-test

# Follow logs in real-time
docker logs -f docs-test
```

### 7. Inspecting the Container

```bash
# Get detailed information about the container
docker inspect docs-test
```

Pay attention to the "NetworkSettings" section to verify port mappings.

### 8. Accessing the Container Shell

```bash
# Access the container's shell
docker exec -it docs-test /bin/sh
```

Once inside, you can:
- Check if the server is running: `ps aux | grep node`
- Verify files exist: `ls -la`
- Check network configuration: `netstat -tuln` (may need to install with `apk add --no-cache net-tools`)

## Automated Testing Script

Create a file named `test-docker.sh` in the docs directory:

```bash
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

# Run the container in detached mode
echo "🚀 Starting container..."
docker run -d -p 3000:3000 --name docs-test cxs-utils-docs:test

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

echo "🧪 Test complete! Container 'docs-test' is still running."
echo "To stop and remove the container, run: docker stop docs-test && docker rm docs-test"
```

Make the script executable:
```bash
chmod +x test-docker.sh
```

Run the script:
```bash
./test-docker.sh
```

## Troubleshooting Common Issues

### 1. Nothing Shows in the Browser

#### Port Mapping Issues

**Symptoms:**
- Container is running but the application is not accessible in the browser

**Solutions:**
- Verify port mapping: `docker ps` should show `0.0.0.0:3000->3000/tcp`
- Try a different host port: `docker run -p 8080:3000 cxs-utils-docs:test` and access via `http://localhost:8080`
- Check if another service is using port 3000: `lsof -i :3000` or `netstat -tuln | grep 3000`

#### Container Not Starting Properly

**Symptoms:**
- Container exits immediately after starting
- Logs show startup errors

**Solutions:**
- Check logs: `docker logs docs-test`
- Run in interactive mode: `docker run -it -p 3000:3000 cxs-utils-docs:test /bin/sh`
- Manually start the server: `node server.js`

#### Environment Variables

**Symptoms:**
- Application starts but shows errors or blank pages
- Logs show missing configuration

**Solutions:**
- Pass environment variables when running the container:
  ```bash
  docker run -p 3000:3000 \
    -e AIRTABLE_API_KEY=your_key \
    -e AIRTABLE_BASE_ID=your_base_id \
    -e AIRTABLE_EVENTS_TABLE_ID=your_table_id \
    -e AIRTABLE_ALIASES_TABLE_ID=your_aliases_table_id \
    cxs-utils-docs:test
  ```
- Create a `.env` file and pass it to the container:
  ```bash
  docker run -p 3000:3000 --env-file .env.docker cxs-utils-docs:test
  ```

#### Network Issues

**Symptoms:**
- Container starts but application can't connect to external services
- Logs show connection errors

**Solutions:**
- Check network configuration: `docker network ls`
- Run with host network: `docker run --network host cxs-utils-docs:test`
- Verify DNS resolution inside container: `docker exec -it docs-test nslookup google.com`

### 2. Application Errors

#### Missing Files or Directories

**Symptoms:**
- Logs show "file not found" or similar errors
- Application crashes on startup

**Solutions:**
- Verify files were copied correctly: `docker exec -it docs-test ls -la /app`
- Check file permissions: `docker exec -it docs-test ls -la /app | grep server.js`
- Rebuild with verbose output: `docker build --progress=plain -t cxs-utils-docs:test .`

#### JavaScript/Next.js Errors

**Symptoms:**
- Logs show JavaScript errors
- White screen in browser with console errors

**Solutions:**
- Check browser console for errors
- Run in development mode to get more detailed errors
- Verify Next.js configuration is correct for containerized environments

## Best Practices for Docker Testing

1. **Use Docker Compose for complex setups**
   - Create a `docker-compose.yml` file for multi-container applications
   - Simplifies environment variable management and container linking

2. **Create a dedicated testing environment**
   - Use environment variables to distinguish between production and testing
   - Create separate configuration files for testing

3. **Implement health checks**
   - Add HEALTHCHECK instruction to your Dockerfile
   - Use tools like curl or wget to verify the application is responding

4. **Automate testing with CI/CD**
   - Integrate Docker testing into your CI/CD pipeline
   - Use tools like GitHub Actions to automatically test Docker builds

5. **Monitor resource usage**
   - Check container resource usage: `docker stats docs-test`
   - Identify performance bottlenecks and optimize accordingly