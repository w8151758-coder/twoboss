"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"

interface AddFollowupDialogProps {
  customerId: string
}

export function AddFollowupDialog({ customerId }: AddFollowupDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: "call",
    content: "",
    next_action: "",
    next_action_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from("customer_followups").insert({
        customer_id: customerId,
        sales_id: user?.id,
        type: formData.type,
        content: formData.content,
        next_action: formData.next_action || null,
        next_action_date: formData.next_action_date || null,
      })

      if (error) {
        alert("添加失败：" + error.message)
        return
      }

      setFormData({
        type: "call",
        content: "",
        next_action: "",
        next_action_date: "",
      })
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加跟进
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加跟进记录</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>跟进方式</FieldLabel>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="call">电话</option>
                <option value="email">邮件</option>
                <option value="visit">拜访</option>
                <option value="wechat">微信</option>
                <option value="other">其他</option>
              </select>
            </Field>

            <Field>
              <FieldLabel>跟进内容</FieldLabel>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入跟进内容..."
                rows={4}
                required
              />
            </Field>

            <Field>
              <FieldLabel>下次行动</FieldLabel>
              <Input
                value={formData.next_action}
                onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                placeholder="计划的下一步行动"
              />
            </Field>

            <Field>
              <FieldLabel>计划日期</FieldLabel>
              <Input
                type="date"
                value={formData.next_action_date}
                onChange={(e) => setFormData({ ...formData, next_action_date: e.target.value })}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "保存中..." : "保存"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
