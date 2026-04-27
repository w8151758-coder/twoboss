"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Search, Clock, CheckCircle, XCircle, AlertCircle, Eye, Phone } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Quote {
  id: string
  quote_no: string
  inquiry_id: string | null
  total_amount: number
  status: string
  created_at: string
  sent_at: string | null
  valid_until: string | null
  inquiries?: {
    contact_name: string | null
    company_name: string | null
  } | null
}

export default function QuoteNegotiationPage() {
  const { locale } = useI18n()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: locale === "zh" ? "草稿" : "Draft", color: "bg-gray-100 text-gray-800" },
    sent: { label: locale === "zh" ? "已发送" : "Sent", color: "bg-blue-100 text-blue-800" },
    viewed: { label: locale === "zh" ? "已查看" : "Viewed", color: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: locale === "zh" ? "已确认" : "Confirmed", color: "bg-green-100 text-green-800" },
    expired: { label: locale === "zh" ? "已过期" : "Expired", color: "bg-red-100 text-red-800" },
  }

  useEffect(() => {
    loadQuotes()
  }, [])

  async function loadQuotes() {
    const supabase = createClient()
    const { data } = await supabase
      .from("quotes")
      .select(`
        *,
        inquiries(contact_name, company_name)
      `)
      .order("created_at", { ascending: false })

    setQuotes(data || [])
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4" />
      case "sent":
        return <MessageSquare className="h-4 w-4" />
      case "viewed":
        return <AlertCircle className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "expired":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getDaysOpen = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const filteredQuotes = quotes.filter(q => 
    q.quote_no.toLowerCase().includes(search.toLowerCase()) ||
    q.inquiries?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    q.inquiries?.contact_name?.toLowerCase().includes(search.toLowerCase())
  )

  // 统计各状态数量
  const statusCounts = {
    draft: quotes.filter(q => q.status === "draft").length,
    sent: quotes.filter(q => q.status === "sent").length,
    viewed: quotes.filter(q => q.status === "viewed").length,
    confirmed: quotes.filter(q => q.status === "confirmed").length,
    expired: quotes.filter(q => q.status === "expired").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "zh" ? "谈判状态" : "Negotiation Status"}
        </h1>
        <p className="text-muted-foreground">
          {locale === "zh" ? "跟踪报价单谈判进度和客户反馈" : "Track quotation negotiation progress and customer feedback"}
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusMap).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {statusCounts[key as keyof typeof statusCounts] || 0}
                </p>
                <Badge className={value.color}>{value.label}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{locale === "zh" ? "谈判跟进列表" : "Negotiation List"}</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder={locale === "zh" ? "搜索客户或报价单..." : "Search customer or quote..."} 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {locale === "zh" ? "加载中..." : "Loading..."}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {locale === "zh" ? "暂无报价单" : "No quotes found"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{locale === "zh" ? "报价单" : "Quote"}</TableHead>
                  <TableHead>{locale === "zh" ? "客户" : "Customer"}</TableHead>
                  <TableHead>{locale === "zh" ? "联系人" : "Contact"}</TableHead>
                  <TableHead className="text-right">{locale === "zh" ? "金额" : "Amount"}</TableHead>
                  <TableHead>{locale === "zh" ? "状态" : "Status"}</TableHead>
                  <TableHead>{locale === "zh" ? "有效期" : "Valid Until"}</TableHead>
                  <TableHead>{locale === "zh" ? "天数" : "Days"}</TableHead>
                  <TableHead className="text-right">{locale === "zh" ? "操作" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => {
                  const status = statusMap[quote.status] || statusMap.draft
                  const daysOpen = getDaysOpen(quote.created_at)
                  
                  return (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.quote_no}</TableCell>
                      <TableCell>{quote.inquiries?.company_name || "-"}</TableCell>
                      <TableCell>{quote.inquiries?.contact_name || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(quote.total_amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(quote.status)}
                            {status.label}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {quote.valid_until 
                          ? new Date(quote.valid_until).toLocaleDateString("zh-CN")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={daysOpen > 7 ? "destructive" : "outline"}>
                          {daysOpen}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/quotes/${quote.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <a href="https://wa.me/8618888888888" target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
