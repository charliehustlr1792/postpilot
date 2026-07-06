#!/bin/sh
set -e

# Apply pending migrations before the server (and its BullMQ workers) start.
echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting PostPilot backend..."
exec npm start
