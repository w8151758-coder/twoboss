"use client"

import Link from "next/link"
import { MessageCircle, Mail, MapPin, Phone, Package } from "lucide-react"
import { useStorefrontI18n, interpolate } from "@/lib/i18n/storefront-context"

export function Footer() {
  const { t } = useStorefrontI18n()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:py-14">
        {/* Mobile: Brand + Social at top */}
        <div className="mb-6 sm:mb-0 sm:hidden">
          <Link href="/" className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#5B8FB9] to-[#7AB8B8]">
              <Package className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-semibold text-foreground">{t.hero.title}{t.hero.subtitle}</span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {t.footer.description}
          </p>
          <div className="flex gap-2">
            <a href="#" className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5B8FB9]/10 hover:bg-[#5B8FB9] hover:text-white text-[#5B8FB9] transition-colors">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7AB8B8]/10 hover:bg-[#7AB8B8] hover:text-white text-[#7AB8B8] transition-colors">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#95C4A0]/10 hover:bg-[#95C4A0] hover:text-white text-[#95C4A0] transition-colors">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>

        {/* Mobile: 2x2 grid for links */}
        <div className="grid grid-cols-2 gap-4 sm:hidden">
          {/* Products */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2">{t.footer.productCategories}</h4>
            <nav className="flex flex-col gap-1.5">
              <Link href="/products?category=t-shirts" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.tshirt}</Link>
              <Link href="/products?category=polo-shirts" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.polo}</Link>
              <Link href="/products?category=hoodies" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.hoodie}</Link>
              <Link href="/products?category=jackets" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.jacket}</Link>
              <Link href="/products?category=pants" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.pants}</Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2">{t.footer.helpSupport}</h4>
            <nav className="flex flex-col gap-1.5">
              <Link href="/help" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.helpCenter}</Link>
              <Link href="/about" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.aboutUs}</Link>
              <Link href="/inquiry-cart" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.common.inquiryCart}</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.privacyPolicy}</Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.termsOfService}</Link>
            </nav>
          </div>
        </div>

        {/* Mobile: Contact info */}
        <div className="mt-4 pt-4 border-t border-slate-200 sm:hidden">
          <h4 className="text-xs font-semibold text-foreground mb-2">{t.footer.contactUs}</h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            <a 
              href="https://wa.me/8613800138000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#25D366] font-medium"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-[#5B8FB9]" />
              <span>sales@example.com</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-[#7AB8B8]" />
              <span>+86 138 0013 8000</span>
            </div>
          </div>
        </div>

        {/* Desktop: Original 4-column layout */}
        <div className="hidden sm:grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B8FB9] to-[#7AB8B8]">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">{t.hero.title}{t.hero.subtitle}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {t.footer.description}
            </p>
            <div className="flex gap-2">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B8FB9]/10 hover:bg-[#5B8FB9] hover:text-white text-[#5B8FB9] transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7AB8B8]/10 hover:bg-[#7AB8B8] hover:text-white text-[#7AB8B8] transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#95C4A0]/10 hover:bg-[#95C4A0] hover:text-white text-[#95C4A0] transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-5">{t.footer.productCategories}</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/products?category=t-shirts" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.tshirt}</Link>
              <Link href="/products?category=polo-shirts" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.polo}</Link>
              <Link href="/products?category=hoodies" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.hoodie}</Link>
              <Link href="/products?category=jackets" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.jacket}</Link>
              <Link href="/products?category=pants" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.pants}</Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-5">{t.footer.helpSupport}</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/help" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.helpCenter}</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.aboutUs}</Link>
              <Link href="/inquiry-cart" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.common.inquiryCart}</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.privacyPolicy}</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-[#5B8FB9] transition-colors">{t.footer.termsOfService}</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-5">{t.footer.contactUs}</h4>
            <div className="space-y-3">
              <a 
                href="https://wa.me/8613800138000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-[#25D366] hover:text-[#128C7E] transition-colors font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{t.help.whatsappConsult}</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-[#5B8FB9]" />
                <span>sales@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-[#7AB8B8]" />
                <span>+86 138 0013 8000</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-[#95C4A0]" />
                <span>{t.footer.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar - Soft Ocean Gradient */}
      <div className="bg-gradient-to-r from-[#5B8FB9] via-[#7AB8B8] to-[#B8C98F]">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-white/90">
            <p>{interpolate(t.footer.copyright, { year: String(currentYear) })}</p>
            <p>{t.footer.workingHours}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
