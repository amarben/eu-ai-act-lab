#!/bin/bash

# EU AI Act Lab - Self-Hosted Server Deployment Script
# Usage: ./deploy-server.sh

set -e  # Exit on error

echo "🚀 EU AI Act Lab - Self-Hosted Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
read -p "Enter server hostname or IP: " SERVER_HOST
read -p "Enter SSH username: " SSH_USER
read -p "Enter deployment directory (default: /var/www/eu-ai-act-lab): " DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-/var/www/eu-ai-act-lab}

echo ""
echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Server: $SSH_USER@$SERVER_HOST"
echo "  Directory: $DEPLOY_DIR"
echo ""

# Step 1: Check local repository
echo -e "${YELLOW}Step 1: Checking local repository${NC}"
echo "-----------------------------------"

if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    exit 1
fi

# Ensure all changes are committed
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    read -p "Commit changes now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " COMMIT_MSG
        git commit -m "$COMMIT_MSG"
    fi
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo -e "${GREEN}✅ Local repository ready${NC}"
echo ""

# Step 2: Deploy to server
echo -e "${YELLOW}Step 2: Deploying to server${NC}"
echo "----------------------------"

# Create deployment script
cat > /tmp/deploy_commands.sh <<'DEPLOY_SCRIPT'
#!/bin/bash
set -e

DEPLOY_DIR="__DEPLOY_DIR__"
REPO_URL="https://github.com/amarben/eu-ai-act-lab.git"

echo "🔧 Setting up deployment environment..."

# Install required packages if needed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

if ! command -v soffice &> /dev/null; then
    echo "Installing LibreOffice..."
    sudo apt install -y libreoffice
fi

# Create deployment directory
sudo mkdir -p $DEPLOY_DIR
sudo chown $USER:$USER $DEPLOY_DIR

# Clone or update repository
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "📦 Updating existing deployment..."
    cd $DEPLOY_DIR
    git fetch origin
    git reset --hard origin/main
else
    echo "📦 Cloning repository..."
    git clone $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

echo "📚 Installing dependencies..."
npm install --production=false

echo "🔐 Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    echo "Creating .env.production file..."
    cat > .env.production <<'EOF'
# Database Configuration
DATABASE_URL=postgresql://euaiact_user:CHANGE_THIS_PASSWORD@localhost:5432/euaiact_prod

# Authentication
NEXTAUTH_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING
NEXTAUTH_URL=https://eu-ai-act.standarity.com

# AI Integration
GEMINI_API_KEY=CHANGE_THIS_TO_YOUR_GEMINI_API_KEY

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://eu-ai-act.standarity.com
PORT=3000

# Rate Limiting
GEMINI_RATE_LIMIT_PER_MINUTE=60
GEMINI_RATE_LIMIT_PER_DAY=1500
EOF
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.production with your actual values!"
    echo "   File location: $DEPLOY_DIR/.env.production"
    echo ""
    read -p "Press Enter to continue after editing .env.production..."
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma migrate deploy || echo "Migration failed - check database connection"

echo "🏗️  Building application..."
npm run build

echo "📁 Creating logs directory..."
mkdir -p logs

# Stop existing PM2 process if running
pm2 stop eu-ai-act-lab 2>/dev/null || true
pm2 delete eu-ai-act-lab 2>/dev/null || true

echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
echo "Setting up PM2 to start on boot..."
pm2 startup | tail -n 1 | sudo bash || true

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Next steps:"
echo "  1. Configure Nginx reverse proxy"
echo "  2. Set up SSL certificate with Certbot"
echo "  3. Configure firewall (ufw)"
echo "  4. Test the application"
echo ""
echo "View logs: pm2 logs eu-ai-act-lab"
echo "Monitor app: pm2 monit"
echo ""
DEPLOY_SCRIPT

# Replace placeholder
sed -i '' "s|__DEPLOY_DIR__|$DEPLOY_DIR|g" /tmp/deploy_commands.sh

echo "Copying deployment script to server..."
scp /tmp/deploy_commands.sh $SSH_USER@$SERVER_HOST:/tmp/

echo "Executing deployment on server..."
ssh $SSH_USER@$SERVER_HOST "bash /tmp/deploy_commands.sh"

echo ""
echo -e "${GREEN}✅ Server deployment complete!${NC}"
echo ""

# Step 3: Nginx Configuration
echo -e "${YELLOW}Step 3: Configure Nginx (optional)${NC}"
echo "------------------------------------"
read -p "Configure Nginx reverse proxy now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create nginx config
    cat > /tmp/nginx_config <<'NGINX_CONFIG'
server {
    listen 80;
    server_name eu-ai-act.standarity.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eu-ai-act.standarity.com;

    # SSL will be configured by Certbot

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONFIG

    echo "Uploading Nginx configuration..."
    scp /tmp/nginx_config $SSH_USER@$SERVER_HOST:/tmp/

    ssh $SSH_USER@$SERVER_HOST << 'NGINX_SETUP'
        sudo mv /tmp/nginx_config /etc/nginx/sites-available/eu-ai-act-lab
        sudo ln -sf /etc/nginx/sites-available/eu-ai-act-lab /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        echo "✅ Nginx configured"
NGINX_SETUP

    echo ""
    echo -e "${YELLOW}📋 SSL Certificate Setup:${NC}"
    echo "Run this on your server to set up SSL:"
    echo "  sudo certbot --nginx -d eu-ai-act.standarity.com"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "🌐 Your application should be available at:"
echo "   https://eu-ai-act.standarity.com"
echo ""
echo "📊 Useful commands (run on server):"
echo "   pm2 status              - View application status"
echo "   pm2 logs eu-ai-act-lab  - View application logs"
echo "   pm2 monit               - Monitor resources"
echo "   pm2 restart eu-ai-act-lab - Restart application"
echo ""
echo "📖 Full guide: SELF_HOSTED_DEPLOYMENT.md"
echo ""

# Cleanup
rm /tmp/deploy_commands.sh 2>/dev/null || true
rm /tmp/nginx_config 2>/dev/null || true
