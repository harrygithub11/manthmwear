# Color Code & Visual Color Selector Feature

## Overview
Replace text-based color names with visual color dots/circles using hex color codes. Show corresponding product images when colors are selected.

## Database Changes

### Schema (Already Done ✅)
```prisma
model productvariant {
  colorCode String? @default("#CCCCCC")
}
```

### Migration SQL
Run `update_color_codes.sql` to populate existing color codes.

## Implementation Steps

### 1. Admin Dashboard Updates

**File: `app/admin/products/ProductModal.tsx`**

Add color code input field next to color name:
```tsx
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium mb-2">Color Name</label>
    <input
      type="text"
      value={variant.color}
      onChange={(e) => updateVariant(index, 'color', e.target.value)}
      className="w-full px-3 py-2 border rounded"
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-2">Color Code</label>
    <div className="flex gap-2">
      <input
        type="color"
        value={variant.colorCode || '#CCCCCC'}
        onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
        className="w-12 h-10 border rounded cursor-pointer"
      />
      <input
        type="text"
        value={variant.colorCode || '#CCCCCC'}
        onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
        placeholder="#000000"
        className="flex-1 px-3 py-2 border rounded font-mono"
      />
    </div>
  </div>
</div>
```

### 2. Create Color Dot Component

**File: `components/common/ColorDot.tsx`**
```tsx
'use client'

import { cn } from '@/lib/utils'

interface ColorDotProps {
  color: string
  colorCode?: string
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ColorDot({ 
  color, 
  colorCode = '#CCCCCC', 
  selected = false, 
  onClick, 
  size = 'md',
  showLabel = false 
}: ColorDotProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-full transition-all duration-200",
        sizeClasses[size],
        selected 
          ? "ring-2 ring-text-black ring-offset-2 scale-110" 
          : "ring-1 ring-gray-300 hover:ring-gray-400 hover:scale-105"
      )}
      title={color}
    >
      <div 
        className="w-full h-full rounded-full"
        style={{ backgroundColor: colorCode }}
      />
      {/* White border for light colors */}
      {colorCode.toLowerCase() === '#ffffff' && (
        <div className="absolute inset-0 rounded-full border border-gray-300" />
      )}
      {showLabel && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap capitalize">
          {color}
        </span>
      )}
    </button>
  )
}
```

### 3. Update Shop Page

**File: `app/shop/page.tsx`**

Replace color buttons with ColorDot:
```tsx
import ColorDot from '@/components/common/ColorDot'

// In the color selection section:
<div className="flex flex-wrap gap-2">
  {uniqueColors.map((color: any) => {
    const variant = product.variants.find((v: any) => v.color === color)
    return (
      <ColorDot
        key={String(color)}
        color={color}
        colorCode={variant?.colorCode}
        selected={packColors[index] === color}
        onClick={() => {
          const newColors = [...currentPackColors]
          newColors[index] = color
          setPackColors(prev => ({ ...prev, [packKey]: newColors }))
        }}
        size="md"
        showLabel
      />
    )
  })}
</div>
```

### 4. Update PDP (Product Detail Page)

**File: `components/pdp/ProductDetailClient.tsx`**

Same as shop page - replace color buttons with ColorDot component.

### 5. Update QuickBuyModal

**File: `components/common/QuickBuyModal.tsx`**

Replace color buttons with ColorDot component.

### 6. Update ProductHighlight (Home Page)

**File: `components/home/ProductHighlight.tsx`**

Replace color buttons with ColorDot component.

### 7. Image Switching Based on Color

Add logic to switch main product image when color is selected:

```tsx
// In PDP or Shop page
const [selectedColorImage, setSelectedColorImage] = useState<string | null>(null)

// When color is selected
const handleColorSelect = (color: string) => {
  setSelectedColor(color)
  
  // Find variant with this color
  const variant = product.variants.find(v => v.color === color)
  
  // If variant has specific image, switch to it
  // This requires storing color-specific images in the database
  // For now, we can use the first image
}
```

## Color Code Mapping Reference

```typescript
const COLOR_CODES = {
  'Black': '#000000',
  'Royal Blue': '#1E3A8A',
  'Dark Green': '#064E3B',
  'Maroon': '#7F1D1D',
  'Grey': '#6B7280',
  'White': '#FFFFFF',
  'Blue': '#1E40AF',
  'Green': '#16A34A',
  'Red': '#DC2626',
  'Orange': '#EA580C',
  'Yellow': '#CA8A04',
  'Purple': '#9333EA',
  'Pink': '#EC4899',
}
```

## Testing Checklist

- [ ] Run migration SQL to populate color codes
- [ ] Test admin dashboard color code input
- [ ] Test color picker in admin
- [ ] Verify color dots display on shop page
- [ ] Verify color dots display on PDP
- [ ] Verify color dots display in QuickBuyModal
- [ ] Verify color dots display on home page
- [ ] Test color selection functionality
- [ ] Test with light colors (white) - should have border
- [ ] Test with dark colors (black)
- [ ] Test mobile responsiveness

## Next Steps

1. Run the SQL migration
2. Update admin interface
3. Create ColorDot component
4. Update all frontend pages
5. Test thoroughly
6. Deploy

