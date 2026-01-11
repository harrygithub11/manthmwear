# Home & Shop Unification - Complete Refactoring Plan

## Overview
This document outlines the complete refactoring to unify home and shop page product displays.

## Current Situation
- Shop page: ~800 lines of inline code
- Home page: Uses separate ProductHighlight component
- Both have similar but duplicate logic

## Goal
Create a single `ShopProducts` component used by both pages.

## Implementation Steps

### Phase 1: Create Shared Component Structure

**File:** `components/shop/ShopProducts.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from '@/components/toast'
import QuickBuyModal from '@/components/common/QuickBuyModal'
import ColorDot from '@/components/common/ColorDot'

interface ShopProductsProps {
  showFilters?: boolean
  showHero?: boolean
  maxProducts?: number
  title?: string
  subtitle?: string
}

export default function ShopProducts({
  showFilters = true,
  showHero = true,
  maxProducts,
  title = "Shop",
  subtitle = "Premium men's underwear engineered for comfort and style"
}: ShopProductsProps) {
  // Copy ALL state management from shop page
  // Copy ALL useEffects from shop page
  // Copy ALL helper functions from shop page
  
  // Conditionally render filters based on showFilters prop
  // Conditionally render hero based on showHero prop
  // Limit products based on maxProducts prop
  
  return (
    <div className={showHero ? "min-h-screen pt-20" : ""}>
      {showHero && (
        <div className="relative bg-near-black overflow-hidden">
          {/* Hero banner code */}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {showFilters && (
          <div className="bg-white border border-gray-border p-6 mb-8">
            {/* Filters code */}
          </div>
        )}
        
        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Product cards */}
        </div>
      </div>
      
      {quickBuyModal && <QuickBuyModal {...quickBuyModal} onClose={() => setQuickBuyModal(null)} />}
    </div>
  )
}
```

### Phase 2: Update Shop Page

**File:** `app/shop/page.tsx`

```typescript
import ShopProducts from '@/components/shop/ShopProducts'

export default function ShopPage() {
  return <ShopProducts showFilters={true} showHero={true} />
}
```

### Phase 3: Update Home Page

**File:** `app/page.tsx`

```typescript
import Hero from '@/components/home/Hero'
import ShopProducts from '@/components/shop/ShopProducts'
import KeyFeatures from '@/components/home/KeyFeatures'
// ... other imports

export default function Home() {
  return (
    <>
      <Hero />
      <ShopProducts 
        showFilters={false} 
        showHero={false}
        maxProducts={6}
        title="Featured Products"
      />
      <KeyFeatures />
      {/* ... other sections */}
    </>
  )
}
```

### Phase 4: Delete Old Component

Delete: `components/home/ProductHighlight.tsx`

## Detailed Code Extraction

Due to the size and complexity, I recommend:

1. **Manual Extraction**: Copy the entire shop page component code
2. **Add Props**: Wrap conditional rendering around filters/hero
3. **Test Thoroughly**: Ensure both pages work correctly
4. **Deploy**: Build and test in production

## Estimated Time

- Code extraction: 15 minutes
- Testing: 15 minutes
- Deployment: 10 minutes
- **Total: 40 minutes**

## Risks

- Breaking existing functionality
- State management issues
- Props not passed correctly

## Testing Checklist

- [ ] Shop page displays correctly
- [ ] Shop page filters work
- [ ] Shop page Quick Buy works
- [ ] Home page displays correctly
- [ ] Home page shows limited products
- [ ] Color ordering correct on both pages
- [ ] Stock filtering works on both pages
- [ ] Image rotation works
- [ ] Color auto-rotation works

## Rollback Plan

If issues occur:
1. Revert `app/shop/page.tsx`
2. Revert `app/page.tsx`
3. Keep `ProductHighlight` component
4. Rebuild and redeploy

## Recommendation

Given the complexity and risk, I recommend:

**Option A: Keep Current Setup**
- Both pages work correctly
- Same logic, different components
- No risk of breaking changes
- Easier to maintain

**Option B: Full Refactoring**
- Single source of truth
- More maintainable long-term
- Requires careful testing
- 40 minutes of work

Which would you prefer?
