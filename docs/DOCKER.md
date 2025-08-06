# Docker and GitHub Actions Setup for Docs

This document describes the Docker setup and GitHub Actions workflow for building and deploying the docs application to DockerHub.

## Docker Setup

The docs application has been containerized using Docker. The Dockerfile is located at `docs/Dockerfile` and uses a multi-stage build approach to create an optimized production image:

1. **Dependencies Stage**: Installs npm dependencies
2. **Builder Stage**: Builds the Next.js application
3. **Runner Stage**: Creates a minimal production image with only the necessary files

### Building the Docker Image Locally

To build the Docker image locally, run the following command from the repository root:

```bash
docker build -t cxs-utils-docs:local -f docs/Dockerfile docs/
```

### Running the Docker Image Locally

To run the Docker image locally, use:

```bash
docker run -p 3000:3000 cxs-utils-docs:local
```

The application will be available at http://localhost:3000.

#### Running with Environment Variables

For the application to function correctly, you'll need to provide environment variables. We've included an example file (.env.docker.example) that you can use as a template:

1. Copy the example file:
   ```bash
   cp .env.docker.example .env.docker
   ```

2. Edit the .env.docker file to add your actual API keys and configuration values:
   ```bash
   nano .env.docker  # or use your preferred editor
   ```

3. Run the container with the environment file:
   ```bash
   docker run -p 3000:3000 --env-file .env.docker cxs-utils-docs:local
   ```

This ensures that all necessary environment variables are available to the application, which is often required for the UI to display correctly.

## GitHub Actions Workflow

A GitHub Actions workflow has been set up to automatically build and push the Docker image to DockerHub. The workflow file is located at `.github/workflows/docker-build-push.yml`.

### Workflow Triggers

The workflow is triggered on:
- Pushes to the `main` branch (only when changes are made to the `docs/` directory or the workflow file)
- Pull requests to the `main` branch (only when changes are made to the `docs/` directory or the workflow file)
- Manual triggers via the GitHub Actions UI

### Workflow Steps

1. Checkout the code
2. Set up Docker Buildx for efficient builds
3. Login to DockerHub using repository secrets
4. Build and push the Docker image to DockerHub
   - On pushes to `main`, the image is both built and pushed
   - On pull requests, the image is only built (not pushed)
   - The image is tagged with both `latest` and the commit SHA

### Required Secrets

The workflow requires the following secrets to be set in the GitHub repository:

- `DOCKERHUB_USERNAME`: Your DockerHub username
- `DOCKERHUB_TOKEN`: A DockerHub access token (not your password)

### Setting Up the Secrets

1. Create a DockerHub access token:
   - Log in to DockerHub
   - Go to Account Settings > Security
   - Click "New Access Token"
   - Give it a name (e.g., "GitHub Actions")
   - Copy the token

2. Add the secrets to your GitHub repository:
   - Go to your GitHub repository
   - Click on "Settings" > "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Add the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets

## Using the Docker Image

Once the image is pushed to DockerHub, you can pull and run it using:

```bash
docker pull <username>/cxs-utils-docs:latest
docker run -p 3000:3000 <username>/cxs-utils-docs:latest
```

Replace `<username>` with your DockerHub username.

## Using Docker Compose

We've added Docker Compose support to make it easier to run the docs application. Docker Compose allows you to define and run multi-container Docker applications with a single command.

### Prerequisites

- [Docker Compose](https://docs.docker.com/compose/install/) installed on your system

### Running with Docker Compose

1. Navigate to the docs directory:
   ```bash
   cd docs
   ```

2. Make sure you have a `.env.docker` file with your environment variables:
   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker with your actual values
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Access the application at http://localhost:3000

### Common Docker Compose Commands

```bash
# Start the application in detached mode
docker-compose up -d

# View logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild the image and start the application
docker-compose up -d --build

# View the status of the containers
docker-compose ps
```

### Advantages of Docker Compose

- **Simplified Management**: Run the application with a single command
- **Environment Variables**: Easily manage environment variables with the env_file option
- **Volume Management**: Persistent data storage with named volumes
- **Health Checks**: Automatic health monitoring of the application
- **Restart Policies**: Automatic container restart if it crashes

## Testing Docker Builds

For comprehensive instructions on testing Docker builds locally and troubleshooting common issues, please refer to the [Docker Testing Guide](./DOCKER_TESTING.md).

### Automated Testing Script

We've created an automated testing script that helps verify your Docker build and diagnose common issues:

```bash
# Navigate to the docs directory
cd docs

# Make the script executable
chmod +x test-docker.sh

# Run the testing script
./test-docker.sh
```

The script will:
1. Build the Docker image
2. Run the container with proper port mapping
3. Test if the application is responding
4. Check for common configuration issues
5. Display detailed logs if problems are detected

This is especially helpful when troubleshooting the "nothing shows up in browser" issue.

## Troubleshooting

### Common Issues and Solutions

#### 1. ENV Format Warning

If you see a warning like:
```
LegacyKeyValueFormat: "ENV key=value" should be used instead of legacy "ENV key value" format
```

**Solution**: Update the ENV instruction in the Dockerfile to use the key=value format:
```dockerfile
# Correct format
ENV NODE_ENV=production

# Incorrect format
ENV NODE_ENV production
```

#### 2. TypeScript Build Errors

If the build fails with TypeScript errors, check the error message for details about missing properties or type mismatches. Common issues include:

- Missing required properties in interface implementations
- Type mismatches between expected and actual types
- Incorrect import paths

**Solution**: Fix the TypeScript errors in the codebase according to the error messages.

#### 3. Missing Public Directory

If the build fails with an error like:
```
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref: "/app/public": not found
```

**Solution**: Create the public directory in the builder stage before the build:
```dockerfile
# Create public directory if it doesn't exist
RUN mkdir -p public
```

This ensures that the directory exists even if it's not included in the source code.

#### 4. Nothing Shows in Browser

If the container builds and runs successfully but nothing appears in the browser:

**Symptoms:**
- Docker container is running (visible in `docker ps`)
- No error messages in container logs
- Browser shows a blank page or cannot connect

**Solutions:**
- Check container logs: `docker logs <container_name>`
- Verify port mapping: `docker ps` should show `0.0.0.0:3000->3000/tcp`
- Ensure environment variables are properly set
- Try accessing with a different browser or in incognito mode
- Check browser console for JavaScript errors

For more detailed troubleshooting steps, refer to the [Docker Testing Guide](./DOCKER_TESTING.md).

#### 5. Accessing Container via IP Address

If you need to access the container directly via its IP address (e.g., http://172.17.0.2:3000) instead of localhost:

**Symptoms:**
- Application works on localhost but not when accessing via container IP
- You're trying to access the container from another machine on the network

**Solutions:**
- Make sure the application is binding to all interfaces (0.0.0.0) instead of just localhost
- Use the provided script to find your container's IP address:
  ```bash
  ./container-ip.sh
  ```
- Check if there are any network isolation settings in Docker that might be preventing access
- Verify that the container's network is accessible from your machine

**Note:** The latest version of the Dockerfile has been updated to bind to all interfaces by default, which should resolve this issue.