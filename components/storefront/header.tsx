"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingCart, User, Search, Menu, X, Package, MessageCircle, FileText, ClipboardList, History, Heart, Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useStorefrontI18n } from "@/lib/i18n/storefront-context"
import { LanguageSwitcher } from "./language-switcher"
import { useSiteSettings } from "@/lib/hooks/use-site-settings"

interface HeaderProps {
  user?: { id?: string; email?: string; name?: string | null; company_name?: string | null; whatsapp?: string | null; country?: string | null; role?: string | null } | null
}

const isAdmin = (role?: string | null) => {
  return role === 'admin' || role === 'sales' || role === 'product_manager' || role === 'marketing'
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems, isLoaded } = useCart()
  const { t } = useStorefrontI18n()
  const { settings } = useSiteSettings()

  const navItems = [
    { href: "/", label: t.common.home },
    { href: "/products", label: t.common.products },
    { href: "/blog", label: t.common.blog },
    { href: "/help", label: t.common.help },
    { href: "/about", label: t.common.about },
  ]

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar - Soft Ocean Gradient */}
      <div className="bg-gradient-to-r from-[#5B8FB9] via-[#7AB8B8] to-[#B8C98F]">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 text-xs text-white">
          <div className="flex items-center gap-4">
            <span className="font-medium">{t.hero.badge}</span>
            <span className="hidden sm:inline text-white/50">|</span>
            <span className="hidden sm:inline text-white/85">{t.hero.minOrder} · {t.hero.customLogo} · {t.features.delivery}</span>
          </div>
          <a 
            href={`https://wa.me/${settings.whatsapp_number || "8618888888888"}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] px-3 py-1 rounded-full transition-colors font-medium"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo - 支持自定义Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {settings.logo_url ? (
            <Image
              src={settings.logo_url}
              alt={settings.site_name || "Logo"}
              width={160}
              height={40}
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
          ) : (
            <>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B8FB9] to-[#7AB8B8] transition-transform group-hover:scale-105 shadow-sm">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground hidden sm:inline">{settings.site_name || "MenswearWholesale"}</span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm rounded-lg transition-colors",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "text-[#5B8FB9] bg-[#5B8FB9]/10 font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder={t.header.searchPlaceholder}
                  className="w-48 h-9 text-sm"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
                <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="h-9 w-9">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher variant="default" />

          {/* Cart */}
          <Link href="/inquiry-cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-4 w-4" />
              {isLoaded && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5B8FB9] text-white text-[10px] font-medium">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* User */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user.company_name || user.name || t.header.customerCenter}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/customer" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t.customer.profile}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/customer/inquiries" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    {t.customer.myInquiries}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/customer/quotations" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t.customer.myQuotes}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/customer/orders" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    {t.customer.myOrders}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/customer/favorites" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {t.common.view}
                  </Link>
                </DropdownMenuItem>
                {isAdmin(user.role) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/admin" className="flex items-center gap-2 font-medium">
                        <Settings className="h-4 w-4" />
                        Admin Panel
                      </a>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="h-9 px-6 rounded-lg bg-gradient-to-r from-[#5B8FB9] to-[#7AB8B8] hover:opacity-90 text-white">
                {t.common.login}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-1 lg:hidden">
          {/* Language Switcher - Mobile */}
          <LanguageSwitcher variant="compact" />

          <Link href="/inquiry-cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-4 w-4" />
              {isLoaded && totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5B8FB9] text-white text-[10px] font-medium">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-8 pt-8">
                <Input 
                  type="search" 
                  placeholder={t.header.searchPlaceholder}
                  className="h-10"
                />
                
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-sm tracking-widest transition-colors",
                        pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                          ? "text-foreground font-medium" 
                          : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="border-t border-border pt-6">
                  {user ? (
                    <div className="space-y-4">
                      <p className="text-xs tracking-widest text-muted-foreground">{t.header.customerCenter}</p>
                      <Link href="/customer" className="block text-sm">{t.customer.profile}</Link>
                      <Link href="/customer/orders" className="block text-sm">{t.customer.myOrders}</Link>
                      {isAdmin(user.role) && (
                        <a href="/admin" className="block text-sm font-medium">Admin Panel</a>
                      )}
                    </div>
                  ) : (
                    <Link href="/auth/login">
                      <Button className="w-full h-10 rounded-lg bg-gradient-to-r from-[#5B8FB9] to-[#7AB8B8] hover:opacity-90">{t.common.login} / {t.common.register}</Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
