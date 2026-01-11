# Pack Color Selection Feature

## Overview
Users can now select individual colors for Pack of 2 and Pack of 3 products, allowing complete customization of their pack combinations.

## How It Works

### Pack of 1
- User selects a single color
- Standard behavior (no changes)

### Pack of 2
- User must select 2 colors
- Can choose same color twice (e.g., Black + Black)
- Can choose different colors (e.g., Black + White)
- Each item in the pack is individually selectable

### Pack of 3
- User must select 3 colors
- Can choose any combination (e.g., Black + Black + Black, or Black + White + Grey)
- Each item in the pack is individually selectable

## User Interface

### Selection Flow
1. User selects size (S, M, L, XL)
2. User selects pack size (1, 2, or 3)
3. Based on pack size:
   - **Pack of 1**: Single color selector appears
   - **Pack of 2**: Two separate color selectors appear (Item 1, Item 2)
   - **Pack of 3**: Three separate color selectors appear (Item 1, Item 2, Item 3)
4. User sees summary of their selection with all chosen colors
5. Add to cart with custom color combination

### Display
- Cart page shows selected colors for multi-packs
- Format: "Colors: black, white, grey" (for pack of 3)
- Single packs show: "Color: black"

## Technical Implementation

### Files Modified
1. `components/common/QuickBuyModal.tsx`
   - Added `packColors` state to track selected colors
   - Added `handlePackChange` to reset colors when pack changes
   - Added `updatePackColor` to update individual color selections
   - Updated UI to show color selectors based on pack size
   - Updated cart addition to include packColors

2. `lib/guest-cart.ts`
   - Added `packColors?: string[]` to `GuestCartItem` interface
   - Stores array of selected colors for multi-packs

3. `app/cart/page.tsx`
   - Updated display to show pack colors
   - Shows "Colors: color1, color2, color3" for multi-packs
   - Shows "Color: color" for single packs

## Data Structure

### Cart Item with Pack Colors
```typescript
{
  productId: "trunk-core",
  variantId: "variant-id",
  quantity: 1,
  pack: 3,
  size: "M",
  color: "black", // Base color (for variant lookup)
  price: 694,
  packColors: ["black", "white", "grey"] // User's custom selection
}
```

## Benefits
- Complete customization freedom
- No predefined combos needed
- Users can buy multiple of same color in a pack
- Flexible for different preferences
- Clear visual feedback during selection

## Future Enhancements
- Visual color swatches with actual color codes
- Save favorite combinations
- Suggest popular combinations
- Show pack preview with selected colors
