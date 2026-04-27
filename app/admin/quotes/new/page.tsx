"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send, Save, Loader2 } from "lucide-react"
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

interface InquiryItem {
  id: string
  product_id: string
  product_snapshot: any
  total_qty: number
  unit_price?: number
}

interface Inquiry {
  id: string
  inquiry_no: string
  contact_name: string
  contact_email: string
  contact_whatsapp: string
  company_name: string
  country: string
  user_id: string
  items: InquiryItem[]
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <NewQuoteContent />
    </Suspense>
  )
}

function NewQuoteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const inquiryId = searchParams.get("inquiry")
  
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [validDays, setValidDays] = useState(7)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (inquiryId) {
      loadInquiry()
    }
  }, [inquiryId])

  async function loadInquiry() {
    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("inquiries")
      .select(`
        *,
        items:inquiry_items(
          id,
          product_id,
          product_snapshot,
          total_qty
        )
      `)
      .eq("id", inquiryId)
      .single()

    if (error) {
      console.error("Error loading inquiry:", error)
      toast.error("加载询价信息失败")
    } else {
      setInquiry(data)
      // 初始化价格
      const initialPrices: Record<string, number> = {}
      data.items?.forEach((item: InquiryItem) => {
        initialPrices[item.id] = 0
      })
      setPrices(initialPrices)
    }
    setLoading(false)
  }

  function calculateTotal() {
    if (!inquiry?.items) return 0
    return inquiry.items.reduce((sum, item) => {
      return sum + (prices[item.id] || 0) * item.total_qty
    }, 0)
  }

  async function handleSubmit(sendEmail: boolean) {
    if (!inquiry) return
    
    // 验证所有商品都有价格
    const hasEmptyPrice = inquiry.items?.some(item => !prices[item.id] || prices[item.id] <= 0)
    if (hasEmptyPrice) {
      toast.error("请为所有商品填写单价")
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    try {
      // 生成报价单号
      const quoteNo = `QT${Date.now().toString(36).toUpperCase()}`
      
      // 创建报价单
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          quote_no: quoteNo,
          inquiry_id: inquiry.id,
          user_id: inquiry.user_id,
          total_amount: calculateTotal(),
          valid_until: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString(),
          status: sendEmail ? "sent" : "draft",
          note: notes,
        })
        .select()
        .single()

      if (quoteError) throw quoteError

      // 创建报价单明细
      const quoteItems = inquiry.items?.map(item => ({
        quote_id: quote.id,
        product_id: item.product_id,
        product_snapshot: item.product_snapshot,
        total_qty: item.total_qty,
        unit_price: prices[item.id],
        subtotal: prices[item.id] * item.total_qty,
      }))

      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(quoteItems)

      if (itemsError) throw itemsError

      // 更新询价状态
      await supabase
        .from("inquiries")
        .update({ status: "quoted" })
        .eq("id", inquiry.id)

      if (sendEmail) {
        // 发送邮件通知
        toast.success(`报价单已创建并发送至 ${inquiry.contact_email}`)
      } else {
        toast.success("报价单已保存为草稿")
      }

      router.push("/admin/quotes")
    } catch (error) {
      console.error("Error creating quote:", error)
      toast.error("创建报价单失败")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-muted-foreground">询价信息不存在</div>
        <Link href="/admin/inquiries">
          <Button variant="outline">返回询价列表</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/inquiries">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">创建报价单</h1>
          <p className="text-muted-foreground">基于询价 {inquiry.inquiry_no} 创建报价</p>
        </div>
      </div>

      {/* 客户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>客户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-muted-foreground">联系人</Label>
              <p className="font-medium">{inquiry.contact_name || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">公司</Label>
              <p className="font-medium">{inquiry.company_name || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">邮箱</Label>
              <p className="font-medium">{inquiry.contact_email || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">WhatsApp</Label>
              <p className="font-medium">{inquiry.contact_whatsapp || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 报价商品 */}
      <Card>
        <CardHeader>
          <CardTitle>报价商品</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>款号</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">单价 (USD)</TableHead>
                <TableHead className="text-right">小计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiry.items?.map((item) => {
                const snapshot = item.product_snapshot || {}
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {snapshot.name || "未知商品"}
                    </TableCell>
                    <TableCell>{snapshot.sku || "-"}</TableCell>
                    <TableCell className="text-right">{item.total_qty}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={prices[item.id] || ""}
                        onChange={(e) => setPrices({
                          ...prices,
                          [item.id]: parseFloat(e.target.value) || 0
                        })}
                        className="w-24 text-right ml-auto"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${((prices[item.id] || 0) * item.total_qty).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  总计
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  ${calculateTotal().toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 报价设置 */}
      <Card>
        <CardHeader>
          <CardTitle>报价设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>报价有效期（天）</Label>
              <Input
                type="number"
                min="1"
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value) || 7)}
                className="w-32"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>备注</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-md"
              placeholder="添加报价备注..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => handleSubmit(false)}
          disabled={submitting}
        >
          <Save className="h-4 w-4 mr-2" />
          保存草稿
        </Button>
        <Button 
          onClick={() => handleSubmit(true)}
          disabled={submitting}
        >
          <Send className="h-4 w-4 mr-2" />
          发送报价单
        </Button>
      </div>
    </div>
  )
}
