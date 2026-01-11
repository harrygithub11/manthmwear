# Create GlobalProduct Component - Step by Step Guide

## Goal
Extract the shop page (768 lines) into a reusable `GlobalProduct` component.

## Step 1: Copy Shop Page Content

1. Open `app/shop/page.tsx`
2. Copy the ENTIRE content (all 768 lines)
3. Create new file: `components/GlobalProduct.tsx`
4. Paste the content

## Step 2: Rename Export

In `components/GlobalProduct.tsx`:

**Change:**
```typescript
export default function ShopPage() {
```

**To:**
```typescript
export default function GlobalProduct() {
```

## Step 3: Update Shop Page

Replace `app/shop/page.tsx` with:

```typescript
import GlobalProduct from '@/components/GlobalProduct'

export default function ShopPage() {
  return <GlobalProduct />
}
```

## Step 4: Update Home Page

Replace `app/page.tsx` with:

```typescript
import Hero from '@/components/home/Hero'
import GlobalProduct from '@/components/GlobalProduct'
import KeyFeatures from '@/components/home/KeyFeatures'
import FabricTech from '@/components/home/FabricTech'
import FitPreview from '@/components/home/FitPreview'
import BrandStory from '@/components/home/BrandStory'
import EmailCapture from '@/components/home/EmailCapture'

export default function Home() {
  return (
    <>
      <Hero />
      <GlobalProduct />
      <KeyFeatures />
      <FabricTech />
      <FitPreview />
      <BrandStory />
      <EmailCapture />
    </>
  )
}
```

## Step 5: Test

```bash
npm run build
```

If successful:
```bash
pm2 restart manthmwear
```

## Step 6: Verify

1. Check `/shop` page - should work exactly as before
2. Check `/` (home) page - should show shop products
3. Test Quick Buy
4. Test color selection
5. Test filters

## Result

- ✅ Single `GlobalProduct` component
- ✅ Used by both shop and home pages
- ✅ Same behavior everywhere
- ✅ Easy to maintain

## Files Created/Modified

- **Created:** `components/GlobalProduct.tsx` (768 lines)
- **Modified:** `app/shop/page.tsx` (3 lines)
- **Modified:** `app/page.tsx` (updated import)

## Rollback

If issues occur, revert:
```bash
git checkout app/shop/page.tsx app/page.tsx
```

---

**This is a simple copy-paste task that takes 5 minutes manually.**
