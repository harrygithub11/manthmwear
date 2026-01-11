# Pack 2/3 Real Colors - Deployment Checklist

## Pre-Deployment

### 1. Test First (READ-ONLY)
```bash
run_test_pack23.bat
```
This shows what will be created WITHOUT making changes.

**Verify:**
- [ ] Pack 1 has 6 colors (Black, Royal Blue, Dark Green, Maroon, Grey, Coffee)
- [ ] Each color has 4 sizes (S, M, L, XL)
- [ ] Pack 1 total: 24 variants
- [ ] Preview shows correct SKUs, prices, and stock

### 2. Backup Database
```bash
mysqldump -u root -p manthmwear > backup_before_pack23_$(date +%Y%m%d).sql
```
**CRITICAL:** Don't skip this step!

### 3. Check Current Orders
Verify no pending orders with Pack 2/3:
```sql
SELECT o.id, o.orderNumber, o.status, oi.variantId, pv.pack, pv.color
FROM `order` o
JOIN orderitem oi ON o.id = oi.orderId
JOIN productvariant pv ON oi.variantId = pv.id
WHERE pv.pack IN (2, 3)
AND o.status NOT IN ('DELIVERED', 'CANCELLED')
ORDER BY o.createdAt DESC;
```

## Deployment Steps

### Step 1: Create Color Variants
```bash
run_create_pack23_colors.bat
```

**What it does:**
- Deactivates old "Custom Pack" variants (keeps them for order history)
- Creates 24 new Pack 2 variants (6 colors × 4 sizes)
- Creates 24 new Pack 3 variants (6 colors × 4 sizes)
- Sets up shared stock
- Calculates prices

**Expected output:**
```
Pack 1: 24 variants (6 colors)
Pack 2: 28 variants (24 new + 4 old deactivated)
Pack 3: 28 variants (24 new + 4 old deactivated)
```

### Step 2: Verify Database
```sql
-- Check variant counts
SELECT 
    pack,
    color,
    isActive,
    COUNT(*) as count
FROM productvariant
WHERE productId = (SELECT id FROM product WHERE slug = 'trunk-core')
GROUP BY pack, color, isActive
ORDER BY pack, isActive DESC, color;

-- Check a sample variant
SELECT * FROM productvariant 
WHERE pack = 2 AND color = 'Black' AND size = 'M'
LIMIT 1;
```

**Verify:**
- [ ] Pack 2 has 24 active variants with real colors
- [ ] Pack 3 has 24 active variants with real colors
- [ ] Old "Custom Pack" variants are inactive (isActive = 0)
- [ ] All fields populated: sizeRank, colorCode, colorRank, baseStock, useSharedStock

### Step 3: Build Application
```bash
npm run build
```

**Check for errors:**
- [ ] No TypeScript errors
- [ ] No build failures
- [ ] Build completes successfully

### Step 4: Restart Server
```bash
pm2 restart manthmwear
```

**Verify:**
- [ ] Server restarts without errors
- [ ] Check logs: `pm2 logs manthmwear --lines 50`

## Post-Deployment Testing

### Frontend Tests

#### 1. Shop Page
- [ ] Visit `/shop`
- [ ] Pack 2 products show color selector (not "Custom Pack")
- [ ] Pack 3 products show color selector
- [ ] Can switch between colors
- [ ] Images update when changing colors
- [ ] Stock displays correctly

#### 2. Home Page
- [ ] Visit `/`
- [ ] Product section shows Pack 2/3 with colors
- [ ] Color switching works

#### 3. Product Detail Page
- [ ] Visit a product page
- [ ] Select Pack 2 from pack selector
- [ ] Color selector appears with 6 colors
- [ ] Can select different colors
- [ ] Stock updates based on selected color
- [ ] Price displays correctly

#### 4. Quick Buy Modal
- [ ] Click "Quick Buy" on Pack 2 product
- [ ] Modal shows selected color
- [ ] Can change color in modal
- [ ] Can change size
- [ ] Stock updates correctly
- [ ] Add to cart works

#### 5. Cart & Checkout
- [ ] Add Pack 2/3 items to cart
- [ ] Cart shows correct color
- [ ] Proceed to checkout
- [ ] Complete order
- [ ] Verify order in admin

### Admin Panel Tests

#### 1. Product List
- [ ] Visit `/admin/products`
- [ ] Trunk Core shows correct variant count
- [ ] Edit product

#### 2. Product Edit
- [ ] See all Pack 2/3 color variants
- [ ] Each variant shows:
  - [ ] Size (S, M, L, XL)
  - [ ] Color (Black, Royal Blue, etc.)
  - [ ] Color code (hex value)
  - [ ] Pack (2 or 3)
  - [ ] Price
  - [ ] Stock with 🔗 icon (shared stock)
  - [ ] Base stock calculation

#### 3. Stock Update
- [ ] Change stock on Pack 2 Black M
- [ ] Save product
- [ ] Verify all Pack 2/3 Black M variants updated
- [ ] Check frontend shows new stock

### API Tests

#### 1. Products API
```bash
curl http://localhost:3000/api/products
```
- [ ] Returns Pack 2/3 with real colors
- [ ] Each variant has colorCode, colorRank, sizeRank
- [ ] Stock calculated correctly

#### 2. Admin Products API
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/admin/products
```
- [ ] Returns all variants including inactive ones
- [ ] Shows baseStock and useSharedStock fields

## Rollback Procedure

If something goes wrong:

### Option 1: Deactivate New Variants
```sql
-- Deactivate new color variants
UPDATE productvariant 
SET isActive = 0
WHERE pack IN (2, 3) 
AND color != 'Custom Pack'
AND productId = (SELECT id FROM product WHERE slug = 'trunk-core');

-- Reactivate old Custom Pack variants
UPDATE productvariant 
SET isActive = 1
WHERE pack IN (2, 3) 
AND color = 'Custom Pack'
AND productId = (SELECT id FROM product WHERE slug = 'trunk-core');
```

### Option 2: Full Database Restore
```bash
mysql -u root -p manthmwear < backup_before_pack23_YYYYMMDD.sql
```

Then rebuild and restart:
```bash
npm run build
pm2 restart manthmwear
```

## Success Criteria

✅ All tests pass
✅ No errors in logs
✅ Pack 2/3 show real colors on frontend
✅ Stock management works
✅ Orders can be placed
✅ Admin panel shows all variants

## Support

If issues occur:
1. Check `pm2 logs manthmwear`
2. Check browser console for errors
3. Verify database with test queries
4. Review `PACK23_REAL_COLORS_GUIDE.md`
5. Rollback if needed

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Status:** ⬜ Success ⬜ Rolled Back
**Notes:** _____________
