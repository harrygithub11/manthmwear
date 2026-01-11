# Server Setup Commands - Quick Guide

## Current Situation
- Server has existing files that conflict with GitHub
- Git merge failed because of untracked files
- Need to safely sync server with GitHub while preserving .env

---

## SOLUTION: Run First-Time Setup Script

### Step 1: Upload the setup script to server
```bash
# On your local machine, the script is ready: server-first-time-setup.sh
# Upload it to server using SCP or copy-paste
```

### Step 2: Run on Server
```bash
# SSH into server
ssh root@your-server-ip

# Navigate to project directory
cd /home/manthmwear/htdocs/manthmwear.com

# If you uploaded the script, make it executable
chmod +x server-first-time-setup.sh

# Run the setup script
./server-first-time-setup.sh
```

---

## ALTERNATIVE: Manual Commands (Copy-Paste)

If you prefer to run commands manually, copy-paste these one by one:

```bash
# Navigate to project
cd /home/manthmwear/htdocs/manthmwear.com

# Backup .env file
cp .env /tmp/.env.manthmwear.backup

# Remove existing .git
rm -rf .git

# Initialize fresh Git
git init
git config user.name "harrygithub11"
git config user.email "harrymailbox11@gmail.com"

# Add remote
git remote add origin https://github.com/harrygithub11/manthmwear.git

# Fetch from GitHub
git fetch origin

# Reset to match GitHub (overwrites local files)
git reset --hard origin/main

# Restore .env
cp /tmp/.env.manthmwear.backup .env

# Fix ownership
chown -R manthmwear:manthmwear /home/manthmwear/htdocs/manthmwear.com

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build Next.js
npm run build

# Make deploy script executable
chmod +x deploy-server.sh

# Restart PM2
pm2 restart manthmwear
pm2 save

# Check status
pm2 status
pm2 logs manthmwear --lines 50
```

---

## What This Does

1. ✅ Backs up your .env file to /tmp
2. ✅ Removes conflicting .git directory
3. ✅ Initializes fresh Git repository
4. ✅ Fetches code from GitHub
5. ✅ Resets local files to match GitHub
6. ✅ Restores your .env file
7. ✅ Fixes file ownership
8. ✅ Installs dependencies
9. ✅ Generates Prisma Client
10. ✅ Builds Next.js application
11. ✅ Makes deploy script executable
12. ✅ Restarts PM2

---

## After Setup

### Verify Everything Works:
```bash
# Check Git status
git status

# Check .env exists
ls -la .env

# Check PM2
pm2 status
pm2 logs manthmwear --lines 50

# Test the website
curl -I http://localhost:3000
```

### Future Deployments:
```bash
# Just run the deploy script
cd /home/manthmwear/htdocs/manthmwear.com
./deploy-server.sh
```

---

## Troubleshooting

### If .env is missing after setup:
```bash
# Check backup
cat /tmp/.env.manthmwear.backup

# Restore manually
cp /tmp/.env.manthmwear.backup /home/manthmwear/htdocs/manthmwear.com/.env
```

### If PM2 fails to restart:
```bash
# Delete and recreate
pm2 delete manthmwear
pm2 start npm --name "manthmwear" -- start
pm2 save
```

### If build fails:
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npx prisma generate
npm run build
```

### If ownership issues persist:
```bash
# Fix ownership recursively
chown -R manthmwear:manthmwear /home/manthmwear/htdocs/manthmwear.com
```

---

## Quick Copy-Paste Solution

**Just run these 3 commands on your server:**

```bash
cd /home/manthmwear/htdocs/manthmwear.com && \
cp .env /tmp/.env.backup && \
rm -rf .git && \
git init && \
git config user.name "harrygithub11" && \
git config user.email "harrymailbox11@gmail.com" && \
git remote add origin https://github.com/harrygithub11/manthmwear.git && \
git fetch origin && \
git reset --hard origin/main && \
cp /tmp/.env.backup .env && \
chown -R manthmwear:manthmwear . && \
npm install && \
npx prisma generate && \
npm run build && \
chmod +x deploy-server.sh && \
pm2 restart manthmwear && \
pm2 save && \
echo "✅ Setup Complete!"
```

---

## What's Next?

After successful setup:
1. ✅ Server is synced with GitHub
2. ✅ Git workflow is ready
3. ✅ Deploy script is ready for future use
4. ✅ PM2 is running latest code

**You're all set!** 🚀
