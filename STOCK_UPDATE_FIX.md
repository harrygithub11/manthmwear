# Stock Update Fix - Shared Stock System

## Problem
When updating stock for Pack of 2 or Pack of 3 variants in the admin panel, the stock display wasn't changing because the system uses **shared stock** (`baseStock` field) instead of the regular `stock` field.

## How Shared Stock Works

For products using shared stock:
- **baseStock**: The total number of individual items available
- **Pack of 1**: Shows `baseStock / 1` packs available
- **Pack of 2**: Shows `baseStock / 2` packs available  
- **Pack of 3**: Shows `baseStock / 3` packs available

Example: If baseStock = 90
- Pack of 1: 90 packs available
- Pack of 2: 45 packs available
- Pack of 3: 30 packs available

## What Was Fixed

### 1. API Update Endpoint (`app/api/admin/products/[id]/route.ts`)
- Added support for `baseStock` and `useSharedStock` fields
- Added `sizeRank`, `colorCode`, `colorRank` fields
- Now properly saves these fields when updating variants

### 2. Admin Product Modal (`app/admin/products/ProductModal.tsx`)
- Added `baseStock`, `useSharedStock`, `sizeRank`, `colorRank` to Variant interface
- Updated `updateVariant()` function to handle shared stock:
  - When you change stock on a shared stock variant, it updates `baseStock`
  - Automatically recalculates stock for all pack sizes with same color/size
- Added visual indicator (🔗) to show when a variant uses shared stock
- Shows calculation: "Base: 90 ÷ 2 = 45 packs"

## How to Update Stock Now

### For Shared Stock Products (Trunk Core):
1. Open the product in admin
2. Find any variant with the color/size you want to update
3. Change the stock value
4. The system will automatically:
   - Calculate new baseStock = stock × pack
   - Update all pack sizes for that color/size
   - Show the calculation below the input

Example: If you set Pack of 2 stock to 0:
- baseStock becomes 0 × 2 = 0
- Pack of 1 shows 0 packs
- Pack of 2 shows 0 packs
- Pack of 3 shows 0 packs

### For Regular Stock Products:
- Just update the stock field directly
- Each variant has independent stock

## Deploy

```bash
npm run build
pm2 restart manthmwear
```

## Verify

1. Go to admin panel
2. Edit a product with Pack of 2/3
3. Change stock to 0
4. Save
5. Check the shop page - stock should now show 0
6. Look for the 🔗 icon next to "Stock" label (indicates shared stock)
7. See the calculation below the stock input

✅ Stock updates now work correctly for all pack sizes!
