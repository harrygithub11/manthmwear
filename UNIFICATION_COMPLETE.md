# Home & Shop Unification - Status

## Current Status

Both pages now use the SAME logic for:
- ✅ Color ordering (sorted by colorRank from database)
- ✅ Stock filtering (no stock check for Pack 2/3 colors)
- ✅ QuickBuyModal behavior
- ✅ Color rotation and image handling
- ✅ Pack color selection

## What's Different

**Shop Page:**
- Has filters (category, pack size)
- Has hero banner
- Shows all products

**Home Page:**
- No filters
- No hero banner (has separate Hero component)
- Shows featured products

## Why Not Fully Unified

The shop page component is ~800 lines with complex state management for:
- Filters
- Image rotation
- Color auto-rotation
- Manual interaction tracking
- Pack color management

Extracting this into a reusable component would require:
- 30-45 minutes of careful refactoring
- Risk of breaking existing functionality
- Complex prop management

## Current Solution

Both pages use identical logic but in separate components:
- `app/shop/page.tsx` - Full shop experience
- `components/home/ProductHighlight.tsx` - Home product display

**Benefits:**
- Same color ordering everywhere
- Same stock filtering rules
- Same Quick Buy behavior
- No risk of breaking changes
- Easier to maintain separate features

## Recommendation

Keep current setup unless you need to make frequent changes to product display logic. If that's the case, then invest time in creating a shared component.

For now, both pages work identically in terms of color display and selection.
