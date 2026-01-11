#!/bin/bash

# First-Time Server Setup Script
# This script safely sets up Git on server with existing files

set -e  # Exit on any error

echo "🚀 First-Time Server Git Setup"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/home/manthmwear/htdocs/manthmwear.com"

echo -e "${YELLOW}📍 Working directory: $PROJECT_DIR${NC}"
cd "$PROJECT_DIR"

# Step 1: Backup .env file
echo -e "${YELLOW}💾 Step 1: Backing up .env file...${NC}"
if [ -f .env ]; then
    cp .env /tmp/.env.manthmwear.backup
    echo -e "${GREEN}✅ .env backed up to /tmp/.env.manthmwear.backup${NC}"
else
    echo -e "${RED}⚠️  Warning: No .env file found${NC}"
fi

# Step 2: Backup node_modules (if exists)
echo -e "${YELLOW}💾 Step 2: Checking node_modules...${NC}"
if [ -d node_modules ]; then
    echo -e "${YELLOW}Found node_modules, will reinstall after setup${NC}"
fi

# Step 3: Remove .git directory to start fresh
echo -e "${YELLOW}🗑️  Step 3: Removing existing .git directory...${NC}"
rm -rf .git

# Step 4: Initialize fresh Git repository
echo -e "${YELLOW}🔧 Step 4: Initializing Git repository...${NC}"
git init
git config user.name "harrygithub11"
git config user.email "harrymailbox11@gmail.com"

# Step 5: Add remote
echo -e "${YELLOW}🔗 Step 5: Adding GitHub remote...${NC}"
git remote add origin https://github.com/harrygithub11/manthmwear.git

# Step 6: Fetch from GitHub
echo -e "${YELLOW}📥 Step 6: Fetching from GitHub...${NC}"
git fetch origin

# Step 7: Reset to match GitHub (this will overwrite local files)
echo -e "${YELLOW}⚠️  Step 7: Resetting to match GitHub repository...${NC}"
echo -e "${RED}This will overwrite local files with GitHub versions${NC}"
git reset --hard origin/main

# Step 8: Restore .env file
echo -e "${YELLOW}📂 Step 8: Restoring .env file...${NC}"
if [ -f /tmp/.env.manthmwear.backup ]; then
    cp /tmp/.env.manthmwear.backup .env
    echo -e "${GREEN}✅ .env restored${NC}"
else
    echo -e "${RED}⚠️  Warning: Could not restore .env file${NC}"
    echo -e "${YELLOW}Please create .env file manually${NC}"
fi

# Step 9: Fix ownership
echo -e "${YELLOW}🔐 Step 9: Fixing file ownership...${NC}"
chown -R manthmwear:manthmwear "$PROJECT_DIR"

# Step 10: Install dependencies
echo -e "${YELLOW}📦 Step 10: Installing dependencies...${NC}"
npm install

# Step 11: Generate Prisma Client
echo -e "${YELLOW}🔧 Step 11: Generating Prisma Client...${NC}"
npx prisma generate

# Step 12: Build Next.js
echo -e "${YELLOW}🏗️  Step 12: Building Next.js application...${NC}"
npm run build

# Step 13: Make deploy script executable
echo -e "${YELLOW}🔧 Step 13: Making deploy script executable...${NC}"
chmod +x deploy-server.sh

# Step 14: Restart PM2
echo -e "${YELLOW}🔄 Step 14: Restarting PM2...${NC}"
pm2 restart manthmwear || pm2 start npm --name "manthmwear" -- start
pm2 save

echo ""
echo -e "${GREEN}✅ First-Time Setup Complete!${NC}"
echo "=================================="
echo -e "${GREEN}🎉 Server is now synced with GitHub${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify .env file: cat .env | head -5"
echo "  2. Check PM2 status: pm2 status"
echo "  3. View logs: pm2 logs manthmwear"
echo "  4. For future deployments, use: ./deploy-server.sh"
echo ""
