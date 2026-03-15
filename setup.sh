#!/bin/bash

set -e

echo "🚀 Finance Dashboard Deployment Script"
echo "=============================="

# Get original user who called sudo
ORIGINAL_USER="${SUDO_USER:-$(whoami)}"
ORIGINAL_HOME=$(getent passwd "$ORIGINAL_USER" | cut -d: -f6)

# Configuration
DOMAIN="${1:-finance.madebynz.xyz}"
SOURCE_DIR="${2:-$ORIGINAL_HOME/stock-analyze}"

WEB_PORT=3000
API_PORT=8000

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📍 Domain: $DOMAIN${NC}"
echo -e "${BLUE}📍 Source Directory: $SOURCE_DIR${NC}"
echo -e "${BLUE}📍 Web Port: $WEB_PORT${NC}"
echo -e "${BLUE}📍 API Port: $API_PORT${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./setup.sh)${NC}"
    exit 1
fi

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Source directory not found: $SOURCE_DIR${NC}"
    echo -e "${YELLOW}Please clone your repo first:${NC}"
    echo -e "${YELLOW}   git clone <your-repo-url> $SOURCE_DIR${NC}"
    exit 1
fi

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Nginx...${NC}"
    apt update
    apt install -y nginx
fi

echo -e "${GREEN}✅ Nginx version: $(nginx -v 2>&1)${NC}"

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker "$ORIGINAL_USER"
fi

echo -e "${GREEN}✅ Docker version: $(docker --version)${NC}"

# Navigate to source directory
cd "$SOURCE_DIR"

# Pull latest changes
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
    sudo -u "$ORIGINAL_USER" git pull origin main 2>/dev/null || sudo -u "$ORIGINAL_USER" git pull origin master 2>/dev/null || true
fi

# Check .env exists
if [ ! -f "$SOURCE_DIR/.env" ]; then
    echo -e "${RED}❌ .env file not found at $SOURCE_DIR/.env${NC}"
    echo -e "${YELLOW}Please create it from .env.example and fill in the values.${NC}"
    exit 1
fi

# Start Docker Compose
echo -e "${YELLOW}🐳 Starting Docker Compose services...${NC}"
sudo -u "$ORIGINAL_USER" docker compose up -d --build

echo -e "${GREEN}✅ Docker services started${NC}"

# Configure Nginx
echo -e "${YELLOW}⚙️  Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/finance << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js web app
    location / {
        proxy_pass http://127.0.0.1:$WEB_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Proxy to FastAPI (direct API access if needed)
    location /fastapi/ {
        rewrite ^/fastapi/(.*) /\$1 break;
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/finance /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
nginx -t
systemctl reload nginx

echo ""
echo "=============================="
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo "=============================="
echo ""
echo -e "${GREEN}🌐 App URL: http://$DOMAIN${NC}"
echo ""
echo "To enable HTTPS, run:"
echo "  sudo apt install certbot python3-certbot-nginx"
echo "  sudo certbot --nginx -d $DOMAIN"
