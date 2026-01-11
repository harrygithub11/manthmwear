# Pack 2 & 3 Individual Color Variants

## What This Does

Creates individual color variants for Pack 2 and Pack 3, matching all the colors available in Pack 1.

## Before
- Pack 1: Black, Royal Blue, Dark Green, Maroon, Grey, Coffee (6 colors × 4 sizes = 24 variants)
- Pack 2: Custom Pack only (4 variants)
- Pack 3: Custom Pack only (4 variants)

## After
- Pack 1: Black, Royal Blue, Dark Green, Maroon, Grey, Coffee (24 variants)
- Pack 2: Black, Royal Blue, Dark Green, Maroon, Grey, Coffee (24 variants)
- Pack 3: Black, Royal Blue, Dark Green, Maroon, Grey, Coffee (24 variants)

**Total: 72 variants** (24 per pack size)

## How It Works

The script:
1. Reads all Pack 1 variants (excluding Custom Pack)
2. Deletes existing "Custom Pack" variants for Pack 2/3
3. Creates Pack 2 variants with:
   - Same colors as Pack 1
   - Same color codes
   - Same color ranks
   - Same size ranks
   - Price: ₹546
   - Shared stock system (baseStock ÷ 2)
4. Creates Pack 3 variants with:
   - Same colors as Pack 1
   - Same color codes
   - Same color ranks
   - Same size ranks
   - Price: ₹799
   - Shared stock system (baseStock ÷ 3)

## SKU Format

- Pack 1: `TC-P1-{SIZE}-{COLOR}` (e.g., TC-P1-M-BLK)
- Pack 2: `TC-P2-{SIZE}-{COLOR}` (e.g., TC-P2-M-BLK)
- Pack 3: `TC-P3-{SIZE}-{COLOR}` (e.g., TC-P3-M-BLK)

## Shared Stock Example

If baseStock = 300 for Black/Medium:
- Pack 1 (Black, M): 300 packs available
- Pack 2 (Black, M): 150 packs available (300 ÷ 2)
- Pack 3 (Black, M): 100 packs available (300 ÷ 3)

When someone buys 1 Pack of 2:
- baseStock becomes 298 (300 - 2)
- Pack 1: 298 packs
- Pack 2: 149 packs
- Pack 3: 99 packs

## Run the Script

```bash
RUN_CREATE_PACK23_COLORS.bat
```

## Verify

After running, check in admin panel:
- Each product should have 72 variants total
- Pack 2 should show all 6 colors for each size
- Pack 3 should show all 6 colors for each size
- All should have proper colorCode (not #CCCCCC)
- All should have proper colorRank and sizeRank

## Deploy

```bash
npm run build
pm2 restart manthmwear
```

✅ Pack 2 and 3 will now have the same color options as Pack 1!
