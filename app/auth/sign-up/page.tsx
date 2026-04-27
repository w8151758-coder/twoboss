"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"
import { signUp } from "@/lib/actions/auth"

export default function SignUpPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    companyName: "",
    whatsapp: "",
    country: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.name) {
      toast.error("请填写必填项")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }

    if (formData.password.length < 6) {
      toast.error("密码至少需要6个字符")
      return
    }

    startTransition(async () => {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        companyName: formData.companyName,
        whatsapp: formData.whatsapp,
        country: formData.country,
      })

      if (result.success) {
        if (result.needsEmailConfirmation) {
          toast.success("注册成功！请查收邮件验证您的账户")
          router.push("/auth/sign-up-success")
        } else {
          toast.success("注册成功")
          router.push("/")
          router.refresh()
        }
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">男装批发</span>
          </Link>
          <CardTitle className="text-2xl">注册账户</CardTitle>
          <CardDescription>注册后即可使用询价报价服务</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>邮箱 *</FieldLabel>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>姓名 *</FieldLabel>
                <Input
                  placeholder="您的姓名"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>公司名称</FieldLabel>
                <Input
                  placeholder="公司名称（选填）"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>WhatsApp</FieldLabel>
                  <Input
                    type="tel"
                    placeholder="+86 xxx"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel>国家/地区</FieldLabel>
                  <Input
                    placeholder="您所在地区"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>密码 *</FieldLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="至少6位字符"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel>确认密码 *</FieldLabel>
                <Input
                  type="password"
                  placeholder="再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "注册中..." : "注册"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              已有账户？{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                立即登录
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
