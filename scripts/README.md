# Admin Password Management Scripts

These scripts help manage the admin password stored in the database.

## Scripts

### 1. `generate-admin-hash.js`
Generates and tests bcrypt hashes for passwords.

```bash
node scripts/generate-admin-hash.js
```

**Purpose:** 
- Generate a bcrypt hash for "admin123"
- Test if the hash works correctly
- Verify the default hash in the codebase

### 2. `fix-admin-password.js`
Fixes the admin password if it's NULL in the database.

```bash
node scripts/fix-admin-password.js
```

**Purpose:**
- Check if adminPasswordHash exists
- Set default "admin123" hash if NULL
- Create settings record if none exists

### 3. `set-admin-password.js`
Sets/resets the admin password to "admin123" with a fresh hash.

```bash
node scripts/set-admin-password.js
```

**Purpose:**
- Generate a new bcrypt hash for "admin123"
- Update the database with the new hash
- Verify the hash works correctly

## Usage on Server

```bash
cd /home/connectharish-ecom/htdocs/ecom.connectharish.online

# Reset admin password to admin123
node scripts/set-admin-password.js

# Restart the app
pm2 restart ecom-app
```

## Default Credentials

- **Username:** Any (not checked)
- **Password:** `admin123`

⚠️ **Important:** Change the password immediately after first login via Admin Settings → Change Admin Password

## Troubleshooting

If login fails with "admin123":

1. Run `node scripts/generate-admin-hash.js` to verify bcrypt is working
2. Run `node scripts/set-admin-password.js` to reset the password
3. Check server logs: `pm2 logs ecom-app --lines 50`
4. Restart: `pm2 restart ecom-app`

## Security Notes

- Passwords are stored as bcrypt hashes (10 rounds)
- Never commit actual passwords to git
- Change default password immediately in production
- Hashes start with `$2b$10$` for bcrypt
