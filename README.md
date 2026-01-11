# MANTHM E-Commerce Platform

Professional e-commerce platform with integrated email management system.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

**Required Configuration:**
- `DATABASE_URL` - Your PostgreSQL database URL
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your domain URL
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Payment gateway
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` - Email server credentials

### 3. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 5. Build for Production
```bash
npm run build
npm start
```

## Production Deployment

### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Build
npm run build

# Start with PM2
pm2 start npm --name "manthm" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure your web server (Nginx/Apache) to proxy to the app
3. Enable HTTPS with Let's Encrypt/SSL certificate
4. Configure firewall to allow ports 80, 443

## Admin Access

- **URL:** `https://yourdomain.com/admin`
- **Default Credentials:** Set via database or create first admin user

## Features

- 📦 **Product Management** - Full catalog with variants, images, inventory
- 🛒 **Shopping Cart** - Session-based cart with guest checkout
- 💳 **Razorpay Integration** - Secure payment processing
- 👤 **User Accounts** - Registration, login, order history
- 📧 **Email Notifications** - Automated order confirmations for customers and admins
- 📊 **Admin Dashboard** - Orders, customers, products, analytics
- 🎨 **Modern UI** - Tailwind CSS, responsive design

## Support

For technical support or questions:
- Email: contact@manthmwear.com
- Phone: +91 8882478024 / +91 92665 22527
- Documentation: Check individual feature folders for detailed guides

## Tech Stack

- **Framework:** Next.js 14
- **Database:** MySQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js
- **Payments:** Razorpay
- **Email:** SMTP (Nodemailer) for order notifications
- **Icons:** Lucide React

## License

Proprietary - All rights reserved
