"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
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

export default function QuotesPage() {
  const { locale } = useI18n()
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  const statusLabels: Record<string, { zh: string; en: string }> = {
    draft: { zh: "草稿", en: "Draft" },
    sent: { zh: "已发送", en: "Sent" },
    viewed: { zh: "已查看", en: "Viewed" },
    negotiating: { zh: "谈判中", en: "Negotiating" },
    confirmed: { zh: "已确认", en: "Confirmed" },
    expired: { zh: "已过期", en: "Expired" },
  }

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    viewed: "bg-indigo-100 text-indigo-700",
    negotiating: "bg-purple-100 text-purple-700",
    confirmed: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-700",
  }

  const t = {
    title: locale === "zh" ? "报价单管理" : "Quotations",
    subtitle: locale === "zh" ? "管理客户报价单" : "Manage price quotations for customers",
    newQuote: locale === "zh" ? "新建报价" : "New Quote",
    list: locale === "zh" ? "报价单列表" : "Quote List",
    searchPlaceholder: locale === "zh" ? "搜索报价单编号..." : "Search quote number...",
    allStatus: locale === "zh" ? "全部状态" : "All Status",
    filter: locale === "zh" ? "筛选" : "Filter",
    quoteNo: locale === "zh" ? "报价单号" : "Quote No.",
    inquiry: locale === "zh" ? "询价单" : "Inquiry",
    customer: locale === "zh" ? "客户" : "Customer",
    items: locale === "zh" ? "产品数" : "Items",
    total: locale === "zh" ? "总金额" : "Total",
    version: locale === "zh" ? "版本" : "Version",
    status: locale === "zh" ? "状态" : "Status",
    validUntil: locale === "zh" ? "有效期" : "Valid Until",
    actions: locale === "zh" ? "操作" : "Actions",
    view: locale === "zh" ? "查看" : "View",
    edit: locale === "zh" ? "编辑" : "Edit",
    noQuotes: locale === "zh" ? "暂无报价单" : "No quotations found",
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
      .from("quotes")
      .select(`
        *,
        inquiries(inquiry_no, contact_name, company_name),
        quote_items(count)
      `, { count: "exact" })

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`quote_no.ilike.%${search}%`)
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    setQuotes(data || [])
    setTotalPages(Math.ceil((count || 0) / pageSize))
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Link href="/admin/quotes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.newQuote}
          </Button>
        </Link>
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
          ) : quotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.quoteNo}</TableHead>
                  <TableHead>{t.inquiry}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.items}</TableHead>
                  <TableHead>{t.total}</TableHead>
                  <TableHead>{t.version}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.validUntil}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quote_no}</TableCell>
                    <TableCell>
                      {quote.inquiries?.inquiry_no ? (
                        <Link href={`/admin/inquiries/${quote.inquiry_id}`} className="text-primary hover:underline">
                          {quote.inquiries.inquiry_no}
                        </Link>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{quote.inquiries?.company_name || quote.inquiries?.contact_name || "-"}</TableCell>
                    <TableCell>{quote.quote_items?.[0]?.count || 0}</TableCell>
                    <TableCell className="font-medium text-accent">
                      ${Number(quote.total_amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>v{quote.current_version}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[quote.status]}>
                        {statusLabels[quote.status]?.[locale] || quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      }) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/quotes/${quote.id}`}>
                          <Button size="sm" variant="outline">{t.view}</Button>
                        </Link>
                        {quote.status === "draft" && (
                          <Link href={`/admin/quotes/${quote.id}/edit`}>
                            <Button size="sm">{t.edit}</Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">{t.noQuotes}</div>
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
