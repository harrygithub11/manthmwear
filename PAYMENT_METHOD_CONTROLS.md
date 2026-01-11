# Payment Method Controls Feature

## Overview
Admin dashboard now includes controls to enable/disable Cash on Delivery (COD) and Online Payment methods.

## Features Implemented

### 1. Database Schema Updates
- Added `codEnabled` (BOOLEAN, default: TRUE)
- Added `onlinePaymentEnabled` (BOOLEAN, default: TRUE)
- Both fields in `sitesettings` table

### 2. Admin Settings Page
**Location:** `/admin/settings`

**Features:**
- Toggle switches for COD and Online Payment
- Razorpay configuration (Key ID & Secret)
- Validation: At least one payment method must be enabled
- Auto-hide Razorpay fields when online payment is disabled

### 3. Checkout Page Updates
**Dynamic Payment Options:**
- Only shows enabled payment methods
- Auto-selects available method if only one is enabled
- Shows warning if no payment methods are available
- Respects admin settings in real-time

### 4. API Endpoints

#### GET `/api/admin/settings`
- Fetch current payment settings
- Requires admin authentication

#### PUT `/api/admin/settings`
- Update payment settings
- Validates at least one method is enabled
- Validates Razorpay credentials if online payment enabled

#### GET `/api/site-settings`
- Public endpoint
- Returns `codEnabled` and `onlinePaymentEnabled` flags

## Setup Instructions

### Step 1: Run Database Migration
Execute the SQL migration file:
```bash
mysql -u your_user -p your_database < add_payment_method_controls.sql
```

Or run directly in MySQL:
```sql
ALTER TABLE sitesettings 
ADD COLUMN codEnabled BOOLEAN DEFAULT TRUE;

ALTER TABLE sitesettings 
ADD COLUMN onlinePaymentEnabled BOOLEAN DEFAULT TRUE;

UPDATE sitesettings 
SET codEnabled = TRUE, onlinePaymentEnabled = TRUE;
```

### Step 2: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 3: Access Admin Settings
1. Login to admin dashboard
2. Navigate to "Payment Settings" in sidebar
3. Configure payment methods as needed

## Usage

### Enable/Disable COD
1. Go to `/admin/settings`
2. Toggle "Cash on Delivery (COD)" switch
3. Click "Save Settings"

### Enable/Disable Online Payment
1. Go to `/admin/settings`
2. Toggle "Online Payment" switch
3. Enter Razorpay Key ID and Secret (required)
4. Click "Save Settings"

### Configure Razorpay
1. Get credentials from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Enter Key ID (e.g., `rzp_test_xxxxxxxxxxxxx`)
3. Enter Key Secret
4. Save settings

## Validation Rules

1. **At least one method must be enabled**
   - Cannot disable both COD and Online Payment
   - System will show error if attempted

2. **Razorpay credentials required for online payment**
   - Key ID and Secret must be provided
   - System validates before saving

3. **Checkout page respects settings**
   - Only enabled methods are shown
   - Auto-selects if only one available
   - Shows warning if none available

## Files Modified

### New Files
- `app/admin/settings/page.tsx` - Admin settings UI
- `app/api/admin/settings/route.ts` - Settings API
- `add_payment_method_controls.sql` - Database migration

### Modified Files
- `prisma/schema.prisma` - Added payment method fields
- `app/checkout/page.tsx` - Dynamic payment method display
- `app/api/site-settings/route.ts` - Include payment flags
- `components/admin/AdminLayout.tsx` - Added settings link

## Testing Checklist

- [ ] Run database migration successfully
- [ ] Access admin settings page
- [ ] Toggle COD on/off
- [ ] Toggle Online Payment on/off
- [ ] Try to disable both (should show error)
- [ ] Save Razorpay credentials
- [ ] Check checkout page shows correct methods
- [ ] Test COD order placement
- [ ] Test online payment order placement
- [ ] Verify settings persist after page refresh

## Default Behavior
- Both COD and Online Payment are enabled by default
- Existing installations will have both methods enabled after migration
- No disruption to current checkout flow

## Security Notes
- Razorpay Key Secret is stored in database (encrypted recommended)
- Admin authentication required for settings access
- Public API only returns enabled/disabled flags, not credentials
