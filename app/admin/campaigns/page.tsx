"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Megaphone, Tag, Bell, Calendar } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  discount: Tag,
  promotion: Megaphone,
  notice: Bell,
}

export default function CampaignsPage() {
  const { locale } = useI18n()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const typeLabels: Record<string, { zh: string; en: string }> = {
    discount: { zh: "折扣", en: "Discount" },
    promotion: { zh: "促销", en: "Promotion" },
    notice: { zh: "公告", en: "Notice" },
  }

  const t = {
    title: locale === "zh" ? "营销中心" : "Marketing Center",
    subtitle: locale === "zh" ? "管理营销活动和促销信息" : "Manage marketing campaigns and promotions",
    addCampaign: locale === "zh" ? "新增活动" : "New Campaign",
    active: locale === "zh" ? "进行中" : "Active",
    ended: locale === "zh" ? "已结束" : "Ended",
    noDescription: locale === "zh" ? "暂无描述" : "No description",
    notSet: locale === "zh" ? "未设置" : "Not set",
    longTerm: locale === "zh" ? "长期" : "Long-term",
    noCampaigns: locale === "zh" ? "暂无营销活动，点击上方按钮创建" : "No campaigns yet, click above to create",
  }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    setCampaigns(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Link href="/admin/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t.addCampaign}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : campaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const Icon = typeIcons[campaign.type] || Megaphone
            const isActive = campaign.is_active &&
              (!campaign.end_date || new Date(campaign.end_date) > new Date())

            return (
              <Link key={campaign.id} href={`/admin/campaigns/${campaign.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant={isActive ? "default" : "outline"}>
                        {isActive ? t.active : t.ended}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg">{campaign.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant="secondary">
                      {typeLabels[campaign.type]?.[locale] || campaign.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description || t.noDescription}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {campaign.start_date
                        ? new Date(campaign.start_date).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")
                        : t.notSet}
                      {" - "}
                      {campaign.end_date
                        ? new Date(campaign.end_date).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")
                        : t.longTerm}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t.noCampaigns}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
