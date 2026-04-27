"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Settings, Building2, Bell, Shield, Upload, Image, Globe, Loader2, Trash2, Save, MessageCircle, Mail, Link2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { toast } from "sonner"
import NextImage from "next/image"

interface SiteSettings {
  site_name: string
  logo_url: string | null
  favicon_url: string | null
  company_name: string
  company_phone: string
  company_address: string
  whatsapp_number: string
  // WhatsApp Business API
  whatsapp_api_token: string
  whatsapp_phone_id: string
  whatsapp_business_id: string
  // 邮件SMTP配置
  email_smtp_host: string
  email_smtp_port: string
  email_smtp_user: string
  email_smtp_pass: string
  email_from_address: string
  email_from_name: string
}

export default function SettingsPage() {
  const { locale } = useI18n()
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "MenswearWholesale",
    logo_url: null,
    favicon_url: null,
    company_name: "",
    company_phone: "",
    company_address: "",
    whatsapp_number: "",
    whatsapp_api_token: "",
    whatsapp_phone_id: "",
    whatsapp_business_id: "",
    email_smtp_host: "",
    email_smtp_port: "587",
    email_smtp_user: "",
    email_smtp_pass: "",
    email_from_address: "",
    email_from_name: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const t = {
    title: locale === "zh" ? "系统设置" : "Settings",
    subtitle: locale === "zh" ? "管理系统配置和参数" : "Manage system configuration and settings",
    brandSettings: locale === "zh" ? "品牌设置" : "Brand Settings",
    brandSettingsDesc: locale === "zh" ? "设置网站Logo和基本品牌信息" : "Set website logo and brand information",
    siteLogo: locale === "zh" ? "网站Logo" : "Website Logo",
    siteLogoDesc: locale === "zh" ? "上传网站Logo，将显示在网站顶部导航栏。建议尺寸：200x50px" : "Upload logo for navigation bar. Recommended: 200x50px",
    uploadLogo: locale === "zh" ? "上传Logo" : "Upload Logo",
    noLogo: locale === "zh" ? "暂无Logo" : "No Logo",
    favicon: locale === "zh" ? "网站图标 (Favicon)" : "Website Icon (Favicon)",
    faviconDesc: locale === "zh" ? "上传网站图标，将显示在浏览器标签页。建议尺寸：32x32px" : "Upload favicon for browser tab. Recommended: 32x32px",
    uploadFavicon: locale === "zh" ? "上传图标" : "Upload Icon",
    siteName: locale === "zh" ? "网站名称" : "Site Name",
    siteNamePlaceholder: locale === "zh" ? "请输入网站名称" : "Enter site name",
    companyInfo: locale === "zh" ? "公司信息" : "Company Information",
    companyInfoDesc: locale === "zh" ? "设置公司基本信息，将显示在报价单等文档中" : "Set company info to display on quotes and documents",
    companyName: locale === "zh" ? "公司名称" : "Company Name",
    companyNamePlaceholder: locale === "zh" ? "请输入公司名称" : "Enter company name",
    phone: locale === "zh" ? "联系电话" : "Phone",
    phonePlaceholder: locale === "zh" ? "请输入联系电话" : "Enter phone number",
    address: locale === "zh" ? "公司地址" : "Address",
    addressPlaceholder: locale === "zh" ? "请输入公司地址" : "Enter company address",
    whatsapp: locale === "zh" ? "WhatsApp号码" : "WhatsApp Number",
    whatsappPlaceholder: locale === "zh" ? "输入WhatsApp号码（含国家代码）" : "Enter WhatsApp number with country code",
    whatsappHint: locale === "zh" ? "例如：8618888888888（中国号码前加86）" : "Example: 8618888888888 (add 86 for China)",
    save: locale === "zh" ? "保存设置" : "Save Settings",
    saving: locale === "zh" ? "保存中..." : "Saving...",
    saveSuccess: locale === "zh" ? "设置已保存" : "Settings saved",
    saveFailed: locale === "zh" ? "保存失败" : "Save failed",
    uploadSuccess: locale === "zh" ? "上传成功" : "Upload successful",
    uploadFailed: locale === "zh" ? "上传失败" : "Upload failed",
    deleted: locale === "zh" ? "已删除" : "Deleted",
    fileFormat: locale === "zh" ? "支持 PNG、JPG、SVG、WebP 格式，最大 2MB" : "Supports PNG, JPG, SVG, WebP. Max 2MB",
    quoteSettings: locale === "zh" ? "报价设置" : "Quote Settings",
    quoteSettingsDesc: locale === "zh" ? "配置报价单相关参数" : "Configure quote-related settings",
    defaultValidDays: locale === "zh" ? "默认有效期（天）" : "Default Valid Days",
    quotePrefix: locale === "zh" ? "报价单前缀" : "Quote Prefix",
    notifications: locale === "zh" ? "通知设置" : "Notifications",
    notificationsDesc: locale === "zh" ? "配置系统通知和提醒" : "Configure system notifications",
    notificationEmail: locale === "zh" ? "通知邮箱" : "Notification Email",
    notificationEmailPlaceholder: locale === "zh" ? "接收系统通知的邮箱" : "Email for system notifications",
    security: locale === "zh" ? "安全设置" : "Security",
    securityDesc: locale === "zh" ? "管理账户安全相关设置" : "Manage account security settings",
    currentPassword: locale === "zh" ? "当前密码" : "Current Password",
    currentPasswordPlaceholder: locale === "zh" ? "请输入当前密码" : "Enter current password",
    newPassword: locale === "zh" ? "新密码" : "New Password",
    newPasswordPlaceholder: locale === "zh" ? "请输入新密码" : "Enter new password",
    confirmPassword: locale === "zh" ? "确认新密码" : "Confirm Password",
    confirmPasswordPlaceholder: locale === "zh" ? "请再次输入新密码" : "Confirm new password",
    changePassword: locale === "zh" ? "修改密码" : "Change Password",
    integrations: locale === "zh" ? "集成配置" : "Integrations",
    integrationsDesc: locale === "zh" ? "配置WhatsApp Business API和邮件服务" : "Configure WhatsApp Business API and email service",
    whatsappApi: locale === "zh" ? "WhatsApp Business API" : "WhatsApp Business API",
    whatsappApiDesc: locale === "zh" ? "配置WhatsApp Business API以启用自动消息功能" : "Configure WhatsApp Business API for automated messaging",
    apiToken: locale === "zh" ? "API Token" : "API Token",
    apiTokenPlaceholder: locale === "zh" ? "输入WhatsApp API Token" : "Enter WhatsApp API Token",
    phoneId: locale === "zh" ? "Phone Number ID" : "Phone Number ID",
    phoneIdPlaceholder: locale === "zh" ? "输入Phone Number ID" : "Enter Phone Number ID",
    businessId: locale === "zh" ? "Business Account ID" : "Business Account ID",
    businessIdPlaceholder: locale === "zh" ? "输入Business Account ID" : "Enter Business Account ID",
    emailSmtp: locale === "zh" ? "邮件服务 (SMTP)" : "Email Service (SMTP)",
    emailSmtpDesc: locale === "zh" ? "配置SMTP服务以发送邮件通知" : "Configure SMTP for email notifications",
    smtpHost: locale === "zh" ? "SMTP服务器" : "SMTP Host",
    smtpHostPlaceholder: locale === "zh" ? "例如: smtp.gmail.com" : "e.g. smtp.gmail.com",
    smtpPort: locale === "zh" ? "端口" : "Port",
    smtpUser: locale === "zh" ? "用户名" : "Username",
    smtpUserPlaceholder: locale === "zh" ? "SMTP用户名或邮箱" : "SMTP username or email",
    smtpPass: locale === "zh" ? "密码" : "Password",
    smtpPassPlaceholder: locale === "zh" ? "SMTP密码或应用专用密码" : "SMTP password or app password",
    fromEmail: locale === "zh" ? "发件人邮箱" : "From Email",
    fromEmailPlaceholder: locale === "zh" ? "发送邮件使用的邮箱地址" : "Email address for sending",
    fromName: locale === "zh" ? "发件人名称" : "From Name",
    fromNamePlaceholder: locale === "zh" ? "显示的发件人名称" : "Displayed sender name",
    testConnection: locale === "zh" ? "测试连接" : "Test Connection",
  }

  // 加载设置
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/site-settings")
      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error("加载设置失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 保存设置
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      
      if (res.ok) {
        toast.success(t.saveSuccess)
      } else {
        toast.error(t.saveFailed)
      }
    } catch (error) {
      console.error("保存失败:", error)
      toast.error(t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  // 上传图片
  const handleUpload = async (file: File, type: "logo" | "favicon") => {
    const setUploading = type === "logo" ? setUploadingLogo : setUploadingFavicon
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      
      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({
          ...prev,
          [type === "logo" ? "logo_url" : "favicon_url"]: data.url,
        }))
        toast.success(t.uploadSuccess)
      } else {
        const error = await res.json()
        toast.error(error.error || t.uploadFailed)
      }
    } catch (error) {
      console.error("上传失败:", error)
      toast.error(t.uploadFailed)
    } finally {
      setUploading(false)
    }
  }

  // 删除图片
  const handleRemoveImage = async (type: "logo" | "favicon") => {
    const settingKey = type === "logo" ? "logo_url" : "favicon_url"
    setSettings(prev => ({ ...prev, [settingKey]: null }))
    
    try {
      await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [settingKey]: null }),
      })
      toast.success(t.deleted)
    } catch (error) {
      console.error("删除失败:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? t.saving : t.save}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* 品牌设置 - Logo上传 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <CardTitle>{t.brandSettings}</CardTitle>
            </div>
            <CardDescription>{t.brandSettingsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo上传 */}
            <div>
              <h4 className="font-medium mb-2">{t.siteLogo}</h4>
              <p className="text-sm text-muted-foreground mb-4">{t.siteLogoDesc}</p>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-[200px] h-[80px] border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                    {settings.logo_url ? (
                      <NextImage
                        src={settings.logo_url}
                        alt="Logo"
                        width={180}
                        height={60}
                        className="object-contain"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Image className="h-8 w-8 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">{t.noLogo}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file, "logo")
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {t.uploadLogo}
                    </Button>
                    {settings.logo_url && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveImage("logo")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t.fileFormat}</p>
                </div>
              </div>
            </div>

            {/* Favicon上传 */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">{t.favicon}</h4>
              <p className="text-sm text-muted-foreground mb-4">{t.faviconDesc}</p>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-[80px] h-[80px] border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50 overflow-hidden">
                    {settings.favicon_url ? (
                      <NextImage
                        src={settings.favicon_url}
                        alt="Favicon"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <Globe className="h-6 w-6 text-muted-foreground opacity-50" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/x-icon,image/ico,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file, "favicon")
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingFavicon}
                    >
                      {uploadingFavicon ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {t.uploadFavicon}
                    </Button>
                    {settings.favicon_url && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveImage("favicon")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t.fileFormat}</p>
                </div>
              </div>
            </div>

            {/* 网站名称 */}
            <div className="pt-4 border-t">
              <Field>
                <FieldLabel>{t.siteName}</FieldLabel>
                <Input
                  value={settings.site_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                  placeholder={t.siteNamePlaceholder}
                  className="max-w-md"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* 公司信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>{t.companyInfo}</CardTitle>
            </div>
            <CardDescription>{t.companyInfoDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>{t.companyName}</FieldLabel>
                  <Input 
                    value={settings.company_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder={t.companyNamePlaceholder} 
                  />
                </Field>
                <Field>
                  <FieldLabel>{t.phone}</FieldLabel>
                  <Input 
                    value={settings.company_phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, company_phone: e.target.value }))}
                    placeholder={t.phonePlaceholder} 
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>{t.address}</FieldLabel>
                <Input 
                  value={settings.company_address}
                  onChange={(e) => setSettings(prev => ({ ...prev, company_address: e.target.value }))}
                  placeholder={t.addressPlaceholder} 
                />
              </Field>
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {t.whatsapp}
                </FieldLabel>
                <Input 
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder={t.whatsappPlaceholder} 
                />
                <p className="text-xs text-muted-foreground mt-1">{t.whatsappHint}</p>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* 报价设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>{t.quoteSettings}</CardTitle>
            </div>
            <CardDescription>{t.quoteSettingsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>{t.defaultValidDays}</FieldLabel>
                  <Input type="number" defaultValue={7} />
                </Field>
                <Field>
                  <FieldLabel>{t.quotePrefix}</FieldLabel>
                  <Input defaultValue="QUO" />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>{t.notifications}</CardTitle>
            </div>
            <CardDescription>{t.notificationsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>{t.notificationEmail}</FieldLabel>
                <Input type="email" placeholder={t.notificationEmailPlaceholder} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* 集成配置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <CardTitle>{t.integrations}</CardTitle>
            </div>
            <CardDescription>{t.integrationsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* WhatsApp Business API */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-[#25D366]/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-medium">{t.whatsappApi}</h4>
                  <p className="text-sm text-muted-foreground">{t.whatsappApiDesc}</p>
                </div>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel>{t.apiToken}</FieldLabel>
                  <Input 
                    type="password"
                    value={settings.whatsapp_api_token}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_api_token: e.target.value }))}
                    placeholder={t.apiTokenPlaceholder}
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>{t.phoneId}</FieldLabel>
                    <Input 
                      value={settings.whatsapp_phone_id}
                      onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_phone_id: e.target.value }))}
                      placeholder={t.phoneIdPlaceholder}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t.businessId}</FieldLabel>
                    <Input 
                      value={settings.whatsapp_business_id}
                      onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_business_id: e.target.value }))}
                      placeholder={t.businessIdPlaceholder}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </div>

            {/* 邮件SMTP配置 */}
            <div className="pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{t.emailSmtp}</h4>
                  <p className="text-sm text-muted-foreground">{t.emailSmtpDesc}</p>
                </div>
              </div>
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field className="md:col-span-2">
                    <FieldLabel>{t.smtpHost}</FieldLabel>
                    <Input 
                      value={settings.email_smtp_host}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_smtp_host: e.target.value }))}
                      placeholder={t.smtpHostPlaceholder}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t.smtpPort}</FieldLabel>
                    <Input 
                      value={settings.email_smtp_port}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_smtp_port: e.target.value }))}
                      placeholder="587"
                    />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>{t.smtpUser}</FieldLabel>
                    <Input 
                      value={settings.email_smtp_user}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_smtp_user: e.target.value }))}
                      placeholder={t.smtpUserPlaceholder}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t.smtpPass}</FieldLabel>
                    <Input 
                      type="password"
                      value={settings.email_smtp_pass}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_smtp_pass: e.target.value }))}
                      placeholder={t.smtpPassPlaceholder}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>{t.fromEmail}</FieldLabel>
                    <Input 
                      type="email"
                      value={settings.email_from_address}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_from_address: e.target.value }))}
                      placeholder={t.fromEmailPlaceholder}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t.fromName}</FieldLabel>
                    <Input 
                      value={settings.email_from_name}
                      onChange={(e) => setSettings(prev => ({ ...prev, email_from_name: e.target.value }))}
                      placeholder={t.fromNamePlaceholder}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        {/* 安全设置 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>{t.security}</CardTitle>
            </div>
            <CardDescription>{t.securityDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>{t.currentPassword}</FieldLabel>
                <Input type="password" placeholder={t.currentPasswordPlaceholder} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>{t.newPassword}</FieldLabel>
                  <Input type="password" placeholder={t.newPasswordPlaceholder} />
                </Field>
                <Field>
                  <FieldLabel>{t.confirmPassword}</FieldLabel>
                  <Input type="password" placeholder={t.confirmPasswordPlaceholder} />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button variant="outline">{t.changePassword}</Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
