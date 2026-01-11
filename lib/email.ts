import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  bcc?: string | string[]
  replyTo?: string
}

function parseShippingAddress(addr: any): any {
  if (!addr) return {}
  if (typeof addr === 'object') return addr
  if (typeof addr === 'string') {
    try {
      // Try JSON first
      return JSON.parse(addr)
    } catch {
      // Fallback: treat as plain string
      return { address: addr }
    }
  }
  return {}
}

export async function sendEmail({ to, subject, html, text, bcc, replyTo }: EmailOptions) {
  try {
    if (!to || (Array.isArray(to) && to.length === 0)) {
      console.error('[EMAIL_ERROR] Missing recipient')
      return { success: false, error: 'Missing recipient' }
    }

    const normalizedTo = Array.isArray(to) ? to : [to]
    // Basic recipient format check to catch obvious mistakes
    const invalid = normalizedTo.filter(addr => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr))
    if (invalid.length) {
      console.error('[EMAIL_ERROR] Invalid recipient(s):', invalid)
      return { success: false, error: `Invalid recipient(s): ${invalid.join(', ')}` }
    }

    const fromAddress = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `MANTHM <${process.env.SMTP_USER}>` : 'noreply@manthmwear.com')

    // Send once and capture response
    const info = await transporter.sendMail({
      from: fromAddress,
      to: normalizedTo,
      bcc,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      replyTo: replyTo || process.env.REPLY_TO || 'contact@manthmwear.com',
      envelope: {
        from: process.env.SMTP_USER || 'noreply@manthmwear.com',
        to: normalizedTo,
      },
    })
    console.log(`[EMAIL_SENT] id=${info.messageId} accepted=${JSON.stringify(info.accepted)} rejected=${JSON.stringify(info.rejected)} subject="${subject}"`)
    return { success: true }
  } catch (error: any) {
    console.error('[EMAIL_ERROR]', error?.message || error)
    return { success: false, error: error?.message || String(error) }
  }
}

export async function sendOrderConfirmation(order: any) {
  // Handle both old format (from verify-payment) and new format
  const customerName = order.user?.name || order.customerName
  const customerEmail = order.user?.email || order.customerEmail
  const shippingAddr = parseShippingAddress(order.shippingAddress)

  const items = order.items?.map((item: any) => {
    if (item.variant?.product) {
      // Old format from verify-payment
      return {
        name: item.variant.product.name,
        variant: `${item.variant.size} - ${item.variant.color}`,
        quantity: item.quantity,
        price: (item.price / 100).toFixed(2),
      }
    }
    // New simplified format
    return item
  }) || []

  const subtotal = order.subtotal ? (order.subtotal / 100).toFixed(2) : '0'
  const shipping = order.shipping ? (order.shipping / 100).toFixed(2) : '0'
  const total = order.total ? (order.total / 100).toFixed(2) : '0'

  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
          <h1>MANTHM</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Order Confirmation</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for your order! Your order <strong>#${order.orderNumber}</strong> has been confirmed.</p>
          
          <div style="background: #fff; padding: 15px; margin: 15px 0; border: 1px solid #ddd;">
            <h3>Order Details:</h3>
            ${items.map((item: any) => `
              <p>${item.name || 'Item'} (${item.variant || 'N/A'}) x ${item.quantity} - ₹${item.price}</p>
            `).join('')}
            <p>Shipping: ₹${shipping}</p>
            <p style="font-size: 18px; font-weight: bold; margin-top: 15px;">Total: ₹${total}</p>
          </div>
          
          <p><strong>Shipping Address:</strong><br>
          ${shippingAddr.line1 || shippingAddr.address || ''}${shippingAddr.city ? `, ${shippingAddr.city}` : ''}</p>
          
          <p>We'll notify you when your order ships.</p>
          <p>Thank you for shopping with MANTHM!</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation #${order.orderNumber} - MANTHM`,
    html: customerHtml,
    replyTo: 'contact@manthmwear.com',
  })
}

export async function sendAdminOrderNotification(order: any) {
  const customerName = order.user?.name || order.customerName
  const customerEmail = order.user?.email || order.customerEmail
  const customerPhone = order.user?.phone || order.customerPhone
  const shippingAddr = parseShippingAddress(order.shippingAddress)

  const items = order.items?.map((item: any) => {
    if (item.variant?.product) {
      return {
        name: item.variant.product.name,
        variant: `${item.variant.size} - ${item.variant.color}`,
        quantity: item.quantity,
        price: (item.price / 100).toFixed(2),
      }
    }
    return item
  }) || []

  const subtotal = order.subtotal ? (order.subtotal / 100).toFixed(2) : '0'
  const shipping = order.shipping ? (order.shipping / 100).toFixed(2) : '0'
  const total = order.total ? (order.total / 100).toFixed(2) : '0'

  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #28a745; color: #fff; padding: 20px; text-align: center;">
          <h1>🎉 New Order Received!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Order #${order.orderNumber}</h2>
          
          <div style="background: #fff; padding: 15px; margin: 15px 0; border: 1px solid #ddd;">
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'COD'}</p>
            
            <h3>Items:</h3>
            ${items.map((item: any) => `
              <p>${item.name || 'Item'} (${item.variant || 'N/A'}) x ${item.quantity} - ₹${item.price}</p>
            `).join('')}
            
            <p><strong>Subtotal:</strong> ₹${subtotal}</p>
            <p><strong>Shipping:</strong> ₹${shipping}</p>
            <p><strong>Total:</strong> ₹${total}</p>
            
            <h3>Shipping Address:</h3>
            <p>${shippingAddr.line1 || shippingAddr.address || ''}${shippingAddr.city ? `, ${shippingAddr.city}` : ''}</p>
          </div>
          
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://manthmwear.com'}/admin/orders/${order.id}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 10px;">View Order in Admin</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  // Get admin emails (comma-separated or fallback to SMTP_USER)
  const adminEmailsStr = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'noreply@manthmwear.com'
  const adminEmails = adminEmailsStr.split(',').map(email => email.trim()).filter(email => email)
  
  console.log('[ADMIN_EMAIL] Sending order notification to:', adminEmails.join(', '))
  
  // Send to all admin emails
  const results = await Promise.allSettled(
    adminEmails.map(email => 
      sendEmail({
        to: email,
        subject: `🛍️ New Order #${order.orderNumber}`,
        html: adminHtml,
      })
    )
  )
  
  // Log results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`[ADMIN_EMAIL_SENT] Order notification sent to ${adminEmails[index]}`)
    } else {
      console.error(`[ADMIN_EMAIL_ERROR] Failed to send to ${adminEmails[index]}:`, (result as PromiseRejectedResult).reason)
    }
  })
  
  return (results[0] as PromiseFulfilledResult<any> | PromiseRejectedResult).status === 'fulfilled'
    ? (results[0] as PromiseFulfilledResult<any>).value
    : { success: false }
}

export async function sendOTP(email: string, otp: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; text-align: center;">
      <div style="max-width: 500px; margin: 50px auto; padding: 40px; background: #f9f9f9; border: 1px solid #ddd;">
        <h2>Your Admin Login OTP</h2>
        <p>Use this code to login to MANTHM Admin Panel:</p>
        <div style="font-size: 32px; font-weight: bold; color: #000; background: #fff; padding: 20px; margin: 20px 0; border: 2px dashed #000;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Your Admin Login OTP - MANTHM',
    html,
  })
}
