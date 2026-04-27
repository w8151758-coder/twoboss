"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, FileText, FileCheck, Users, TrendingUp, Clock, DollarSign, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

interface DashboardData {
  productCount: number
  inquiryCount: number
  quoteCount: number
  orderCount: number
  customerCount: number
  recentInquiries: any[]
  recentQuotes: any[]
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const { locale, t } = useI18n()

  const stats = [
    {
      title: locale === "zh" ? "产品总数" : "Total Products",
      value: data.productCount || 0,
      icon: Package,
      href: "/admin/products",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: locale === "zh" ? "待处理询价" : "Pending Inquiries",
      value: data.inquiryCount || 0,
      icon: FileText,
      href: "/admin/inquiries",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: locale === "zh" ? "草稿报价单" : "Draft Quotes",
      value: data.quoteCount || 0,
      icon: FileCheck,
      href: "/admin/quotes",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: locale === "zh" ? "订单总数" : "Total Orders",
      value: data.orderCount || 0,
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ]

  const statusLabels: Record<string, Record<string, string>> = {
    zh: {
      new: "新询价",
      pending_quote: "待报价",
      quoted: "已报价",
      negotiating: "谈判中",
      converted: "已成交",
      lost: "已流失",
      draft: "草稿",
      sent: "已发送",
      viewed: "已查看",
      confirmed: "已确认",
      expired: "已过期",
    },
    en: {
      new: "New",
      pending_quote: "Pending",
      quoted: "Quoted",
      negotiating: "Negotiating",
      converted: "Converted",
      lost: "Lost",
      draft: "Draft",
      sent: "Sent",
      viewed: "Viewed",
      confirmed: "Confirmed",
      expired: "Expired",
    },
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    pending_quote: "bg-amber-100 text-amber-700",
    quoted: "bg-primary/10 text-primary",
    negotiating: "bg-purple-100 text-purple-700",
    converted: "bg-green-100 text-green-700",
    lost: "bg-gray-100 text-gray-700",
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    viewed: "bg-indigo-100 text-indigo-700",
    confirmed: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
        <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              {locale === "zh" ? "最近询价" : "Recent Inquiries"}
            </CardTitle>
            <Link href="/admin/inquiries" className="text-sm text-primary hover:underline">
              {t.dashboard.viewAll}
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentInquiries && data.recentInquiries.length > 0 ? (
              <div className="space-y-4">
                {data.recentInquiries.map((inquiry: any) => (
                  <Link
                    key={inquiry.id}
                    href={`/admin/inquiries/${inquiry.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium text-foreground">{inquiry.inquiry_no}</p>
                      <p className="text-sm text-muted-foreground">
                        {inquiry.profiles?.company_name || inquiry.profiles?.name || (locale === "zh" ? "未知客户" : "Unknown")}
                      </p>
                    </div>
                    <Badge className={statusColors[inquiry.status]}>
                      {statusLabels[locale][inquiry.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {locale === "zh" ? "暂无询价记录" : "No inquiries yet"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Quotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              {locale === "zh" ? "最近报价单" : "Recent Quotes"}
            </CardTitle>
            <Link href="/admin/quotes" className="text-sm text-primary hover:underline">
              {t.dashboard.viewAll}
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentQuotes && data.recentQuotes.length > 0 ? (
              <div className="space-y-4">
                {data.recentQuotes.map((quote: any) => (
                  <Link
                    key={quote.id}
                    href={`/admin/quotes/${quote.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium text-foreground">{quote.quote_no}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.profiles?.company_name || quote.profiles?.name || (locale === "zh" ? "未知客户" : "Unknown")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ¥{Number(quote.total_amount || 0).toLocaleString()}
                      </p>
                      <Badge className={statusColors[quote.status]}>
                        {statusLabels[locale][quote.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {locale === "zh" ? "暂无报价单" : "No quotes yet"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "快捷操作" : "Quick Actions"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/products/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Package className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">
                {locale === "zh" ? "添加产品" : "Add Product"}
              </span>
            </Link>
            <Link
              href="/admin/inquiries"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <FileText className="h-8 w-8 text-amber-600" />
              <span className="text-sm font-medium">
                {locale === "zh" ? "处理询价" : "Handle Inquiries"}
              </span>
            </Link>
            <Link
              href="/admin/customers"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-600" />
              <span className="text-sm font-medium">
                {locale === "zh" ? "客户管理" : "Customers"}
              </span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium">
                {locale === "zh" ? "订单管理" : "Orders"}
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
