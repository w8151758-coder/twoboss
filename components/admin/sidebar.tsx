"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import {
  Package,
  FileText,
  FileCheck,
  Users,
  Megaphone,
  LayoutDashboard,
  ChevronDown,
  Settings,
  LogOut,
  ShoppingCart,
  Shield,
  Zap,
  MessageCircle,
  Newspaper,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"

export function AdminSidebar() {
  const pathname = usePathname()
  const { locale, t } = useI18n()
  
  const menuItems = [
    {
      title: t.sidebar.dashboard,
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: t.sidebar.products,
      icon: Package,
      children: [
        { title: locale === "zh" ? "产品分类" : "Categories", href: "/admin/categories" },
        { title: locale === "zh" ? "产品列表" : "Product List", href: "/admin/products" },
      ],
    },
    {
      title: t.sidebar.inquiries,
      href: "/admin/inquiries",
      icon: FileText,
    },
    {
      title: t.sidebar.quotes,
      icon: FileCheck,
      children: [
        { title: t.sidebar.currentQuotes, href: "/admin/quotes" },
        { title: t.sidebar.historyVersions, href: "/admin/quotes/history" },
        { title: t.sidebar.priceChanges, href: "/admin/quotes/changes" },
        { title: t.sidebar.negotiationStatus, href: "/admin/quotes/negotiation" },
      ],
    },
    {
      title: t.sidebar.orders,
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: t.sidebar.customers,
      icon: Users,
      children: [
        { title: locale === "zh" ? "客户列表" : "Customer List", href: "/admin/customers" },
        { title: locale === "zh" ? "销售跟进" : "Follow-ups", href: "/admin/followups" },
      ],
    },
    {
      title: t.sidebar.permissions,
      href: "/admin/permissions",
      icon: Shield,
    },
    {
      title: t.sidebar.marketing,
      href: "/admin/campaigns",
      icon: Megaphone,
    },
    {
      title: locale === "zh" ? "内容管理" : "Content",
      icon: Newspaper,
      children: [
        { title: locale === "zh" ? "网站设置" : "Site Settings", href: "/admin/content" },
        { title: locale === "zh" ? "新闻博客" : "Blog", href: "/admin/content/blog" },
        { title: locale === "zh" ? "帮助中心" : "Help Center", href: "/admin/content/help" },
        { title: locale === "zh" ? "像素追踪" : "Tracking", href: "/admin/content/tracking" },
      ],
    },
    {
      title: t.sidebar.automation,
      href: "/admin/automation",
      icon: Zap,
    },
    {
      title: t.sidebar.settings,
      href: "/admin/settings",
      icon: Settings,
    },
  ]
  
  const [openMenus, setOpenMenus] = useState<string[]>([t.sidebar.products, t.sidebar.customers, t.sidebar.quotes, locale === "zh" ? "内容管理" : "Content"])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            B
          </div>
          <span className="text-lg font-semibold text-foreground">
            {locale === "zh" ? "后台管理" : "Admin"}
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href
              ? pathname === item.href
              : item.children?.some((child) => pathname === child.href)
            const isOpen = openMenus.includes(item.title)

            if (item.children) {
              return (
                <li key={item.title}>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <ul className="ml-7 mt-1 space-y-1 border-l border-border pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              pathname === child.href
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            }

            return (
              <li key={item.title}>
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* WhatsApp Link */}
      <div className="border-t border-border p-4">
        <a
          href="https://wa.me/8618888888888"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {locale === "zh" ? "WhatsApp 谈价" : "WhatsApp Chat"}
        </a>
      </div>

      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {locale === "zh" ? "退出登录" : "Sign Out"}
        </Button>
      </div>
    </aside>
  )
}
