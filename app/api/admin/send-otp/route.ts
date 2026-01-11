import { NextRequest, NextResponse } from 'next/server'
import { sendOTP } from '@/lib/email'
import { otpStore } from '@/lib/otp-store'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get admin emails from environment (comma-separated list)
    const adminEmailsEnv = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.SMTP_USER
    
    if (!adminEmailsEnv) {
      console.error('[OTP_ERROR] No admin emails configured in environment variables')
      return NextResponse.json({ error: 'Admin authentication not configured. Please contact support.' }, { status: 500 })
    }

    // Parse admin emails (support comma-separated list)
    const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase())
    const inputEmail = email.trim().toLowerCase()

    if (!adminEmails.includes(inputEmail)) {
      console.warn(`[OTP_UNAUTHORIZED] Email ${email} is not in the authorized admin list`)
      return NextResponse.json({ 
        error: 'Unauthorized email. This email is not authorized for admin access.' 
      }, { status: 403 })
    }

    console.log(`[OTP_REQUEST] Authorized admin email: ${email}`)

    // Generate 6-digit OTP
    const otp = otpStore.generateOTP()
    
    // Store OTP (expires in 10 minutes)
    otpStore.set(email, otp)

    // Send OTP email
    const result = await sendOTP(email, otp)

    if (result.success) {
      console.log(`[OTP_SENT] Email: ${email}, OTP: ${otp}`)
      return NextResponse.json({ success: true, message: 'OTP sent to your email' })
    } else {
      return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[SEND_OTP_ERROR]', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
