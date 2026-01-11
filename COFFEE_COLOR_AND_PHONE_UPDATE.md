# Coffee Color & Phone Number Update

## Summary
Added Coffee color support across the application and updated customer care phone number.

## Changes Made

### 1. Coffee Color Addition

Added Coffee color (`#6F4E37`) to all color mapping functions:

#### Files Updated:
- ✅ `app/shop/page.tsx`
- ✅ `components/common/QuickBuyModal.tsx`
- ✅ `components/pdp/ProductDetailClient.tsx`
- ✅ `components/home/ProductHighlight.tsx`
- ✅ `app/admin/products/ProductModal.tsx`

#### Color Code:
```typescript
'coffee': '#6F4E37'
```

This is a rich brown color that will display correctly in all color selectors throughout the site.

### 2. Phone Number Update

Updated customer care phone number in support page:

#### Old Numbers:
- +91 8882478024
- +91 92665 22527

#### New Number:
- **+91 73039 31002**

#### File Updated:
- ✅ `app/support/page.tsx`

### 3. Database Script

Created SQL script to add Coffee color variants:
- **File:** `add_coffee_color_variants.sql`
- **Variants:** S, M, L, XL
- **SKUs:** TC-P1-CF-S, TC-P1-CF-M, TC-P1-CF-L, TC-P1-CF-XL
- **Price:** ₹335.00 (33500 paise)
- **Initial Stock:** 100 units per size
- **Product:** Trunk Core Pack of 1

## How to Apply Database Changes

Run the SQL script to add Coffee color variants:

```bash
mysql -u your_username -p your_database < add_coffee_color_variants.sql
```

Or execute directly in your database management tool.

## Testing

1. **Coffee Color Display:**
   - Go to Shop page
   - Select any Pack of 1 product
   - Coffee color should appear in the color selector with brown dot
   - Click Coffee color to see it selected

2. **Phone Number:**
   - Go to Support page (`/support`)
   - Scroll to "Get in Touch" section
   - Verify phone number shows: +91 73039 31002
   - Click to test phone link works

3. **Stock Filtering:**
   - Coffee color will only appear when stock > 0
   - Set stock to 0 to hide it from selectors
   - Set stock > 0 to show it again

## Notes

- Coffee color will automatically appear in Pack of 2 and Pack of 3 custom color selections
- The color follows the same stock filtering rules as other colors
- Phone number is clickable and will open phone dialer on mobile devices
- All changes are backward compatible with existing functionality
