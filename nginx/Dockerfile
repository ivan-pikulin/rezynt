FROM nginx:alpine

# Install openssl for certificate checking
RUN apk add --no-cache openssl

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl/rezynt.com

# Copy SSL check script
COPY check-ssl.sh /usr/local/bin/check-ssl.sh
RUN chmod +x /usr/local/bin/check-ssl.sh

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
