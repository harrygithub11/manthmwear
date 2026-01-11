# Execute Coffee Color Update

## Quick Execute (Windows)

Simply double-click the file:
```
run_coffee_color_update.bat
```

## Manual Execute (Command Line)

### Option 1: Using MySQL Command Line
```bash
mysql -h localhost -P 3306 -u manthmwearuser -pMANTHMweardb8989 manthmwear < FINAL_COFFEE_COLOR_QUERY.sql
```

### Option 2: Using MySQL Workbench or phpMyAdmin
1. Open MySQL Workbench or phpMyAdmin
2. Connect to database: `manthmwear`
3. Open file: `FINAL_COFFEE_COLOR_QUERY.sql`
4. Execute the query

### Option 3: Direct Query
Copy and paste this into your MySQL client:

```sql
USE manthmwear;

INSERT INTO `productvariant` (`id`, `productId`, `sku`, `size`, `sizeRank`, `color`, `colorCode`, `pack`, `price`, `stock`, `isActive`, `createdAt`, `updatedAt`) VALUES
('v_p1_cf_s', 'prod_trunk_core_pack_1', 'TC-P1-CF-S', 'S', 1, 'Coffee', '#6F4E37', 1, 33500, 100, 1, NOW(), NOW()),
('v_p1_cf_m', 'prod_trunk_core_pack_1', 'TC-P1-CF-M', 'M', 2, 'Coffee', '#6F4E37', 1, 33500, 100, 1, NOW(), NOW()),
('v_p1_cf_l', 'prod_trunk_core_pack_1', 'TC-P1-CF-L', 'L', 3, 'Coffee', '#6F4E37', 1, 33500, 100, 1, NOW(), NOW()),
('v_p1_cf_xl', 'prod_trunk_core_pack_1', 'TC-P1-CF-XL', 'XL', 4, 'Coffee', '#6F4E37', 1, 33500, 100, 1, NOW(), NOW());
```

## Verify Installation

After running the query, verify with:

```sql
SELECT id, sku, size, color, colorCode, price, stock 
FROM productvariant 
WHERE color = 'Coffee';
```

You should see 4 rows (S, M, L, XL).

## What Happens Next

1. ✅ Coffee color will appear in all color selectors
2. ✅ Works with Pack of 1, 2, and 3
3. ✅ Shows brown color dot (#6F4E37)
4. ✅ Stock filtering applies (only shows when stock > 0)
5. ✅ Available immediately after query execution

## Troubleshooting

**Error: Duplicate entry**
- Coffee color already exists in database
- Check with: `SELECT * FROM productvariant WHERE color = 'Coffee';`

**Coffee not showing on website**
- Clear browser cache
- Restart Next.js dev server: `npm run dev`
- Check stock is > 0

**Wrong color displaying**
- Verify colorCode is '#6F4E37' in database
- Hard refresh browser (Ctrl + Shift + R)

## Database Connection Details

- **Host:** localhost
- **Port:** 3306
- **User:** manthmwearuser
- **Password:** MANTHMweardb8989
- **Database:** manthmwear

## Summary of Changes

### Database Changes:
- ✅ Added 4 Coffee color variants (S, M, L, XL)
- ✅ SKUs: TC-P1-CF-S, TC-P1-CF-M, TC-P1-CF-L, TC-P1-CF-XL
- ✅ Price: ₹335.00 per unit
- ✅ Initial stock: 100 units per size

### Code Changes (Already Applied):
- ✅ Coffee color mapping in all components
- ✅ Phone number updated to +91 73039 31002
- ✅ Stock filtering for out-of-stock colors

All code changes are complete. Just run the SQL query to activate Coffee color!
