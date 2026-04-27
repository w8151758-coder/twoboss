"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const { locale } = useI18n()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  const statusLabels: Record<string, { zh: string; en: string }> = {
    pending_payment: { zh: "待付款", en: "Pending Payment" },
    paid: { zh: "已付款", en: "Paid" },
    in_production: { zh: "生产中", en: "In Production" },
    production_done: { zh: "生产完成", en: "Production Done" },
    shipping: { zh: "运输中", en: "Shipping" },
    delivered: { zh: "已送达", en: "Delivered" },
    completed: { zh: "已完成", en: "Completed" },
    cancelled: { zh: "已取消", en: "Cancelled" },
  }

  const statusColors: Record<string, string> = {
    pending_payment: "bg-amber-100 text-amber-700",
    paid: "bg-blue-100 text-blue-700",
    in_production: "bg-indigo-100 text-indigo-700",
    production_done: "bg-purple-100 text-purple-700",
    shipping: "bg-cyan-100 text-cyan-700",
    delivered: "bg-teal-100 text-teal-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  }

  const t = {
    title: locale === "zh" ? "订单管理" : "Orders",
    subtitle: locale === "zh" ? "管理客户订单和跟踪履约" : "Manage customer orders and track fulfillment",
    list: locale === "zh" ? "订单列表" : "Order List",
    searchPlaceholder: locale === "zh" ? "搜索订单编号..." : "Search order number...",
    allStatus: locale === "zh" ? "全部状态" : "All Status",
    filter: locale === "zh" ? "筛选" : "Filter",
    orderNo: locale === "zh" ? "订单编号" : "Order No.",
    quote: locale === "zh" ? "报价单" : "Quote",
    customer: locale === "zh" ? "客户" : "Customer",
    items: locale === "zh" ? "产品数" : "Items",
    total: locale === "zh" ? "总金额" : "Total",
    paid: locale === "zh" ? "已付" : "Paid",
    status: locale === "zh" ? "状态" : "Status",
    date: locale === "zh" ? "日期" : "Date",
    actions: locale === "zh" ? "操作" : "Actions",
    view: locale === "zh" ? "查看" : "View",
    noOrders: locale === "zh" ? "暂无订单" : "No orders found",
    previous: locale === "zh" ? "上一页" : "Previous",
    next: locale === "zh" ? "下一页" : "Next",
    page: locale === "zh" ? "页" : "Page",
    of: locale === "zh" ? "/" : "of",
  }

  useEffect(() => {
    loadData()
  }, [page, search, status])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("orders")
      .select(`
        *,
        profiles(name, company_name, email),
        quotes(quote_no),
        order_items(count)
      `, { count: "exact" })

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`order_no.ilike.%${search}%`)
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    setOrders(data || [])
    setTotalPages(Math.ceil((count || 0) / pageSize))
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.list}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t.allStatus}</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{locale === "zh" ? label.zh : label.en}</option>
                ))}
              </select>
              <Button onClick={() => { setPage(1); loadData(); }}>{t.filter}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.orderNo}</TableHead>
                  <TableHead>{t.quote}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.items}</TableHead>
                  <TableHead>{t.total}</TableHead>
                  <TableHead>{t.paid}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.date}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_no}</TableCell>
                    <TableCell>
                      {order.quotes?.quote_no ? (
                        <Link href={`/admin/quotes/${order.quote_id}`} className="text-primary hover:underline">
                          {order.quotes.quote_no}
                        </Link>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{order.profiles?.company_name || order.profiles?.name || "-"}</TableCell>
                    <TableCell>{order.order_items?.[0]?.count || 0}</TableCell>
                    <TableCell className="font-medium">
                      ${Number(order.total_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600">
                      ${Number(order.paid_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]?.[locale] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button size="sm" variant="outline">{t.view}</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">{t.noOrders}</div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
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
        </CardContent>
      </Card>
    </div>
  )
}
