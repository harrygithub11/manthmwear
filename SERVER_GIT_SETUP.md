# Server Git Setup Guide

## Current Status
- **Local Git**: ✅ Complete (pushed to GitHub)
- **Server Git**: 🔄 In Progress
- **Server Path**: `/home/manthmwear/htdocs/manthmwear.com`
- **Server User**: manthmwear (running as root)
- **Repository**: https://github.com/harrygithub11/manthmwear

## Issue Encountered
- "dubious ownership" error due to permission mismatch
- Fixed with: `git config --global --add safe.directory /home/manthmwear/htdocs/manthmwear.com`

---

## RECOMMENDED: Fresh Clone Approach

This is the cleanest and most reliable method.

### Step 1: Backup Current Directory
```bash
# SSH into server
ssh manthmwear@your-server-ip

# Navigate to parent directory
cd /home/manthmwear/htdocs

# Create timestamped backup
mv manthmwear.com manthmwear.com.backup.$(date +%Y%m%d_%H%M%S)
```

### Step 2: Clone from GitHub
```bash
# Clone repository
git clone https://github.com/harrygithub11/manthmwear.git manthmwear.com

# Navigate to project
cd manthmwear.com

# Configure Git
git config user.name "harrygithub11"
git config user.email "harrymailbox11@gmail.com"
```

### Step 3: Fix Ownership
```bash
# Fix ownership (if needed)
sudo chown -R manthmwear:manthmwear /home/manthmwear/htdocs/manthmwear.com
```

### Step 4: Restore .env File
```bash
# Copy .env from backup
cp ../manthmwear.com.backup.*/.env .env

# Verify .env exists
cat .env | head -5
```

### Step 5: Install and Build
```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build Next.js
npm run build
```

### Step 6: Restart PM2
```bash
# Restart application
pm2 restart manthmwear

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs manthmwear --lines 50
```

### Step 7: Make Deployment Script Executable
```bash
# Make deploy script executable
chmod +x deploy-server.sh

# Test deployment script
./deploy-server.sh
```

---

## ALTERNATIVE: Fix Current Setup

If you prefer to keep the current directory structure:

### Step 1: Clean Git State
```bash
cd /home/manthmwear/htdocs/manthmwear.com

# Remove existing .git directory
rm -rf .git

# Initialize fresh Git repository
git init
```

### Step 2: Configure Git
```bash
# Set user info
git config user.name "harrygithub11"
git config user.email "harrymailbox11@gmail.com"

# Add remote
git remote add origin https://github.com/harrygithub11/manthmwear.git
```

### Step 3: Pull from GitHub
```bash
# Fetch from remote
git fetch origin

# Reset to match remote (WARNING: This will overwrite local changes)
git reset --hard origin/main

# OR merge if you want to keep local changes
git merge origin/main --allow-unrelated-histories
```

### Step 4: Fix Ownership
```bash
# Fix ownership
sudo chown -R manthmwear:manthmwear /home/manthmwear/htdocs/manthmwear.com
```

### Step 5: Install and Build
```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build Next.js
npm run build

# Restart PM2
pm2 restart manthmwear
pm2 save
```

---

## Future Deployment Workflow

### On Local Machine (Windows):
```powershell
# Make changes to code
# Test locally
npm run build

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

### On Server (Linux):
```bash
# Option 1: Use automated script (RECOMMENDED)
cd /home/manthmwear/htdocs/manthmwear.com
./deploy-server.sh

# Option 2: Manual deployment
cd /home/manthmwear/htdocs/manthmwear.com
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart manthmwear
```

---

## Deployment Script Features

The `deploy-server.sh` script automatically:
1. ✅ Backs up .env file
2. ✅ Pulls latest changes from GitHub
3. ✅ Installs dependencies
4. ✅ Generates Prisma Client
5. ✅ Builds Next.js application
6. ✅ Restarts PM2 process
7. ✅ Saves PM2 configuration
8. ✅ Shows deployment status

---

## Troubleshooting

### Permission Denied Error
```bash
sudo chown -R manthmwear:manthmwear /home/manthmwear/htdocs/manthmwear.com
```

### Dubious Ownership Error
```bash
git config --global --add safe.directory /home/manthmwear/htdocs/manthmwear.com
```

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npx prisma generate
npm run build
```

### PM2 Not Starting
```bash
# Check logs
pm2 logs manthmwear --lines 100

# Delete and restart
pm2 delete manthmwear
pm2 start npm --name "manthmwear" -- start
pm2 save
```

### GitHub Authentication
If prompted for credentials:
- **Username**: harrygithub11
- **Password**: Use Personal Access Token (PAT)
- Generate PAT: https://github.com/settings/tokens
  - Select scopes: `repo` (full control)
  - Copy token and use as password

---

## Important Notes

1. **Never commit .env** - Already excluded in .gitignore
2. **Database migrations** - Run SQL files manually on server
3. **Always test locally** - Run `npm run build` before pushing
4. **Check logs after deployment** - `pm2 logs manthmwear`
5. **Backup before major changes** - Use timestamped backups

---

## Files Created

1. `deploy-server.sh` - Automated deployment script
2. `SERVER_GIT_SETUP.md` - This guide
3. `.gitignore` - Excludes sensitive files

---

## Quick Reference Commands

### Local (Windows):
```powershell
git status
git add .
git commit -m "message"
git push origin main
```

### Server (Linux):
```bash
cd /home/manthmwear/htdocs/manthmwear.com
./deploy-server.sh
pm2 logs manthmwear
pm2 status
```

---

## Next Steps

1. Choose deployment approach (Fresh Clone recommended)
2. Follow steps above
3. Test deployment script
4. Make a test change and deploy
5. Verify everything works

**Ready to proceed with server setup!** 🚀
