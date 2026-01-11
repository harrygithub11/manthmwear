import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Admin email list (env-driven with fallback)
const ENV_LIST = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)
const SINGLE_ADMIN = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const combinedEnvAdmins = [...ENV_LIST]
if (SINGLE_ADMIN) {
  combinedEnvAdmins.push(SINGLE_ADMIN)
}

const ADMIN_EMAILS = combinedEnvAdmins.length
  ? combinedEnvAdmins.filter((email, index, arr) => arr.indexOf(email) === index)
  : [
      'priyanshu@manthm.com',
      'ankit@manthm.com',
      'ayush@manthm.com',
    ]

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessionEmail = (session.user.email || '').toLowerCase()
  if (!ADMIN_EMAILS.includes(sessionEmail)) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
  }

  return null // No error, proceed
}
