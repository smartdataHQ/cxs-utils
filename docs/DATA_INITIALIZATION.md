# Data Directory Initialization

## Overview

This document explains how the application's data directory is initialized when a new Persistent Volume Claim (PVC) is used in Kubernetes.

## The Issue

When a Persistent Volume Claim (PVC) is mounted to a container in Kubernetes, it replaces the contents of the mount point directory with the contents of the volume. If the volume is empty (as is the case with a new PVC), the directory will appear empty to the container, even if the directory was created and populated during the image build.

Our application expects certain files to exist in the `/app/data` directory, specifically:
- `/app/data/event-bible/events.json`
- `/app/data/event-bible/documentation/template.mdoc`
- Various other `.mdoc` files in the documentation directory

If these files don't exist when the application starts, it will fail when trying to read them.

## The Solution

We've implemented a solution that primes the data directory when a new PVC is used. The solution consists of:

1. An initialization script (`init-data.sh`) that:
   - Checks if the necessary directories exist, and creates them if they don't
   - Checks if the necessary files exist, and copies them from a source location if they don't

2. Modifications to the Dockerfile to:
   - Copy the data directory to a source location (`/app/init-data`) for initialization
   - Copy the initialization script to the image and make it executable
   - Create an entrypoint script that runs the initialization script before starting the application

3. An entrypoint script that:
   - Runs the initialization script
   - Starts the application

## How It Works

When a container starts with a new PVC mounted at `/app/data`:

1. The entrypoint script runs the initialization script
2. The initialization script checks if the necessary files exist in the mounted PVC
3. If the files don't exist, the script copies them from the source location in the image
4. The application starts with all the necessary files in place

This ensures that the application can function correctly even when a new PVC is used.

## Implementation Details

### Initialization Script

The initialization script (`init-data.sh`) is located in the root of the container and is responsible for checking if the necessary files exist and copying them if they don't:

```sh
#!/bin/sh
set -e

# Source directory in the image
SRC_DIR="/app/init-data"

# Destination directory (mounted PVC)
DEST_DIR="/app/data"

# Create the event-bible directory if it doesn't exist
mkdir -p ${DEST_DIR}/event-bible
mkdir -p ${DEST_DIR}/event-bible/documentation
mkdir -p ${DEST_DIR}/event-bible/backups

# Check if events.json exists, if not copy it
if [ ! -f "${DEST_DIR}/event-bible/events.json" ]; then
    echo "Initializing events.json..."
    cp ${SRC_DIR}/event-bible/events.json ${DEST_DIR}/event-bible/events.json
    echo "events.json initialized."
fi

# Check if template.mdoc exists, if not copy it
if [ ! -f "${DEST_DIR}/event-bible/documentation/template.mdoc" ]; then
    echo "Initializing template.mdoc..."
    cp ${SRC_DIR}/event-bible/documentation/template.mdoc ${DEST_DIR}/event-bible/documentation/template.mdoc
    echo "template.mdoc initialized."
fi

# Copy all other .mdoc files if they don't exist
for mdoc_file in ${SRC_DIR}/event-bible/documentation/*.mdoc; do
    filename=$(basename "$mdoc_file")
    if [ "$filename" != "template.mdoc" ] && [ ! -f "${DEST_DIR}/event-bible/documentation/$filename" ]; then
        echo "Copying $filename..."
        cp "$mdoc_file" "${DEST_DIR}/event-bible/documentation/$filename"
    fi
done

echo "Data directory initialization complete."
```

### Dockerfile Changes

The Dockerfile has been modified to include the necessary files and run the initialization script:

```dockerfile
# Copy data directory to a source location for initialization
COPY docs/data /app/init-data

# Copy initialization script
COPY docs/init-data.sh /app/init-data.sh
RUN chmod +x /app/init-data.sh

# Create an entrypoint script to run initialization and then start the app
RUN echo '#!/bin/sh\n\
/app/init-data.sh\n\
exec node server.js --hostname 0.0.0.0\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Set the command to run the entrypoint script
CMD ["/app/entrypoint.sh"]
```

## Testing the Solution

To verify that the solution works correctly, you can follow these steps:

1. Build the Docker image with the changes:
   ```bash
   docker build -t cxs-utils-docs:test -f docs/Dockerfile .
   ```

2. Create a test environment that simulates a new PVC:
   ```bash
   # Create a temporary directory to simulate an empty PVC
   mkdir -p /tmp/test-pvc
   
   # Run the container with the empty directory mounted at /app/data
   docker run -v /tmp/test-pvc:/app/data -p 3000:3000 cxs-utils-docs:test
   ```

3. Check the container logs to verify that the initialization script ran successfully:
   ```bash
   # In another terminal
   docker ps  # Get the container ID
   docker logs <container_id>
   ```
   
   You should see output like:
   ```
   Initializing events.json...
   events.json initialized.
   Initializing template.mdoc...
   template.mdoc initialized.
   Copying commerce.discovery.hotel_searched.mdoc...
   ...
   Data directory initialization complete.
   ```

4. Verify that the files were copied to the mounted volume:
   ```bash
   ls -la /tmp/test-pvc/event-bible
   ls -la /tmp/test-pvc/event-bible/documentation
   ```
   
   You should see the events.json file and the .mdoc files in the appropriate directories.

5. Access the application at http://localhost:3000 to verify that it works correctly with the initialized data.

In a Kubernetes environment, you would:

1. Apply the updated Dockerfile and build a new image
2. Deploy the application with a new PVC
3. Check the pod logs to verify that the initialization script ran successfully
4. Verify that the application works correctly with the initialized data

## Conclusion

With these changes, the application's data directory is properly primed when a new PVC is used, ensuring that the application can function correctly even when deployed with a fresh volume. This addresses the issue of the application failing when trying to read files that don't exist in a new PVC.

The solution is robust because:
1. It only copies files that don't already exist, preserving any existing data
2. It creates the necessary directory structure if it doesn't exist
3. It runs automatically when the container starts, requiring no manual intervention
4. It's transparent to the application, which continues to work as expected