#!/bin/bash

# Скрипт для проверки статуса SSL-сертификатов
# Использование: ./check-ssl.sh

echo "🔍 Проверка статуса SSL-сертификатов"
echo "===================================="

# Функция для проверки сертификата
check_certificate() {
    local domain=$1
    echo "📋 Проверка сертификата для $domain:"
    
    # Проверяем сертификат через openssl
    echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer
    
    # Проверяем сертификат через curl
    local curl_result=$(curl -I -s --connect-timeout 10 https://$domain | head -n 1)
    echo "HTTP статус: $curl_result"
    echo ""
}

# Проверяем оба домена
check_certificate "rezynt.com"
check_certificate "app.rezynt.com"

# Проверяем статус автоматического обновления
echo "⏰ Статус автоматического обновления:"
docker-compose ps certbot

echo ""
echo "📝 Информация о сертификатах в контейнере:"
docker-compose exec certbot certbot certificates

echo ""
echo "🔄 Тест обновления сертификатов (dry-run):"
docker-compose exec certbot certbot renew --dry-run