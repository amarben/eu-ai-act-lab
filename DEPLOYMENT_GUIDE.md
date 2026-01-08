# Deployment Guide
## EU AI Act Implementation Lab

**Version:** 1.0
**Date:** December 24, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Deployment Option 1: Vercel (Recommended for MVP)](#deployment-option-1-vercel-recommended-for-mvp)
6. [Deployment Option 2: AWS](#deployment-option-2-aws)
7. [Deployment Option 3: Docker Self-Hosted](#deployment-option-3-docker-self-hosted)
8. [Post-Deployment Configuration](#post-deployment-configuration)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Disaster Recovery](#backup--disaster-recovery)
11. [Security Hardening](#security-hardening)
12. [Scaling Strategies](#scaling-strategies)
13. [Troubleshooting](#troubleshooting)
14. [Production Checklist](#production-checklist)

---

## Overview

This guide provides step-by-step instructions for deploying the EU AI Act Implementation Lab to production. Three deployment options are covered:

1. **Vercel** - Fastest, zero-config deployment (recommended for MVP)
2. **AWS** - Full control, enterprise-grade infrastructure
3. **Docker Self-Hosted** - Maximum flexibility, cost-effective

### Architecture Summary

```
┌─────────────────────────────────────────────────┐
│             Client (Browser)                     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│        CDN / Load Balancer / Edge               │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│        Next.js Application (SSR + API)          │
│  - Server-side rendering                        │
│  - API routes                                   │
│  - Authentication                               │
└─────┬──────────┬──────────┬──────────┬─────────┘
      │          │          │          │
   ┌──▼──┐  ┌───▼───┐  ┌───▼────┐ ┌──▼────┐
   │ DB  │  │ S3/R2 │  │ Redis  │ │Gemini │
   │ PG  │  │Storage│  │ Cache  │ │  API  │
   └─────┘  └───────┘  └────────┘ └───────┘
```

---

## Prerequisites

### Required Tools & Accounts

- **Node.js**: 18.17.0 or later (LTS recommended)
- **pnpm**: 8.0.0 or later
- **Git**: Latest version
- **PostgreSQL**: 15 or later
- **Cloud Platform Account**: Vercel, AWS, or hosting provider
- **Domain Name**: (Optional but recommended)

### Required API Keys

- **Gemini API**: https://aistudio.google.com/app/apikey
- **Email Service**: Resend or SendGrid
- **Storage**: AWS S3 or Cloudflare R2
- **Redis** (optional): Upstash or Redis Cloud

### Recommended Services

- **Monitoring**: Sentry for error tracking
- **Analytics**: Plausible or Umami (privacy-friendly)
- **CDN**: Cloudflare or CloudFront

---

## Environment Setup

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# ============================================================================
# APPLICATION
# ============================================================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.euaiactlab.com

# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://user:password@host:5432/euaiact_prod?schema=public&sslmode=require

# Connection pool settings (for serverless)
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# ============================================================================
# AUTHENTICATION
# ============================================================================
NEXTAUTH_URL=https://app.euaiactlab.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Session settings
SESSION_MAX_AGE=3600 # 1 hour
REFRESH_TOKEN_MAX_AGE=604800 # 7 days

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# ============================================================================
# GEMINI AI
# ============================================================================
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=8192

# ============================================================================
# STORAGE (AWS S3 or Cloudflare R2)
# ============================================================================
S3_BUCKET=eu-aiact-uploads-prod
S3_REGION=eu-central-1
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_ENDPOINT=https://s3.eu-central-1.amazonaws.com # or R2 endpoint

# CDN URL (if using CloudFront or R2)
CDN_URL=https://cdn.euaiactlab.com

# ============================================================================
# EMAIL (Resend or SendGrid)
# ============================================================================
EMAIL_PROVIDER=resend # or sendgrid
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=your-resend-api-key
FROM_EMAIL=noreply@euaiactlab.com
FROM_NAME=EU AI Act Lab

# ============================================================================
# REDIS (Optional - for caching)
# ============================================================================
REDIS_URL=redis://default:password@host:6379
REDIS_TOKEN=your-upstash-token # for Upstash

# ============================================================================
# MONITORING & LOGGING
# ============================================================================
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=euaiact-lab
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Logging level
LOG_LEVEL=info # debug, info, warn, error

# ============================================================================
# ANALYTICS
# ============================================================================
ANALYTICS_ENABLED=true
PLAUSIBLE_DOMAIN=app.euaiactlab.com

# ============================================================================
# RATE LIMITING
# ============================================================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000 # 1 minute

# ============================================================================
# SECURITY
# ============================================================================
ALLOWED_ORIGINS=https://euaiactlab.com,https://app.euaiactlab.com
CSRF_SECRET=<generate-with-openssl-rand-base64-32>

# Content Security Policy
CSP_ENABLED=true

# ============================================================================
# FEATURE FLAGS
# ============================================================================
FEATURE_OAUTH_ENABLED=true
FEATURE_WEBHOOKS_ENABLED=false
FEATURE_API_KEYS_ENABLED=false

# ============================================================================
# BACKUP
# ============================================================================
BACKUP_S3_BUCKET=eu-aiact-backups-prod
BACKUP_RETENTION_DAYS=30
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CSRF_SECRET
openssl rand -base64 32
```

---

## Database Setup

### Option A: Managed PostgreSQL (Recommended)

**Providers:**
- Vercel Postgres
- Neon (Serverless Postgres)
- Supabase
- AWS RDS
- Google Cloud SQL
- Azure Database for PostgreSQL

**Setup Steps (Neon Example):**

1. **Create Account**: https://neon.tech
2. **Create Project**: "EU AI Act Lab - Production"
3. **Copy Connection String**:
   ```
   postgresql://user:password@ep-example.us-east-2.aws.neon.tech/euaiact_prod?sslmode=require
   ```
4. **Add to `.env.production`**:
   ```bash
   DATABASE_URL="postgresql://user:password@ep-example.us-east-2.aws.neon.tech/euaiact_prod?sslmode=require"
   ```

### Option B: Self-Hosted PostgreSQL

**Prerequisites:**
- Ubuntu 22.04 or later
- 4GB RAM minimum
- 50GB SSD storage

**Installation:**

```bash
# Install PostgreSQL 15
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE euaiact_prod;
CREATE USER euaiact_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE euaiact_prod TO euaiact_user;
ALTER DATABASE euaiact_prod OWNER TO euaiact_user;
EOF

# Configure remote access (if needed)
sudo nano /etc/postgresql/15/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql

# Enable SSL (recommended)
# Generate SSL certificate
sudo -u postgres openssl req -new -text -nodes -keyout /var/lib/postgresql/15/main/server.key -out /var/lib/postgresql/15/main/server.crt -subj "/CN=postgres"

# Set permissions
sudo chmod 600 /var/lib/postgresql/15/main/server.key
sudo chown postgres:postgres /var/lib/postgresql/15/main/server.*

# Update postgresql.conf
# ssl = on
# ssl_cert_file = '/var/lib/postgresql/15/main/server.crt'
# ssl_key_file = '/var/lib/postgresql/15/main/server.key'
```

### Database Migrations

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Verify database schema
pnpm prisma db pull

# (Optional) Seed initial data
pnpm prisma db seed
```

### Database Connection Pooling

For serverless deployments (Vercel, AWS Lambda), use connection pooling:

**Prisma Configuration:**

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Enable Prisma Accelerate (Optional):**

```bash
# For serverless at scale
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=your_api_key"
```

---

## Deployment Option 1: Vercel (Recommended for MVP)

### Why Vercel?

- Zero configuration needed
- Automatic HTTPS
- Global CDN
- Preview deployments
- Built-in analytics
- Serverless functions
- Easy scaling

### Prerequisites

- GitHub repository
- Vercel account (free tier available)

### Step-by-Step Deployment

#### 1. Prepare Repository

```bash
# Push code to GitHub
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Create Vercel Project

1. Visit https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `pnpm build`
   - **Output Directory**: .next
   - **Install Command**: `pnpm install`

#### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add all variables from `.env.production`.

**Critical Variables:**
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GEMINI_API_KEY`
- `S3_*` (all S3 variables)
- `SMTP_*` (all email variables)

#### 4. Deploy

Click "Deploy" button. Vercel will:
1. Install dependencies
2. Run build
3. Deploy to production
4. Provide production URL

#### 5. Custom Domain Setup

1. In Vercel Dashboard → Settings → Domains
2. Add custom domain: `app.euaiactlab.com`
3. Update DNS:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)
5. Vercel automatically provisions SSL certificate

#### 6. Configure Vercel Postgres (Optional)

```bash
# Install Vercel Postgres
pnpm i @vercel/postgres

# In Vercel Dashboard, create Postgres database
# Copy connection string to environment variables
```

#### 7. Production Deployment

```bash
# Future deployments automatically trigger on git push
git add .
git commit -m "Update application"
git push origin main

# Or deploy manually
pnpm vercel --prod
```

### Vercel Configuration File

Create `vercel.json`:

```json
{
  "buildCommand": "pnpm prisma generate && pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### Monitoring Vercel Deployment

```bash
# Check deployment logs
pnpm vercel logs <deployment-url>

# Check build logs
# In Vercel Dashboard → Deployments → [Click deployment] → View Build Logs
```

---

## Deployment Option 2: AWS

### Architecture Overview

```
Internet
   │
   ▼
Route 53 (DNS)
   │
   ▼
CloudFront (CDN)
   │
   ▼
Application Load Balancer
   │
   ├─────────┬─────────┬─────────┐
   ▼         ▼         ▼         ▼
ECS/Fargate ECS/Fargate ECS/Fargate ...
   │
   ├─────────┬─────────┬─────────┐
   ▼         ▼         ▼         ▼
RDS (PG)  ElastiCache  S3    External APIs
         (Redis)            (Gemini)
```

### Prerequisites

- AWS Account
- AWS CLI installed and configured
- Docker installed locally
- Domain registered in Route 53 (or external DNS)

### Step 1: Create VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=euaiact-vpc}]'

# Create public subnets (2 AZs for high availability)
aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone eu-central-1a

aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.2.0/24 \
  --availability-zone eu-central-1b

# Create private subnets
aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.3.0/24 \
  --availability-zone eu-central-1a

aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.4.0/24 \
  --availability-zone eu-central-1b

# Create Internet Gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --vpc-id vpc-xxxxx --internet-gateway-id igw-xxxxx

# Create NAT Gateway (for private subnets)
# ... (detailed NAT Gateway setup)
```

**Or use CloudFormation template** (see `infrastructure/aws/vpc.yaml`)

### Step 2: Create RDS PostgreSQL Database

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name euaiact-db-subnet \
  --db-subnet-group-description "Subnet group for EU AI Act DB" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier euaiact-db-prod \
  --db-instance-class db.t4g.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username euaiact_admin \
  --master-user-password <strong-password> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --db-subnet-group-name euaiact-db-subnet \
  --vpc-security-group-ids sg-xxxxx \
  --multi-az \
  --publicly-accessible false \
  --enable-cloudwatch-logs-exports '["postgresql"]'
```

### Step 3: Create S3 Buckets

```bash
# Create uploads bucket
aws s3 mb s3://eu-aiact-uploads-prod --region eu-central-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket eu-aiact-uploads-prod \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket eu-aiact-uploads-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Set lifecycle policy (delete exports after 7 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket eu-aiact-uploads-prod \
  --lifecycle-configuration file://s3-lifecycle.json

# Create backups bucket
aws s3 mb s3://eu-aiact-backups-prod --region eu-central-1
```

**s3-lifecycle.json:**
```json
{
  "Rules": [
    {
      "Id": "DeleteExportsAfter7Days",
      "Status": "Enabled",
      "Prefix": "organizations/*/exports/",
      "Expiration": {
        "Days": 7
      }
    },
    {
      "Id": "DeleteTempFilesAfter1Day",
      "Status": "Enabled",
      "Prefix": "temp/",
      "Expiration": {
        "Days": 1
      }
    }
  ]
}
```

### Step 4: Create ElastiCache Redis (Optional)

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name euaiact-cache-subnet \
  --cache-subnet-group-description "Subnet group for Redis cache" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id euaiact-redis-prod \
  --engine redis \
  --cache-node-type cache.t4g.micro \
  --num-cache-nodes 1 \
  --cache-subnet-group-name euaiact-cache-subnet \
  --security-group-ids sg-xxxxx
```

### Step 5: Build and Push Docker Image

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install libreoffice for PDF conversion
RUN apk add --no-cache libreoffice

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

**Build and push:**

```bash
# Build Docker image
docker build -t euaiact-lab:latest .

# Tag for ECR
docker tag euaiact-lab:latest <account-id>.dkr.ecr.eu-central-1.amazonaws.com/euaiact-lab:latest

# Login to ECR
aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-central-1.amazonaws.com

# Push to ECR
docker push <account-id>.dkr.ecr.eu-central-1.amazonaws.com/euaiact-lab:latest
```

### Step 6: Create ECS Cluster and Service

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name euaiact-cluster

# Create task definition (see ecs-task-definition.json)
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster euaiact-cluster \
  --service-name euaiact-service \
  --task-definition euaiact-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=euaiact-app,containerPort=3000"
```

**ecs-task-definition.json:**

```json
{
  "family": "euaiact-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "euaiact-app",
      "image": "<account-id>.dkr.ecr.eu-central-1.amazonaws.com/euaiact-lab:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:eu-central-1:xxxxx:secret:euaiact/db-url"
        },
        {
          "name": "NEXTAUTH_SECRET",
          "valueFrom": "arn:aws:secretsmanager:eu-central-1:xxxxx:secret:euaiact/nextauth-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/euaiact-app",
          "awslogs-region": "eu-central-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### Step 7: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name euaiact-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name euaiact-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /api/health

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### Step 8: Configure CloudFront CDN

```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Step 9: Configure Route 53 DNS

```bash
# Create hosted zone (if not exists)
aws route53 create-hosted-zone --name euaiactlab.com --caller-reference $(date +%s)

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets --hosted-zone-id Z123456 --change-batch file://route53-records.json
```

### Step 10: Deploy Updates

```bash
#!/bin/bash
# deploy.sh

# Build new image
docker build -t euaiact-lab:latest .

# Tag with version
VERSION=$(date +%Y%m%d%H%M%S)
docker tag euaiact-lab:latest <account-id>.dkr.ecr.eu-central-1.amazonaws.com/euaiact-lab:$VERSION
docker tag euaiact-lab:latest <account-id>.dkr.ecr.eu-central-1.amazonaws.com/euaiact-lab:latest

# Push to ECR
docker push <account-id>.dkr.ecr.eu-central-1.amazonaws.com/euaiact-lab:$VERSION
docker push <account-id>.dkr.ecr.eu-central-1.amazonaws.com/euaiact-lab:latest

# Update ECS service
aws ecs update-service \
  --cluster euaiact-cluster \
  --service euaiact-service \
  --force-new-deployment

echo "Deployment initiated. Version: $VERSION"
```

---

## Deployment Option 3: Docker Self-Hosted

### Prerequisites

- Ubuntu 22.04 server (4GB RAM, 2 CPU cores minimum)
- Docker and Docker Compose installed
- Domain name configured
- SSL certificate (Let's Encrypt)

### Step 1: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Create Docker Compose Configuration

**docker-compose.prod.yml:**

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: euaiact-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: euaiact_prod
      POSTGRES_USER: euaiact_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - euaiact-network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U euaiact_user']
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache (optional)
  redis:
    image: redis:7-alpine
    container_name: euaiact-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - euaiact-network
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js Application
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: euaiact-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://euaiact_user:${DB_PASSWORD}@postgres:5432/euaiact_prod
      REDIS_URL: redis://default:${REDIS_PASSWORD}@redis:6379
    env_file:
      - .env.production
    ports:
      - '127.0.0.1:3000:3000'
    volumes:
      - ./uploads:/app/uploads
    networks:
      - euaiact-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: euaiact-nginx
    restart: unless-stopped
    depends_on:
      - app
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    networks:
      - euaiact-network

networks:
  euaiact-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### Step 3: Create Nginx Configuration

**nginx/nginx.conf:**

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 25M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name app.euaiactlab.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name app.euaiactlab.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

        # Proxy to Next.js app
        location / {
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
        }

        # Rate limit API endpoints
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Extra rate limit for login
        location /api/auth/login {
            limit_req zone=login_limit burst=3 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint (no rate limit)
        location /api/health {
            access_log off;
            proxy_pass http://app:3000;
        }
    }
}
```

### Step 4: Obtain SSL Certificate

```bash
# Install Certbot
sudo apt install certbot -y

# Obtain certificate
sudo certbot certonly --standalone -d app.euaiactlab.com

# Copy certificates to nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/app.euaiactlab.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/app.euaiactlab.com/privkey.pem nginx/ssl/

# Set permissions
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem

# Auto-renewal (add to crontab)
sudo crontab -e
# Add: 0 0 1 * * certbot renew --quiet && docker-compose restart nginx
```

### Step 5: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/eu-aiact-lab.git
cd eu-aiact-lab

# Create .env.production file
nano .env.production
# Add all environment variables

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check health
curl https://app.euaiactlab.com/api/health
```

### Step 6: Automated Backups

**backup.sh:**

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backups"
DB_CONTAINER="euaiact-postgres"
RETENTION_DAYS=30
S3_BUCKET="s3://eu-aiact-backups-prod"

# Create backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

docker exec $DB_CONTAINER pg_dump -U euaiact_user euaiact_prod | gzip > $BACKUP_FILE

# Upload to S3 (if configured)
if [ -n "$S3_BUCKET" ]; then
    aws s3 cp $BACKUP_FILE $S3_BUCKET/
fi

# Delete old backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE"
```

**Add to crontab:**

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

---

## Post-Deployment Configuration

### 1. Database Migrations

```bash
# Run migrations
docker exec euaiact-app pnpm prisma migrate deploy

# Seed initial data
docker exec euaiact-app pnpm prisma db seed
```

### 2. Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: process.env.REDIS_URL ? 'configured' : 'not configured',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

### 3. Configure CORS

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const origin = request.headers.get('origin');

  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  return response;
}
```

### 4. Setup Monitoring

Install Sentry:

```bash
pnpm add @sentry/nextjs
pnpm sentry:init
```

Configure Sentry:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

**(Continuing in next response due to length...)**

Let me create the rest of the DEPLOYMENT_GUIDE.md file now:
