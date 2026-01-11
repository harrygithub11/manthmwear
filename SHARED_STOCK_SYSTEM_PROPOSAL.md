# Shared Stock System - Proposal

## Current System

Each variant has **independent stock**:
- Pack of 1 Black-S: 296 stock
- Pack of 2 Black-S: 380 stock  
- Pack of 3 Black-S: 376 stock

**Problem:** These are treated as separate products with separate inventory.

## Desired System

**Single stock pool** shared across all pack sizes:
- Base stock: 1000 Black-S trunks
- Pack of 1: Shows 1000 available
- Pack of 2: Shows 500 available (1000 ÷ 2)
- Pack of 3: Shows 333 available (1000 ÷ 3)

When customer buys Pack of 2:
- Deduct 2 from base stock
- New base: 998
- Pack of 1: 998 available
- Pack of 2: 499 available
- Pack of 3: 332 available

## Implementation Required

### 1. Database Changes
```sql
-- Add base stock tracking
ALTER TABLE productvariant ADD COLUMN baseStock INT DEFAULT 0;
ALTER TABLE productvariant ADD COLUMN useSharedStock BOOLEAN DEFAULT false;

-- For shared stock variants, stock = baseStock ÷ pack
```

### 2. API Changes
- Calculate available packs dynamically
- Return `availablePacks = Math.floor(baseStock / packSize)`

### 3. Order Processing
- When order placed, deduct `quantity × packSize` from baseStock
- Update all pack variants to reflect new availability

### 4. Admin Interface
- Show base stock instead of per-pack stock
- Update base stock, auto-calculate pack availability

## Complexity

This is a **major feature** requiring:
- ⚠️ Database schema changes
- ⚠️ API logic updates
- ⚠️ Order processing changes
- ⚠️ Admin interface updates
- ⚠️ Stock synchronization
- ⚠️ Migration of existing data

**Estimated effort:** 4-6 hours of development + testing

## Alternative: Manual Stock Management

**Simpler approach:**
1. Keep current system (separate stock per pack)
2. Manually update stock for all packs when inventory changes
3. Use admin interface to update all variants at once

**Pros:**
- No code changes needed
- Works with current system
- Immediate solution

**Cons:**
- Manual work required
- Risk of inconsistency
- No automatic synchronization

## Recommendation

For now, use **manual stock management**:
1. When you receive 1000 Black-S trunks
2. Update stock in admin:
   - Pack of 1: 1000
   - Pack of 2: 500
   - Pack of 3: 333

Later, we can implement **shared stock system** as a proper feature with:
- Automatic calculation
- Order synchronization
- Stock tracking

## Quick Fix: Sync Stock Script

I can create a SQL script to sync stock across packs based on a base value.

Would you like:
1. **Quick fix** - SQL script to manually sync stock
2. **Full feature** - Implement shared stock system (requires more time)
