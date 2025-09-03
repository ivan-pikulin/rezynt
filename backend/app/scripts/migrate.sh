#!/bin/bash

set -e

echo "📦 Running Alembic migrations..."

APP_ENV=${APP_ENV:-dev}
PROJECT_ROOT="/app"
cd "$PROJECT_ROOT"

# Set Python path
export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"

ALEMBIC_INI="/app/app/database/migrations/alembic.ini"
VERSIONS_DIR="/app/app/database/migrations/versions"
ALEMBIC_CMD="uv run alembic -c $ALEMBIC_INI"


# Check if alembic.ini exists
if [ ! -f "$ALEMBIC_INI" ]; then
  echo "❌ alembic.ini not found at path: $ALEMBIC_INI"
  exit 1
fi

# Check and create versions directory
if [ ! -d "$VERSIONS_DIR" ]; then
  echo "📁 versions folder not found. Creating: $VERSIONS_DIR"
  mkdir -p "$VERSIONS_DIR"
  chmod 777 "$VERSIONS_DIR"
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until uv run python -c "
import asyncio
import asyncpg
import os

async def check_db():
    try:
        conn = await asyncpg.connect(
            host=os.getenv('POSTGRES_HOST', 'postgres'),
            port=int(os.getenv('POSTGRES_PORT', 5432)),
            user=os.getenv('POSTGRES_USER', 'postgres'),
            password=os.getenv('POSTGRES_PASSWORD', 'password'),
            database=os.getenv('POSTGRES_DB', 'rezynt')
        )
        await conn.close()
        return True
    except Exception:
        return False

if asyncio.run(check_db()):
    print('Database is ready')
    exit(0)
else:
    print('Database not ready')
    exit(1)
" 2>/dev/null; do
  echo "⏳ Database is not ready yet, waiting..."
  sleep 2
done
echo "✅ Database is ready"

# Auto-generate migrations if AUTO_GENERATE_MIGRATIONS is set
if [ "${AUTO_GENERATE_MIGRATIONS:-false}" = "true" ]; then
  echo "🔧 Auto-generating migrations..."
  $ALEMBIC_CMD upgrade head
  $ALEMBIC_CMD revision --autogenerate -m "autogen"
  echo "✅ Migration creation completed"
fi


echo "📝 Applying migrations..."
$ALEMBIC_CMD upgrade head

echo "✅ Alembic migrations completed"
