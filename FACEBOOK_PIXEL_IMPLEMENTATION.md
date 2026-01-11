# Facebook Pixel Integration - Complete Implementation

## Overview
Complete end-to-end Facebook Pixel integration with admin dashboard management and automatic event tracking across the e-commerce funnel.

## Features Implemented

### 1. Admin Dashboard Configuration
- ✅ Enable/Disable Facebook Pixel from admin panel
- ✅ Configure Pixel ID through UI
- ✅ Real-time toggle without code changes
- ✅ Secure storage in database

### 2. Automatic Event Tracking
The following Facebook Pixel events are automatically tracked:

#### **PageView**
- Tracked on every page navigation
- Automatic tracking via Next.js router

#### **ViewContent**
- Tracked when user views a product page
- Includes: product name, ID, price, currency

#### **AddToCart**
- Tracked when user adds item to cart
- Includes: product details, quantity, total value

#### **InitiateCheckout**
- Tracked when user reaches checkout page
- Includes: cart items, total value, item count

#### **Purchase**
- Tracked on successful order completion (both COD and Online Payment)
- Includes: order value, items, quantities

#### **Search** (Ready for implementation)
- Can be added to search functionality
- Includes: search query, results

#### **Lead** (Ready for implementation)
- Can be added to newsletter signup, support tickets
- Tracks user engagement

#### **CompleteRegistration** (Ready for implementation)
- Can be added to account creation
- Tracks new user signups

## Files Created/Modified

### New Files
1. **`components/FacebookPixel.tsx`**
   - Core Facebook Pixel component
   - Event tracking helper functions
   - TypeScript definitions

2. **`components/FacebookPixelWrapper.tsx`**
   - Client-side wrapper to fetch settings
   - Conditionally loads pixel based on admin settings

3. **`add_facebook_pixel.sql`**
   - Database migration to add pixel fields
   - Adds `facebookPixelId` and `facebookPixelEnabled` columns

4. **`FACEBOOK_PIXEL_IMPLEMENTATION.md`**
   - This documentation file

### Modified Files
1. **`prisma/schema.prisma`**
   - Added Facebook Pixel fields to sitesettings model

2. **`app/layout.tsx`**
   - Integrated FacebookPixelWrapper component

3. **`app/admin/site-settings/page.tsx`**
   - Added Facebook Pixel configuration section
   - Toggle enable/disable
   - Pixel ID input field
   - Event tracking information

4. **`components/pdp/ProductDetailClient.tsx`**
   - Added ViewContent tracking on product page load
   - Added AddToCart tracking on add to cart action

5. **`app/checkout/page.tsx`**
   - Added InitiateCheckout tracking on page load
   - Added Purchase tracking on order completion (COD & Online)

## Database Changes

### Migration SQL
```sql
ALTER TABLE `sitesettings` 
ADD COLUMN `facebookPixelId` VARCHAR(255) NULL AFTER `razorpayKeySecret`,
ADD COLUMN `facebookPixelEnabled` BOOLEAN DEFAULT FALSE AFTER `facebookPixelId`;
```

### Prisma Schema
```prisma
model sitesettings {
  // ... existing fields
  
  // Facebook Pixel
  facebookPixelId       String?
  facebookPixelEnabled  Boolean  @default(false)
  
  // ... rest of fields
}
```

## Setup Instructions

### Step 1: Run Database Migration
```bash
# On your database
mysql -u your_user -p your_database < add_facebook_pixel.sql

# Or run manually:
ALTER TABLE `sitesettings` 
ADD COLUMN `facebookPixelId` VARCHAR(255) NULL,
ADD COLUMN `facebookPixelEnabled` BOOLEAN DEFAULT FALSE;
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Build and Deploy
```bash
npm run build
pm2 restart manthmwear
```

### Step 4: Configure in Admin Dashboard
1. Login to admin dashboard
2. Go to **Site Settings**
3. Scroll to **Facebook Pixel** section
4. Check "Enable Facebook Pixel"
5. Enter your Facebook Pixel ID (find it in Facebook Events Manager)
6. Click "Save Settings"

## How to Find Your Facebook Pixel ID

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Click on **Data Sources** in the left menu
3. Click on **Pixels**
4. Your Pixel ID is displayed (15-digit number)
5. Copy and paste it into the admin dashboard

## Event Tracking Details

### ViewContent Event
**Triggered**: When user views a product page
**Data Sent**:
```javascript
{
  content_name: "Trunk Core Series",
  content_ids: ["product_id"],
  content_type: "product",
  value: 599,
  currency: "INR"
}
```

### AddToCart Event
**Triggered**: When user clicks "Add to Cart"
**Data Sent**:
```javascript
{
  content_name: "Trunk Core Series",
  content_ids: ["variant_id"],
  content_type: "product",
  value: 599,
  currency: "INR"
}
```

### InitiateCheckout Event
**Triggered**: When user reaches checkout page
**Data Sent**:
```javascript
{
  content_ids: ["variant_id_1", "variant_id_2"],
  contents: [
    { id: "variant_id_1", quantity: 2 },
    { id: "variant_id_2", quantity: 1 }
  ],
  value: 1797,
  currency: "INR",
  num_items: 3
}
```

### Purchase Event
**Triggered**: When order is successfully completed
**Data Sent**:
```javascript
{
  content_ids: ["variant_id_1", "variant_id_2"],
  contents: [
    { id: "variant_id_1", quantity: 2 },
    { id: "variant_id_2", quantity: 1 }
  ],
  value: 1797,
  currency: "INR",
  num_items: 3
}
```

## Testing the Integration

### 1. Test Pixel Installation
1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/) Chrome extension
2. Visit your website
3. Click the extension icon
4. Should show your Pixel ID and "PageView" event

### 2. Test Events
1. **ViewContent**: Visit any product page → Check Pixel Helper
2. **AddToCart**: Add item to cart → Check Pixel Helper
3. **InitiateCheckout**: Go to checkout → Check Pixel Helper
4. **Purchase**: Complete a test order → Check Pixel Helper

### 3. Verify in Facebook Events Manager
1. Go to Facebook Events Manager
2. Click on your Pixel
3. Go to **Test Events** tab
4. Perform actions on your website
5. Events should appear in real-time

## Benefits

### For Marketing
- ✅ Track conversion funnel
- ✅ Optimize Facebook/Instagram ads
- ✅ Create custom audiences
- ✅ Retarget website visitors
- ✅ Measure ROAS (Return on Ad Spend)

### For Analytics
- ✅ Understand user behavior
- ✅ Track product performance
- ✅ Identify drop-off points
- ✅ A/B test campaigns

### For Business
- ✅ Improve ad targeting
- ✅ Reduce customer acquisition cost
- ✅ Increase conversion rates
- ✅ Better ROI on ad spend

## Advanced Features (Future Enhancements)

### 1. Custom Conversions
- Track specific actions (e.g., "Added to Wishlist")
- Set up custom conversion goals

### 2. Dynamic Ads
- Automatically show products users viewed
- Retarget cart abandoners

### 3. Audience Building
- Create lookalike audiences
- Segment by purchase behavior

### 4. Enhanced Matching
- Send hashed email/phone for better matching
- Improve attribution accuracy

## Troubleshooting

### Pixel Not Loading
1. Check if Pixel is enabled in admin settings
2. Verify Pixel ID is correct (15 digits)
3. Clear browser cache
4. Check browser console for errors

### Events Not Tracking
1. Install Facebook Pixel Helper extension
2. Check if events fire in browser console
3. Verify Pixel ID matches Facebook Events Manager
4. Check if ad blockers are interfering

### Events Not Showing in Facebook
1. Wait 20-30 minutes for data to appear
2. Check Test Events tab for real-time data
3. Verify Pixel is active in Events Manager
4. Check if domain is verified

## Privacy & Compliance

### GDPR Compliance
- Consider adding cookie consent banner
- Allow users to opt-out of tracking
- Provide privacy policy

### Data Handling
- Pixel ID stored securely in database
- No sensitive user data sent to Facebook
- Only transaction and product data tracked

## Support

### Facebook Resources
- [Facebook Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- [Events Manager](https://business.facebook.com/events_manager)
- [Pixel Helper Extension](https://chrome.google.com/webstore/detail/facebook-pixel-helper/)

### Implementation Files
- `components/FacebookPixel.tsx` - Core implementation
- `components/FacebookPixelWrapper.tsx` - Settings loader
- `app/admin/site-settings/page.tsx` - Admin configuration

---

## Summary

✅ **Complete end-to-end Facebook Pixel integration**
✅ **Admin dashboard management**
✅ **Automatic event tracking**
✅ **No code changes needed for future updates**
✅ **Production-ready implementation**

**Next Steps:**
1. Run database migration
2. Deploy to production
3. Configure Pixel ID in admin dashboard
4. Test events with Pixel Helper
5. Start running Facebook/Instagram ads!

🎉 **Your e-commerce store is now ready for advanced Facebook advertising!**
