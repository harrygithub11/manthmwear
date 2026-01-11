# Support & Newsletter Feature Setup Guide

This guide explains the complete end-to-end flow for the Support Page form and Newsletter subscription feature with admin dashboard integration.

## 🎯 Features Implemented

### 1. **Support Page Contact Form**
- Full contact form on `/support` page
- Collects: Name, Email, Subject, Message
- Real-time validation
- Success/error feedback
- Data stored in database

### 2. **Newsletter Subscription**
- Email capture on homepage
- Duplicate email prevention
- Reactivation for previously unsubscribed users
- Success/error feedback

### 3. **Admin Dashboard Integration**
- View all support tickets with filtering (NEW, IN_PROGRESS, RESOLVED, CLOSED)
- View all newsletter subscribers with status filtering
- Update ticket status directly from dashboard
- Export data to CSV
- Export email list for marketing campaigns
- Stats cards on main dashboard

## 📁 Files Created/Modified

### Database Schema
- `prisma/schema.prisma` - Added `supportticket` and `newslettersubscriber` models

### API Endpoints
- `app/api/support/route.ts` - Handle support form submissions
- `app/api/newsletter/route.ts` - Handle newsletter subscriptions
- `app/api/admin/support-tickets/route.ts` - Admin API for support tickets
- `app/api/admin/newsletter-subscribers/route.ts` - Admin API for subscribers

### Frontend Pages
- `app/support/page.tsx` - Updated with working contact form
- `components/home/EmailCapture.tsx` - Updated with API integration
- `app/admin/support-tickets/page.tsx` - Admin page for support tickets
- `app/admin/newsletter-subscribers/page.tsx` - Admin page for subscribers
- `app/admin/page.tsx` - Updated dashboard with new stats

### Components
- `components/admin/AdminLayout.tsx` - Added navigation links

### Database Migration
- `database_migration_support_newsletter.sql` - SQL script to create tables

## 🚀 Setup Instructions

### Step 1: Database Migration

Run the SQL migration script on your MySQL database:

```bash
# Option 1: Using MySQL command line
mysql -u your_username -p your_database_name < database_migration_support_newsletter.sql

# Option 2: Using phpMyAdmin or MySQL Workbench
# Import the database_migration_support_newsletter.sql file
```

### Step 2: Generate Prisma Client

```bash
npm run db:generate
# or
npx prisma generate
```

### Step 3: Start Development Server

```bash
npm run dev
```

## 📊 Database Schema

### Support Tickets Table (`supporttickets`)
```sql
- id (VARCHAR) - Primary key
- name (VARCHAR) - Customer name
- email (VARCHAR) - Customer email
- subject (VARCHAR) - Ticket subject
- message (TEXT) - Ticket message
- status (VARCHAR) - NEW, IN_PROGRESS, RESOLVED, CLOSED
- createdAt (DATETIME) - Creation timestamp
- updatedAt (DATETIME) - Last update timestamp
```

### Newsletter Subscribers Table (`newslettersubscribers`)
```sql
- id (VARCHAR) - Primary key
- email (VARCHAR) - Subscriber email (unique)
- subscribedAt (DATETIME) - Subscription timestamp
- isActive (BOOLEAN) - Active status
```

## 🔐 Admin Access

### Admin Routes
- `/admin/support-tickets` - Manage support tickets
- `/admin/newsletter-subscribers` - Manage newsletter subscribers

### Features Available

#### Support Tickets Dashboard
- View all tickets with filtering by status
- Update ticket status (NEW → IN_PROGRESS → RESOLVED → CLOSED)
- Quick reply via email link
- Export to CSV with all ticket details
- Stats: Total, New, In Progress, Resolved

#### Newsletter Subscribers Dashboard
- View all subscribers with active/inactive filtering
- Export to CSV with subscriber details
- Export email list (comma-separated) for email campaigns
- Stats: Total, Active, Inactive

## 📤 Export Functionality

### Support Tickets CSV Export
Includes: ID, Name, Email, Subject, Message, Status, Created At

### Newsletter Subscribers CSV Export
Includes: Email, Subscribed At, Status

### Email List Export
Plain text file with comma-separated active email addresses for easy import into email marketing tools.

## 🎨 User Flow

### Support Form Flow
1. User visits `/support` page
2. Fills out contact form (Name, Email, Subject, Message)
3. Submits form
4. Data validated and saved to database
5. Success message displayed
6. Admin receives ticket in dashboard

### Newsletter Subscription Flow
1. User enters email on homepage
2. Clicks Subscribe
3. Email validated
4. Checks for existing subscription
5. Creates new subscriber or reactivates inactive one
6. Success message displayed
7. Admin can view in dashboard

## 🔧 API Endpoints

### Public Endpoints
- `POST /api/support` - Submit support ticket
- `POST /api/newsletter` - Subscribe to newsletter

### Admin Endpoints (Requires Authentication)
- `GET /api/admin/support-tickets` - Get all tickets
- `PATCH /api/admin/support-tickets` - Update ticket status
- `GET /api/admin/newsletter-subscribers` - Get all subscribers

## 🎯 Next Steps (Optional Enhancements)

1. **Email Notifications**
   - Send confirmation email to users on form submission
   - Notify admin of new support tickets
   - Send welcome email to newsletter subscribers

2. **Advanced Filtering**
   - Date range filters
   - Search functionality
   - Bulk actions

3. **Analytics**
   - Ticket resolution time
   - Response rate metrics
   - Subscriber growth charts

4. **Integration**
   - Connect to email marketing platforms (Mailchimp, SendGrid)
   - CRM integration
   - Automated responses

## 📝 Testing Checklist

- [ ] Submit support form from `/support` page
- [ ] Verify form validation works
- [ ] Check success/error messages display
- [ ] Subscribe to newsletter from homepage
- [ ] Test duplicate email prevention
- [ ] Login to admin dashboard
- [ ] View support tickets at `/admin/support-tickets`
- [ ] Update ticket status
- [ ] Export tickets to CSV
- [ ] View newsletter subscribers at `/admin/newsletter-subscribers`
- [ ] Export subscribers to CSV
- [ ] Export email list
- [ ] Verify stats on main dashboard

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MySQL server is running
- Check `.env` file for correct `DATABASE_URL`
- Verify database credentials

### Prisma Client Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Admin Authentication
- Ensure you're logged in to admin panel
- Check `localStorage` for `admin_token`
- Token is validated on each API request

## 📞 Support

For issues or questions, contact the development team.

---

**Developed by Harish** | **Powered by BlinkrMedia**
