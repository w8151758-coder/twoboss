import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Phone, Mail, MapPin, Building2, FileText, FileCheck } from "lucide-react"
import Link from "next/link"
import { FollowupList } from "./followup-list"
import { AddFollowupDialog } from "./add-followup-dialog"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!customer) {
    notFound()
  }

  // 获取客户的询价和报价统计
  const [
    { count: inquiryCount },
    { count: quotationCount },
    { data: followups },
  ] = await Promise.all([
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase.from("quotations").select("*", { count: "exact", head: true }).eq("user_id", id),
    supabase
      .from("customer_followups")
      .select("*, sales:profiles!customer_followups_sales_id_fkey(contact_name)")
      .eq("customer_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {customer.company_name || "未设置公司名称"}
            </h1>
            <p className="text-muted-foreground">
              {customer.contact_name || customer.email}
            </p>
          </div>
        </div>
        <AddFollowupDialog customerId={id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 客户信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              客户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone || "未设置"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email || "未设置"}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span>{customer.address || "未设置"}</span>
            </div>
          </CardContent>
        </Card>

        {/* 统计数据 */}
        <Card>
          <CardHeader>
            <CardTitle>业务统计</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>询价单</span>
              </div>
              <Badge variant="secondary">{inquiryCount || 0} 条</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground" />
                <span>报价单</span>
              </div>
              <Badge variant="secondary">{quotationCount || 0} 条</Badge>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                注册时间：{new Date(customer.created_at).toLocaleDateString("zh-CN")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/admin/inquiries?search=${customer.company_name}`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                查看询价记录
              </Button>
            </Link>
            <Link href={`/admin/quotations?search=${customer.company_name}`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileCheck className="mr-2 h-4 w-4" />
                查看报价记录
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 跟进记录 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>跟进记录</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowupList followups={followups || []} />
        </CardContent>
      </Card>
    </div>
  )
}
