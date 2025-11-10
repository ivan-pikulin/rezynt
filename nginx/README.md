# Nginx Configuration for Rezynt.com

## SSL Certificate Setup

### 1. Obtain SSL Certificate

For production deployment, you need to obtain SSL certificates for `rezynt.com` and `www.rezynt.com`.

#### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt update
sudo apt install certbot

# Obtain certificate for both domains
sudo certbot certonly --standalone -d rezynt.com -d www.rezynt.com

# Certificates will be placed in:
# /etc/letsencrypt/live/rezynt.com/fullchain.pem
# /etc/letsencrypt/live/rezynt.com/privkey.pem
```

#### Using Other Certificate Authorities

If using a different CA, place your certificates in:
- `/etc/letsencrypt/live/rezynt.com/fullchain.pem`
- `/etc/letsencrypt/live/rezynt.com/privkey.pem`

### 2. Certificate Renewal

For Let's Encrypt certificates, set up automatic renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Manual SSL Check

You can manually check SSL certificate status:

```bash
# Check certificate validity
docker compose exec nginx /usr/local/bin/check-ssl.sh

# Or directly on the server
openssl x509 -in /etc/letsencrypt/live/rezynt.com/fullchain.pem -text -noout
```

## Configuration Files

- `nginx.conf` - Main nginx configuration
- `check-ssl.sh` - SSL certificate validation script
- `Dockerfile` - Nginx container configuration
- `landing.conf` - Configuration for landing page container
- `POSTHOG_DEPLOYMENT.md` - PostHog reverse proxy deployment guide

## Health Checks

The nginx configuration includes health check endpoints:

- `http://localhost/health` - Nginx health check
- `https://rezynt.com/health` - Public health check

## Features

### Security Headers

The configuration includes security headers:

- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy
- Referrer-Policy

### PostHog Analytics Reverse Proxy

Nginx is configured to proxy PostHog analytics through your domain:

- **Endpoint**: `/ingest/` → proxies to PostHog cloud (us.i.posthog.com)
- **Static Assets**: `/static/` → proxies PostHog JS library (with 1h caching)
- **Benefits**: Bypasses ad blockers, improves tracking accuracy, first-party cookies

For setup instructions, see `POSTHOG_DEPLOYMENT.md` in this directory or `POSTHOG_SETUP.md` in the root.

## Troubleshooting

### Certificate Issues

1. Check certificate files exist:
   ```bash
   ls -la /etc/letsencrypt/live/rezynt.com/
   ```

2. Verify certificate validity:
   ```bash
   openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/rezynt.com/fullchain.pem
   ```

3. Check nginx configuration:
   ```bash
   docker compose exec nginx nginx -t
   ```

### Nginx Issues

1. Check nginx logs:
   ```bash
   docker compose logs nginx
   ```

2. Restart nginx:
   ```bash
   docker compose restart nginx
   ```

3. Check nginx configuration syntax:
   ```bash
   docker compose exec nginx nginx -t
   ``` 