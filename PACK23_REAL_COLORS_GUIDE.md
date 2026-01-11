# Pack 2 & 3 Real Color Variants - Implementation Guide

## Overview
This changes Pack 2 and 3 from "Custom Pack" (customer chooses colors) to real color variants (Black, Royal Blue, Dark Green, etc.) just like Pack 1.

## What Changes

### Before (Custom Pack):
- Pack 2: 4 variants (S, M, L, XL) - all "Custom Pack"
- Pack 3: 4 variants (S, M, L, XL) - all "Custom Pack"
- Customer chooses colors in Quick Buy modal
- Total: 8 variants for Pack 2/3

### After (Real Colors):
- Pack 2: 24 variants (4 sizes × 6 colors)
- Pack 3: 24 variants (4 sizes × 6 colors)
- Each variant has specific color (Black, Royal Blue, etc.)
- Customer selects color before adding to cart
- Total: 48 variants for Pack 2/3

## Colors Available
1. Black (#000000)
2. Royal Blue (#1E3A8A)
3. Dark Green (#064E3B)
4. Maroon (#7F1D1D)
5. Grey (#6B7280)
6. Coffee (#6F4E37)

## Database Changes

### Step 1: Run SQL Script
```bash
run_create_pack23_colors.bat
```

This will:
- Backup existing Pack 2/3 variants
- Delete "Custom Pack" variants
- Create individual color variants for Pack 2/3
- Set up shared stock system
- Calculate prices (Pack 2 = 1.8x Pack 1, Pack 3 = 2.5x Pack 1)

### Step 2: Verify in Database
Check that Pack 2/3 now have color variants:
```sql
SELECT pack, color, COUNT(*) as count
FROM productvariant
WHERE productId = (SELECT id FROM product WHERE slug = 'trunk-core')
GROUP BY pack, color
ORDER BY pack, color;
```

Should show:
- Pack 1: 6 colors
- Pack 2: 6 colors (same as Pack 1)
- Pack 3: 6 colors (same as Pack 1)

## Frontend Behavior

### Shop Page / Home Page
- Pack 1: Shows single color, can switch colors
- Pack 2: Shows single color, can switch colors (NEW!)
- Pack 3: Shows single color, can switch colors (NEW!)

### Product Detail Page
- All pack sizes show color selector
- Selecting a color updates the variant
- Stock is shared across pack sizes

### Quick Buy Modal
- Shows selected color
- Can change color/size/pack
- Stock updates based on shared stock

## Stock Management

### Shared Stock System
- baseStock = total individual items
- Pack 1 stock = baseStock / 1
- Pack 2 stock = baseStock / 2
- Pack 3 stock = baseStock / 3

Example: baseStock = 90
- Pack 1: 90 packs available
- Pack 2: 45 packs available
- Pack 3: 30 packs available

### Updating Stock in Admin
1. Edit any variant (Pack 1, 2, or 3)
2. Change stock value
3. System automatically updates baseStock
4. All pack sizes for that color/size update

## Pricing

### Auto-Calculated Prices
- Pack 1: Base price (e.g., ₹335)
- Pack 2: 1.8x Pack 1 (e.g., ₹546)
- Pack 3: 2.5x Pack 1 (e.g., ₹838)

### Adjusting Prices
You can manually adjust prices in admin panel after creation.

## Deployment Steps

1. **Backup Database** (important!)
   ```bash
   mysqldump -u root -p manthmwear > backup_before_pack23_colors.sql
   ```

2. **Run SQL Script**
   ```bash
   run_create_pack23_colors.bat
   ```

3. **Verify Database**
   - Check variant counts
   - Verify colors are correct
   - Check stock values

4. **Build & Deploy**
   ```bash
   npm run build
   pm2 restart manthmwear
   ```

5. **Test Frontend**
   - Check shop page shows colors for Pack 2/3
   - Test color switching
   - Verify Quick Buy modal
   - Test adding to cart

## Rollback Plan

If something goes wrong:

1. **Restore from backup table**
   ```sql
   DELETE FROM productvariant WHERE pack IN (2, 3);
   INSERT INTO productvariant SELECT * FROM productvariant_backup_pack23;
   ```

2. **Or restore full database**
   ```bash
   mysql -u root -p manthmwear < backup_before_pack23_colors.sql
   ```

## Benefits

✅ Consistent experience across all pack sizes
✅ Easier inventory management
✅ Clearer product display
✅ Better for SEO (specific color URLs)
✅ Shared stock prevents overselling

## Considerations

⚠️ More variants to manage (48 instead of 8)
⚠️ Customers can't mix colors in Pack 2/3
⚠️ Need to maintain stock for each color

## Next Steps After Deployment

1. Review prices and adjust if needed
2. Update product descriptions if they mention "custom colors"
3. Monitor stock levels
4. Check analytics for color preferences
5. Consider adding more colors based on demand

---

**Ready to proceed?** Run `run_create_pack23_colors.bat` to start!
