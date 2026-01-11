# Product & Variant Deletion Behavior Guide

## Overview
The admin system now supports both **Safe Deletion** and **Force Deletion** modes to give you control over how items are removed from the system.

## Safe Deletion (Default)
- **Products**: Deactivated if they have existing orders, permanently deleted if no orders exist
- **Variants**: Deactivated if they have existing orders, permanently deleted if no orders exist
- **Data Integrity**: Preserves order history and prevents broken references
- **Recommended**: For production environments

## Force Deletion (Advanced)
- **Products**: Permanently deleted regardless of order history
- **Variants**: Permanently deleted regardless of order history
- **Order Items**: Related order items are also deleted to maintain database consistency
- **Warning**: This action cannot be undone and may affect order history
- **Use Case**: For cleaning up test data or when you need complete removal

## How to Use

### In Product Edit Modal
1. Open any existing product for editing
2. Scroll to the bottom to find "Deletion Settings"
3. Check "Force Delete Mode" to enable permanent deletion
4. When you remove variants or save changes, they will be permanently deleted instead of deactivated

### In Products List
1. **Safe Delete**: Click the trash icon normally
2. **Force Delete**: 
   - Hold Shift and click the trash icon, OR
   - Hover over trash icon and select "⚠️ Force Delete" from dropdown

## Visual Indicators
- 🗑️ Regular trash icon = Safe deletion
- ⚠️ Warning symbol = Force deletion
- Red background in settings = Danger zone

## Best Practices
1. **Use Safe Deletion** for live products with customer orders
2. **Use Force Deletion** only for:
   - Test products and variants
   - Duplicate entries
   - Data cleanup operations
3. **Always backup** your database before force deleting important data
4. **Double-check** the confirmation dialogs - they clearly indicate the deletion type

## Technical Details
- Safe deletion sets `isActive: false` on products/variants
- Force deletion removes records from database tables
- Force deletion on products also removes related order items to prevent foreign key constraints
- The system checks for existing orders before allowing safe deletion vs deactivation

## Confirmation Messages
- **Safe Delete**: "Are you sure you want to delete [name]? (It will be deactivated if it has orders)"
- **Force Delete**: "⚠️ FORCE DELETE: This will permanently delete [name] and ALL its data, even if referenced in orders. This action CANNOT be undone. Are you absolutely sure?"