# Show All Colors in Pack 2 & 3

## Change Made

**Before:** Pack 2 and Pack 3 only showed colors with stock > 0
**After:** Pack 2 and Pack 3 show ALL colors (even if Pack 1 has 0 stock)

## Why?

- Pack 2 and Pack 3 are custom packs where customers choose colors
- Even if Royal Blue has 0 stock in Pack 1, customers can still select it for Pack 2/3
- Only Pack 1 should be restricted by stock (since it's a single color purchase)

## Files Modified

1. ✅ `app/shop/page.tsx` - Removed stock check
2. ✅ `components/pdp/ProductDetailClient.tsx` - Removed stock check
3. ✅ `components/common/QuickBuyModal.tsx` - Removed stock check
4. ✅ `components/home/ProductHighlight.tsx` - Removed stock check

## What Changed

### Before (Stock Filtering):
```typescript
if (v.pack === 1 && v.color && v.color !== 'Custom Pack' && v.isActive && v.stock > 0) {
  allColors.add(v.color)
}
```

### After (No Stock Filtering for Pack 2/3):
```typescript
if (v.pack === 1 && v.color && v.color !== 'Custom Pack' && v.isActive) {
  allColors.add(v.color)
}
```

## Result

Now all 6 colors will appear in Pack 2 and Pack 3:
1. Black
2. Royal Blue ← Now shows even with 0 stock
3. Dark Green
4. Maroon
5. Grey
6. Coffee

## Deploy Command

```bash
cd /home/manthmwear/htdocs/manthmwear.com && npm run build && pm2 restart manthmwear && echo "✅ Done! Clear browser cache."
```

## Note

- Pack 1 still respects stock (if 0 stock, won't show)
- Pack 2/3 show all colors for customer selection
- When customer tries to buy, stock validation happens at checkout
- This gives customers full color choice for custom packs

---

**Status:** ✅ Ready to deploy
