#!/bin/bash

# Check SSL certificate validity
echo "Checking SSL certificate for rezynt.com..."

# Check if certificate files exist
if [ ! -f "/etc/nginx/ssl/rezynt.com/fullchain.pem" ]; then
    echo "ERROR: SSL certificate file not found: /etc/nginx/ssl/rezynt.com/fullchain.pem"
    exit 1
fi

if [ ! -f "/etc/nginx/ssl/rezynt.com/privkey.pem" ]; then
    echo "ERROR: SSL private key file not found: /etc/nginx/ssl/rezynt.com/privkey.pem"
    exit 1
fi

# Check certificate validity
echo "Certificate details:"
openssl x509 -in /etc/nginx/ssl/rezynt.com/fullchain.pem -text -noout | grep -E "(Subject:|Not Before|Not After)"

# Check if certificate is valid
if openssl x509 -checkend 86400 -noout -in /etc/nginx/ssl/rezynt.com/fullchain.pem; then
    echo "SSL certificate is valid and will not expire in the next 24 hours"
else
    echo "WARNING: SSL certificate will expire within 24 hours or is already expired"
fi

echo "SSL check completed" 