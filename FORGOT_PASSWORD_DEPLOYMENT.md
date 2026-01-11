# Forgot Password - Quick Deployment Guide

## What Was Implemented

Complete forgot password functionality for customer accounts with:
- Forgot password page with email input
- Reset password page with token validation
- Secure token generation (32-byte random)
- 1-hour token expiry
- Password hashing with bcrypt
- Email enumeration prevention

## Quick Deploy Commands

```bash
cd /home/manthmwear/htdocs/manthmwear.com

# 1. Run database migration
mysql -u your_db_user -p manthmwear < add_password_reset_fields.sql

# 2. Regenerate Prisma client
npx prisma generate

# 3. Build application
npm run build

# 4. Restart PM2
pm2 restart manthmwear

# 5. Check logs
pm2 logs manthmwear --lines 20
```

## Files Created

**Pages:**
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`

**API Routes:**
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/validate-reset-token/route.ts`
- `app/api/auth/reset-password/route.ts`

**Database:**
- `add_password_reset_fields.sql`
- Updated `prisma/schema.prisma`

## How It Works

1. **User requests reset:** Goes to `/forgot-password`, enters email
2. **Token generated:** 32-byte random token, expires in 1 hour
3. **Email sent:** Reset link sent to user (currently logs to console in dev)
4. **User clicks link:** Opens `/reset-password?token=xxxxx`
5. **Token validated:** Checks if token exists and hasn't expired
6. **Password reset:** User enters new password, token is cleared

## Testing

### Test Flow
```bash
# 1. Go to forgot password page
https://manthmwear.com/forgot-password

# 2. Enter email and submit
# 3. Check PM2 logs for reset URL
pm2 logs manthmwear | grep "Reset URL"

# 4. Copy the URL and open in browser
# 5. Enter new password
# 6. Try logging in with new password
```

### Check Database
```sql
-- View reset tokens
SELECT id, email, resetToken, resetTokenExpiry 
FROM user 
WHERE resetToken IS NOT NULL;

-- Check if fields exist
DESCRIBE user;
```

## Important Notes

### Development Mode
- Reset URLs are logged to console
- Check PM2 logs to get the reset link
- No actual emails are sent

### Production Setup
- Configure email service (SendGrid, Nodemailer, or Resend)
- Add email credentials to `.env`
- Update `/api/auth/forgot-password/route.ts` to send real emails

### Security
- Tokens expire after 1 hour
- Tokens are single-use (cleared after reset)
- Passwords are hashed with bcrypt
- Email enumeration is prevented

## Add Forgot Password Link

Add this link to your login/account pages:

```tsx
<Link 
  href="/forgot-password"
  className="text-sm text-gray-secondary hover:text-text-black underline"
>
  Forgot Password?
</Link>
```

## Troubleshooting

**Token not working:**
```bash
# Check if migration ran
mysql -u your_db_user -p manthmwear -e "DESCRIBE user;"

# Should show resetToken and resetTokenExpiry fields
```

**Page not loading:**
```bash
# Check build errors
npm run build

# Check PM2 logs
pm2 logs manthmwear --lines 50
```

**Password not updating:**
```bash
# Verify bcrypt is installed
npm list bcrypt bcryptjs

# Check API logs
pm2 logs manthmwear | grep RESET_PASSWORD
```

## Success Checklist

- [ ] Database migration completed
- [ ] Prisma client regenerated
- [ ] Application built successfully
- [ ] PM2 restarted without errors
- [ ] Forgot password page loads
- [ ] Can submit email
- [ ] Reset URL appears in logs
- [ ] Reset password page loads with token
- [ ] Can set new password
- [ ] Can login with new password
- [ ] Old password doesn't work

## Next Steps

1. **Deploy to production** (follow commands above)
2. **Test complete flow**
3. **Add forgot password links to UI**
4. **Configure email service** (for production)
5. **Monitor reset requests**

## Email Service Setup (Production)

Choose one and add to `.env`:

**SendGrid:**
```env
SENDGRID_API_KEY=your_key_here
```

**SMTP (Gmail, etc):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Resend:**
```env
RESEND_API_KEY=your_key_here
```

Then update `app/api/auth/forgot-password/route.ts` to send actual emails.

## Support

If issues occur:
1. Check PM2 logs: `pm2 logs manthmwear`
2. Check database: `mysql -u user -p manthmwear`
3. Verify migration: `DESCRIBE user;`
4. Test API directly with curl
5. Check browser console for errors

Complete documentation in `FORGOT_PASSWORD_IMPLEMENTATION.md`
