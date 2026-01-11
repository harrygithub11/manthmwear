# Email Setup for Forgot Password

## Current Status
- Reset links are logged to PM2 logs
- No emails are sent yet
- You need to configure SMTP to send real emails

## How to Get Reset Link (Development)

Check PM2 logs on your VPS:
```bash
pm2 logs manthmwear | grep "Reset URL"
```

You'll see:
```
[FORGOT_PASSWORD] Reset URL: https://manthmwear.com/reset-password?token=xxxxx
```

Copy that URL and send it to the user manually, or open it yourself to test.

## Setup Email Sending (Production)

### Option 1: Gmail SMTP (Easiest)

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Add to `.env` file:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
NEXT_PUBLIC_APP_URL=https://manthmwear.com
```

4. **Install nodemailer:**
```bash
cd /home/manthmwear/htdocs/manthmwear.com
npm install nodemailer
npm install --save-dev @types/nodemailer
```

5. **Rebuild and restart:**
```bash
npm run build
pm2 restart manthmwear
```

### Option 2: Custom SMTP Server

If you have your own email server:

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@manthmwear.com
SMTP_PASS=your-password
NEXT_PUBLIC_APP_URL=https://manthmwear.com
```

### Option 3: SendGrid (Recommended for Production)

1. **Sign up at https://sendgrid.com**
2. **Create API Key**
3. **Install SendGrid:**
```bash
npm install @sendgrid/mail
```

4. **Update forgot-password API** to use SendGrid instead of nodemailer

## Testing Email

After setup:

1. Go to https://manthmwear.com/forgot-password
2. Enter your email
3. Check your inbox (and spam folder)
4. Click the reset link
5. Set new password

## Troubleshooting

### Email not received

**Check PM2 logs:**
```bash
pm2 logs manthmwear --lines 100 | grep FORGOT_PASSWORD
```

Look for:
- `[FORGOT_PASSWORD] Email sent successfully` ✅
- `[FORGOT_PASSWORD] Failed to send email` ❌
- `[FORGOT_PASSWORD] SMTP not configured` ⚠️

### Gmail "Less secure app" error

- Use App Password, not your regular password
- Enable 2-Step Verification first
- Generate new App Password

### SMTP connection failed

```bash
# Test SMTP connection
telnet smtp.gmail.com 587
```

### Email goes to spam

- Add SPF record to your domain
- Add DKIM signature
- Use a verified sender email
- Warm up your sending domain

## Email Template Customization

The email template is in `/app/api/auth/forgot-password/route.ts`

You can customize:
- Colors and styling
- Logo (add image URL)
- Text content
- Footer information

## Production Checklist

- [ ] SMTP credentials added to `.env`
- [ ] Nodemailer installed
- [ ] Application rebuilt
- [ ] PM2 restarted
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] Reset link works
- [ ] Email not in spam
- [ ] Remove `_dev` object from response

## Security Notes

1. **Never commit `.env` file** to git
2. **Use App Passwords** not regular passwords
3. **Enable 2FA** on email account
4. **Rate limit** forgot password requests
5. **Monitor** for abuse

## Cost Considerations

- **Gmail SMTP:** Free (500 emails/day limit)
- **SendGrid:** Free tier (100 emails/day)
- **Custom SMTP:** Depends on provider
- **AWS SES:** $0.10 per 1000 emails

## Support

If emails still don't work:
1. Check `.env` file has correct values
2. Verify SMTP credentials
3. Check PM2 logs for errors
4. Test with a different email provider
5. Contact your hosting provider
