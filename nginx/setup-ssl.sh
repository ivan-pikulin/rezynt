#!/bin/bash

# Скрипт для первичной настройки SSL-сертификатов Let's Encrypt
# Использование: ./setup-ssl.sh

set -e

echo "🔧 Настройка SSL-сертификатов для rezynt.com и app.rezynt.com"

# Создаем директорию для webroot
mkdir -p ./nginx/webroot/.well-known/acme-challenge

# Проверяем, что домены настроены правильно
echo "📋 Проверка DNS записей..."
echo "Убедитесь, что следующие DNS записи настроены:"
echo "  rezynt.com -> A запись на IP сервера"
echo "  app.rezynt.com -> A запись на IP сервера"
echo ""

# Запускаем контейнеры без SSL (временно)
echo "🚀 Запуск контейнеров для получения сертификатов..."
docker-compose up -d nginx

# Ждем, пока nginx запустится
sleep 10

# Получаем сертификаты для основного домена
echo "🔐 Получение сертификата для rezynt.com..."
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email team@rezynt.com \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d rezynt.com

# Получаем сертификаты для поддомена
echo "🔐 Получение сертификата для app.rezynt.com..."
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email team@rezynt.com \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d app.rezynt.com

# Перезапускаем nginx с SSL
echo "🔄 Перезапуск nginx с SSL конфигурацией..."
docker-compose restart nginx

# Запускаем certbot для автоматического обновления
echo "⏰ Запуск автоматического обновления сертификатов..."
docker-compose up -d certbot

echo "✅ Настройка SSL завершена!"
echo ""
echo "📝 Проверьте сертификаты:"
echo "  https://rezynt.com"
echo "  https://app.rezynt.com"
echo ""
echo "🔄 Автоматическое обновление сертификатов настроено (каждые 12 часов)"
