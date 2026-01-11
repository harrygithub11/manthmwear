# Facebook Pixel - Quick Deployment Guide

## ✅ What's Been Done

1. ✅ Facebook Pixel component created
2. ✅ Admin dashboard configuration added
3. ✅ Event tracking integrated (ViewContent, AddToCart, InitiateCheckout, Purchase)
4. ✅ Database schema updated
5. ✅ Built and tested successfully
6. ✅ Pushed to GitHub

## 🚀 Deployment Steps

### Step 1: Run Database Migration

**On your server**, run this SQL:

```bash
mysql -u your_user -p your_database < add_facebook_pixel.sql
```

Or manually:

```sql
ALTER TABLE `sitesettings` 
ADD COLUMN `facebookPixelId` VARCHAR(255) NULL,
ADD COLUMN `facebookPixelEnabled` BOOLEAN DEFAULT FALSE;
```

### Step 2: Deploy to Server

```bash
cd /home/manthmwear/htdocs/manthmwear.com
./deploy-server.sh
```

Or if you haven't set up Git yet, use the command from `COPY_PASTE_TO_SERVER.txt`

### Step 3: Configure Facebook Pixel

1. Login to admin dashboard: `https://manthmwear.com/admin/login`
2. Go to **Site Settings**
3. Scroll down to **Facebook Pixel** section
4. Check "Enable Facebook Pixel"
5. Enter your Facebook Pixel ID
6. Click "Save Settings"

### Step 4: Get Your Facebook Pixel ID

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Click **Data Sources** → **Pixels**
3. Copy your Pixel ID (15-digit number)
4. Paste it in the admin dashboard

### Step 5: Test the Integration

1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) Chrome extension
2. Visit your website
3. Click the extension icon
4. Should show your Pixel ID and events firing

## 📊 Events Being Tracked

- ✅ **PageView** - Every page visit
- ✅ **ViewContent** - Product page views
- ✅ **AddToCart** - Items added to cart
- ✅ **InitiateCheckout** - Checkout page visits
- ✅ **Purchase** - Completed orders (COD & Online)

## 🎯 What You Can Do Now

### 1. Run Facebook/Instagram Ads
- Create conversion campaigns
- Track ROI accurately
- Optimize for purchases

### 2. Retargeting
- Show ads to people who viewed products
- Retarget cart abandoners
- Create custom audiences

### 3. Analytics
- See which products drive conversions
- Track customer journey
- Measure ad performance

## 📝 Quick Reference

### Admin Dashboard Location
`https://manthmwear.com/admin/site-settings` → Scroll to "Facebook Pixel"

### Test Events
1. Visit product page → ViewContent fires
2. Add to cart → AddToCart fires
3. Go to checkout → InitiateCheckout fires
4. Complete order → Purchase fires

### Verify in Facebook
1. Go to Events Manager
2. Click your Pixel
3. Go to "Test Events" tab
4. Perform actions on your site
5. Events appear in real-time

## 🔧 Troubleshooting

### Pixel Not Loading?
- Check if enabled in admin settings
- Verify Pixel ID is correct (15 digits)
- Clear browser cache

### Events Not Tracking?
- Install Facebook Pixel Helper extension
- Check browser console for errors
- Verify Pixel is active in Events Manager

## 📚 Documentation

- Full implementation details: `FACEBOOK_PIXEL_IMPLEMENTATION.md`
- Database migration: `add_facebook_pixel.sql`
- Component files: `components/FacebookPixel.tsx`, `components/FacebookPixelWrapper.tsx`

---

## Summary

✅ **Code**: Ready and pushed to GitHub
✅ **Build**: Successful
✅ **Next**: Run database migration and deploy to server

**Total Time to Deploy**: ~5 minutes

🎉 **You're ready to start tracking conversions and running optimized Facebook ads!**
