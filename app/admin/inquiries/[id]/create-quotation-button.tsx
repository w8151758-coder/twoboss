"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface InquiryItem {
  id: string
  product_id: string | null
  sku_id: string | null
  product_name: string
  sku_attributes: Record<string, string> | null
  quantity: number
  remark: string | null
  product?: { base_price: number }
  sku?: { price: number }
}

interface Inquiry {
  id: string
  inquiry_no: string
  user_id: string | null
  company_name: string | null
  contact_name: string | null
  inquiry_items?: InquiryItem[]
}

interface CreateQuotationButtonProps {
  inquiry: Inquiry
}

export function CreateQuotationButton({ inquiry }: CreateQuotationButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      const supabase = createClient()

      // 获取当前用户作为销售
      const { data: { user } } = await supabase.auth.getUser()

      // 生成报价单编号: QT + 年月日 + 4位随机数
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "")
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      const quotationNo = `QT${dateStr}${randomNum}`

      // 创建报价单
      const { data: quotation, error: quotationError } = await supabase
        .from("quotations")
        .insert({
          quotation_no: quotationNo,
          inquiry_id: inquiry.id,
          user_id: inquiry.user_id,
          sales_id: user?.id,
          company_name: inquiry.company_name,
          contact_name: inquiry.contact_name,
          status: "draft",
          validity_days: 7,
        })
        .select()
        .single()

      if (quotationError) {
        alert("创建报价单失败：" + quotationError.message)
        return
      }

      // 创建报价单商品（自动计算价格）
      if (inquiry.inquiry_items && inquiry.inquiry_items.length > 0) {
        const quotationItems = inquiry.inquiry_items.map((item) => {
          const unitPrice = item.sku?.price || item.product?.base_price || 0
          return {
            quotation_id: quotation.id,
            product_id: item.product_id,
            sku_id: item.sku_id,
            product_name: item.product_name,
            sku_attributes: item.sku_attributes,
            quantity: item.quantity,
            unit_price: unitPrice,
            subtotal: unitPrice * item.quantity,
            remark: item.remark,
          }
        })

        await supabase.from("quotation_items").insert(quotationItems)
      }

      // 更新询价单状态
      await supabase
        .from("inquiries")
        .update({ status: "quoted" })
        .eq("id", inquiry.id)

      router.push(`/admin/quotations/${quotation.id}`)
    })
  }

  return (
    <Button onClick={handleCreate} disabled={isPending}>
      <FileCheck className="mr-2 h-4 w-4" />
      {isPending ? "生成中..." : "生成报价单"}
    </Button>
  )
}
