"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"
import { updateProfile } from "@/lib/actions/auth"
import type { Profile } from "@/lib/types"

interface ProfileFormProps {
  profile: Profile | null
  email: string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    companyName: profile?.company_name || "",
    whatsapp: profile?.whatsapp || "",
    country: profile?.country || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.success) {
        toast.success("资料更新成功")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>邮箱</FieldLabel>
              <Input value={email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">邮箱不可修改</p>
            </Field>

            <Field>
              <FieldLabel>姓名</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="您的姓名"
              />
            </Field>

            <Field>
              <FieldLabel>公司名称</FieldLabel>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="您的公司名称"
              />
            </Field>

            <Field>
              <FieldLabel>WhatsApp 号码</FieldLabel>
              <Input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+86 xxx xxxx xxxx"
              />
              <p className="text-xs text-muted-foreground">请包含国家区号，方便我们联系您</p>
            </Field>

            <Field>
              <FieldLabel>国家/地区</FieldLabel>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="您所在的国家或地区"
              />
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "保存中..." : "保存修改"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
