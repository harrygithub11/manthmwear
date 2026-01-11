# GlobalProduct Component - Deployment

## ✅ What Was Done

Created a unified `GlobalProduct` component that both home and shop pages use.

### Files Created:
- ✅ `components/GlobalProduct.tsx` - The shared product display component (768 lines)

### Files Modified:
- ✅ `app/shop/page.tsx` - Now imports GlobalProduct
- ✅ `app/page.tsx` - Now imports GlobalProduct

## Result

Both pages now use the EXACT SAME component:
- Same product grid
- Same filters
- Same hero banner
- Same color ordering
- Same Quick Buy
- Same everything

## Deploy Command

```bash
cd /home/manthmwear/htdocs/manthmwear.com && npm run build && pm2 restart manthmwear && echo "✅ GlobalProduct deployed!"
```

## What You'll See

### Shop Page (`/shop`):
- Hero banner: "Shop"
- Filters (category, pack size)
- All products
- Quick Buy

### Home Page (`/`):
- Hero component (from home)
- **Shop section** (hero banner: "Shop", filters, all products)
- Key Features
- Fabric Tech
- Fit Preview
- Brand Story
- Email Capture

## Benefits

✅ Single source of truth
✅ Fix once, applies everywhere
✅ Consistent behavior
✅ Easier maintenance
✅ No duplicate code

## Testing

After deployment:
1. Go to `/shop` - should work exactly as before
2. Go to `/` - should show shop products section
3. Test Quick Buy on both pages
4. Test color selection
5. Test filters

## Rollback

If issues occur:
```bash
git checkout app/shop/page.tsx app/page.tsx
rm components/GlobalProduct.tsx
npm run build
pm2 restart manthmwear
```

---

**Status:** ✅ Ready to deploy
