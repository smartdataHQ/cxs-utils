# Resolving "Nothing Loads on Container IP Address"

## Issue

If you're experiencing the issue where **nothing loads on http://172.17.0.2:3000 or on http://172.17.0.2:3000/docs**, this document will help you resolve it.

## Cause

The root cause of this issue is that by default, the Next.js server inside the Docker container was binding only to the localhost interface (127.0.0.1) rather than all interfaces (0.0.0.0). This means:

- The server was only accepting connections from within the container itself
- Requests coming to the container's IP address (172.17.0.2) were being rejected
- Port mapping to localhost worked because Docker handles that differently

## Solution

We've implemented the following changes to fix this issue:

1. **Updated the Dockerfile**: Modified the CMD instruction to make the Next.js server bind to all interfaces:
   ```dockerfile
   CMD ["node", "server.js", "--hostname", "0.0.0.0"]
   ```

2. **Created a helper script**: Added `container-ip.sh` to help you find your container's IP address and verify connectivity:
   ```bash
   chmod +x container-ip.sh
   ./container-ip.sh
   ```

3. **Updated documentation**: Added information about accessing containers via IP address to the DOCKER.md file.

## How to Apply the Fix

### If you're building a new image:

1. Make sure you're using the latest Dockerfile that includes the fix
2. Build and run your container as usual:
   ```bash
   docker build -t cxs-utils-docs:local .
   docker run -d -p 3000:3000 --name docs-container cxs-utils-docs:local
   ```

### If you have an existing container:

1. Stop and remove your existing container:
   ```bash
   docker stop your-container-name
   docker rm your-container-name
   ```

2. Update your Dockerfile with the fix mentioned above

3. Rebuild and run your container:
   ```bash
   docker build -t cxs-utils-docs:local .
   docker run -d -p 3000:3000 --name docs-container cxs-utils-docs:local
   ```

## Verifying the Fix

1. Run the container-ip.sh script to find your container's IP address:
   ```bash
   ./container-ip.sh
   ```

2. Try accessing the application using the container's IP address:
   ```
   http://172.17.0.2:3000
   http://172.17.0.2:3000/docs
   ```
   (Replace 172.17.0.2 with your actual container IP address)

3. If you can now access the application, the fix was successful!

## Still Having Issues?

If you're still experiencing problems, check the following:

1. **Container logs**: Look for any error messages
   ```bash
   docker logs your-container-name
   ```

2. **Network configuration**: Make sure your Docker network settings allow access to the container
   ```bash
   docker network inspect bridge
   ```

3. **Firewall settings**: Ensure no firewall is blocking access to the container

4. **Environment variables**: Verify all required environment variables are set correctly
   ```bash
   docker exec your-container-name env
   ```

For more detailed troubleshooting, refer to the [Docker Testing Guide](./DOCKER_TESTING.md) and the [Docker documentation](./DOCKER.md).