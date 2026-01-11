import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip maintenance check for admin routes and API routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  
  if (isAdminRoute || isApiRoute) {
    return NextResponse.next()
  }

  try {
    // Check maintenance mode from API
    // Prefer internal HTTP base to avoid TLS issues between reverse proxy and app
    const internalBase = `http://127.0.0.1:${process.env.PORT || '3005'}`
    const externalBase = request.nextUrl.origin

    let settingsRes: Response | null = null
    try {
      settingsRes = await fetch(`${internalBase}/api/site-settings`, { cache: 'no-store' })
    } catch (_) {
      // Fallback to external origin if internal fetch fails
      try {
        settingsRes = await fetch(`${externalBase}/api/site-settings`, { cache: 'no-store' })
      } catch (_) {
        settingsRes = null
      }
    }
    
    if (settingsRes && settingsRes.ok) {
      const settings = await settingsRes.json()
      
      if (settings.maintenanceMode) {
        // Redirect to maintenance page
        return NextResponse.rewrite(new URL('/maintenance', request.url))
      }
    }
  } catch (error) {
    // Silently continue on any error to avoid noisy logs
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
