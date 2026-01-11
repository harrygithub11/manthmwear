# Pack Variants Database Update Guide

## Overview
This guide explains how to update your database to support the new custom color selection feature for Pack of 2 and Pack of 3.

## Problem
Currently, the database has separate variants for each color combination:
- Pack of 1: 5 colors × 4 sizes = 20 variants ✅ (Keep as is)
- Pack of 2: 5 colors × 4 sizes = 20 variants ❌ (Too many, users select colors now)
- Pack of 3: 5 colors × 4 sizes = 20 variants ❌ (Too many, users select colors now)

**Total: 60 variants**

## Solution
After the update:
- Pack of 1: 5 colors × 4 sizes = 20 variants ✅ (Keep all colors)
- Pack of 2: 1 base × 4 sizes = 4 variants ✅ (Users select 2 colors)
- Pack of 3: 1 base × 4 sizes = 4 variants ✅ (Users select 3 colors)

**Total: 28 variants** (saves 32 unnecessary variants)

## SQL Files Provided

### 1. `clean_pack_variants_simple.sql` (RECOMMENDED)
**Best for: Trunk Core product only**
- Simple and straightforward
- Keeps only Black variants for Pack 2 & 3
- Easy to understand and verify
- Includes backup and rollback

### 2. `clean_all_pack_variants.sql`
**Best for: Multiple products**
- Works across all products in database
- Automatically keeps first color alphabetically
- More complex but comprehensive
- Includes backup and rollback

### 3. `update_pack_variants_for_custom_colors.sql`
**Best for: Understanding the logic**
- Detailed comments explaining each step
- Shows verification queries
- Includes alternative approaches

## Step-by-Step Instructions

### Before You Start
1. **BACKUP YOUR DATABASE!**
   ```bash
   mysqldump -u your_user -p your_database > backup_before_pack_update.sql
   ```

2. **Test on a development database first**

### Execution Steps

#### Option A: Simple Update (Recommended)
```bash
# 1. Connect to your database
mysql -u your_user -p your_database

# 2. Run the simple clean script
source clean_pack_variants_simple.sql

# 3. Verify the results (should show 28 total variants)
SELECT pack, COUNT(*) as count FROM productvariant 
WHERE productId = 'prod_trunk_core' 
GROUP BY pack;
```

#### Option B: Comprehensive Update (All Products)
```bash
# 1. Connect to your database
mysql -u your_user -p your_database

# 2. Run the comprehensive script
source clean_all_pack_variants.sql

# 3. Verify the results
SELECT pack, COUNT(*) FROM productvariant GROUP BY pack;
```

### Verification Queries

After running the update, verify the changes:

```sql
-- Check variant counts by pack
SELECT 
    pack,
    COUNT(*) as total_variants,
    GROUP_CONCAT(DISTINCT color) as colors,
    GROUP_CONCAT(DISTINCT size ORDER BY size) as sizes
FROM productvariant
WHERE productId = 'prod_trunk_core'
GROUP BY pack;

-- Expected output:
-- Pack 1: 20 variants, colors: Black,Dark Green,Grey,Maroon,Royal Blue, sizes: L,M,S,XL
-- Pack 2: 4 variants, colors: Black, sizes: L,M,S,XL
-- Pack 3: 4 variants, colors: Black, sizes: L,M,S,XL
```

### Rollback (If Needed)

If something goes wrong:

```sql
-- Restore from backup table
DELETE FROM productvariant WHERE productId = 'prod_trunk_core';
INSERT INTO productvariant SELECT * FROM productvariant_backup_20251127;
DROP TABLE productvariant_backup_20251127;
```

Or restore from full backup:
```bash
mysql -u your_user -p your_database < backup_before_pack_update.sql
```

## What Happens in the Application

### Before Update
- User sees: "Black", "Royal Blue", "Dark Green", etc. for Pack 2
- User can only buy predefined combinations
- 60 variants to manage

### After Update
- User sees: Size selector → Pack selector → Custom color selectors
- Pack of 2: User selects 2 colors (Item 1, Item 2)
- Pack of 3: User selects 3 colors (Item 1, Item 2, Item 3)
- 28 variants to manage (much simpler!)

## Important Notes

1. **Stock Management**: After the update, Pack 2 & 3 will have only one variant per size. Make sure to adjust stock levels accordingly.

2. **Pricing**: The prices remain the same:
   - Pack 1: ₹335 (33500 paise)
   - Pack 2: ₹546 (54600 paise)
   - Pack 3: ₹694 (69400 paise)

3. **SKU Updates**: You may want to update SKUs for Pack 2 & 3:
   ```sql
   UPDATE productvariant 
   SET sku = CONCAT('TC-CUSTOM-', size, '-', pack)
   WHERE pack IN (2, 3) AND productId = 'prod_trunk_core';
   ```

4. **Color Field**: The `color` field for Pack 2 & 3 becomes a "base" color. The actual selected colors are stored in the cart as `packColors` array.

## Testing Checklist

After database update, test:
- [ ] Pack of 1 selection works (single color)
- [ ] Pack of 2 selection shows 2 color selectors
- [ ] Pack of 3 selection shows 3 color selectors
- [ ] Can select same color multiple times (e.g., Black + Black)
- [ ] Can select different colors (e.g., Black + White + Grey)
- [ ] Cart displays selected colors correctly
- [ ] Checkout process works
- [ ] Stock levels are correct

## Support

If you encounter issues:
1. Check the backup was created successfully
2. Verify the variant counts match expected numbers
3. Test the UI with different pack selections
4. Check browser console for any errors

## Summary

This update simplifies your database structure and gives users complete freedom to choose their own color combinations for multi-packs. The application now handles color selection in the UI rather than requiring predefined database variants.
