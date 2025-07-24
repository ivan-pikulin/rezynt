FROM nginx:alpine

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
