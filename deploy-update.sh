#!/bin/bash

# EU AI Act Lab - Update Deployment Script
# Usage: ./deploy-update.sh

set -e

echo "🔄 EU AI Act Lab - Deployment Update"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
read -p "Enter server hostname or IP: " SERVER_HOST
read -p "Enter SSH username: " SSH_USER
read -p "Enter deployment directory (default: /var/www/eu-ai-act-lab): " DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-/var/www/eu-ai-act-lab}

echo ""
echo -e "${BLUE}📋 Update Configuration:${NC}"
echo "  Server: $SSH_USER@$SERVER_HOST"
echo "  Directory: $DEPLOY_DIR"
echo ""

# Push latest changes
echo -e "${YELLOW}Step 1: Pushing latest changes to GitHub${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    read -p "Commit and push now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " COMMIT_MSG
        git commit -m "$COMMIT_MSG"
        git push origin main
    fi
else
    git push origin main
fi

echo -e "${GREEN}✅ Changes pushed${NC}"
echo ""

# Create update script
echo -e "${YELLOW}Step 2: Updating server deployment${NC}"

cat > /tmp/update_commands.sh <<'UPDATE_SCRIPT'
#!/bin/bash
set -e

DEPLOY_DIR="__DEPLOY_DIR__"

cd $DEPLOY_DIR

echo "📦 Pulling latest changes..."
git fetch origin
git reset --hard origin/main

echo "📚 Installing/updating dependencies..."
npm install --production=false

echo "🗄️  Running database migrations..."
export $(cat .env.production | grep -v '^#' | xargs)
npx prisma generate
npx prisma migrate deploy

echo "🏗️  Rebuilding application..."
npm run build

echo "🔄 Restarting application..."
pm2 restart eu-ai-act-lab

echo ""
echo "✅ Update complete!"
echo ""
echo "📊 Application Status:"
pm2 status eu-ai-act-lab

echo ""
echo "📝 Recent logs:"
pm2 logs eu-ai-act-lab --lines 20 --nostream
UPDATE_SCRIPT

# Replace placeholder
sed -i '' "s|__DEPLOY_DIR__|$DEPLOY_DIR|g" /tmp/update_commands.sh

echo "Uploading update script..."
scp /tmp/update_commands.sh $SSH_USER@$SERVER_HOST:/tmp/

echo "Executing update on server..."
ssh $SSH_USER@$SERVER_HOST "bash /tmp/update_commands.sh"

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Update Complete!${NC}"
echo "=========================================="
echo ""
echo "🌐 Application: https://eu-ai-act.standarity.com"
echo ""
echo "📊 Check status: ssh $SSH_USER@$SERVER_HOST 'pm2 status'"
echo "📝 View logs:    ssh $SSH_USER@$SERVER_HOST 'pm2 logs eu-ai-act-lab'"
echo ""

# Cleanup
rm /tmp/update_commands.sh 2>/dev/null || true
