"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { ClipboardList, Eye, CheckCircle, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Quotation {
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
  quote_items: { id: string }[]
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "草稿", variant: "outline" },
  sent: { label: "待查看", variant: "secondary" },
  viewed: { label: "已查看", variant: "secondary" },
  negotiating: { label: "谈判中", variant: "default" },
  accepted: { label: "已接受", variant: "default" },
  rejected: { label: "已拒绝", variant: "destructive" },
  expired: { label: "已过期", variant: "destructive" },
}

export default function CustomerQuotationsPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const loadQuotations = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login?redirect=/customer/quotations")
        return
      }

      setUser(user)

      const { data } = await supabase
        .from("quotes")
        .select(`
          *,
          quote_items(id)
        `)
        .eq("user_id", user.id)
        .neq("status", "draft")
        .order("created_at", { ascending: false })

      setQuotations(data || [])
      setLoading(false)
    }

    loadQuotations()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">我的报价单</h2>
        <p className="text-sm text-muted-foreground">查看销售团队发送给您的报价单</p>
      </div>

      {quotations.length === 0 ? (
        <Empty
          icon={<ClipboardList className="h-12 w-12" />}
          title="暂无报价单"
          description="您还没有收到任何报价单，提交询价后我们会尽快为您报价。"
        >
          <Link href="/products">
            <Button className="mt-4">浏览产品</Button>
          </Link>
        </Empty>
      ) : (
        <div className="space-y-4">
          {quotations.map((quotation) => {
            const status = statusMap[quotation.status] || statusMap.sent
            const itemCount = quotation.quote_items?.length || 0
            const isExpired = quotation.valid_until && new Date(quotation.valid_until) < new Date()

            return (
              <Card key={quotation.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{quotation.quote_no}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {quotation.sent_at
                          ? formatDistanceToNow(new Date(quotation.sent_at), {
                              addSuffix: true,
                              locale: zhCN,
                            })
                          : formatDistanceToNow(new Date(quotation.created_at), {
                              addSuffix: true,
                              locale: zhCN,
                            })}
                      </p>
                    </div>
                    <Badge variant={isExpired ? "destructive" : status.variant}>
                      {isExpired ? "已过期" : status.label}
                    </Badge>
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
                        <span className="text-muted-foreground">报价金额：</span>
                        <span className="font-medium text-primary">
                          ${Number(quotation.total_amount).toLocaleString()}
                        </span>
                      </p>
                      {quotation.valid_until && !isExpired && (
                        <p>
                          <span className="text-muted-foreground">有效期至：</span>
                          {new Date(quotation.valid_until).toLocaleDateString("zh-CN")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {quotation.status === "sent" && !isExpired && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 text-green-600 hover:text-green-700"
                          onClick={async () => {
                            const supabase = createClient()
                            await supabase
                              .from("quotes")
                              .update({ status: "confirmed" })
                              .eq("id", quotation.id)
                            router.refresh()
                            window.location.reload()
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                          接受
                        </Button>
                      )}
                      <a
                        href="https://wa.me/8618888888888"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageCircle className="h-4 w-4" />
                          谈价
                        </Button>
                      </a>
                      <Link href={`/customer/quotations/${quotation.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          查看详情
                        </Button>
                      </Link>
                    </div>
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
