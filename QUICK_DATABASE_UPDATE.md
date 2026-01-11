# Quick Database Update for Custom Pack Colors

## What This Does
Removes unnecessary color variants for Pack of 2 and Pack of 3, since users now select their own colors.

## Quick Start (3 Steps)

### 1. Backup
```bash
mysqldump -u root -p manthmwear > backup_$(date +%Y%m%d).sql
```

### 2. Run SQL
```bash
mysql -u root -p manthmwear < clean_pack_variants_simple.sql
```

### 3. Verify
```sql
SELECT pack, COUNT(*) FROM productvariant 
WHERE productId = 'prod_trunk_core' 
GROUP BY pack;
```

**Expected Result:**
```
pack | COUNT(*)
-----|----------
  1  |    20
  2  |     4
  3  |     4
```

## Before vs After

### BEFORE (60 variants)
```
Pack 1: Black, Royal Blue, Dark Green, Maroon, Grey (20 variants)
Pack 2: Black, Royal Blue, Dark Green, Maroon, Grey (20 variants)
Pack 3: Black, Royal Blue, Dark Green, Maroon, Grey (20 variants)
```

### AFTER (28 variants)
```
Pack 1: Black, Royal Blue, Dark Green, Maroon, Grey (20 variants) ✅
Pack 2: Black only (4 variants) - Users select 2 colors ✅
Pack 3: Black only (4 variants) - Users select 3 colors ✅
```

## What Users See

### Pack of 1
- Select 1 color from dropdown
- Works exactly as before

### Pack of 2
```
Item 1: [Black] [Royal Blue] [Dark Green] [Maroon] [Grey]
Item 2: [Black] [Royal Blue] [Dark Green] [Maroon] [Grey]
```
User can choose: Black + Black, Black + White, etc.

### Pack of 3
```
Item 1: [Black] [Royal Blue] [Dark Green] [Maroon] [Grey]
Item 2: [Black] [Royal Blue] [Dark Green] [Maroon] [Grey]
Item 3: [Black] [Royal Blue] [Dark Green] [Maroon] [Grey]
```
User can choose any combination!

## Rollback (If Needed)
```sql
DELETE FROM productvariant WHERE productId = 'prod_trunk_core';
INSERT INTO productvariant SELECT * FROM productvariant_backup_20251127;
```

## Done! 🎉
Your database is now optimized for custom color selection.
