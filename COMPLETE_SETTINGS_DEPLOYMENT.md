# Complete Site Settings - Deployment Guide

## Overview
Comprehensive admin settings page with 5 tabs:
1. **Payment Settings** - COD, Online Payment, Razorpay
2. **Shipping & Store** - Shipping fees, tax, currency
3. **Social Media** - Instagram, Facebook, Twitter links
4. **Security** - Change admin password
5. **Maintenance Mode** - Enable/disable site maintenance

## Files Created/Modified

### New Files
- `app/admin/settings/page.tsx` - Complete settings UI
- `app/api/admin/settings/route.ts` - Settings API
- `app/api/admin/change-password/route.ts` - Password change API
- `add_payment_method_controls.sql` - Database migration

### Modified Files
- `prisma/schema.prisma` - Added payment method fields
- `app/checkout/page.tsx` - Respects payment settings
- `app/api/site-settings/route.ts` - Returns payment flags
- `components/admin/AdminLayout.tsx` - Updated nav link

## Database Migration

Run this SQL in your MySQL database:

```sql
-- Add payment method control columns
ALTER TABLE sitesettings 
ADD COLUMN codEnabled BOOLEAN DEFAULT TRUE;

ALTER TABLE sitesettings 
ADD COLUMN onlinePaymentEnabled BOOLEAN DEFAULT TRUE;

-- Update existing records
UPDATE sitesettings 
SET codEnabled = TRUE, onlinePaymentEnabled = TRUE 
WHERE codEnabled IS NULL OR onlinePaymentEnabled IS NULL;

-- Verify
SELECT id, codEnabled, onlinePaymentEnabled, maintenanceMode, 
       instagramUrl, facebookUrl, twitterUrl 
FROM sitesettings;
```

## Deployment Commands

```bash
# Navigate to project directory
cd /home/manthmwear/htdocs/manthmwear.com

# Run database migration
mysql -u your_db_user -p manthmwear < add_payment_method_controls.sql

# Regenerate Prisma Client
npx prisma generate

# Build the application
npm run build

# Restart PM2
pm2 restart manthmwear

# Check status
pm2 status

# View logs
pm2 logs manthmwear --lines 50
```

## Features by Tab

### 1. Payment Settings
- **COD Toggle** - Enable/disable Cash on Delivery
- **Online Payment Toggle** - Enable/disable online payments
- **Razorpay Configuration** - Key ID and Secret
- **Validation** - At least one method must be enabled
- **Auto-hide** - Razorpay fields hidden when online payment disabled

### 2. Shipping & Store
- **Shipping Fee** - Standard shipping charge (₹)
- **Free Shipping Threshold** - Minimum order for free shipping (₹)
- **Tax Rate** - Percentage tax on orders (0-100%)
- **Currency Code** - ISO currency code (INR, USD, etc.)
- **Currency Symbol** - Display symbol (₹, $, etc.)
- **Live Preview** - Shows example pricing

### 3. Social Media
- **Instagram URL** - Full Instagram profile link
- **Facebook URL** - Full Facebook page link
- **Twitter URL** - Full Twitter profile link
- **Auto-display** - Links appear in footer automatically

### 4. Security
- **Change Password** - Update admin login password
- **Validation** - Minimum 6 characters, must match confirmation
- **Separate Save** - Independent from other settings
- **Warning** - Notifies about re-login requirement

### 5. Maintenance Mode
- **Toggle** - Enable/disable maintenance mode
- **Custom Message** - Message shown to visitors
- **Warning** - Shows alert when maintenance is active
- **Visitor Block** - Prevents access to store when enabled

## Usage Examples

### Enable Only COD
1. Go to Payment Settings tab
2. Toggle OFF "Online Payment"
3. Keep "Cash on Delivery" ON
4. Click "Save Settings"

### Set Free Shipping
1. Go to Shipping & Store tab
2. Set "Shipping Fee" to 50
3. Set "Free Shipping Threshold" to 999
4. Orders ≥ ₹999 get free shipping

### Change Admin Password
1. Go to Security tab
2. Enter new password (min 6 chars)
3. Confirm password
4. Click "Change Password"
5. Log in again with new password

### Enable Maintenance Mode
1. Go to Maintenance tab
2. Toggle ON "Enable Maintenance Mode"
3. Enter custom message
4. Click "Save Settings"
5. Site shows maintenance page to visitors

## API Endpoints

### GET `/api/admin/settings`
**Auth:** Required (Bearer token)
**Returns:** All settings including payment, shipping, social, maintenance

### PUT `/api/admin/settings`
**Auth:** Required (Bearer token)
**Body:** Settings object
**Validates:** Payment methods, Razorpay credentials, numeric ranges

### POST `/api/admin/change-password`
**Auth:** Required (Bearer token)
**Body:** `{ newPassword: string }`
**Validates:** Minimum 6 characters

### GET `/api/site-settings`
**Auth:** Public
**Returns:** Public settings including payment flags (no secrets)

## Validation Rules

### Payment Settings
- At least one payment method must be enabled
- Razorpay credentials required if online payment enabled
- Key ID and Secret must not be empty

### Shipping Settings
- Shipping fee ≥ 0
- Free shipping threshold ≥ 0
- Tax rate between 0-100%

### Security
- Password minimum 6 characters
- Password and confirmation must match

### Social Media
- URLs must be valid format (optional)
- Empty URLs are allowed

## Testing Checklist

- [ ] Access `/admin/settings` without redirect
- [ ] Switch between all 5 tabs
- [ ] Toggle COD on/off
- [ ] Toggle Online Payment on/off
- [ ] Save Razorpay credentials
- [ ] Update shipping fee and threshold
- [ ] Change tax rate
- [ ] Update social media links
- [ ] Change admin password
- [ ] Enable/disable maintenance mode
- [ ] Verify settings persist after refresh
- [ ] Check checkout page shows correct payment methods
- [ ] Test COD order placement
- [ ] Test online payment order
- [ ] Verify maintenance mode blocks visitors

## Security Notes

1. **Password Storage** - Hashed with bcrypt (10 rounds)
2. **Razorpay Secret** - Stored in database (consider encryption)
3. **Admin Auth** - Token-based, checks for 'YWRtaW4' prefix
4. **Public API** - Only returns non-sensitive data
5. **Maintenance Mode** - Admin can still access dashboard

## Troubleshooting

### Settings page redirects to login
- Clear browser cache and cookies
- Log out and log in again
- Check browser console for errors

### TypeScript errors in API
- Run database migration first
- Run `npx prisma generate`
- Rebuild with `npm run build`

### Changes not saving
- Check browser console for errors
- Verify admin token is valid
- Check PM2 logs for server errors

### Maintenance mode not working
- Verify setting is saved in database
- Check middleware implementation
- Clear browser cache

## Default Values

- COD: Enabled
- Online Payment: Enabled
- Shipping Fee: ₹50
- Free Shipping Threshold: ₹999
- Tax Rate: 0%
- Currency: INR
- Currency Symbol: ₹
- Maintenance Mode: Disabled
- Admin Password: admin123 (change immediately!)

## Support

For issues or questions:
1. Check PM2 logs: `pm2 logs manthmwear`
2. Check browser console for errors
3. Verify database migration completed
4. Ensure Prisma client regenerated
