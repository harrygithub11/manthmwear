# Three Separate Products Guide

## Overview
This approach creates 3 distinct products instead of 1 product with multiple pack variants.

## Products Created

### 1. Trunk Core - Pack of 1
- **ID**: `prod_trunk_core_pack_1`
- **Slug**: `trunk-core-pack-of-1`
- **Price**: ₹335
- **Variants**: 20 (5 colors × 4 sizes)
- **Colors**: Black, Royal Blue, Dark Green, Maroon, Grey
- **Sizes**: S, M, L, XL
- **Image**: `/Packs/Packof1.jpg`

### 2. Trunk Core - Pack of 2
- **ID**: `prod_trunk_core_pack_2`
- **Slug**: `trunk-core-pack-of-2`
- **Price**: ₹546
- **Variants**: 4 (4 sizes with custom color selection)
- **Sizes**: S, M, L, XL
- **Image**: `/Packs/Packof2.jpg`
- **Feature**: Users select 2 colors

### 3. Trunk Core - Pack of 3
- **ID**: `prod_trunk_core_pack_3`
- **Slug**: `trunk-core-pack-of-3`
- **Price**: ₹694
- **Variants**: 4 (4 sizes with custom color selection)
- **Sizes**: S, M, L, XL
- **Image**: `/Packs/Packof3.jpg`
- **Feature**: Users select 3 colors

## Installation

```bash
mysql -u root -p manthmwear < create_three_separate_pack_products.sql
```

## Verification

After running the script:

```sql
-- Check products
SELECT id, name, slug FROM product WHERE id LIKE 'prod_trunk_core_pack_%';

-- Check variant counts
SELECT 
    p.name,
    COUNT(pv.id) as variants
FROM product p
LEFT JOIN productvariant pv ON p.id = pv.productId
WHERE p.id LIKE 'prod_trunk_core_pack_%'
GROUP BY p.id, p.name;
```

Expected output:
```
Trunk Core - Pack of 1: 20 variants
Trunk Core - Pack of 2: 4 variants
Trunk Core - Pack of 3: 4 variants
```

## Benefits of This Approach

### 1. Clear Product Separation
- Each pack size is a distinct product
- Easier to manage inventory per pack
- Clearer analytics and reporting

### 2. Better SEO
- Separate URLs for each pack size
- Better targeting for search engines
- Individual product pages

### 3. Simpler Pricing Display
- Each product has a single price
- No price ranges to confuse customers
- Clearer value proposition

### 4. Easier Marketing
- Can promote specific packs individually
- Different images for each pack
- Targeted descriptions per pack size

### 5. Better User Experience
- Users see 3 products in shop
- Clear choice between pack sizes
- No confusion about pricing

## Shop Page Display

Users will see 3 products:

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Pack of 1          │  │  Pack of 2          │  │  Pack of 3          │
│  [Image]            │  │  [Image]            │  │  [Image]            │
│  ₹335               │  │  ₹546               │  │  ₹694               │
│  [Add to Cart]      │  │  [Add to Cart]      │  │  [Add to Cart]      │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

## Color Selection Flow

### Pack of 1
1. User clicks "Add to Cart"
2. Modal opens
3. Select size (S, M, L, XL)
4. Select color (Black, Royal Blue, Dark Green, Maroon, Grey)
5. Add to cart

### Pack of 2
1. User clicks "Add to Cart"
2. Modal opens
3. Select size (S, M, L, XL)
4. Select color for Item 1
5. Select color for Item 2
6. Add to cart

### Pack of 3
1. User clicks "Add to Cart"
2. Modal opens
3. Select size (S, M, L, XL)
4. Select color for Item 1
5. Select color for Item 2
6. Select color for Item 3
7. Add to cart

## Database Structure

```
product
├── prod_trunk_core_pack_1 (Pack of 1)
│   └── 20 variants (5 colors × 4 sizes)
├── prod_trunk_core_pack_2 (Pack of 2)
│   └── 4 variants (4 sizes, custom colors)
└── prod_trunk_core_pack_3 (Pack of 3)
    └── 4 variants (4 sizes, custom colors)
```

## Comparison: Single vs Multiple Products

### Single Product Approach
- 1 product with 28 variants
- Pack selection in modal
- Single product page
- Price range display (₹335 - ₹694)

### Multiple Products Approach (This One)
- 3 products with 28 total variants
- Each product has its own page
- Clear pricing per product
- Better for SEO and marketing

## Migration from Single Product

If you have the old single product, you can:

1. **Keep both**: Old product + 3 new products
2. **Replace**: Delete old product, use 3 new ones
3. **Redirect**: Set up redirects from old to new

To delete the old product:
```sql
DELETE FROM productvariant WHERE productId = 'prod_trunk_core';
DELETE FROM product WHERE id = 'prod_trunk_core';
```

## Notes

- All products use the same fabric and technology
- Stock is managed separately per product
- Each product can have different images
- Descriptions highlight the pack-specific benefits
- Custom color selection works the same way

## Testing Checklist

- [ ] All 3 products appear in shop page
- [ ] Pack of 1 shows 5 color options
- [ ] Pack of 2 shows 2 color selectors
- [ ] Pack of 3 shows 3 color selectors
- [ ] Prices are correct (₹335, ₹546, ₹694)
- [ ] Images display correctly
- [ ] Add to cart works for all products
- [ ] Cart shows selected colors correctly
- [ ] Checkout process works

## Done! 🎉

You now have 3 separate products for each pack size with full custom color selection support!
