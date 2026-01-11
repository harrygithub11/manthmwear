# Home & Shop Page Unification

## Goal
Use the SAME product display component on both Home and Shop pages.

## Current Status
- ❌ Home page uses `ProductHighlight` component (different logic)
- ❌ Shop page has its own product grid (inline)
- ❌ Two different implementations = inconsistent behavior

## Solution
Create a shared `ShopProducts` component that both pages use.

## Implementation Steps

### Step 1: Create ShopProducts Component
Extract the product grid logic from `app/shop/page.tsx` into `components/shop/ShopProducts.tsx`

### Step 2: Add Props
```typescript
interface ShopProductsProps {
  showFilters?: boolean  // Show filters on shop page, hide on home
  showHero?: boolean     // Show hero banner on shop page only
  maxProducts?: number   // Limit products on home page
}
```

### Step 3: Update Shop Page
```typescript
import ShopProducts from '@/components/shop/ShopProducts'

export default function ShopPage() {
  return <ShopProducts showFilters={true} showHero={true} />
}
```

### Step 4: Update Home Page
```typescript
import ShopProducts from '@/components/shop/ShopProducts'

export default function Home() {
  return (
    <>
      <Hero />
      <ShopProducts showFilters={false} maxProducts={6} />
      {/* other sections */}
    </>
  )
}
```

## Benefits
✅ Single source of truth for product display
✅ Consistent color ordering everywhere
✅ Same Quick Buy modal behavior
✅ Easier to maintain
✅ Bug fixes apply to both pages

## Current Workaround
For now, I've updated the home page to import `ShopProducts` component.
The component needs to be created by extracting logic from shop page.

## Files to Modify
1. Create: `components/shop/ShopProducts.tsx`
2. Update: `app/shop/page.tsx` - use new component
3. Update: `app/page.tsx` - already done ✅
4. Delete: `components/home/ProductHighlight.tsx` - no longer needed

## Estimated Time
This refactoring will take about 30-45 minutes to properly extract and test.

## Quick Fix (Current)
I've updated the home page import, but the `ShopProducts` component doesn't exist yet.
You can either:
1. Keep using `ProductHighlight` for now (revert my change)
2. Let me create the full `ShopProducts` component (30-45 min work)

Which would you prefer?
