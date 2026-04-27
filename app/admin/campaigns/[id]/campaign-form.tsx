"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

interface Campaign {
  id: string
  name: string
  type: string
  description: string | null
  content: string | null
  image_url: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
}

interface CampaignFormProps {
  campaign: Campaign | null
}

export function CampaignForm({ campaign }: CampaignFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isNew = !campaign

  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    type: campaign?.type || "promotion",
    description: campaign?.description || "",
    content: campaign?.content || "",
    start_date: campaign?.start_date?.split("T")[0] || "",
    end_date: campaign?.end_date?.split("T")[0] || "",
    is_active: campaign?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const supabase = createClient()

      const data = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      }

      if (isNew) {
        const { error } = await supabase.from("campaigns").insert(data)
        if (error) {
          alert("创建失败：" + error.message)
          return
        }
      } else {
        const { error } = await supabase
          .from("campaigns")
          .update(data)
          .eq("id", campaign.id)
        if (error) {
          alert("更新失败：" + error.message)
          return
        }
      }

      router.push("/admin/campaigns")
    })
  }

  const handleDelete = async () => {
    if (!campaign || !confirm("确定要删除此活动吗？")) return

    startTransition(async () => {
      const supabase = createClient()
      await supabase.from("campaigns").delete().eq("id", campaign.id)
      router.push("/admin/campaigns")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/campaigns">
            <Button type="button" variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? "新增活动" : "编辑活动"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "创建新的营销活动" : `编辑 ${campaign.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>活动信息</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>活动名称</FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>活动类型</FieldLabel>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="promotion">促销活动</option>
                  <option value="discount">折扣优惠</option>
                  <option value="notice">公告通知</option>
                </select>
              </Field>

              <Field>
                <FieldLabel>简要描述</FieldLabel>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="活动的简要描述，将显示在列表中"
                />
              </Field>

              <Field>
                <FieldLabel>活动详情</FieldLabel>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="活动的详细内容..."
                  rows={6}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>开始日期</FieldLabel>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel>结束日期</FieldLabel>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">启用活动</span>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              关闭后活动将不会在前台展示
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
