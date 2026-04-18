#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "1/3 Copy backend env if needed"
if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  cp "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env"
  echo "Created backend/.env from example"
fi

echo "2/3 Start frontend on http://localhost:8080"
node "$ROOT_DIR/index.js" &
FRONT_PID=$!

echo "3/3 Start backend on http://localhost:3000"
cd "$ROOT_DIR/backend"
npm start

trap "kill $FRONT_PID" EXIT
