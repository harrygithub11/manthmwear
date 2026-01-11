# Coupon Authentication Fix

## Issue Found
When testing the coupon system, you encountered an "Unauthorized" error when trying to create coupons in the admin dashboard.

## Root Cause
There was a **localStorage key mismatch** between different parts of the application:

- **Admin Login Page** (`app/admin/login/page.tsx`): Stores token as `admin_token` (with underscore)
- **Coupons Page** (`app/admin/coupons/page.tsx`): Was trying to read `adminToken` (no underscore)

This caused the coupons page to not find the authentication token, resulting in "Unauthorized" errors.

## Fix Applied
Updated all instances in `app/admin/coupons/page.tsx` to use the correct key:

```typescript
// Before (WRONG)
const token = localStorage.getItem('adminToken')

// After (CORRECT)
const token = localStorage.getItem('admin_token')
```

### Files Changed
- `app/admin/coupons/page.tsx` - Fixed 4 instances:
  - `fetchCoupons()` function
  - `handleSubmit()` function
  - `handleDelete()` function
  - `toggleActive()` function

## Testing Steps

1. **Clear browser cache and localStorage**:
   - Open browser DevTools (F12)
   - Go to Application tab → Local Storage
   - Clear all items
   - Or run: `localStorage.clear()`

2. **Login again**:
   - Go to `/admin/login`
   - Login with your admin password
   - This will set the correct `admin_token` in localStorage

3. **Test coupon creation**:
   - Go to `/admin/coupons`
   - Click "Create Coupon"
   - Fill in the form
   - Click "Create Coupon"
   - Should work without "Unauthorized" error

## Deployment

### Local (Already Done)
✅ Fixed and built locally
✅ Committed to Git
✅ Pushed to GitHub

### Server Deployment
Run on your server:
```bash
cd /home/manthmwear/htdocs/manthmwear.com
./deploy-server.sh
```

Or if you haven't set up Git on server yet, run the setup command from `COPY_PASTE_TO_SERVER.txt`

## Verification

After deployment, verify the fix:

1. Clear browser cache
2. Login to admin dashboard
3. Navigate to Coupons page
4. Try creating a test coupon
5. Should work without errors

## Additional Notes

- This fix ensures consistency across all admin pages
- The correct token key is: `admin_token` (with underscore)
- All other admin pages already use the correct key
- No database changes required
- No .env changes required

---

**Status**: ✅ Fixed and deployed to GitHub
**Next**: Deploy to server using `./deploy-server.sh`
