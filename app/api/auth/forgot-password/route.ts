import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Check if user exists
    if (!user) {
      console.log('[FORGOT_PASSWORD] User not found:', email)
      return NextResponse.json({ 
        error: 'No account found with this email address. Please check your email or sign up.' 
      }, { status: 404 })
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.password) {
      console.log('[FORGOT_PASSWORD] User has no password (OAuth account):', email)
      return NextResponse.json({ 
        error: 'This account uses social login. Please sign in with your social account.' 
      }, { status: 400 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Log for development
    console.log('[FORGOT_PASSWORD] Reset link for', email)
    console.log('[FORGOT_PASSWORD] Reset URL:', resetUrl)
    console.log('[FORGOT_PASSWORD] Token:', resetToken)
    console.log('[FORGOT_PASSWORD] Expires:', resetTokenExpiry)

    // Send email if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const nodemailer = require('nodemailer')
        
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        })

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `"MANTHM" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Reset Your Password - MANTHM',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #000; color: #fff; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff !important; text-decoration: none; margin: 20px 0; }
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
          `,
        })

        console.log('[FORGOT_PASSWORD] Email sent successfully to', email)
      } catch (emailError) {
        console.error('[FORGOT_PASSWORD] Failed to send email:', emailError)
        // Don't fail the request if email fails, user can still use the logged URL
      }
    } else {
      console.log('[FORGOT_PASSWORD] SMTP not configured, email not sent')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset link sent to your email',
      // Include dev info if not in production
      ...(process.env.NODE_ENV !== 'production' && {
        _dev: {
          resetUrl,
          token: resetToken,
          note: 'Check PM2 logs for reset URL'
        }
      })
    })
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
