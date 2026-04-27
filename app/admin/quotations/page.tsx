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

export default function QuotationsPage() {
  const { locale } = useI18n()
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  const statusLabels: Record<string, { zh: string; en: string }> = {
    draft: { zh: "草稿", en: "Draft" },
    sent: { zh: "已发送", en: "Sent" },
    accepted: { zh: "已接受", en: "Accepted" },
    rejected: { zh: "已拒绝", en: "Rejected" },
    expired: { zh: "已过期", en: "Expired" },
  }

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline",
    sent: "default",
    accepted: "secondary",
    rejected: "destructive",
    expired: "outline",
  }

  const t = {
    title: locale === "zh" ? "报价管理" : "Quotation Management",
    subtitle: locale === "zh" ? "管理报价单" : "Manage quotations",
    list: locale === "zh" ? "报价列表" : "Quotation List",
    searchPlaceholder: locale === "zh" ? "搜索报价单号或客户..." : "Search quotation or customer...",
    allStatus: locale === "zh" ? "全部状态" : "All Status",
    filter: locale === "zh" ? "筛选" : "Filter",
    quotationNo: locale === "zh" ? "报价单号" : "Quotation No.",
    customer: locale === "zh" ? "客户" : "Customer",
    totalAmount: locale === "zh" ? "总金额" : "Total",
    discount: locale === "zh" ? "折扣" : "Discount",
    finalAmount: locale === "zh" ? "最终金额" : "Final",
    status: locale === "zh" ? "状态" : "Status",
    createdAt: locale === "zh" ? "创建时间" : "Created",
    actions: locale === "zh" ? "操作" : "Actions",
    viewDetails: locale === "zh" ? "查看详情" : "View Details",
    noQuotations: locale === "zh" ? "暂无报价记录" : "No quotations found",
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
      .from("quotations")
      .select("*", { count: "exact" })

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`quotation_no.ilike.%${search}%,company_name.ilike.%${search}%`)
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    setQuotations(data || [])
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
          ) : quotations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.quotationNo}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.totalAmount}</TableHead>
                  <TableHead>{t.discount}</TableHead>
                  <TableHead>{t.finalAmount}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.createdAt}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium">{quotation.quotation_no}</TableCell>
                    <TableCell>{quotation.company_name || "-"}</TableCell>
                    <TableCell>¥{Number(quotation.total_amount).toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">
                      {quotation.discount_amount > 0 ? `-¥${Number(quotation.discount_amount).toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      ¥{Number(quotation.final_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[quotation.status]}>
                        {statusLabels[quotation.status]?.[locale] || quotation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(quotation.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/quotations/${quotation.id}`}>
                        <Button size="sm" variant="outline">
                          {t.viewDetails}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              {t.noQuotations}
            </div>
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
