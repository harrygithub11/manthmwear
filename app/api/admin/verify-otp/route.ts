import { NextRequest, NextResponse } from 'next/server'
import { otpStore } from '@/lib/otp-store'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })
    }

    // Verify OTP using shared store
    const result = otpStore.verify(email, otp)
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    // Generate admin token
    const token = 'YWRtaW4' + Date.now().toString(36)

    console.log(`[OTP_VERIFIED] Email: ${email}`)

    return NextResponse.json({
      success: true,
      token,
      message: 'OTP verified successfully',
    })
  } catch (error: any) {
    console.error('[VERIFY_OTP_ERROR]', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
