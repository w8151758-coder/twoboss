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

export default function InquiriesPage() {
  const { locale } = useI18n()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  const statusLabels: Record<string, { zh: string; en: string }> = {
    new: { zh: "新询价", en: "New" },
    pending_quote: { zh: "待报价", en: "Pending Quote" },
    quoted: { zh: "已报价", en: "Quoted" },
    negotiating: { zh: "谈判中", en: "Negotiating" },
    converted: { zh: "已成交", en: "Converted" },
    lost: { zh: "已流失", en: "Lost" },
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    pending_quote: "bg-amber-100 text-amber-700",
    quoted: "bg-green-100 text-green-700",
    negotiating: "bg-purple-100 text-purple-700",
    converted: "bg-emerald-100 text-emerald-700",
    lost: "bg-gray-100 text-gray-700",
  }

  const t = {
    title: locale === "zh" ? "询价管理" : "Inquiries",
    subtitle: locale === "zh" ? "管理客户询价请求" : "Manage customer inquiry requests",
    list: locale === "zh" ? "询价列表" : "Inquiry List",
    searchPlaceholder: locale === "zh" ? "搜索询价编号..." : "Search inquiry number...",
    allStatus: locale === "zh" ? "全部状态" : "All Status",
    filter: locale === "zh" ? "筛选" : "Filter",
    inquiryNo: locale === "zh" ? "询价编号" : "Inquiry No.",
    customer: locale === "zh" ? "客户" : "Customer",
    contact: locale === "zh" ? "联系方式" : "Contact",
    type: locale === "zh" ? "类型" : "Type",
    items: locale === "zh" ? "产品数" : "Items",
    country: locale === "zh" ? "国家/地区" : "Country",
    budget: locale === "zh" ? "预算" : "Budget",
    status: locale === "zh" ? "状态" : "Status",
    date: locale === "zh" ? "日期" : "Date",
    actions: locale === "zh" ? "操作" : "Actions",
    view: locale === "zh" ? "查看" : "View",
    createQuote: locale === "zh" ? "创建报价" : "Create Quote",
    noInquiries: locale === "zh" ? "暂无询价" : "No inquiries found",
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

    // 先查询询价基本信息
    let query = supabase
      .from("inquiries")
      .select(`
        *,
        inquiry_items(count)
      `, { count: "exact" })

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`inquiry_no.ilike.%${search}%`)
    }

    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    // 为有 user_id 的询价获取用户注册信息
    if (data && data.length > 0) {
      // 获取所有有 user_id 的询价
      const userIds = data.filter(i => i.user_id).map(i => i.user_id)
      
      let profilesMap: Record<string, any> = {}
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email, company_name, whatsapp, country")
          .in("id", userIds)
        
        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = p
            return acc
          }, {} as Record<string, any>)
        }
      }

      // 合并用户信息到询价数据中
      const enrichedData = data.map(inquiry => {
        const profile = inquiry.user_id ? profilesMap[inquiry.user_id] : null
        return {
          ...inquiry,
          // 优先使用询价表中的信息，如果没有则使用用户注册信息
          display_company: inquiry.company_name || profile?.company_name || null,
          display_contact: inquiry.contact_name || profile?.name || null,
          display_email: inquiry.contact_email || profile?.email || null,
          display_whatsapp: inquiry.contact_whatsapp || profile?.whatsapp || null,
          display_country: inquiry.country || profile?.country || null,
        }
      })

      setInquiries(enrichedData)
    } else {
      setInquiries([])
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
          ) : inquiries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.inquiryNo}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.contact}</TableHead>
                  <TableHead>{t.type}</TableHead>
                  <TableHead>{t.items}</TableHead>
                  <TableHead>{t.country}</TableHead>
                  <TableHead>{t.budget}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.date}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.inquiry_no}</TableCell>
                    <TableCell>{inquiry.display_company || inquiry.display_contact || "-"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{inquiry.display_email || "-"}</div>
                        {inquiry.display_whatsapp && (
                          <div className="text-muted-foreground">{inquiry.display_whatsapp}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {inquiry.inquiry_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{inquiry.inquiry_items?.[0]?.count || 0}</TableCell>
                    <TableCell>{inquiry.display_country || "-"}</TableCell>
                    <TableCell>{inquiry.budget || "-"}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[inquiry.status]}>
                        {statusLabels[inquiry.status]?.[locale] || inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(inquiry.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/inquiries/${inquiry.id}`}>
                          <Button size="sm" variant="outline">{t.view}</Button>
                        </Link>
                        {inquiry.status === "new" && (
                          <Link href={`/admin/quotes/new?inquiry=${inquiry.id}`}>
                            <Button size="sm">{t.createQuote}</Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">{t.noInquiries}</div>
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
