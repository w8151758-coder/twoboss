import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { countryToLocale, defaultLocale, locales, LOCALE_COOKIE, type Locale } from '@/lib/i18n/config'

export async function middleware(request: NextRequest) {
  // First, handle Supabase session
  const response = await updateSession(request)
  
  // Check if locale cookie exists
  const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined
  
  // If no locale cookie, detect from IP
  if (!localeCookie) {
    // Get country from Vercel's geolocation header
    const country = request.headers.get('x-vercel-ip-country') || 'US'
    
    // Map country to locale
    const detectedLocale = countryToLocale[country] || defaultLocale
    
    // Validate the locale
    const locale = locales.includes(detectedLocale as Locale) ? detectedLocale : defaultLocale
    
    // Set the locale cookie in response
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
