"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Field, FieldLabel } from "@/components/ui/field"

interface QuotationItem {
  id: string
  product_name: string
  sku_attributes: Record<string, string> | null
  quantity: number
  unit_price: number
  subtotal: number
  remark: string | null
}

interface Quotation {
  id: string
  quotation_no: string
  company_name: string | null
  contact_name: string | null
  total_amount: number
  discount_amount: number
  final_amount: number
  validity_days: number
  status: string
  remark: string | null
  created_at: string
  quotation_items: QuotationItem[]
}

const statusLabels: Record<string, string> = {
  draft: "草稿",
  sent: "已发送",
  accepted: "已接受",
  rejected: "已拒绝",
  expired: "已过期",
}

interface QuotationEditorProps {
  quotation: Quotation
}

export function QuotationEditor({ quotation }: QuotationEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState(quotation.quotation_items)
  const [discountAmount, setDiscountAmount] = useState(quotation.discount_amount)
  const [validityDays, setValidityDays] = useState(quotation.validity_days)
  const [remark, setRemark] = useState(quotation.remark || "")

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)
  const finalAmount = totalAmount - discountAmount

  const updateItemPrice = (id: string, price: number) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        return { ...item, unit_price: price, subtotal: price * item.quantity }
      }
      return item
    }))
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        return { ...item, quantity, subtotal: item.unit_price * quantity }
      }
      return item
    }))
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleSave = async () => {
    startTransition(async () => {
      const supabase = createClient()

      // 更新报价单
      await supabase
        .from("quotations")
        .update({
          total_amount: totalAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          validity_days: validityDays,
          remark,
        })
        .eq("id", quotation.id)

      // 更新报价单商品
      for (const item of items) {
        await supabase
          .from("quotation_items")
          .update({
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          })
          .eq("id", item.id)
      }

      // 删除已移除的商品
      const remainingIds = items.map((i) => i.id)
      const removedIds = quotation.quotation_items
        .filter((i) => !remainingIds.includes(i.id))
        .map((i) => i.id)
      
      if (removedIds.length > 0) {
        await supabase
          .from("quotation_items")
          .delete()
          .in("id", removedIds)
      }

      router.refresh()
    })
  }

  const handleSend = async () => {
    if (!confirm("确定要发送此报价单给客户吗？")) return

    startTransition(async () => {
      await handleSave()

      const supabase = createClient()
      await supabase
        .from("quotations")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          expired_at: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", quotation.id)

      router.refresh()
    })
  }

  const isDraft = quotation.status === "draft"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/quotations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              报价单 {quotation.quotation_no}
            </h1>
            <p className="text-muted-foreground">
              {quotation.company_name} · {quotation.contact_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isDraft ? "outline" : "default"}>
            {statusLabels[quotation.status]}
          </Badge>
          {isDraft && (
            <>
              <Button variant="outline" onClick={handleSave} disabled={isPending}>
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>
              <Button onClick={handleSend} disabled={isPending}>
                <Send className="mr-2 h-4 w-4" />
                发送报价
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 报价商品 */}
      <Card>
        <CardHeader>
          <CardTitle>报价商品</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品名称</TableHead>
                <TableHead>规格</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>小计</TableHead>
                {isDraft && <TableHead className="text-right">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell>
                    {item.sku_attributes ? (
                      Object.entries(item.sku_attributes).map(([k, v]) => (
                        <span key={k} className="mr-2 text-sm">
                          {k}: {v}
                        </span>
                      ))
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {isDraft ? (
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {isDraft ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                        className="w-24"
                      />
                    ) : (
                      `¥${Number(item.unit_price).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    ¥{Number(item.subtotal).toFixed(2)}
                  </TableCell>
                  {isDraft && (
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 金额汇总 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>报价设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>折扣金额</FieldLabel>
              <Input
                type="number"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                disabled={!isDraft}
              />
            </Field>
            <Field>
              <FieldLabel>有效期（天）</FieldLabel>
              <Input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                disabled={!isDraft}
              />
            </Field>
            <Field>
              <FieldLabel>备注</FieldLabel>
              <Input
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                disabled={!isDraft}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>金额汇总</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">商品总额</span>
              <span className="font-medium">¥{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">折扣</span>
              <span className="text-destructive">-¥{discountAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">最终报价</span>
                <span className="text-2xl font-bold text-primary">
                  ¥{finalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
