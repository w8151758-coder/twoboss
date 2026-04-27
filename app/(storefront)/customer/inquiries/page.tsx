import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { FileText, Eye, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "新询价", variant: "secondary" },
  pending: { label: "待报价", variant: "secondary" },
  pending_quote: { label: "待报价", variant: "secondary" },
  quoted: { label: "已报价", variant: "default" },
  negotiating: { label: "谈判中", variant: "default" },
  accepted: { label: "已接受", variant: "default" },
  converted: { label: "已转订单", variant: "default" },
  rejected: { label: "已拒绝", variant: "destructive" },
  lost: { label: "已失效", variant: "destructive" },
  expired: { label: "已过期", variant: "outline" },
}

export default async function CustomerInquiriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select(`
      *,
      items:inquiry_items(count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">我的询价</h2>
          <p className="text-sm text-muted-foreground">查看您提交的所有询价单</p>
        </div>
        <Link href="/products">
          <Button className="gap-2">
            新建询价
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {!inquiries || inquiries.length === 0 ? (
        <Empty
          icon={<FileText className="h-12 w-12" />}
          title="暂无询价记录"
          description="浏览产品并提交您的第一个询价"
        >
          <Link href="/products">
            <Button className="mt-4">浏览产品</Button>
          </Link>
        </Empty>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const status = statusMap[inquiry.status] || statusMap.new
            const itemCount = Array.isArray(inquiry.items) ? inquiry.items.length : inquiry.items?.[0]?.count || 0

            return (
              <Card key={inquiry.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{inquiry.inquiry_no}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(inquiry.created_at), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">商品数量：</span>
                        {itemCount} 件
                      </p>
                      <p>
                        <span className="text-muted-foreground">询价类型：</span>
                        {inquiry.inquiry_type === 'quick' ? '快速询价' : '详细询价'}
                      </p>
                    </div>
                    <Link href={`/customer/inquiries/${inquiry.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
