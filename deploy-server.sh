#!/bin/bash

# Manthmwear Deployment Script
# This script pulls latest changes from GitHub and deploys to production

set -e  # Exit on any error

echo "🚀 Starting Manthmwear Deployment..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/manthmwear/htdocs/manthmwear.com"
PM2_APP_NAME="manthmwear"
BACKUP_DIR="/home/manthmwear/backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📍 Working directory: $PROJECT_DIR${NC}"
cd "$PROJECT_DIR"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file before deploying"
    exit 1
fi

# Backup .env file
echo -e "${YELLOW}💾 Backing up .env file...${NC}"
cp .env "$BACKUP_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"

# Pull latest changes from GitHub
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
git pull origin main

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Generate Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

# Build Next.js application
echo -e "${YELLOW}🏗️  Building Next.js application...${NC}"
npm run build

# Restart PM2 process
echo -e "${YELLOW}🔄 Restarting PM2 process...${NC}"
pm2 restart "$PM2_APP_NAME"

# Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

# Show PM2 status
echo -e "${YELLOW}📊 PM2 Status:${NC}"
pm2 list

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=================================="
echo -e "${GREEN}🎉 Manthmwear is now running with latest changes${NC}"
echo ""
echo "Useful commands:"
echo "  - View logs: pm2 logs $PM2_APP_NAME"
echo "  - Check status: pm2 status"
echo "  - Restart: pm2 restart $PM2_APP_NAME"
echo ""
