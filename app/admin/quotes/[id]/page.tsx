"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Edit, Printer, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface QuoteItem {
  id: string
  product_id: string
  product_snapshot: {
    name?: string
    sku?: string
    images?: string[]
  } | null
  total_qty: number
  unit_price: number
  subtotal: number
}

interface Quote {
  id: string
  quote_no: string
  inquiry_id: string | null
  user_id: string | null
  total_amount: number
  discount_amount: number
  status: string
  note: string | null
  created_at: string
  sent_at: string | null
  valid_until: string | null
  current_version: number
  inquiries?: {
    inquiry_no: string
    contact_name: string | null
    contact_email: string | null
    contact_whatsapp: string | null
    company_name: string | null
  } | null
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  confirmed: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
}

const statusLabels: Record<string, string> = {
  draft: "草稿",
  sent: "已发送",
  viewed: "已查看",
  confirmed: "已确认",
  expired: "已过期",
}

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [items, setItems] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuote()
  }, [params.id])

  async function loadQuote() {
    const supabase = createClient()
    
    // 加载报价单基本信息
    const { data: quoteData, error: quoteError } = await supabase
      .from("quotes")
      .select(`
        *,
        inquiries(inquiry_no, contact_name, contact_email, contact_whatsapp, company_name)
      `)
      .eq("id", params.id)
      .single()

    if (quoteError || !quoteData) {
      toast.error("报价单不存在")
      router.push("/admin/quotes")
      return
    }

    setQuote(quoteData)

    // 加载报价单明细
    const { data: itemsData } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", params.id)

    setItems(itemsData || [])
    setLoading(false)
  }

  async function handleSend() {
    if (!quote) return

    const supabase = createClient()
    const { error } = await supabase
      .from("quotes")
      .update({ 
        status: "sent",
        sent_at: new Date().toISOString()
      })
      .eq("id", quote.id)

    if (error) {
      toast.error("发送失败，请重试")
      return
    }

    toast.success("报价单已发送")
    setQuote({ ...quote, status: "sent", sent_at: new Date().toISOString() })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quote) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">报价单详情</h1>
            <p className="text-muted-foreground">查看和管理报价单</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {quote.status === "draft" && (
            <>
              <Link href={`/admin/quotes/${quote.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
              </Link>
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                发送报价单
              </Button>
            </>
          )}
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            打印
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 报价单信息 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>报价单信息</CardTitle>
              <Badge className={statusColors[quote.status]}>
                {statusLabels[quote.status] || quote.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">报价单号：</span>
                <span className="font-medium ml-2">{quote.quote_no}</span>
              </div>
              <div>
                <span className="text-muted-foreground">版本：</span>
                <span className="font-medium ml-2">v{quote.current_version}</span>
              </div>
              <div>
                <span className="text-muted-foreground">创建时间：</span>
                <span className="ml-2">
                  {new Date(quote.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">有效期至：</span>
                <span className="ml-2">
                  {quote.valid_until 
                    ? new Date(quote.valid_until).toLocaleDateString("zh-CN")
                    : "-"
                  }
                </span>
              </div>
              {quote.sent_at && (
                <div>
                  <span className="text-muted-foreground">发送时间：</span>
                  <span className="ml-2">
                    {new Date(quote.sent_at).toLocaleString("zh-CN")}
                  </span>
                </div>
              )}
              {quote.inquiry_id && (
                <div>
                  <span className="text-muted-foreground">关联询价：</span>
                  <Link 
                    href={`/admin/inquiries/${quote.inquiry_id}`}
                    className="ml-2 text-primary hover:underline"
                  >
                    {quote.inquiries?.inquiry_no}
                  </Link>
                </div>
              )}
            </div>
            {quote.note && (
              <div className="pt-4 border-t">
                <span className="text-muted-foreground text-sm">备注：</span>
                <p className="mt-1">{quote.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 客户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>客户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">联系人：</span>
              <span className="ml-2">{quote.inquiries?.contact_name || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">公司：</span>
              <span className="ml-2">{quote.inquiries?.company_name || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">邮箱：</span>
              <span className="ml-2">{quote.inquiries?.contact_email || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">WhatsApp：</span>
              <span className="ml-2">{quote.inquiries?.contact_whatsapp || "-"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 商品明细 */}
      <Card>
        <CardHeader>
          <CardTitle>商品明细</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>款号</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">单价</TableHead>
                <TableHead className="text-right">小计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.product_snapshot?.images?.[0] && (
                        <img 
                          src={item.product_snapshot.images[0]} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <span className="font-medium">
                        {item.product_snapshot?.name || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.product_snapshot?.sku || "-"}</TableCell>
                  <TableCell className="text-right">{item.total_qty}</TableCell>
                  <TableCell className="text-right">
                    ${Number(item.unit_price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(item.subtotal).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 合计 */}
          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">小计</span>
                <span>${Number(quote.total_amount).toLocaleString()}</span>
              </div>
              {quote.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>折扣</span>
                  <span>-${Number(quote.discount_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t text-lg font-bold">
                <span>总计</span>
                <span className="text-primary">
                  ${Number(quote.total_amount - (quote.discount_amount || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
