#!/bin/sh
set -e

# This script initializes the data directory when a new PVC is mounted
# It checks if the necessary files exist, and if not, copies them from the source location

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