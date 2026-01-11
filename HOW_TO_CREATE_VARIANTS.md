# How to Create Trunk Core Variants with Custom Pack Selection

## Quick Start

### Option 1: Fresh Insert (Recommended if you deleted all variants)
```bash
mysql -u root -p manthmwear < create_trunk_core_variants_with_custom_packs.sql
```

### Option 2: Safe Insert/Update (Safe to run multiple times)
```bash
mysql -u root -p manthmwear < insert_or_update_trunk_core_variants.sql
```

## What Gets Created

### Pack of 1 (20 variants)
All 5 colors × 4 sizes = 20 variants
- **Black** (S, M, L, XL) - ₹335 each
- **Royal Blue** (S, M, L, XL) - ₹335 each
- **Dark Green** (S, M, L, XL) - ₹335 each
- **Maroon** (S, M, L, XL) - ₹335 each
- **Grey** (S, M, L, XL) - ₹335 each

**User Experience:** Select 1 color from dropdown

### Pack of 2 (4 variants)
1 base × 4 sizes = 4 variants
- **Custom Pack** (S, M, L, XL) - ₹546 each

**User Experience:** 
```
Item 1: [Select Color] → Black, Royal Blue, Dark Green, Maroon, Grey
Item 2: [Select Color] → Black, Royal Blue, Dark Green, Maroon, Grey
```
Can choose: Black + Black, Black + Royal Blue, etc.

### Pack of 3 (4 variants)
1 base × 4 sizes = 4 variants
- **Custom Pack** (S, M, L, XL) - ₹694 each

**User Experience:**
```
Item 1: [Select Color] → Black, Royal Blue, Dark Green, Maroon, Grey
Item 2: [Select Color] → Black, Royal Blue, Dark Green, Maroon, Grey
Item 3: [Select Color] → Black, Royal Blue, Dark Green, Maroon, Grey
```
Can choose any combination!

## Total: 28 Variants

## Verification

After running the SQL, verify with:

```sql
-- Check total count
SELECT COUNT(*) as total FROM productvariant WHERE productId = 'prod_trunk_core';
-- Expected: 28

-- Check by pack
SELECT 
    pack,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT color) as colors
FROM productvariant
WHERE productId = 'prod_trunk_core'
GROUP BY pack;

-- Expected output:
-- pack | count | colors
-- -----|-------|------------------------------------------
--   1  |  20   | Black,Dark Green,Grey,Maroon,Royal Blue
--   2  |   4   | Custom Pack
--   3  |   4   | Custom Pack
```

## Color Codes Included

All variants include proper color codes for visual display:
- Black: `#000000`
- Royal Blue: `#4169E1`
- Dark Green: `#013220`
- Maroon: `#800000`
- Grey: `#808080`
- Custom Pack: `#CCCCCC` (placeholder)

## Stock Levels

All variants are created with:
- Stock: 100 units
- Active: Yes
- Price: As per pack (₹335, ₹546, ₹694)

## SKU Format

- Pack 1: `TC-{COLOR}-{SIZE}-1` (e.g., TC-BK-M-1)
- Pack 2: `TC-CUSTOM-{SIZE}-2` (e.g., TC-CUSTOM-M-2)
- Pack 3: `TC-CUSTOM-{SIZE}-3` (e.g., TC-CUSTOM-M-3)

## Troubleshooting

### If you get duplicate key errors:
Use the `insert_or_update_trunk_core_variants.sql` file instead - it's safe to run multiple times.

### If variants don't show up:
Check that the product exists:
```sql
SELECT * FROM product WHERE id = 'prod_trunk_core';
```

### If prices are wrong:
Prices are in paise (1 rupee = 100 paise):
- ₹335 = 33500 paise
- ₹546 = 54600 paise
- ₹694 = 69400 paise

## Next Steps

After creating variants:
1. Test Pack of 1 selection (should show 5 colors)
2. Test Pack of 2 selection (should show 2 color selectors)
3. Test Pack of 3 selection (should show 3 color selectors)
4. Add items to cart and verify colors display correctly
5. Complete a test checkout

## Done! 🎉

Your database now has the optimal structure for custom pack color selection!
