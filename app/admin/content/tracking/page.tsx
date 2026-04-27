"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Save, Facebook, BarChart3, Tag, Video, Camera, Ghost, Code } from "lucide-react"

interface TrackingSettings {
  facebook_pixel_id: string
  google_analytics_id: string
  google_tag_manager_id: string
  tiktok_pixel_id: string
  pinterest_tag_id: string
  snapchat_pixel_id: string
  custom_head_scripts: string
  custom_body_scripts: string
}

const defaultSettings: TrackingSettings = {
  facebook_pixel_id: "",
  google_analytics_id: "",
  google_tag_manager_id: "",
  tiktok_pixel_id: "",
  pinterest_tag_id: "",
  snapchat_pixel_id: "",
  custom_head_scripts: "",
  custom_body_scripts: "",
}

export default function TrackingPage() {
  const [settings, setSettings] = useState<TrackingSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const supabase = createClient()
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .eq("category", "tracking")

    if (data) {
      const newSettings = { ...defaultSettings }
      data.forEach((item) => {
        if (item.key in newSettings) {
          (newSettings as any)[item.key] = item.value || ""
        }
      })
      setSettings(newSettings)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from("site_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key)
      }
      toast.success("追踪设置已保存")
    } catch (error) {
      toast.error("保存失败，请重试")
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const pixelPlatforms = [
    {
      key: "facebook_pixel_id",
      name: "Facebook Pixel",
      icon: Facebook,
      color: "bg-blue-500",
      placeholder: "例如: 1234567890123456",
      description: "用于追踪 Facebook 和 Instagram 广告转化",
    },
    {
      key: "google_analytics_id",
      name: "Google Analytics",
      icon: BarChart3,
      color: "bg-orange-500",
      placeholder: "例如: G-XXXXXXXXXX 或 UA-XXXXXXXX-X",
      description: "用于网站流量分析和用户行为追踪",
    },
    {
      key: "google_tag_manager_id",
      name: "Google Tag Manager",
      icon: Tag,
      color: "bg-blue-400",
      placeholder: "例如: GTM-XXXXXXX",
      description: "统一管理所有追踪代码和标签",
    },
    {
      key: "tiktok_pixel_id",
      name: "TikTok Pixel",
      icon: Video,
      color: "bg-black",
      placeholder: "例如: CXXXXXXXXXXXXXXXXX",
      description: "用于追踪 TikTok 广告转化",
    },
    {
      key: "pinterest_tag_id",
      name: "Pinterest Tag",
      icon: Camera,
      color: "bg-red-500",
      placeholder: "例如: 1234567890123",
      description: "用于追踪 Pinterest 广告转化",
    },
    {
      key: "snapchat_pixel_id",
      name: "Snapchat Pixel",
      icon: Ghost,
      color: "bg-yellow-400",
      placeholder: "例如: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      description: "用于追踪 Snapchat 广告转化",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">像素追踪</h1>
          <p className="text-muted-foreground">管理广告平台追踪代码和分析工具</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "保存中..." : "保存设置"}
        </Button>
      </div>

      <Tabs defaultValue="pixels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pixels">广告像素</TabsTrigger>
          <TabsTrigger value="custom">自定义代码</TabsTrigger>
        </TabsList>

        <TabsContent value="pixels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {pixelPlatforms.map((platform) => {
              const Icon = platform.icon
              const value = settings[platform.key as keyof TrackingSettings]
              const isActive = !!value

              return (
                <Card key={platform.key} className={isActive ? "border-primary" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${platform.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{platform.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {platform.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "已启用" : "未配置"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor={platform.key}>Pixel ID / 追踪 ID</Label>
                      <Input
                        id={platform.key}
                        value={value}
                        onChange={(e) =>
                          setSettings({ ...settings, [platform.key]: e.target.value })
                        }
                        placeholder={platform.placeholder}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>自定义 Head 脚本</CardTitle>
                  <CardDescription>
                    添加到 &lt;head&gt; 标签中的自定义脚本，如其他追踪代码、元标签等
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.custom_head_scripts}
                onChange={(e) =>
                  setSettings({ ...settings, custom_head_scripts: e.target.value })
                }
                placeholder={`<!-- 在这里粘贴您的自定义脚本 -->
<script>
  // 您的追踪代码
</script>`}
                className="font-mono text-sm min-h-[200px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>自定义 Body 脚本</CardTitle>
                  <CardDescription>
                    添加到 &lt;body&gt; 标签末尾的自定义脚本，如聊天工具、弹窗等
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.custom_body_scripts}
                onChange={(e) =>
                  setSettings({ ...settings, custom_body_scripts: e.target.value })
                }
                placeholder={`<!-- 在这里粘贴您的自定义脚本 -->
<script>
  // 您的脚本代码
</script>`}
                className="font-mono text-sm min-h-[200px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">使用说明</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 只需填写对应平台的 Pixel ID 或追踪 ID，系统会自动生成追踪代码</li>
            <li>• Facebook Pixel ID 通常是一串 15-16 位数字</li>
            <li>• Google Analytics 4 的 ID 格式为 G-XXXXXXXXXX</li>
            <li>• Google Tag Manager 的 ID 格式为 GTM-XXXXXXX</li>
            <li>• 保存后追踪代码会自动注入到网站的所有页面</li>
            <li>• 如需添加其他追踪代码，可使用"自定义代码"标签页</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
