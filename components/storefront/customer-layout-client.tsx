"use client"

import Link from "next/link"
import { User, FileText, ClipboardList, Package, LogOut, Heart, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStorefrontI18n } from "@/lib/i18n/storefront-context"

interface CustomerLayoutClientProps {
  children: React.ReactNode
  signOutAction: () => Promise<void>
}

export function CustomerLayoutClient({ children, signOutAction }: CustomerLayoutClientProps) {
  const { t } = useStorefrontI18n()

  const sidebarItems = [
    { href: "/customer", label: t.customer.profile, icon: User },
    { href: "/customer/inquiries", label: t.customer.myInquiries, icon: History },
    { href: "/customer/quotations", label: t.customer.myQuotes, icon: FileText },
    { href: "/customer/orders", label: t.customer.myOrders, icon: Package },
    { href: "/customer/favorites", label: t.customer.favorites, icon: Heart },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold text-foreground">{t.customer.title}</h1>
        <p className="text-xs sm:text-base text-muted-foreground">{t.customer.description}</p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <nav className="grid grid-cols-3 sm:grid-cols-5 lg:flex lg:flex-col gap-1 rounded-lg border border-border bg-card p-2 sm:p-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col sm:flex-row items-center lg:justify-start gap-1 sm:gap-3 rounded-md px-2 sm:px-3 py-2 text-[10px] sm:text-sm font-medium transition-colors hover:bg-muted text-center sm:text-left"
              >
                <item.icon className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="line-clamp-1">{item.label}</span>
              </Link>
            ))}
            <form action={signOutAction} className="contents lg:block">
              <Button
                type="submit"
                variant="ghost"
                className="flex flex-col sm:flex-row items-center lg:justify-start gap-1 sm:gap-3 w-full h-auto px-2 sm:px-3 py-2 text-[10px] sm:text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.common.logout}</span>
              </Button>
            </form>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
