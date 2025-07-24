#!/bin/bash

set -e

echo "📦 Запуск Alembic миграций..."

APP_ENV=${APP_ENV:-dev}
SCRIPT_DIR="/app/app/scripts"
PROJECT_ROOT="/app"
cd "$PROJECT_ROOT"
export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"

ALEMBIC_INI="/app/app/database/migrations/alembic.ini"
ALEMBIC_CMD="alembic -c $ALEMBIC_INI"
VERSIONS_DIR="/app/app/database/migrations/versions"

# Проверка наличия alembic.ini
if [ ! -f "$ALEMBIC_INI" ]; then
  echo "❌ Не найден alembic.ini по пути: $ALEMBIC_INI"
  exit 1
fi

# Проверка и создание директории для миграций
if [ ! -d "$VERSIONS_DIR" ]; then
  echo "📁 Папка versions не найдена. Создаю: $VERSIONS_DIR"
  mkdir -p "$VERSIONS_DIR"
  chmod 777 "$VERSIONS_DIR"
fi

# Миграции
if [ "$APP_ENV" = "dev" ]; then
  echo "🔍 DEV: Генерация и применение миграций..."
  $ALEMBIC_CMD upgrade head
  $ALEMBIC_CMD revision --autogenerate -m "autogen"
  sleep 1
fi

echo "🚀 Применение миграций..."
$ALEMBIC_CMD upgrade head

echo "✅ Alembic миграции выполнены"