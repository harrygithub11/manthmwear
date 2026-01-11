# Forgot Password Feature - Complete Implementation

## Overview
Complete end-to-end forgot password flow for customer accounts with email-based password reset.

## Features Implemented

### 1. Forgot Password Page (`/forgot-password`)
- Email input form
- Email validation
- Success confirmation screen
- Link to resend email

### 2. Reset Password Page (`/reset-password?token=xxx`)
- Token validation
- New password input with show/hide toggle
- Password confirmation
- Expired token handling
- Success redirect to home

### 3. API Endpoints

#### POST `/api/auth/forgot-password`
- Accepts email address
- Generates secure reset token
- Stores token with 1-hour expiry
- Sends reset email (logs URL in development)
- Prevents email enumeration

#### POST `/api/auth/validate-reset-token`
- Validates reset token
- Checks expiry time
- Returns token status

#### POST `/api/auth/reset-password`
- Validates token
- Updates user password
- Clears reset token
- Hashes password with bcrypt

## Database Changes

### New Fields in `user` Table
```sql
resetToken        VARCHAR(255) UNIQUE
resetTokenExpiry  DATETIME
```

### Migration File
`add_password_reset_fields.sql`

## User Flow

### Step 1: Request Reset
1. User goes to `/forgot-password`
2. Enters email address
3. Clicks "Send Reset Link"
4. Sees confirmation message

### Step 2: Receive Email
1. User receives email with reset link
2. Link format: `/reset-password?token=xxxxx`
3. Link expires in 1 hour

### Step 3: Reset Password
1. User clicks link in email
2. Token is validated
3. User enters new password
4. Password is confirmed
5. Password is updated
6. User is redirected to home

## Security Features

### Token Generation
- 32-byte random token using crypto
- Unique per user
- Stored hashed in database

### Token Expiry
- 1 hour expiration time
- Automatically invalidated after use
- Cannot be reused

### Password Requirements
- Minimum 6 characters
- Hashed with bcrypt (10 rounds)
- Must match confirmation

### Email Enumeration Prevention
- Always returns success message
- Doesn't reveal if email exists
- Logs attempts for monitoring

## Deployment Steps

### Step 1: Database Migration
```bash
cd /home/manthmwear/htdocs/manthmwear.com

# Run migration
mysql -u your_db_user -p manthmwear < add_password_reset_fields.sql

# Verify fields added
mysql -u your_db_user -p manthmwear -e "DESCRIBE user;"
```

### Step 2: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 3: Build and Deploy
```bash
npm run build
pm2 restart manthmwear
```

### Step 4: Add Forgot Password Link
Add link to login/account pages (see below)

## Integration Points

### Add to Login Page
```tsx
<Link 
  href="/forgot-password"
  className="text-sm text-gray-secondary hover:text-text-black underline"
>
  Forgot Password?
</Link>
```

### Add to Account Page
```tsx
<Link 
  href="/forgot-password"
  className="text-sm font-bold hover:underline"
>
  Reset Password
</Link>
```

### Add to Navigation (if needed)
```tsx
{!user && (
  <Link href="/forgot-password">
    Forgot Password
  </Link>
)}
```

## Email Configuration

### Development
Currently logs reset URL to console:
```
[FORGOT_PASSWORD] Reset URL: http://localhost:3000/reset-password?token=xxxxx
```

### Production Setup
You'll need to configure an email service. Options:

#### Option 1: SendGrid
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

await sgMail.send({
  to: email,
  from: 'noreply@manthmwear.com',
  subject: 'Reset Your Password - MANTHM',
  html: `
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
  `
})
```

#### Option 2: Nodemailer
```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

await transporter.sendMail({
  from: 'noreply@manthmwear.com',
  to: email,
  subject: 'Reset Your Password - MANTHM',
  html: `...`
})
```

#### Option 3: Resend
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'noreply@manthmwear.com',
  to: email,
  subject: 'Reset Your Password - MANTHM',
  html: `...`
})
```

## Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>MANTHM</h1>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 MANTHM. All rights reserved.</p>
      <p>Premium Men's Underwear</p>
    </div>
  </div>
</body>
</html>
```

## Testing Checklist

### Forgot Password Flow
- [ ] Navigate to `/forgot-password`
- [ ] Enter valid email address
- [ ] Click "Send Reset Link"
- [ ] Verify success message appears
- [ ] Check console/logs for reset URL
- [ ] Verify token stored in database
- [ ] Verify expiry time is 1 hour from now

### Reset Password Flow
- [ ] Copy reset URL from logs
- [ ] Open URL in browser
- [ ] Verify page loads without errors
- [ ] Enter new password (min 6 chars)
- [ ] Enter matching confirmation
- [ ] Click "Reset Password"
- [ ] Verify success message
- [ ] Verify redirect to home
- [ ] Try logging in with new password
- [ ] Verify login works

### Token Validation
- [ ] Try using expired token (wait 1 hour)
- [ ] Verify "expired token" error
- [ ] Try using invalid token
- [ ] Verify "invalid token" error
- [ ] Try reusing same token twice
- [ ] Verify second use fails

### Security Tests
- [ ] Enter non-existent email
- [ ] Verify same success message (no enumeration)
- [ ] Try password < 6 characters
- [ ] Verify validation error
- [ ] Try mismatched passwords
- [ ] Verify validation error
- [ ] Check password is hashed in database
- [ ] Verify token is cleared after reset

### Edge Cases
- [ ] Test with uppercase/lowercase email
- [ ] Test with spaces in email
- [ ] Test with special characters in password
- [ ] Test rapid multiple requests
- [ ] Test concurrent token usage

## Troubleshooting

### Token not found in database
**Solution:**
```sql
SELECT id, email, resetToken, resetTokenExpiry FROM user WHERE email = 'test@example.com';
```

### Token expired immediately
**Solution:** Check server time vs database time
```sql
SELECT NOW(), resetTokenExpiry FROM user WHERE resetToken = 'xxx';
```

### Password not updating
**Solution:** Check bcrypt is installed
```bash
npm list bcrypt bcryptjs
```

### Email not sending (production)
**Solution:** Check email service configuration
- Verify API keys in environment variables
- Check email service logs
- Test with email service dashboard

## Environment Variables

Add to `.env`:
```env
# App URL for reset links
NEXT_PUBLIC_APP_URL=https://manthmwear.com

# Email Service (choose one)
SENDGRID_API_KEY=your_key_here
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
# OR
RESEND_API_KEY=your_key_here
```

## Files Created

### Pages
- `app/forgot-password/page.tsx` - Forgot password form
- `app/reset-password/page.tsx` - Reset password form

### API Routes
- `app/api/auth/forgot-password/route.ts` - Generate reset token
- `app/api/auth/validate-reset-token/route.ts` - Validate token
- `app/api/auth/reset-password/route.ts` - Update password

### Database
- `add_password_reset_fields.sql` - Migration file
- Updated `prisma/schema.prisma` - Added reset fields

### Documentation
- `FORGOT_PASSWORD_IMPLEMENTATION.md` - This file

## Next Steps

1. **Run database migration**
2. **Regenerate Prisma client**
3. **Add forgot password links to UI**
4. **Configure email service**
5. **Test complete flow**
6. **Deploy to production**
7. **Monitor reset requests**

## Support

Common issues:
- Token not working → Check database migration
- Email not sending → Configure email service
- Page not loading → Check build errors
- Token expired → Check server time

## Security Recommendations

1. **Rate limiting** - Limit reset requests per IP
2. **Email verification** - Require email verification before reset
3. **Audit logging** - Log all reset attempts
4. **2FA option** - Consider adding two-factor authentication
5. **Password strength** - Enforce stronger password requirements
6. **Account lockout** - Lock account after multiple failed attempts

## Monitoring

Track these metrics:
- Reset requests per day
- Successful resets
- Expired tokens
- Failed attempts
- Average time to reset

Query for monitoring:
```sql
-- Recent reset requests
SELECT email, resetTokenExpiry, 
       CASE WHEN resetTokenExpiry > NOW() THEN 'Active' ELSE 'Expired' END as status
FROM user 
WHERE resetToken IS NOT NULL 
ORDER BY resetTokenExpiry DESC 
LIMIT 10;

-- Reset activity
SELECT DATE(updatedAt) as date, COUNT(*) as resets
FROM user
WHERE resetToken IS NULL AND resetTokenExpiry IS NOT NULL
GROUP BY DATE(updatedAt)
ORDER BY date DESC
LIMIT 30;
```

## Success Criteria

Feature is complete when:
- ✅ User can request password reset
- ✅ Reset email is sent (or logged in dev)
- ✅ Reset link works and validates token
- ✅ User can set new password
- ✅ Old password no longer works
- ✅ New password works for login
- ✅ Token expires after 1 hour
- ✅ Token cannot be reused
- ✅ No security vulnerabilities
- ✅ All tests pass
