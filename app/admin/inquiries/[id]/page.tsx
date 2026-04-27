import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileCheck } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreateQuotationButton } from "./create-quotation-button"

const statusLabels: Record<string, string> = {
  pending: "待报价",
  quoted: "已报价",
  accepted: "已接受",
  rejected: "已拒绝",
  expired: "已过期",
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: inquiry } = await supabase
    .from("inquiries")
    .select(`
      *,
      inquiry_items(
        *,
        product:products(id, name, base_price),
        sku:product_skus(id, sku_code, attributes, price)
      )
    `)
    .eq("id", id)
    .single()

  if (!inquiry) {
    notFound()
  }

  // 检查是否已有报价单
  const { data: existingQuotation } = await supabase
    .from("quotations")
    .select("id, quotation_no")
    .eq("inquiry_id", id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/inquiries">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              询价单 {inquiry.inquiry_no}
            </h1>
            <p className="text-muted-foreground">
              创建于 {new Date(inquiry.created_at).toLocaleString("zh-CN")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={inquiry.status === "pending" ? "default" : "secondary"}>
            {statusLabels[inquiry.status]}
          </Badge>
          {existingQuotation ? (
            <Link href={`/admin/quotations/${existingQuotation.id}`}>
              <Button>
                <FileCheck className="mr-2 h-4 w-4" />
                查看报价单
              </Button>
            </Link>
          ) : (
            <CreateQuotationButton inquiry={inquiry} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 客户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>客户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">公司名称</p>
              <p className="font-medium">{inquiry.company_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">联系人</p>
              <p className="font-medium">{inquiry.contact_name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">电话</p>
              <p className="font-medium">{inquiry.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">邮箱</p>
              <p className="font-medium">{inquiry.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">地址</p>
              <p className="font-medium">{inquiry.address || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* 询价商品 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>询价商品</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名称</TableHead>
                  <TableHead>规格</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>参考价格</TableHead>
                  <TableHead>备注</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiry.inquiry_items?.map((item: {
                  id: string
                  product_name: string
                  quantity: number
                  remark: string | null
                  sku_attributes: Record<string, string> | null
                  product?: { name: string; base_price: number }
                  sku?: { price: number; attributes: Record<string, string> }
                }) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product_name || item.product?.name || "-"}
                    </TableCell>
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
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      ¥{Number(item.sku?.price || item.product?.base_price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.remark || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 备注 */}
      {inquiry.remark && (
        <Card>
          <CardHeader>
            <CardTitle>客户备注</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{inquiry.remark}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
