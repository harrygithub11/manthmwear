# Quick Start Guide - Support & Newsletter Feature

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration (2 minutes)

Open your MySQL client (phpMyAdmin, MySQL Workbench, or command line) and run:

```bash
# Command line method
mysql -u your_username -p your_database_name < database_migration_support_newsletter.sql

# Or copy/paste the SQL from database_migration_support_newsletter.sql into your MySQL client
```

This creates two new tables:
- `supporttickets` - For support form submissions
- `newslettersubscribers` - For newsletter subscriptions

### Step 2: Generate Prisma Client (1 minute)

```bash
npm run db:generate
```

This updates the Prisma client to recognize the new database tables.

### Step 3: Start Your Server (1 minute)

```bash
npm run dev
```

## ✅ Test It Out

### Test Support Form
1. Visit: `http://localhost:3000/support`
2. Scroll to "Get in Touch" section
3. Fill out the form and submit
4. You should see a success message

### Test Newsletter
1. Visit: `http://localhost:3000/`
2. Scroll to bottom of page
3. Enter your email and click Subscribe
4. You should see "Subscribed!" message

### Test Admin Dashboard
1. Login to admin: `http://localhost:3000/admin/login`
2. Go to "Support Tickets" in sidebar
3. You should see your test submission
4. Try changing the status dropdown
5. Click "Export CSV" to download data
6. Go to "Newsletter" in sidebar
7. You should see your test subscription
8. Click "Export CSV" or "Export Emails"

## 🎯 What You Get

### For Customers
- Professional support form on `/support` page
- Easy newsletter signup on homepage
- Instant feedback on submissions

### For Admins
- View all support tickets at `/admin/support-tickets`
- View all subscribers at `/admin/newsletter-subscribers`
- Filter by status
- Update ticket status
- Export to CSV
- Export email list for campaigns
- Stats on main dashboard

## 📊 Admin Dashboard URLs

- Main Dashboard: `/admin`
- Support Tickets: `/admin/support-tickets`
- Newsletter Subscribers: `/admin/newsletter-subscribers`

## 🔧 Troubleshooting

### "Can't reach database server"
- Make sure MySQL is running
- Check your `.env` file has correct `DATABASE_URL`

### "Table doesn't exist"
- Run the database migration SQL script
- Make sure you're connected to the correct database

### "Prisma Client not found"
- Run `npm run db:generate`
- Restart your dev server

### Admin page shows "Unauthorized"
- Make sure you're logged in to admin panel
- Check if `admin_token` exists in browser localStorage

## 📝 Quick Reference

### Database Tables Created
```
supporttickets
├── id
├── name
├── email
├── subject
├── message
├── status (NEW, IN_PROGRESS, RESOLVED, CLOSED)
├── createdAt
└── updatedAt

newslettersubscribers
├── id
├── email (unique)
├── subscribedAt
└── isActive
```

### API Endpoints
```
Public:
POST /api/support              - Submit support ticket
POST /api/newsletter           - Subscribe to newsletter

Admin (requires auth token):
GET  /api/admin/support-tickets       - Get all tickets
PATCH /api/admin/support-tickets      - Update ticket status
GET  /api/admin/newsletter-subscribers - Get all subscribers
```

## 🎉 You're Done!

The feature is now fully functional. Customers can submit support requests and subscribe to your newsletter, and you can manage everything from the admin dashboard.

## 📚 Need More Info?

- **Full Setup Guide**: See `SUPPORT_NEWSLETTER_SETUP.md`
- **Flow Diagrams**: See `FLOW_DIAGRAM.md`
- **Complete Summary**: See `IMPLEMENTATION_SUMMARY.md`

---

**Questions?** Check the documentation files or contact the development team.
