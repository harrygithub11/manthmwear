# Settings Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Files Ready
- [ ] `app/admin/settings/page.tsx` - Settings UI with 8 tabs
- [ ] `app/api/admin/settings/route.ts` - Settings API (GET/PUT)
- [ ] `app/api/admin/change-password/route.ts` - Password change API
- [ ] `complete_settings_migration.sql` - Database migration
- [ ] `prisma/schema.prisma` - Updated with payment fields
- [ ] `app/checkout/page.tsx` - Respects payment settings
- [ ] `components/admin/AdminLayout.tsx` - Nav link updated

### 2. Database Preparation
- [ ] Backup current database
  ```bash
  mysqldump -u your_db_user -p manthmwear > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- [ ] Verify database connection
  ```bash
  mysql -u your_db_user -p manthmwear -e "SELECT 1;"
  ```

### 3. Code Upload
- [ ] Upload all modified files to VPS
- [ ] Verify file permissions
  ```bash
  ls -la /home/manthmwear/htdocs/manthmwear.com/app/admin/settings/
  ls -la /home/manthmwear/htdocs/manthmwear.com/app/api/admin/settings/
  ```

## 🚀 Deployment Steps

### Step 1: Database Migration
```bash
cd /home/manthmwear/htdocs/manthmwear.com

# Run migration
mysql -u your_db_user -p manthmwear < complete_settings_migration.sql

# Verify migration
mysql -u your_db_user -p manthmwear -e "SELECT COUNT(*) as column_count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'sitesettings';"

# Should show ~30 columns
```

### Step 2: Regenerate Prisma Client
```bash
cd /home/manthmwear/htdocs/manthmwear.com

# Generate Prisma client
npx prisma generate

# Verify generation
ls -la node_modules/@prisma/client/
```

### Step 3: Build Application
```bash
cd /home/manthmwear/htdocs/manthmwear.com

# Clear cache
rm -rf .next

# Build
npm run build

# Check for build errors
echo $?  # Should be 0
```

### Step 4: Restart Application
```bash
# Restart PM2
pm2 restart manthmwear

# Check status
pm2 status

# Monitor logs
pm2 logs manthmwear --lines 50
```

## 🧪 Post-Deployment Testing

### Test 1: Access Settings Page
```bash
# Should not redirect to login
curl -I https://manthmwear.com/admin/settings
```
- [ ] Page loads without redirect
- [ ] All 8 tabs are visible
- [ ] No console errors

### Test 2: Load Settings
- [ ] Login to admin dashboard
- [ ] Click "Settings" in sidebar
- [ ] Verify all tabs load
- [ ] Check browser console for errors
- [ ] Verify settings load from database

### Test 3: Save Settings
- [ ] Update site name in General tab
- [ ] Click "Save Settings"
- [ ] Verify success message
- [ ] Refresh page
- [ ] Verify change persisted

### Test 4: Payment Methods
- [ ] Go to Payment tab
- [ ] Toggle COD off
- [ ] Save settings
- [ ] Open checkout page in new tab
- [ ] Verify COD option is hidden
- [ ] Go back to settings
- [ ] Toggle COD on
- [ ] Save settings
- [ ] Refresh checkout page
- [ ] Verify COD option appears

### Test 5: Shipping Settings
- [ ] Go to Shipping tab
- [ ] Set shipping fee to 100
- [ ] Set free shipping threshold to 1500
- [ ] Save settings
- [ ] Add item to cart (< ₹1500)
- [ ] Go to checkout
- [ ] Verify shipping fee is ₹100
- [ ] Add more items (> ₹1500)
- [ ] Verify shipping is FREE

### Test 6: Password Change
- [ ] Go to Security tab
- [ ] Enter new password: "test123456"
- [ ] Confirm password: "test123456"
- [ ] Click "Change Password"
- [ ] Verify success message
- [ ] Log out
- [ ] Log in with new password
- [ ] Verify login works
- [ ] Change password back to original

### Test 7: Maintenance Mode
- [ ] Go to Maintenance tab
- [ ] Toggle maintenance mode ON
- [ ] Enter message: "We'll be back soon!"
- [ ] Save settings
- [ ] Open site in incognito window
- [ ] Verify maintenance page shows
- [ ] Verify admin dashboard still accessible
- [ ] Toggle maintenance mode OFF
- [ ] Save settings
- [ ] Verify site is accessible

### Test 8: Social Links
- [ ] Go to Social tab
- [ ] Add Instagram URL
- [ ] Add Facebook URL
- [ ] Add Twitter URL
- [ ] Save settings
- [ ] Go to homepage
- [ ] Scroll to footer
- [ ] Verify social links appear

### Test 9: SEO Settings
- [ ] Go to SEO tab
- [ ] Add meta title
- [ ] Add meta description
- [ ] Save settings
- [ ] View page source
- [ ] Verify meta tags updated

### Test 10: Email Settings
- [ ] Go to Email tab
- [ ] Add email from address
- [ ] Add admin notification email
- [ ] Save settings
- [ ] Place test order
- [ ] Verify notification email received

## 🔍 Verification Queries

### Check Settings in Database
```sql
-- View all settings
SELECT * FROM sitesettings;

-- Check payment settings
SELECT codEnabled, onlinePaymentEnabled, razorpayKeyId FROM sitesettings;

-- Check shipping settings
SELECT shippingFee, freeShippingThreshold, taxRate FROM sitesettings;

-- Check maintenance mode
SELECT maintenanceMode, maintenanceMessage FROM sitesettings;
```

### Check API Response
```bash
# Get settings (replace TOKEN with actual admin token)
curl -X GET https://manthmwear.com/api/admin/settings \
  -H "Authorization: Bearer TOKEN" \
  | jq .

# Should return all settings
```

## ❌ Rollback Plan

If something goes wrong:

### Rollback Database
```bash
# Restore from backup
mysql -u your_db_user -p manthmwear < backup_YYYYMMDD_HHMMSS.sql
```

### Rollback Code
```bash
# Revert to previous commit
cd /home/manthmwear/htdocs/manthmwear.com
git log --oneline -5
git revert <commit_hash>
npm run build
pm2 restart manthmwear
```

### Emergency Fix
```bash
# If site is down, disable maintenance mode directly
mysql -u your_db_user -p manthmwear -e "UPDATE sitesettings SET maintenanceMode = FALSE;"
```

## 📊 Success Metrics

Deployment is successful when:
- ✅ Settings page loads without errors
- ✅ All 8 tabs are functional
- ✅ Settings save to database
- ✅ Settings persist after refresh
- ✅ Payment methods control checkout
- ✅ Shipping calculations are correct
- ✅ Password change works
- ✅ Maintenance mode works
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ PM2 shows "online" status
- ✅ No errors in PM2 logs

## 🐛 Common Issues & Solutions

### Issue: Settings page redirects to login
**Solution:**
- Clear browser cache
- Log out and log in again
- Check admin token in localStorage
- Verify API endpoint returns 200

### Issue: Changes not saving
**Solution:**
- Check PM2 logs for errors
- Verify database connection
- Check API endpoint with curl
- Verify Prisma client regenerated

### Issue: TypeScript errors
**Solution:**
- Run database migration first
- Regenerate Prisma client
- Clear .next folder
- Rebuild application

### Issue: Payment methods not working
**Solution:**
- Verify settings saved in database
- Check checkout page fetches settings
- Clear browser cache
- Test in incognito mode

### Issue: Maintenance mode not working
**Solution:**
- Verify setting saved in database
- Check middleware implementation
- Clear browser cache
- Test in incognito mode

## 📞 Emergency Contacts

If critical issues occur:
1. Check PM2 logs immediately
2. Check database for corruption
3. Restore from backup if needed
4. Contact development team

## ✅ Final Verification

Before marking deployment complete:
- [ ] All tests passed
- [ ] No errors in logs
- [ ] Settings persist correctly
- [ ] Payment methods work
- [ ] Shipping calculations correct
- [ ] Password change works
- [ ] Maintenance mode works
- [ ] Social links appear
- [ ] SEO tags updated
- [ ] Email settings saved
- [ ] Documentation updated
- [ ] Team notified

## 🎉 Deployment Complete!

Once all checks pass, the settings feature is fully deployed and operational.

**Next Steps:**
1. Monitor logs for 24 hours
2. Test all features in production
3. Update team documentation
4. Train admin users on new features
