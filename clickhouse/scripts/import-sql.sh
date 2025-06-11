#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_DIR="$(cd "$SCRIPT_DIR/../../cxs-schema/sql" && pwd)"

# First, stop any existing container with the same name
docker stop clickhouse-server || true
docker rm clickhouse-server || true

# Start the ClickHouse Docker container
cd "$(dirname "$0")/.." 
docker-compose up -d

# Wait for ClickHouse to start
echo "Waiting for ClickHouse to start..."
sleep 15

docker exec clickhouse-server clickhouse-client \
      --multiquery \
      --allow_suspicious_low_cardinality_types=1 \
      --query "CREATE DATABASE IF NOT EXISTS ql; \
               CREATE DATABASE IF NOT EXISTS default; \
               system reload config;"

CH_SETTINGS="--multiquery --allow_suspicious_low_cardinality_types=1"

for f in "$SQL_DIR"/*.sql; do
  echo "Importing $(basename "$f")"
  cat "$f" | docker exec -i clickhouse-server clickhouse-client $CH_SETTINGS
done

docker exec clickhouse-server clickhouse-client \
       --allow_suspicious_low_cardinality_types=1 \
       --query "SHOW TABLES FROM ql"

echo "Import completed!"
