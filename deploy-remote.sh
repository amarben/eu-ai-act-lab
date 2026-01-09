#!/bin/bash

# EU AI Act Lab - Remote Server Deployment
# This script runs ON the remote server

set -e  # Exit on error

echo "🚀 EU AI Act Lab - Remote Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DEPLOY_DIR="/var/www/eu-ai-act-lab"
REPO_URL="https://github.com/amarben/eu-ai-act-lab.git"
APP_PORT=3001  # Different port to avoid conflict with existing app

echo -e "${BLUE}📦 Step 1: System Dependencies${NC}"
echo "--------------------------------"

# Check and install Node.js if needed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "✓ Node.js already installed: $(node --version)"
fi

# Check and install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
else
    echo "✓ PM2 already installed"
fi

# Check and install LibreOffice if needed
if ! command -v soffice &> /dev/null; then
    echo "Installing LibreOffice..."
    sudo apt install -y libreoffice
else
    echo "✓ LibreOffice already installed"
fi

echo ""
echo -e "${BLUE}📁 Step 2: Application Setup${NC}"
echo "-----------------------------"

# Create deployment directory
sudo mkdir -p $DEPLOY_DIR
sudo chown $USER:$USER $DEPLOY_DIR

# Clone or update repository
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "Updating existing deployment..."
    cd $DEPLOY_DIR
    git fetch origin
    git reset --hard origin/main
else
    echo "Cloning repository..."
    git clone $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

echo ""
echo -e "${BLUE}📚 Step 3: Install Dependencies${NC}"
echo "--------------------------------"
npm install --production=false

echo ""
echo -e "${BLUE}🔐 Step 4: Environment Configuration${NC}"
echo "------------------------------------"

# Create production environment file
cat > .env.production <<EOF
# Database Configuration
DATABASE_URL=postgresql://euaiact_user:SecurePass2024!@localhost:5432/euaiact_prod

# Authentication (generate new secret with: openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://eu-ai-act.standarity.com

# AI Integration
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://eu-ai-act.standarity.com
PORT=$APP_PORT

# Rate Limiting
GEMINI_RATE_LIMIT_PER_MINUTE=60
GEMINI_RATE_LIMIT_PER_DAY=1500
EOF

echo "✓ Environment file created at: $DEPLOY_DIR/.env.production"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Edit the following values in .env.production:${NC}"
echo "  - DATABASE_URL (if different)"
echo "  - GEMINI_API_KEY"
echo ""
read -p "Press Enter after you've updated .env.production (or we can continue with defaults)..."

echo ""
echo -e "${BLUE}🗄️  Step 5: Database Setup${NC}"
echo "-------------------------"

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Set up database
echo "Setting up PostgreSQL database..."
sudo -u postgres psql <<EOSQL || echo "Database might already exist, continuing..."
CREATE DATABASE euaiact_prod;
CREATE USER euaiact_user WITH PASSWORD 'SecurePass2024!';
GRANT ALL PRIVILEGES ON DATABASE euaiact_prod TO euaiact_user;
EOSQL

# Run migrations
echo "Running database migrations..."
npx prisma generate
npx prisma migrate deploy || echo "Migration failed - check database connection"

echo ""
echo -e "${BLUE}🏗️  Step 6: Build Application${NC}"
echo "----------------------------"
npm run build

echo ""
echo -e "${BLUE}📝 Step 7: Update PM2 Configuration${NC}"
echo "-----------------------------------"

# Update ecosystem.config.js with correct port
cat > ecosystem.config.js <<'EOFPM2'
module.exports = {
  apps: [{
    name: 'eu-ai-act-lab',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/eu-ai-act-lab',
    instances: 1,  # Start with 1 instance
    exec_mode: 'cluster',
    env_file: '.env.production',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
EOFPM2

# Create logs directory
mkdir -p logs

echo ""
echo -e "${BLUE}🚀 Step 8: Start Application${NC}"
echo "----------------------------"

# Stop existing instance if running
pm2 stop eu-ai-act-lab 2>/dev/null || true
pm2 delete eu-ai-act-lab 2>/dev/null || true

# Start application
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo ""
echo -e "${BLUE}🌐 Step 9: Nginx Configuration${NC}"
echo "------------------------------"

# Create nginx config for EU AI Act Lab
sudo tee /etc/nginx/sites-available/eu-ai-act-lab > /dev/null <<'EOFNGINX'
server {
    listen 80;
    server_name eu-ai-act.standarity.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for AI processing
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOFNGINX

# Enable site
sudo ln -sf /etc/nginx/sites-available/eu-ai-act-lab /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo -e "${BLUE}🔒 Step 10: SSL Certificate${NC}"
echo "---------------------------"
echo "Obtaining SSL certificate for eu-ai-act.standarity.com..."

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

# Get SSL certificate
sudo certbot --nginx -d eu-ai-act.standarity.com --non-interactive --agree-tos --email admin@standarity.com || echo "SSL setup failed - you may need to run this manually"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${GREEN}🎉 Your EU AI Act Lab is now deployed!${NC}"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🌐 Access your application:"
echo "   https://eu-ai-act.standarity.com"
echo ""
echo "📝 Useful Commands:"
echo "   pm2 status              - Check application status"
echo "   pm2 logs eu-ai-act-lab  - View application logs"
echo "   pm2 restart eu-ai-act-lab - Restart application"
echo "   pm2 monit               - Monitor resources"
echo ""
echo "📖 View recent logs:"
pm2 logs eu-ai-act-lab --lines 20 --nostream
echo ""
