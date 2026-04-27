"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { CheckCircle, Mail, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function InquirySuccessContent() {
  const searchParams = useSearchParams()
  const inquiryNo = searchParams.get("no") || ""
  const email = searchParams.get("email") || ""
  const isNew = searchParams.get("new") === "1"

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <Card className="max-w-lg w-full mx-4">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">询价提交成功！</CardTitle>
          <CardDescription className="text-base mt-2">
            我们已收到您的询价，销售团队将在24小时内与您联系
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 询价单号 */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">询价单号</p>
            <p className="text-xl font-bold font-mono">{inquiryNo}</p>
          </div>

          {/* 后续步骤 */}
          <div className="space-y-3">
            <h4 className="font-medium">后续步骤：</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
                <span>销售团队将审核您的询价需求</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
                <span>我们会通过邮件或WhatsApp发送报价单</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
                <span>确认报价后即可安排生产发货</span>
              </div>
            </div>
          </div>

          {/* 登录提示 */}
          {email && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">使用邮箱验证码登录</p>
                  <p className="text-blue-700 mt-1">
                    邮箱：<span className="font-medium">{email}</span>
                  </p>
                  <p className="text-blue-600 mt-1">
                    无需密码，点击下方按钮发送验证码即可登录
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/">
              <Button variant="outline" className="w-full">
                继续浏览产品
              </Button>
            </Link>
            <Link href={`/auth/login?redirect=/customer/inquiries&email=${encodeURIComponent(email)}&mode=email`}>
              <Button className="w-full gap-2">
                登录查看询价进度
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* WhatsApp 联系 */}
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground mb-2">有紧急需求？</p>
            <a 
              href="https://wa.me/8613800138000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp 联系我们
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InquirySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    }>
      <InquirySuccessContent />
    </Suspense>
  )
}
