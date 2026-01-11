# Coupon System Implementation Guide

## Overview
Complete end-to-end coupon code system with admin management, validation, and checkout integration.

## Files Created

### 1. Database Schema Updates
**File**: `prisma/schema.prisma`
- Added `coupon` model with all fields
- Added `couponusage` tracking model
- Added `couponCode` field to `order` model
- Added relations between models

### 2. SQL Migration
**File**: `add_coupon_system.sql`
- Creates `coupons` table
- Creates `couponusages` table
- Adds `couponCode` column to orders
- Includes 3 sample coupons for testing

### 3. Admin API Routes
**File**: `app/api/admin/coupons/route.ts`
- GET: List all coupons with usage stats
- POST: Create new coupon with validation

**File**: `app/api/admin/coupons/[id]/route.ts`
- GET: Get single coupon with usage history
- PATCH: Update coupon
- DELETE: Delete coupon

### 4. Public API Route
**File**: `app/api/coupons/validate/route.ts`
- POST: Validate coupon code
- Checks: active status, expiry, usage limits, min order value, one-time per user
- Returns: discount amount and validation result

### 5. Admin Dashboard Page
**File**: `app/admin/coupons/page.tsx`
- Full CRUD interface for coupons
- Create/Edit modal with all fields
- Toggle active/inactive status
- Copy coupon codes
- View usage statistics
- Delete coupons

## Features Implemented

### Coupon Types
1. **Percentage Discount** (e.g., 10% off)
   - Optional max discount cap
2. **Fixed Amount Discount** (e.g., ₹100 off)

### Coupon Controls
- **Code**: Unique coupon code (auto-uppercase)
- **Description**: Optional description
- **Discount Type**: PERCENTAGE or FIXED
- **Discount Value**: Percentage (0-100) or amount in rupees
- **Min Order Value**: Minimum cart value required
- **Max Discount**: Maximum discount cap (for percentage)
- **Usage Limit**: Total number of times coupon can be used
- **One-time Per User**: Restrict to one use per customer
- **Expiry Date**: Optional expiration date
- **Active/Inactive**: Enable/disable coupon

### Validation Rules
✅ Code must be unique
✅ Active status check
✅ Expiry date check
✅ Usage limit check
✅ Minimum order value check
✅ One-time per user check
✅ Discount cannot exceed cart value

### Usage Tracking
- Tracks every coupon usage
- Links to order and user
- Records actual discount applied
- Timestamp of usage
- Visible in admin dashboard

## Deployment Steps

### Step 1: Update Database Schema
```bash
# Run Prisma migration
npx prisma generate
```

### Step 2: Run SQL Migration
```bash
# Connect to your MySQL database and run:
mysql -u your_user -p your_database < add_coupon_system.sql
```

Or use your database management tool to execute `add_coupon_system.sql`

### Step 3: Add Navigation Link
Add to `components/admin/AdminLayout.tsx`:
```tsx
<Link href="/admin/coupons" className={...}>
  <Tag className="w-5 h-5" />
  <span>Coupons</span>
</Link>
```

### Step 4: Update Checkout Page
The checkout page needs to be updated to include:
1. Coupon code input field
2. Apply/Remove coupon button
3. Coupon validation logic
4. Display applied discount
5. Pass coupon code to order creation

See `CHECKOUT_COUPON_INTEGRATION.md` for detailed code changes.

### Step 5: Update Order Creation API
The guest order API (`app/api/orders/guest/route.ts`) needs to:
1. Accept coupon code in request
2. Validate coupon again server-side
3. Apply discount to order
4. Create coupon usage record
5. Increment coupon usage count

## Testing Checklist

### Admin Dashboard
- [ ] Create percentage coupon
- [ ] Create fixed amount coupon
- [ ] Edit coupon details
- [ ] Toggle active/inactive
- [ ] Delete coupon
- [ ] Copy coupon code
- [ ] View usage statistics

### Checkout Flow
- [ ] Apply valid coupon
- [ ] Try invalid coupon code
- [ ] Try expired coupon
- [ ] Try coupon below min order value
- [ ] Try coupon at usage limit
- [ ] Try one-time coupon twice (same user)
- [ ] Remove applied coupon
- [ ] Complete order with coupon
- [ ] Verify discount in order

### Order Tracking
- [ ] Coupon code saved in order
- [ ] Discount amount correct
- [ ] Usage recorded in couponusages table
- [ ] Usage count incremented
- [ ] Visible in admin order details

## Sample Coupons (Pre-loaded)

1. **WELCOME10**
   - 10% off, no minimum
   - Max discount: ₹500
   - Unlimited uses
   - No expiry

2. **FLAT100**
   - ₹100 off on orders above ₹500
   - Limited to 100 uses
   - Expires in 30 days

3. **FIRSTORDER**
   - 15% off, no minimum
   - Max discount: ₹1000
   - One-time per user
   - No expiry

## API Endpoints

### Admin (Requires Authentication)
- `GET /api/admin/coupons` - List all coupons
- `POST /api/admin/coupons` - Create coupon
- `GET /api/admin/coupons/[id]` - Get coupon details
- `PATCH /api/admin/coupons/[id]` - Update coupon
- `DELETE /api/admin/coupons/[id]` - Delete coupon

### Public
- `POST /api/coupons/validate` - Validate coupon code

## Database Schema

### coupons table
```sql
id              VARCHAR(191) PRIMARY KEY
code            VARCHAR(191) UNIQUE
description     TEXT
discountType    VARCHAR(191) -- 'PERCENTAGE' or 'FIXED'
discountValue   INT -- Percentage or amount in paise
minOrderValue   INT -- In paise
maxDiscount     INT -- In paise (nullable)
usageLimit      INT -- Nullable (null = unlimited)
usageCount      INT DEFAULT 0
oneTimePerUser  BOOLEAN DEFAULT false
expiryDate      DATETIME -- Nullable
isActive        BOOLEAN DEFAULT true
createdAt       DATETIME
updatedAt       DATETIME
```

### couponusages table
```sql
id        VARCHAR(191) PRIMARY KEY
couponId  VARCHAR(191) FOREIGN KEY
orderId   VARCHAR(191) FOREIGN KEY
userId    VARCHAR(191) FOREIGN KEY
discount  INT -- Actual discount in paise
usedAt    DATETIME
```

## Next Steps

1. **Checkout Integration**: Update checkout page with coupon UI
2. **Order API Update**: Modify order creation to handle coupons
3. **Admin Order View**: Show coupon details in order management
4. **Email Templates**: Include coupon savings in order emails
5. **Analytics**: Add coupon performance dashboard
6. **Bulk Operations**: Import/export coupons
7. **Advanced Features**:
   - Product-specific coupons
   - Category-specific coupons
   - User-specific coupons
   - Auto-apply coupons
   - Coupon stacking rules

## Support

For issues or questions:
1. Check console logs for errors
2. Verify database migrations ran successfully
3. Ensure Prisma client is regenerated
4. Check API authentication tokens
5. Verify coupon validation logic

## Security Notes

- All admin routes require authentication
- Coupon codes are case-insensitive (stored uppercase)
- Server-side validation prevents tampering
- Usage tracking prevents fraud
- One-time per user uses userId tracking

---

**Status**: ✅ Core system implemented
**Next**: Checkout page integration
