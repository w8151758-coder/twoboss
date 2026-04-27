"use client"

import { Phone, Mail, Video, MessageCircle, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Followup {
  id: string
  type: string
  content: string
  next_action: string | null
  next_action_date: string | null
  created_at: string
  sales?: {
    contact_name: string
  }
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  visit: Video,
  wechat: MessageCircle,
  other: MoreHorizontal,
}

const typeLabels: Record<string, string> = {
  call: "电话",
  email: "邮件",
  visit: "拜访",
  wechat: "微信",
  other: "其他",
}

interface FollowupListProps {
  followups: Followup[]
}

export function FollowupList({ followups }: FollowupListProps) {
  if (followups.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        暂无跟进记录
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {followups.map((followup) => {
        const Icon = typeIcons[followup.type] || MoreHorizontal
        return (
          <div
            key={followup.id}
            className="flex gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{typeLabels[followup.type]}</Badge>
                <span className="text-sm text-muted-foreground">
                  {followup.sales?.contact_name || "未知"} ·{" "}
                  {new Date(followup.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
              <p className="text-foreground">{followup.content}</p>
              {followup.next_action && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">下次行动：{followup.next_action}</p>
                  {followup.next_action_date && (
                    <p className="text-sm text-muted-foreground">
                      计划时间：{new Date(followup.next_action_date).toLocaleDateString("zh-CN")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
