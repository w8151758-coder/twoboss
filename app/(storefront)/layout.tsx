import { cookies } from "next/headers"
import { Header } from "@/components/storefront/header"
import { Footer } from "@/components/storefront/footer"
import { CartProvider } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/server"
import { TrackingScripts } from "@/components/tracking-scripts"
import { StorefrontI18nProvider } from "@/lib/i18n/storefront-context"
import { LOCALE_COOKIE, defaultLocale, locales, type Locale, isRTL } from "@/lib/i18n/config"
import { DynamicFavicon } from "@/components/dynamic-favicon"

// 允许部分静态生成，5分钟重新验证
export const revalidate = 300

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Parallel fetch user and locale
  const [supabase, cookieStore] = await Promise.all([
    createClient(),
    cookies()
  ])
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, email, name, company_name, whatsapp, country, role")
      .eq("id", user.id)
      .single()
    
    profile = profileData
  }

  // Get locale from cookie
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined
  const initialLocale = localeCookie && locales.includes(localeCookie) ? localeCookie : defaultLocale
  const rtl = isRTL(initialLocale)

  return (
    <StorefrontI18nProvider initialLocale={initialLocale}>
      <CartProvider>
        <TrackingScripts />
        <DynamicFavicon />
        <div className="flex min-h-screen flex-col" dir={rtl ? 'rtl' : 'ltr'}>
          <Header user={profile} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </StorefrontI18nProvider>
  )
}
