#!/bin/bash

set -e

echo "📦 Запуск Alembic миграций..."

APP_ENV=${APP_ENV:-dev}
PROJECT_ROOT="/app"
cd "$PROJECT_ROOT"

# Set Python path
export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"

ALEMBIC_INI="/app/app/database/migrations/alembic.ini"
VERSIONS_DIR="/app/app/database/migrations/versions"

# Check if alembic.ini exists
if [ ! -f "$ALEMBIC_INI" ]; then
  echo "❌ Не найден alembic.ini по пути: $ALEMBIC_INI"
  exit 1
fi

# Check and create versions directory
if [ ! -d "$VERSIONS_DIR" ]; then
  echo "📁 Папка versions не найдена. Создаю: $VERSIONS_DIR"
  mkdir -p "$VERSIONS_DIR"
  chmod 777 "$VERSIONS_DIR"
fi

# Wait for database to be ready
echo "⏳ Ожидание готовности базы данных..."
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
  echo "⏳ База данных еще не готова, ожидание..."
  sleep 2
done
echo "✅ База данных готова"

# Auto-generate migrations if AUTO_GENERATE_MIGRATIONS is set
if [ "${AUTO_GENERATE_MIGRATIONS:-false}" = "true" ]; then
  echo "🔧 Автоматическое создание миграций..."
  
  # Check if there are any pending changes
  echo "🔍 Проверка изменений в моделях..."
  if uv run alembic -c "$ALEMBIC_INI" check 2>/dev/null; then
    echo "📝 Создание автоматической миграции..."
    uv run alembic -c "$ALEMBIC_INI" revision --autogenerate -m "autogen_$(date +%Y%m%d_%H%M%S)"
    echo "✅ Автоматическая миграция создана"
  else
    echo "ℹ️  Изменений в моделях не обнаружено, пропускаю создание миграции"
  fi
fi

echo "🚀 Применение миграций..."

# First, check for multiple heads
echo "🔍 Проверка состояния миграций..."
uv run alembic -c "$ALEMBIC_INI" heads

# Apply migrations using 'heads' to handle multiple heads
echo "📝 Применение всех головных миграций..."
uv run alembic -c "$ALEMBIC_INI" upgrade heads

echo "✅ Alembic миграции выполнены"
