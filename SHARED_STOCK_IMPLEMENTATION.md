# Shared Stock System - Implementation Complete

## Overview

Implemented a shared stock system where all pack sizes (Pack of 1, 2, 3) draw from the same inventory pool.

## How It Works

### Base Stock
- Each color/size combination has a **baseStock** value
- This represents the total number of individual units available
- Example: 1000 Black-S trunks in warehouse

### Calculated Stock
- Pack of 1: Shows `baseStock ÷ 1` = 1000 available
- Pack of 2: Shows `baseStock ÷ 2` = 500 available
- Pack of 3: Shows `baseStock ÷ 3` = 333 available

### When Order is Placed
- Customer buys 2× Pack of 2 (4 units total)
- System deducts: `2 × 2 = 4` from baseStock
- New baseStock: 996
- Updated availability:
  - Pack of 1: 996
  - Pack of 2: 498
  - Pack of 3: 332

## Database Changes

### New Fields
```sql
ALTER TABLE productvariant ADD COLUMN baseStock INT DEFAULT NULL;
ALTER TABLE productvariant ADD COLUMN useSharedStock BOOLEAN DEFAULT false;
```

### Migration
- Pack of 1 variants: `baseStock = current stock`
- Pack of 2 variants: `baseStock = current stock × 2`
- Pack of 3 variants: `baseStock = current stock × 3`
- All variants: `useSharedStock = true`

## Files Modified

### 1. Database
- ✅ `implement_shared_stock.sql` - Migration script
- ✅ Added `baseStock` and `useSharedStock` columns

### 2. Prisma Schema
- ✅ `prisma/schema.prisma` - Added new fields

### 3. API Routes
- ✅ `app/api/products/route.ts` - Calculate stock dynamically
- ✅ `app/api/admin/products/route.ts` - Admin stock display
- ✅ `app/api/orders/guest/route.ts` - Shared stock deduction

### 4. Utilities
- ✅ `lib/shared-stock.ts` - Helper functions for stock management

## Usage

### For Admin: Update Stock

To update stock for a color/size:

```typescript
import { updateBaseStock } from '@/lib/shared-stock'

// Update Black-S to 1000 units
await updateBaseStock('prod_trunk_core_pack_1', 'Black', 'S', 1000)

// This automatically updates:
// - Pack of 1: 1000 available
// - Pack of 2: 500 available
// - Pack of 3: 333 available
```

### For Orders: Deduct Stock

```typescript
import { deductStock } from '@/lib/shared-stock'

// Customer buys 2× Pack of 2
await deductStock('variant_id', 2)

// Automatically deducts 4 units from baseStock
```

### Get Stock Summary

```typescript
import { getStockSummary } from '@/lib/shared-stock'

const summary = await getStockSummary('prod_id', 'Black', 'S')
// Returns:
// {
//   baseStock: 1000,
//   availability: {
//     pack1: 1000,
//     pack2: 500,
//     pack3: 333
//   }
// }
```

## Deployment Steps

### Step 1: Run Migration
```bash
mysql -h localhost -P 3306 -u manthmwearuser -pMANTHMweardb8989 manthmwear < implement_shared_stock.sql
```

### Step 2: Update Prisma
```bash
npx prisma db pull
npx prisma generate
```

### Step 3: Build & Deploy
```bash
npm run build
pm2 restart manthmwear
```

### Step 4: Verify
1. Check admin panel - stock should show calculated values
2. Place test order - verify stock deducts correctly
3. Check all pack sizes update together

## Benefits

✅ **Single Source of Truth** - One baseStock value per color/size
✅ **Automatic Sync** - All pack sizes always in sync
✅ **Accurate Inventory** - No more separate stock counts
✅ **Easy Management** - Update one value, affects all packs
✅ **Prevents Overselling** - Stock calculated in real-time

## Example Scenario

### Initial State
- Warehouse: 1000 Black-S trunks
- baseStock: 1000

### Display to Customers
- Pack of 1: "1000 in stock"
- Pack of 2: "500 in stock"
- Pack of 3: "333 in stock"

### After Sale (5× Pack of 2)
- Deducted: 5 × 2 = 10 units
- New baseStock: 990

### Updated Display
- Pack of 1: "990 in stock"
- Pack of 2: "495 in stock"
- Pack of 3: "330 in stock"

## Backward Compatibility

- Variants with `useSharedStock = false` use old system
- Can migrate gradually or all at once
- No breaking changes to existing functionality

## Admin Interface

The admin panel will show:
- **Base Stock**: Total units available
- **Pack 1 Available**: baseStock ÷ 1
- **Pack 2 Available**: baseStock ÷ 2
- **Pack 3 Available**: baseStock ÷ 3

Update base stock, and all pack availabilities update automatically!

## Testing Checklist

- [ ] Run migration script
- [ ] Verify baseStock values are correct
- [ ] Check shop page shows calculated stock
- [ ] Place test order
- [ ] Verify stock deducts correctly
- [ ] Check all pack sizes update together
- [ ] Test with different colors/sizes
- [ ] Verify admin panel displays correctly

## Support

If you encounter issues:
1. Check database: `SELECT * FROM productvariant WHERE useSharedStock = true`
2. Verify baseStock values are set
3. Check API response includes calculated stock
4. Review order processing logs

---

**Status:** ✅ Implementation Complete - Ready for Deployment
