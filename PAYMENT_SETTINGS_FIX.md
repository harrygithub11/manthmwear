# Payment Settings Page - Login Redirect Fix

## Issue
When clicking on "Payment Settings" in the admin dashboard, it was redirecting to the login page every time.

## Root Cause
The `/api/admin/settings` endpoint was using a different token verification method than other admin APIs:
- Other admin APIs check if token starts with `'YWRtaW4'` (base64 for "admin")
- Settings API was checking for `process.env.ADMIN_TOKEN` which doesn't match the login token

## Fix Applied
Updated the `verifyAdminToken` function in `/app/api/admin/settings/route.ts` to match the verification method used by other admin APIs.

### Before:
```typescript
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  const token = authHeader.substring(7)
  const validToken = process.env.ADMIN_TOKEN || 'admin-secret-token'
  return token === validToken
}
```

### After:
```typescript
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token.startsWith('YWRtaW4')
}
```

## Deployment Steps

1. **Run the SQL migration first** (if not already done):
```bash
cd /home/manthmwear/htdocs/manthmwear.com
mysql -u your_db_user -p manthmwear < add_payment_method_controls.sql
```

2. **Upload the updated files**:
   - `app/api/admin/settings/route.ts`
   - `app/admin/settings/page.tsx`

3. **Regenerate Prisma and rebuild**:
```bash
cd /home/manthmwear/htdocs/manthmwear.com
npx prisma generate
npm run build
pm2 restart manthmwear
```

## Testing
1. Login to admin dashboard
2. Click on "Payment Settings" in the sidebar
3. Page should load without redirecting to login
4. Toggle payment methods and save settings
5. Verify changes persist after page refresh

## Files Modified
- `app/api/admin/settings/route.ts` - Fixed token verification
- `app/admin/settings/page.tsx` - Added debug logging

## Note
The TypeScript errors in the API route will disappear once the database migration is run and Prisma client is regenerated with the new schema fields (`codEnabled` and `onlinePaymentEnabled`).
