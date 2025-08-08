# Accessing the Docker Image in Your Local Browser

## Yes, you can access the Docker image in your local browser without docker-compose!

The Docker image exposes port 3000 and runs a web server that you can access directly in your browser.

### Quick Start:

1. **Build the image** (if needed):
   ```bash
   cd docs
   docker build -t cxs-utils-docs:local .
   ```

2. **Run the container** with port mapping:
   ```bash
   docker run -p 3000:3000 --env-file .env.docker cxs-utils-docs:local
   ```

3. **Access in browser**:
   ```
   http://localhost:3000
   ```

### Using the Helper Script:

For convenience, I've created a `run-docker.sh` script:
```bash
cd docs
./run-docker.sh
```

### Important Notes:

- Environment variables are crucial for functionality
- Use the `.env.docker.example` as a template
- If you see a blank page, check container logs