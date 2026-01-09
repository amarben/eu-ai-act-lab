# EU AI Act Lab - Self-Hosted Deployment Guide

Deploy to your own server at **eu-ai-act.standarity.com**

## Prerequisites

### On Your Server
- Ubuntu/Debian Linux (or similar)
- Node.js 18+ and npm
- PostgreSQL 14+
- LibreOffice (for PDF conversion)
- PM2 (process manager)
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt recommended)
- SSH access with sudo privileges

### On Your Local Machine
- Git repository cloned
- SSH access to your server
- Server credentials (IP, username, password/key)

---

## Quick Deployment (Automated)

```bash
# Run the automated deployment script
./deploy-server.sh
```

The script will prompt for:
- Server SSH credentials
- Database connection details
- Environment variables
- SSL configuration

---

## Manual Deployment Steps

### Step 1: Prepare Your Server

SSH into your server:
```bash
ssh user@eu-ai-act.standarity.com
```

Install required software:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install LibreOffice (for PDF conversion)
sudo apt install -y libreoffice

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE euaiact_prod;
CREATE USER euaiact_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE euaiact_prod TO euaiact_user;
\q
```

### Step 3: Clone and Build Application

```bash
# Create application directory
sudo mkdir -p /var/www/eu-ai-act-lab
sudo chown $USER:$USER /var/www/eu-ai-act-lab
cd /var/www/eu-ai-act-lab

# Clone repository
git clone https://github.com/amarben/eu-ai-act-lab.git .

# Install dependencies
npm install --production=false

# Create production environment file
cat > .env.production <<EOF
# Database
DATABASE_URL=postgresql://euaiact_user:your_secure_password_here@localhost:5432/euaiact_prod

# Authentication
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://eu-ai-act.standarity.com

# AI Integration
GEMINI_API_KEY=your_gemini_api_key_here

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://eu-ai-act.standarity.com
PORT=3000

# Rate Limiting
GEMINI_RATE_LIMIT_PER_MINUTE=60
GEMINI_RATE_LIMIT_PER_DAY=1500
EOF

# Load environment and run migrations
export $(cat .env.production | xargs)
npx prisma migrate deploy
npx prisma generate

# Build the application
npm run build
```

### Step 4: Configure PM2 Process Manager

Create PM2 ecosystem file:
```bash
cat > ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: 'eu-ai-act-lab',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/eu-ai-act-lab',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

### Step 5: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/eu-ai-act-lab
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name eu-ai-act.standarity.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eu-ai-act.standarity.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/eu-ai-act.standarity.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/eu-ai-act.standarity.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Increase upload size for file uploads
    client_max_body_size 50M;

    # Proxy to Next.js
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

        # Timeouts for long-running AI requests
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Static files cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/eu-ai-act-lab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Set Up SSL Certificate

```bash
# Obtain SSL certificate from Let's Encrypt
sudo certbot --nginx -d eu-ai-act.standarity.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Deployment Updates

When you need to deploy updates:

```bash
# SSH into server
ssh user@eu-ai-act.standarity.com

# Navigate to app directory
cd /var/www/eu-ai-act-lab

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Run database migrations
export $(cat .env.production | xargs)
npx prisma migrate deploy

# Rebuild application
npm run build

# Restart with PM2
pm2 restart eu-ai-act-lab

# Check status
pm2 status
pm2 logs eu-ai-act-lab --lines 50
```

Or use the update script:
```bash
./deploy-update.sh
```

---

## Monitoring and Maintenance

### View Application Logs
```bash
pm2 logs eu-ai-act-lab
pm2 logs eu-ai-act-lab --lines 100
```

### Monitor Application
```bash
pm2 monit
pm2 status
```

### Restart Application
```bash
pm2 restart eu-ai-act-lab
```

### Database Backup
```bash
# Create backup
pg_dump -U euaiact_user euaiact_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U euaiact_user euaiact_prod < backup_20260109_120000.sql
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs eu-ai-act-lab --err

# Check if port 3000 is in use
sudo lsof -i :3000

# Verify environment variables
pm2 env 0
```

### Database Connection Issues
```bash
# Test database connection
psql -U euaiact_user -d euaiact_prod -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

### SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew certificate manually
sudo certbot renew
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### PDF Generation Issues
```bash
# Check LibreOffice installation
soffice --version

# Test LibreOffice headless mode
soffice --headless --convert-to pdf test.docx
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | Auth secret (32+ chars) | Output of `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://eu-ai-act.standarity.com` |
| `GEMINI_API_KEY` | Google Gemini API key | Get from https://aistudio.google.com |
| `NODE_ENV` | Environment | `production` |
| `NEXT_PUBLIC_APP_URL` | Public URL | `https://eu-ai-act.standarity.com` |
| `PORT` | Application port | `3000` |
| `GEMINI_RATE_LIMIT_PER_MINUTE` | AI rate limit | `60` |
| `GEMINI_RATE_LIMIT_PER_DAY` | Daily AI limit | `1500` |

---

## Security Checklist

- [ ] PostgreSQL password is strong and unique
- [ ] NEXTAUTH_SECRET is randomly generated (32+ characters)
- [ ] Firewall is enabled (UFW)
- [ ] SSL certificate is installed and auto-renews
- [ ] SSH key authentication is enabled (disable password auth)
- [ ] Database backups are automated
- [ ] PM2 logs are rotated
- [ ] Nginx security headers are enabled
- [ ] File upload limits are set appropriately
- [ ] Application runs as non-root user

---

## Performance Optimization

### Enable Gzip Compression (Nginx)
Add to nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### Database Connection Pooling
Already configured in Prisma. Monitor with:
```bash
# Check active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### PM2 Cluster Mode
Already configured in ecosystem.config.js with `instances: 'max'`

---

**Deployment Status**: Ready for production
**Last Updated**: January 9, 2026
**Repository**: https://github.com/amarben/eu-ai-act-lab
