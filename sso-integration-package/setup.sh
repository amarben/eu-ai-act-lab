#!/bin/bash

# SSO Integration Setup Script
# Automatically configures any Next.js app to use Standarity SSO

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
APP_NAME=""
SUBDOMAIN=""
PORT=""
STANDARITY_PATH=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --app-name)
      APP_NAME="$2"
      shift 2
      ;;
    --subdomain)
      SUBDOMAIN="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --standarity-path)
      STANDARITY_PATH="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Standarity SSO Integration Setup                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get input if not provided
if [ -z "$APP_NAME" ]; then
  read -p "Application Name (e.g., ISMS Application): " APP_NAME
fi

if [ -z "$SUBDOMAIN" ]; then
  read -p "Subdomain (e.g., isms for isms.standarity.com): " SUBDOMAIN
fi

if [ -z "$PORT" ]; then
  read -p "Development port (e.g., 3001): " PORT
fi

if [ -z "$STANDARITY_PATH" ]; then
  read -p "Path to Standarity main app (or press Enter for ../Standarity): " STANDARITY_PATH
  STANDARITY_PATH=${STANDARITY_PATH:-"../Standarity"}
fi

# Validate inputs
if [ -z "$APP_NAME" ] || [ -z "$SUBDOMAIN" ] || [ -z "$PORT" ]; then
  echo -e "${RED}❌ Error: All fields are required${NC}"
  exit 1
fi

# Validate subdomain format
if [[ ! "$SUBDOMAIN" =~ ^[a-z0-9-]+$ ]]; then
  echo -e "${RED}❌ Error: Subdomain must contain only lowercase letters, numbers, and hyphens${NC}"
  exit 1
fi

# Check if we're in the right directory
if [ ! -f "setup.sh" ]; then
  echo -e "${RED}❌ Error: Please run this script from the sso-integration-package directory${NC}"
  exit 1
fi

# Get the parent directory (the app directory)
APP_DIR="$(cd .. && pwd)"
echo -e "${GREEN}📁 Target app directory: $APP_DIR${NC}"

echo -e "\n${YELLOW}Step 1: Registering OAuth client with Standarity...${NC}"

# Register OAuth client
cd "$STANDARITY_PATH"
REGISTRATION_OUTPUT=$(node scripts/register-oauth-client.js \
  --name "$APP_NAME" \
  --subdomain "$SUBDOMAIN" <<EOF
$PORT
EOF
)

# Extract credentials from output
SSO_CLIENT_ID=$(echo "$REGISTRATION_OUTPUT" | grep 'SSO_CLIENT_ID=' | cut -d'"' -f2)
SSO_CLIENT_SECRET=$(echo "$REGISTRATION_OUTPUT" | grep 'SSO_CLIENT_SECRET=' | cut -d'"' -f2)
AUTH_SECRET=$(echo "$REGISTRATION_OUTPUT" | grep 'AUTH_SECRET=' | cut -d'"' -f2)
DATABASE_URL=$(echo "$REGISTRATION_OUTPUT" | grep 'DATABASE_URL=' | cut -d'"' -f2)

if [ -z "$SSO_CLIENT_ID" ] || [ -z "$SSO_CLIENT_SECRET" ]; then
  echo -e "${RED}❌ Error: Failed to register OAuth client${NC}"
  echo "$REGISTRATION_OUTPUT"
  exit 1
fi

echo -e "${GREEN}✅ OAuth client registered successfully${NC}"

# Go back to app directory
cd "$APP_DIR"

echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found. Is this a Next.js app?${NC}"
  exit 1
fi

# Install required packages
npm install next-auth@latest @auth/prisma-adapter@latest @prisma/client@latest bcryptjs@latest

echo -e "${GREEN}✅ Dependencies installed${NC}"

echo -e "\n${YELLOW}Step 3: Creating configuration files...${NC}"

# Create .env.local
cat > .env.local << EOF
# OAuth SSO Configuration
SSO_CLIENT_ID="$SSO_CLIENT_ID"
SSO_CLIENT_SECRET="$SSO_CLIENT_SECRET"
SSO_PROVIDER_URL="http://localhost:4000"

# NextAuth Configuration
AUTH_SECRET="$AUTH_SECRET"
AUTH_URL="http://localhost:$PORT"
NEXTAUTH_URL="http://localhost:$PORT"
AUTH_TRUST_HOST=true

# App Information
NEXT_PUBLIC_APP_NAME="$APP_NAME"

# Shared Database
DATABASE_URL="$DATABASE_URL"
EOF

echo -e "${GREEN}✅ Created .env.local${NC}"

# Create lib directory if it doesn't exist
mkdir -p lib

# Copy SSO library files if not already there
if [ ! -f "lib/sso-auth.js" ]; then
  cp sso-integration-package/lib/sso-auth.js lib/
  echo -e "${GREEN}✅ Created lib/sso-auth.js${NC}"
fi

if [ ! -f "lib/prisma.js" ]; then
  cp sso-integration-package/lib/prisma.js lib/
  echo -e "${GREEN}✅ Created lib/prisma.js${NC}"
fi

# Create auth.js
cat > auth.js << 'EOF'
import { createSSOAuth } from '@/lib/sso-auth';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = createSSOAuth({
  prisma,
});
EOF

echo -e "${GREEN}✅ Created auth.js${NC}"

# Create API route directory
mkdir -p app/api/auth/\[...nextauth\]

# Create NextAuth API route
cat > app/api/auth/\[...nextauth\]/route.js << 'EOF'
export { handlers as GET, handlers as POST } from '@/auth';
EOF

echo -e "${GREEN}✅ Created app/api/auth/[...nextauth]/route.js${NC}"

# Create prisma directory if needed
if [ ! -d "prisma" ]; then
  mkdir -p prisma
  cp "$STANDARITY_PATH/prisma/schema.prisma" prisma/
  echo -e "${GREEN}✅ Created prisma/schema.prisma${NC}"
fi

echo -e "\n${YELLOW}Step 4: Updating package.json scripts...${NC}"

# Add or update dev script to use correct port
if command -v jq &> /dev/null; then
  # Use jq if available
  jq ".scripts.dev = \"next dev -p $PORT\"" package.json > package.json.tmp && mv package.json.tmp package.json
  echo -e "${GREEN}✅ Updated package.json dev script${NC}"
else
  echo -e "${YELLOW}⚠️  Please manually update your dev script to: \"next dev -p $PORT\"${NC}"
fi

echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           SSO Integration Complete! 🎉                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}✅ Application: $APP_NAME${NC}"
echo -e "${GREEN}✅ Subdomain: $SUBDOMAIN.standarity.com${NC}"
echo -e "${GREEN}✅ Development URL: http://localhost:$PORT${NC}"
echo -e "${GREEN}✅ OAuth client registered and configured${NC}"

echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Start the main Standarity app:"
echo -e "   ${YELLOW}cd $STANDARITY_PATH && npm run dev${NC}"
echo -e "\n2. Start this app:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo -e "\n3. Test SSO:"
echo -e "   - Login to http://localhost:4000"
echo -e "   - Visit http://localhost:$PORT"
echo -e "   - You should be automatically logged in! ✨"

echo -e "\n${BLUE}Files created:${NC}"
echo -e "  ✅ .env.local (with OAuth credentials)"
echo -e "  ✅ auth.js (NextAuth configuration)"
echo -e "  ✅ lib/sso-auth.js (SSO library)"
echo -e "  ✅ lib/prisma.js (Database client)"
echo -e "  ✅ app/api/auth/[...nextauth]/route.js (Auth handler)"

echo -e "\n${GREEN}All done! 🚀${NC}\n"
