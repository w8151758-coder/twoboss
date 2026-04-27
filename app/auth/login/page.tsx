"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Package, Lock, ArrowRight, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { signIn, signInCustomerDirect } from "@/lib/actions/auth"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const prefillEmail = searchParams.get("email") || ""
  
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState("")
  
  // 登录流程: "email" -> "password"(管理员) 或直接登录(普通客户)
  const [step, setStep] = useState<"email" | "password">("email")
  const [isAdmin, setIsAdmin] = useState(false)

  // 第一步：输入邮箱后检查用户类型并登录
  const handleContinue = async () => {
    if (!email.trim()) {
      toast.error("请输入邮箱地址")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    setLoading(true)
    try {
      // 尝试直接登录（会自动检查是否是管理员）
      const result = await signInCustomerDirect(email, redirectTo)
      
      if (result.success) {
        // 登录成功，使用 window.location 强制刷新以确保 cookies 生效
        toast.success("登录成功")
        window.location.href = result.redirectTo || redirectTo
      } else if (result.requirePassword) {
        // 是管理员，需要密码
        setIsAdmin(true)
        setStep("password")
      } else {
        toast.error(result.error || "登录失败")
      }
    } catch (error) {
      toast.error("系统错误，请重试")
    } finally {
      setLoading(false)
    }
  }

  // 管理员密码登录
  const handlePasswordLogin = async () => {
    if (!password.trim()) {
      toast.error("请输入密码")
      return
    }

    setLoading(true)
    try {
      const result = await signIn({ email, password, redirectTo })
      if (result?.error) {
        toast.error(result.error)
      }
    } catch (error) {
      // signIn 成功会 redirect
    } finally {
      setLoading(false)
    }
  }

  // 返回修改邮箱
  const handleBack = () => {
    setStep("email")
    setPassword("")
    setIsAdmin(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">男装批发</span>
        </Link>
        <CardTitle className="text-2xl">欢迎回来</CardTitle>
        <CardDescription>
          {step === "email" && "输入邮箱即可登录"}
          {step === "password" && "请输入管理员密码"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* 步骤1: 输入邮箱 */}
        {step === "email" && (
          <div className="space-y-4">
            <Field>
              <FieldLabel className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                邮箱地址
              </FieldLabel>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              />
            </Field>

            <Button 
              className="w-full gap-2" 
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  登录中...
                </>
              ) : (
                <>
                  登录
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* 步骤2: 管理员密码登录 */}
        {step === "password" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800 font-medium">管理员登录</p>
              <p className="text-xs text-amber-600 mt-1">
                邮箱：{email}
              </p>
            </div>

            <Field>
              <FieldLabel className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                密码
              </FieldLabel>
              <Input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
              />
            </Field>

            <Button 
              className="w-full" 
              onClick={handlePasswordLogin}
              disabled={loading}
            >
              {loading ? <Spinner className="h-4 w-4" /> : "登录"}
            </Button>

            <Button 
              variant="ghost" 
              className="w-full gap-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
              返回修改邮箱
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-2">
        <p className="text-center text-sm text-muted-foreground">
          还没有账户？{" "}
          <Link href="/auth/sign-up" className="text-primary hover:underline">
            立即注册
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Suspense fallback={<div className="text-muted-foreground">加载中...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
