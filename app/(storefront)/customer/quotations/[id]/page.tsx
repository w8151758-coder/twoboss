"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Check, MessageCircle, Printer, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "草稿", variant: "outline" },
  sent: { label: "待确认", variant: "secondary" },
  viewed: { label: "已查看", variant: "secondary" },
  negotiating: { label: "谈判中", variant: "default" },
  confirmed: { label: "已确认", variant: "default" },
  expired: { label: "已过期", variant: "destructive" },
}

interface QuoteItem {
  id: string
  product_id: string
  product_snapshot: Record<string, unknown> | null
  total_qty: number
  unit_price: number
  subtotal: number
}

interface Quote {
  id: string
  quote_no: string
  inquiry_id: string | null
  total_amount: number
  discount_amount: number
  status: string
  note: string | null
  created_at: string
  sent_at: string | null
  valid_until: string | null
  items: QuoteItem[]
}

interface QuotationDetailPageProps {
  params: Promise<{ id: string }>
}

export default function QuotationDetailPage({ params }: QuotationDetailPageProps) {
  const router = useRouter()
  const [quotation, setQuotation] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const loadQuotation = async () => {
      const { id } = await params
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login?redirect=/customer/quotations")
        return
      }

      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          items:quote_items(*)
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        router.push("/customer/quotations")
        return
      }

      // 标记为已查看
      if (data.status === "sent") {
        await supabase
          .from("quotes")
          .update({ status: "viewed" })
          .eq("id", id)
        data.status = "viewed"
      }

      setQuotation(data)
      setLoading(false)
    }

    loadQuotation()
  }, [params, router])

  const handleAccept = () => {
    if (!quotation) return
    
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from("quotes")
        .update({ status: "confirmed" })
        .eq("id", quotation.id)

      if (error) {
        toast.error("操作失败，请重试")
        return
      }

      setQuotation({ ...quotation, status: "confirmed" })
      toast.success("已接受报价，我们将尽快与您联系确认订单")
    })
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!quotation) {
    return null
  }

  const status = statusMap[quotation.status] || statusMap.sent
  const isExpired = quotation.valid_until && new Date(quotation.valid_until) < new Date()
  const canRespond = (quotation.status === "sent" || quotation.status === "viewed") && !isExpired

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/customer/quotations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">{quotation.quote_no}</h2>
            <Badge variant={isExpired ? "destructive" : status.variant}>
              {isExpired ? "已过期" : status.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {quotation.sent_at
              ? `发送于 ${format(new Date(quotation.sent_at), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}`
              : `创建于 ${format(new Date(quotation.created_at), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          打印
        </Button>
      </div>

      {/* 打印时显示的标题 */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold">报价单</h1>
        <p className="text-lg">{quotation.quote_no}</p>
      </div>

      {/* Quotation Info */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle className="text-base">报价信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">报价单号</p>
              <p className="font-medium">{quotation.quote_no}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">有效期至</p>
              <p className="font-medium">
                {quotation.valid_until
                  ? format(new Date(quotation.valid_until), "yyyy年MM月dd日", { locale: zhCN })
                  : "-"}
              </p>
            </div>
            {quotation.note && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">备注</p>
                <p className="font-medium">{quotation.note}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle className="text-base">报价明细</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">单价</TableHead>
                <TableHead className="text-right">小计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotation.items.map((item) => {
                const snapshot = item.product_snapshot as Record<string, unknown> | null
                const productName = snapshot?.name as string || "商品"
                const productSku = snapshot?.sku as string || ""

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{productName}</span>
                        {productSku && (
                          <p className="text-sm text-muted-foreground">款号: {productSku}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.total_qty} 件
                    </TableCell>
                    <TableCell className="text-right">
                      ${Number(item.unit_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(item.subtotal).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="space-y-2 text-right">
            <div className="flex justify-end gap-8">
              <span className="text-muted-foreground">商品总额</span>
              <span className="w-32 font-medium">${Number(quotation.total_amount).toLocaleString()}</span>
            </div>
            {Number(quotation.discount_amount) > 0 && (
              <div className="flex justify-end gap-8">
                <span className="text-muted-foreground">优惠金额</span>
                <span className="w-32 font-medium text-destructive">
                  -${Number(quotation.discount_amount).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-8 text-lg">
              <span className="font-medium">应付金额</span>
              <span className="w-32 font-bold text-primary">
                ${(Number(quotation.total_amount) - Number(quotation.discount_amount || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 - 打印时隐藏 */}
      {canRespond && (
        <Card className="print:hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                请在有效期内确认此报价单，如需谈价请通过 WhatsApp 联系我们
              </p>
              <div className="flex gap-2">
                <a
                  href="https://wa.me/8618888888888"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp 谈价
                  </Button>
                </a>
                <Button 
                  className="gap-2"
                  onClick={handleAccept}
                  disabled={isPending}
                >
                  <Check className="h-4 w-4" />
                  接受报价
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 已确认状态提示 */}
      {quotation.status === "confirmed" && (
        <Card className="print:hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 py-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-lg font-medium text-green-600">您已接受此报价，我们将尽快与您联系确认订单</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 已过期提示 */}
      {isExpired && quotation.status !== "confirmed" && (
        <Card className="print:hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 py-4">
              <span className="text-lg font-medium text-muted-foreground">此报价单已过期，如需重新报价请联系我们</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
