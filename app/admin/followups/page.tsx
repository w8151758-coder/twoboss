"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Video, MessageCircle, MoreHorizontal, Calendar } from "lucide-react"
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

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  visit: Video,
  wechat: MessageCircle,
  other: MoreHorizontal,
}

export default function FollowupsPage() {
  const { locale } = useI18n()
  const [followups, setFollowups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpcoming, setShowUpcoming] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 15

  const typeLabels: Record<string, { zh: string; en: string }> = {
    call: { zh: "电话", en: "Call" },
    email: { zh: "邮件", en: "Email" },
    visit: { zh: "拜访", en: "Visit" },
    wechat: { zh: "微信", en: "WeChat" },
    other: { zh: "其他", en: "Other" },
  }

  const t = {
    title: locale === "zh" ? "跟进记录" : "Follow-ups",
    subtitle: locale === "zh" ? "查看所有客户跟进记录" : "View all customer follow-up records",
    viewAll: locale === "zh" ? "查看全部" : "View All",
    upcoming: locale === "zh" ? "待办跟进" : "Upcoming",
    allRecords: locale === "zh" ? "全部记录" : "All Records",
    upcomingTitle: locale === "zh" ? "待办跟进" : "Upcoming Follow-ups",
    type: locale === "zh" ? "类型" : "Type",
    customer: locale === "zh" ? "客户" : "Customer",
    content: locale === "zh" ? "跟进内容" : "Content",
    sales: locale === "zh" ? "跟进人" : "Sales",
    nextAction: locale === "zh" ? "下次行动" : "Next Action",
    date: locale === "zh" ? "时间" : "Date",
    actions: locale === "zh" ? "操作" : "Actions",
    viewCustomer: locale === "zh" ? "查看客户" : "View Customer",
    noFollowups: locale === "zh" ? "暂无跟进记录" : "No follow-up records",
    previous: locale === "zh" ? "上一页" : "Previous",
    next: locale === "zh" ? "下一页" : "Next",
    page: locale === "zh" ? "页" : "Page",
    of: locale === "zh" ? "/" : "of",
  }

  useEffect(() => {
    loadData()
  }, [page, showUpcoming])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("customer_followups")
      .select(`
        *,
        customer:profiles!customer_followups_customer_id_fkey(id, company_name, name),
        sales:profiles!customer_followups_sales_id_fkey(name)
      `, { count: "exact" })

    if (showUpcoming) {
      query = query
        .gte("next_action_date", new Date().toISOString().split("T")[0])
        .not("next_action_date", "is", null)
        .order("next_action_date", { ascending: true })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    const { data, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1)

    setFollowups(data || [])
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
        <div className="flex items-center gap-2">
          <Button 
            variant={showUpcoming ? "default" : "outline"}
            onClick={() => { setShowUpcoming(!showUpcoming); setPage(1); }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {showUpcoming ? t.viewAll : t.upcoming}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {showUpcoming ? t.upcomingTitle : t.allRecords}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : followups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.type}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.content}</TableHead>
                  <TableHead>{t.sales}</TableHead>
                  <TableHead>{t.nextAction}</TableHead>
                  <TableHead>{t.date}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followups.map((followup) => {
                  const Icon = typeIcons[followup.type] || MoreHorizontal
                  return (
                    <TableRow key={followup.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary">
                            {typeLabels[followup.type]?.[locale] || followup.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/customers/${followup.customer?.id}`}
                          className="font-medium hover:underline"
                        >
                          {followup.customer?.company_name || followup.customer?.name || "-"}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {followup.content}
                      </TableCell>
                      <TableCell>{followup.sales?.name || "-"}</TableCell>
                      <TableCell>
                        {followup.next_action ? (
                          <div>
                            <p className="text-sm">{followup.next_action}</p>
                            {followup.next_action_date && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(followup.next_action_date).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                              </p>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(followup.created_at).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/customers/${followup.customer?.id}`}>
                          <Button size="sm" variant="outline">
                            {t.viewCustomer}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              {t.noFollowups}
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
