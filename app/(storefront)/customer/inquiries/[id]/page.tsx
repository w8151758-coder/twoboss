import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, FileText } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "待报价", variant: "secondary" },
  quoted: { label: "已报价", variant: "default" },
  accepted: { label: "已接受", variant: "default" },
  rejected: { label: "已拒绝", variant: "destructive" },
  expired: { label: "已过期", variant: "outline" },
}

interface ProductSnapshot {
  id: string
  name: string
  sku: string
  fabric?: string
  moq?: number
}

interface InquiryItem {
  id: string
  product_id: string
  product_snapshot: ProductSnapshot
  specs?: Array<{ color: string; size: string; qty: number }>
  total_qty: number
  note: string | null
  product?: { id: string; name: string; sku: string; fabric: string } | null
}

interface InquiryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .select(`
      *,
      items:inquiry_items(
        *,
        product:products(id, name, sku, fabric),
        specs:inquiry_item_specs(color, size, qty)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !inquiry) {
    notFound()
  }

  // Check if there's a quotation for this inquiry
  const { data: quotation } = await supabase
    .from("quotations")
    .select("id, quotation_no, status")
    .eq("inquiry_id", id)
    .single()

  const status = statusMap[inquiry.status] || statusMap.pending

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer/inquiries">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">{inquiry.inquiry_no}</h2>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            提交于 {format(new Date(inquiry.created_at), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
          </p>
        </div>
        {quotation && (
          <Link href={`/customer/quotations/${quotation.id}`}>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              查看报价单
            </Button>
          </Link>
        )}
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">联系信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">公司名称</p>
              <p className="font-medium">{inquiry.company_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">联系人</p>
              <p className="font-medium">{inquiry.contact_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">WhatsApp</p>
              <p className="font-medium">{inquiry.contact_whatsapp || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">邮箱</p>
              <p className="font-medium">{inquiry.contact_email || "-"}</p>
            </div>
            {inquiry.address && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">地址</p>
                <p className="font-medium">{inquiry.address}</p>
              </div>
            )}
            {inquiry.remark && (
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">备注</p>
                <p className="font-medium">{inquiry.remark}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">询价商品</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>规格</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead>备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiry.items.map((item: InquiryItem) => {
                // 从 product_snapshot 获取产品信息
                const snapshot = item.product_snapshot
                const productName = snapshot?.name || item.product?.name || "未知商品"
                const productSku = snapshot?.sku || item.product?.sku || ""
                const productFabric = snapshot?.fabric || item.product?.fabric || ""
                
                // 解析规格信息
                const specs = item.specs || []
                
                // 获取产品图片 - 使用占位图
                const image = "/placeholder-product.jpg"

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                          <Image src={image} alt="" fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{productName}</p>
                          {productSku && (
                            <p className="text-xs text-muted-foreground">款号: {productSku}</p>
                          )}
                          {productFabric && (
                            <p className="text-xs text-muted-foreground">面料: {productFabric}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {specs.length > 0 ? (
                        <div className="space-y-1">
                          {specs.map((spec, idx) => {
                            // 构建规格文本
                            const specParts = []
                            if (spec.color) specParts.push(spec.color)
                            if (spec.size) specParts.push(spec.size)
                            const specText = specParts.length > 0 ? specParts.join(" / ") : "默认规格"
                            
                            return (
                              <div key={idx} className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {specText}
                                </Badge>
                                <span className="text-sm">x{spec.qty}</span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.total_qty} 件
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.note || "-"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
