"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Building2, Mail, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export default function CustomersPage() {
  const { locale } = useI18n()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 12

  const t = {
    title: locale === "zh" ? "客户管理" : "Customers",
    subtitle: locale === "zh" ? "管理客户账户和CRM" : "Manage customer accounts and CRM",
    searchPlaceholder: locale === "zh" ? "搜索公司、姓名、邮箱..." : "Search by company, name, email...",
    search: locale === "zh" ? "搜索" : "Search",
    noCompany: locale === "zh" ? "无公司名称" : "No Company",
    noName: locale === "zh" ? "无姓名" : "No Name",
    inquiries: locale === "zh" ? "询价" : "Inquiries",
    quotes: locale === "zh" ? "报价" : "Quotes",
    orders: locale === "zh" ? "订单" : "Orders",
    viewDetails: locale === "zh" ? "查看详情" : "View Details",
    joined: locale === "zh" ? "注册时间:" : "Joined:",
    noCustomers: locale === "zh" ? "暂无客户" : "No customers found",
    previous: locale === "zh" ? "上一页" : "Previous",
    next: locale === "zh" ? "下一页" : "Next",
    page: locale === "zh" ? "页" : "Page",
    of: locale === "zh" ? "/" : "of",
  }

  useEffect(() => {
    loadData()
  }, [page, search])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    // 查询客户基本信息
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("role", "customer")

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    // 为每个客户获取真实的统计数据
    if (data && data.length > 0) {
      const customersWithStats = await Promise.all(
        data.map(async (customer) => {
          // 查询询价数量
          const { count: inquiryCount } = await supabase
            .from("inquiries")
            .select("*", { count: "exact", head: true })
            .eq("user_id", customer.id)

          // 查询报价数量
          const { count: quoteCount } = await supabase
            .from("quotes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", customer.id)

          // 查询订单数量
          let orderCount = 0
          const { count: oCount } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("user_id", customer.id)
          orderCount = oCount || 0

          return {
            ...customer,
            inquiry_count: inquiryCount || 0,
            quote_count: quoteCount || 0,
            order_count: orderCount,
          }
        })
      )
      setCustomers(customersWithStats)
    } else {
      setCustomers([])
    }

    setTotalPages(Math.ceil((count || 0) / pageSize))
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80 pl-10"
            />
          </div>
          <Button onClick={() => { setPage(1); loadData(); }}>{t.search}</Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : customers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  {customer.company_name || t.noCompany}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">
                    {customer.name || t.noName}
                  </span>
                  {customer.country && (
                    <Badge variant="outline" className="text-xs">{customer.country}</Badge>
                  )}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </div>
                )}
                {customer.whatsapp && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {customer.whatsapp}
                  </div>
                )}
                
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{customer.inquiry_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{t.inquiries}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{customer.quote_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{t.quotes}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{customer.order_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{t.orders}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/admin/customers/${customer.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      {t.viewDetails}
                    </Button>
                  </Link>
                  {customer.whatsapp && (
                    <a
                      href={`https://wa.me/${customer.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="text-green-600">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {t.joined} {new Date(customer.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.noCustomers}
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t.page} {page} {t.of} {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t.previous}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {t.next}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
