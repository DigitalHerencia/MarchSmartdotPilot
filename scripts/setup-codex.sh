set -euo pipefail

REQUIRED_NODE_MAJOR=20
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -v | sed 's/^v//' | cut -d. -f1)
  if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
    echo "Node.js >=20 required. Current: $(node -v)" >&2
    exit 1
  fi
else
  echo "Node.js not found. Please install Node.js >=20." >&2
  exit 1
fi

npm ci

npx prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  npx prisma db push
else
  echo "DATABASE_URL not set; skipping prisma db push"
fi

npx playwright install --with-deps

echo "Setup complete. Run 'npm run dev' to start the development server."
