# Complete Settings Implementation - End-to-End Guide

## Overview
This is a comprehensive admin settings page with 8 tabs covering all site configuration needs.

## 📋 All Settings Tabs

### 1. General Tab
- **Site Name** - Store name (e.g., MANTHM)
- **Site Tagline** - Store tagline/slogan
- **Logo URL** - Full URL to logo image
- **Favicon URL** - Full URL to favicon
- **Domain** - Store domain name
- **Contact Email** - Primary contact email
- **Contact Phone** - Contact phone number

### 2. Payment Tab
- **COD Toggle** - Enable/disable Cash on Delivery
- **Online Payment Toggle** - Enable/disable online payments
- **Razorpay Key ID** - Razorpay API key
- **Razorpay Key Secret** - Razorpay secret key

### 3. Shipping Tab
- **Shipping Fee** - Standard shipping charge (₹)
- **Free Shipping Threshold** - Minimum order for free shipping (₹)
- **Tax Rate** - Tax percentage (0-100%)
- **Currency Code** - ISO currency code (INR, USD, etc.)
- **Currency Symbol** - Display symbol (₹, $, etc.)

### 4. Social Tab
- **Instagram URL** - Full Instagram profile link
- **Facebook URL** - Full Facebook page link
- **Twitter URL** - Full Twitter profile link

### 5. SEO Tab
- **Meta Title** - Page title for search engines (max 60 chars)
- **Meta Description** - Page description (max 160 chars)
- **Meta Keywords** - Comma-separated keywords

### 6. Email Tab
- **Email From** - Sender email for automated emails
- **Admin Notification Email** - Email for order notifications

### 7. Security Tab
- **Change Password** - Update admin login password
- **Password validation** - Min 6 characters, must match

### 8. Maintenance Tab
- **Maintenance Mode Toggle** - Enable/disable site maintenance
- **Maintenance Message** - Custom message for visitors

## 🗄️ Database Schema

All fields exist in the `sitesettings` table:

```sql
-- Branding
siteName              VARCHAR
siteTagline           VARCHAR
logoUrl               VARCHAR
faviconUrl            VARCHAR

-- Contact
domain                VARCHAR
contactEmail          VARCHAR
contactPhone          VARCHAR

-- Store
currency              VARCHAR
currencySymbol        VARCHAR
shippingFee           INT (in paise)
freeShippingThreshold INT (in paise)
taxRate               FLOAT

-- Email
emailFrom             VARCHAR
adminNotificationEmail VARCHAR

-- Social
instagramUrl          VARCHAR
facebookUrl           VARCHAR
twitterUrl            VARCHAR

-- SEO
metaTitle             VARCHAR
metaDescription       VARCHAR
metaKeywords          VARCHAR

-- Payment
razorpayKeyId         VARCHAR
razorpayKeySecret     VARCHAR
codEnabled            BOOLEAN
onlinePaymentEnabled  BOOLEAN

-- Security
adminPasswordHash     VARCHAR

-- Maintenance
maintenanceMode       BOOLEAN
maintenanceMessage    VARCHAR

-- Timestamps
createdAt             DATETIME
updatedAt             DATETIME
```

## 🚀 Deployment Steps

### Step 1: Database Migration

```bash
# Connect to MySQL
mysql -u your_db_user -p manthmwear

# Run the complete migration
source complete_settings_migration.sql

# Or run directly
mysql -u your_db_user -p manthmwear < complete_settings_migration.sql
```

### Step 2: Verify Database

```sql
-- Check if all columns exist
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'sitesettings' 
ORDER BY ORDINAL_POSITION;

-- Check current settings
SELECT * FROM sitesettings;
```

### Step 3: Deploy Code

```bash
cd /home/manthmwear/htdocs/manthmwear.com

# Regenerate Prisma Client
npx prisma generate

# Build application
npm run build

# Restart PM2
pm2 restart manthmwear

# Check status
pm2 status

# Monitor logs
pm2 logs manthmwear --lines 50
```

## 🔍 API Endpoints

### GET `/api/admin/settings`
**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "siteName": "MANTHM",
  "siteTagline": "Premium Men's Underwear",
  "logoUrl": "",
  "faviconUrl": "",
  "domain": "manthmwear.com",
  "contactEmail": "contact@manthmwear.com",
  "contactPhone": "",
  "codEnabled": true,
  "onlinePaymentEnabled": true,
  "razorpayKeyId": "rzp_test_xxx",
  "razorpayKeySecret": "xxx",
  "shippingFee": 50,
  "freeShippingThreshold": 999,
  "taxRate": 0,
  "currency": "INR",
  "currencySymbol": "₹",
  "instagramUrl": "",
  "facebookUrl": "",
  "twitterUrl": "",
  "metaTitle": "",
  "metaDescription": "",
  "metaKeywords": "",
  "emailFrom": "",
  "adminNotificationEmail": "",
  "maintenanceMode": false,
  "maintenanceMessage": ""
}
```

### PUT `/api/admin/settings`
**Authentication:** Required (Bearer token)

**Request Body:** Same as GET response

**Validation:**
- At least one payment method must be enabled
- Razorpay credentials required if online payment enabled
- Shipping fee ≥ 0
- Free shipping threshold ≥ 0
- Tax rate between 0-100%

### POST `/api/admin/change-password`
**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "newPassword": "your_new_password"
}
```

**Validation:**
- Password minimum 6 characters

### GET `/api/site-settings`
**Authentication:** Public (no auth required)

**Response:** Public-safe settings (no secrets)

## ✅ Testing Checklist

### General Tab
- [ ] Update site name and verify it saves
- [ ] Update site tagline
- [ ] Add logo URL
- [ ] Add favicon URL
- [ ] Update domain
- [ ] Update contact email
- [ ] Update contact phone
- [ ] Click Save and verify persistence

### Payment Tab
- [ ] Toggle COD off, verify checkout page hides COD
- [ ] Toggle COD on, verify checkout page shows COD
- [ ] Toggle Online Payment off, verify checkout hides it
- [ ] Toggle Online Payment on, verify checkout shows it
- [ ] Try to disable both, verify error message
- [ ] Add Razorpay Key ID
- [ ] Add Razorpay Key Secret
- [ ] Save and verify persistence
- [ ] Test actual COD order placement
- [ ] Test actual online payment order

### Shipping Tab
- [ ] Update shipping fee to 100
- [ ] Update free shipping threshold to 1500
- [ ] Verify checkout calculates correctly
- [ ] Test order below threshold (should charge shipping)
- [ ] Test order above threshold (should be free)
- [ ] Update tax rate to 5%
- [ ] Verify checkout applies tax correctly
- [ ] Update currency code
- [ ] Update currency symbol
- [ ] Verify prices display with new symbol

### Social Tab
- [ ] Add Instagram URL
- [ ] Add Facebook URL
- [ ] Add Twitter URL
- [ ] Save and verify persistence
- [ ] Check footer displays social links

### SEO Tab
- [ ] Add meta title (check character count)
- [ ] Add meta description (check character count)
- [ ] Add meta keywords
- [ ] Save and verify persistence
- [ ] View page source, verify meta tags updated

### Email Tab
- [ ] Add email from address
- [ ] Add admin notification email
- [ ] Save and verify persistence
- [ ] Test order notification email

### Security Tab
- [ ] Enter new password (min 6 chars)
- [ ] Enter matching confirmation
- [ ] Click Change Password
- [ ] Verify success message
- [ ] Log out
- [ ] Log in with new password
- [ ] Verify login works

### Maintenance Tab
- [ ] Toggle maintenance mode ON
- [ ] Add custom maintenance message
- [ ] Save settings
- [ ] Open site in incognito/private window
- [ ] Verify maintenance page shows
- [ ] Verify admin can still access dashboard
- [ ] Toggle maintenance mode OFF
- [ ] Verify site is accessible again

### Cross-Tab Testing
- [ ] Switch between tabs without saving
- [ ] Verify unsaved changes are lost (expected)
- [ ] Make changes in multiple tabs
- [ ] Save and verify all changes persist
- [ ] Refresh page and verify all settings load correctly

### Error Handling
- [ ] Try to save with invalid email format
- [ ] Try to save with negative shipping fee
- [ ] Try to save with tax rate > 100%
- [ ] Try to save with both payment methods disabled
- [ ] Try to enable online payment without Razorpay keys
- [ ] Try to change password with < 6 characters
- [ ] Try to change password with mismatched confirmation

## 🔧 Troubleshooting

### Settings page redirects to login
**Solution:**
```bash
# Clear browser cache and cookies
# Log out and log in again
# Check browser console for errors
```

### Changes not saving
**Solution:**
```bash
# Check PM2 logs
pm2 logs manthmwear --lines 100

# Check database connection
mysql -u your_db_user -p manthmwear -e "SELECT * FROM sitesettings;"

# Verify API endpoint
curl -X GET http://localhost:3000/api/admin/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### TypeScript errors
**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Database fields missing
**Solution:**
```bash
# Run migration again
mysql -u your_db_user -p manthmwear < complete_settings_migration.sql

# Verify columns
mysql -u your_db_user -p manthmwear -e "DESCRIBE sitesettings;"
```

### Payment methods not working
**Solution:**
1. Check settings are saved in database
2. Verify checkout page fetches settings
3. Check browser console for errors
4. Verify Razorpay credentials are correct
5. Test in incognito mode

## 📊 Database Queries for Verification

### Check all settings
```sql
SELECT * FROM sitesettings;
```

### Check specific settings
```sql
SELECT 
    siteName,
    codEnabled,
    onlinePaymentEnabled,
    shippingFee,
    freeShippingThreshold,
    maintenanceMode
FROM sitesettings;
```

### Update settings manually (if needed)
```sql
UPDATE sitesettings 
SET 
    codEnabled = TRUE,
    onlinePaymentEnabled = TRUE,
    shippingFee = 5000,
    freeShippingThreshold = 99900
WHERE id = 'your_settings_id';
```

### Reset to defaults
```sql
UPDATE sitesettings 
SET 
    siteName = 'MANTHM',
    siteTagline = 'Premium Men\'s Underwear',
    domain = 'manthmwear.com',
    contactEmail = 'contact@manthmwear.com',
    currency = 'INR',
    currencySymbol = '₹',
    shippingFee = 5000,
    freeShippingThreshold = 99900,
    taxRate = 0,
    codEnabled = TRUE,
    onlinePaymentEnabled = TRUE,
    maintenanceMode = FALSE
WHERE id = 'your_settings_id';
```

## 🎯 Default Values

| Setting | Default Value |
|---------|--------------|
| Site Name | MANTHM |
| Site Tagline | Premium Men's Underwear |
| Domain | manthmwear.com |
| Contact Email | contact@manthmwear.com |
| Currency | INR |
| Currency Symbol | ₹ |
| Shipping Fee | ₹50 (5000 paise) |
| Free Shipping Threshold | ₹999 (99900 paise) |
| Tax Rate | 0% |
| COD Enabled | TRUE |
| Online Payment Enabled | TRUE |
| Maintenance Mode | FALSE |
| Admin Password | admin123 (CHANGE IMMEDIATELY!) |

## 🔐 Security Recommendations

1. **Change default admin password immediately**
2. **Use strong Razorpay credentials**
3. **Keep admin notification email secure**
4. **Don't share admin token**
5. **Use HTTPS in production**
6. **Regularly backup database**
7. **Monitor admin access logs**

## 📝 Files Modified/Created

### Created
- `app/admin/settings/page.tsx` - Complete settings UI (8 tabs)
- `app/api/admin/settings/route.ts` - Settings CRUD API
- `app/api/admin/change-password/route.ts` - Password change API
- `complete_settings_migration.sql` - Complete database migration
- `SETTINGS_COMPLETE_GUIDE.md` - This guide

### Modified
- `prisma/schema.prisma` - Added payment method fields
- `app/checkout/page.tsx` - Respects payment settings
- `app/api/site-settings/route.ts` - Returns all public settings
- `components/admin/AdminLayout.tsx` - Updated nav link

## 🎉 Success Criteria

Settings implementation is complete when:
- ✅ All 8 tabs are accessible
- ✅ All settings save to database
- ✅ All settings load on page refresh
- ✅ Payment methods control checkout options
- ✅ Shipping settings affect order calculations
- ✅ Password change works and requires re-login
- ✅ Maintenance mode blocks visitors (not admin)
- ✅ Social links appear in footer
- ✅ SEO meta tags update
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ All validations work correctly

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs manthmwear`
2. Check browser console for errors
3. Verify database migration completed
4. Ensure Prisma client regenerated
5. Test API endpoints directly with curl
6. Check file permissions on VPS

## 🚀 Quick Start Commands

```bash
# Complete deployment in one go
cd /home/manthmwear/htdocs/manthmwear.com && \
mysql -u your_db_user -p manthmwear < complete_settings_migration.sql && \
npx prisma generate && \
npm run build && \
pm2 restart manthmwear && \
pm2 logs manthmwear --lines 20
```

Replace `your_db_user` with your actual MySQL username.
