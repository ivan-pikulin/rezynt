# Rezynt Landing Page

Landing page for Rezynt AI Resume Builder.

## Development

### Prerequisites
- Node.js 20+
- Yarn

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The development server will run on http://localhost:3001

### Build

```bash
# Build for production
yarn build
```

The build output will be in `../landing_html/` directory.

## Deployment

The landing page is automatically deployed when changes are pushed to the `main` branch via GitHub Actions.

### Deployment Process

1. **Build**: GitHub Actions builds the landing page using `yarn build`
2. **Transfer**: Built files from `landing_html/` are copied to the server via SCP
3. **Serve**: Nginx serves the static files from `/usr/share/nginx/html`

### Manual Deployment

If you need to deploy manually:

```bash
# On your local machine
cd landing
yarn build

# Copy to server (example)
scp -r ../landing_html/* user@server:/root/rezynt/landing_html/

# On the server
cd /root/rezynt
docker compose restart landing
```

## Project Structure

```
landing/
├── index.html               # Main landing page
├── privacy-policy.html      # Privacy Policy page
├── terms-of-service.html    # Terms of Service page
├── styles.css               # Styles
├── script.js                # JavaScript
├── public/                  # Static assets (images, icons, etc.)
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Configuration

### Vite Configuration

The build output directory is configured in `vite.config.js`:

```javascript
build: {
  outDir: '../landing_html',
  emptyOutDir: true,
  assetsDir: 'assets'
}
```

### Nginx Configuration

The landing page is served through Nginx. Configuration is in `../nginx/landing.conf`.

Key settings:
- Root directory: `/usr/share/nginx/html`
- Static asset caching: 30 days
- Health check endpoint: `/health`

## SSL/HTTPS

SSL certificates are managed by Certbot and configured in the main `nginx/nginx.conf` file for:
- `rezynt.com`
- `www.rezynt.com`

## Notes

- All paths to static assets in HTML should be relative to root (e.g., `/logo.png` not `/public/logo.png`)
- The `landing_html/` directory is gitignored as it's a build artifact
- Static files from `public/` are copied to the root of the build output

