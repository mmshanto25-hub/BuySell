#!/bin/sh
set -e

# Container Healthcheck Script
API_URL="${API_URL:-http://localhost:5000}"

echo "Checking API liveness at $API_URL/health/liveness..."
curl -fsS "$API_URL/health/liveness" > /dev/null || {
  echo "API liveness check failed!"
  exit 1
}

echo "Checking API readiness at $API_URL/health/readiness..."
curl -fsS "$API_URL/health/readiness" > /dev/null || {
  echo "API readiness check failed!"
  exit 1
}

echo "Healthcheck OK."
exit 0
