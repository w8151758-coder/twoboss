"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Save, Building2, Phone, Share2, FileText } from "lucide-react"

const translations = {
  zh: {
    title: "内容管理",
    subtitle: "管理网站内容、联系方式和社交媒体",
    general: "基本信息",
    contact: "联系方式",
    social: "社交媒体",
    pages: "页面内容",
    companyName: "公司名称",
    companyDescription: "公司简介",
    whatsapp: "WhatsApp",
    email: "邮箱",
    address: "地址",
    businessHours: "营业时间",
    facebookUrl: "Facebook",
    instagramUrl: "Instagram",
    linkedinUrl: "LinkedIn",
    twitterUrl: "Twitter/X",
    aboutContent: "关于我们内容",
    save: "保存",
    saving: "保存中...",
    saved: "设置已保存",
    error: "保存失败",
  },
  en: {
    title: "Content Management",
    subtitle: "Manage website content, contact info and social media",
    general: "General",
    contact: "Contact",
    social: "Social Media",
    pages: "Pages",
    companyName: "Company Name",
    companyDescription: "Company Description",
    whatsapp: "WhatsApp",
    email: "Email",
    address: "Address",
    businessHours: "Business Hours",
    facebookUrl: "Facebook",
    instagramUrl: "Instagram",
    linkedinUrl: "LinkedIn",
    twitterUrl: "Twitter/X",
    aboutContent: "About Us Content",
    save: "Save",
    saving: "Saving...",
    saved: "Settings saved",
    error: "Failed to save",
  },
}

export default function ContentManagementPage() {
  const { locale } = useI18n()
  const t = translations[locale as keyof typeof translations] || translations.zh
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({
    company_name: "",
    company_description: "",
    whatsapp: "",
    email: "",
    address: "",
    business_hours: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    twitter_url: "",
    about_content: "",
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const supabase = createClient()
    const { data } = await supabase.from("site_settings").select("key, value")
    
    if (data) {
      const settingsMap: Record<string, string> = {}
      data.forEach((item) => {
        settingsMap[item.key] = item.value || ""
      })
      setSettings((prev) => ({ ...prev, ...settingsMap }))
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
          .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
      }
      toast.success(t.saved)
    } catch (error) {
      toast.error(t.error)
    }
    setSaving(false)
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? t.saving : t.save}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t.general}
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="h-4 w-4" />
            {t.contact}
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            {t.social}
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="h-4 w-4" />
            {t.pages}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t.general}</CardTitle>
              <CardDescription>设置公司基本信息，将显示在网站页脚和其他位置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.companyName}</Label>
                <Input
                  value={settings.company_name}
                  onChange={(e) => updateSetting("company_name", e.target.value)}
                  placeholder="输入公司名称"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.companyDescription}</Label>
                <Textarea
                  value={settings.company_description}
                  onChange={(e) => updateSetting("company_description", e.target.value)}
                  placeholder="输入公司简介"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>{t.contact}</CardTitle>
              <CardDescription>设置联系方式，方便客户与您取得联系</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.whatsapp}</Label>
                  <Input
                    value={settings.whatsapp}
                    onChange={(e) => updateSetting("whatsapp", e.target.value)}
                    placeholder="+86 188-8888-8888"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.email}</Label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting("email", e.target.value)}
                    placeholder="sales@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.address}</Label>
                <Input
                  value={settings.address}
                  onChange={(e) => updateSetting("address", e.target.value)}
                  placeholder="中国 广州"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.businessHours}</Label>
                <Input
                  value={settings.business_hours}
                  onChange={(e) => updateSetting("business_hours", e.target.value)}
                  placeholder="周一至周六: 9:00 - 18:00 (北京时间)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>{t.social}</CardTitle>
              <CardDescription>设置社交媒体链接，将显示在网站页脚</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.facebookUrl}</Label>
                  <Input
                    value={settings.facebook_url}
                    onChange={(e) => updateSetting("facebook_url", e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.instagramUrl}</Label>
                  <Input
                    value={settings.instagram_url}
                    onChange={(e) => updateSetting("instagram_url", e.target.value)}
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.linkedinUrl}</Label>
                  <Input
                    value={settings.linkedin_url}
                    onChange={(e) => updateSetting("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/company/yourpage"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.twitterUrl}</Label>
                  <Input
                    value={settings.twitter_url}
                    onChange={(e) => updateSetting("twitter_url", e.target.value)}
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>{t.pages}</CardTitle>
              <CardDescription>设置页面内容，如关于我们等</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.aboutContent}</Label>
                <Textarea
                  value={settings.about_content}
                  onChange={(e) => updateSetting("about_content", e.target.value)}
                  placeholder="输入关于我们页面的内容..."
                  rows={10}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
