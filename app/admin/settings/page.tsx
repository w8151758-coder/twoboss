"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Settings, Building2, Bell, Shield } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function SettingsPage() {
  const { locale } = useI18n()

  const t = {
    title: locale === "zh" ? "系统设置" : "Settings",
    subtitle: locale === "zh" ? "管理系统配置和参数" : "Manage system configuration and settings",
    companyInfo: locale === "zh" ? "公司信息" : "Company Information",
    companyInfoDesc: locale === "zh" ? "设置公司基本信息，将显示在报价单等文档中" : "Set company info to display on quotes and documents",
    companyName: locale === "zh" ? "公司名称" : "Company Name",
    companyNamePlaceholder: locale === "zh" ? "请输入公司名称" : "Enter company name",
    phone: locale === "zh" ? "联系电话" : "Phone",
    phonePlaceholder: locale === "zh" ? "请输入联系电话" : "Enter phone number",
    address: locale === "zh" ? "公司地址" : "Address",
    addressPlaceholder: locale === "zh" ? "请输入公司地址" : "Enter company address",
    save: locale === "zh" ? "保存" : "Save",
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
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-6">
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
                  <Input placeholder={t.companyNamePlaceholder} />
                </Field>
                <Field>
                  <FieldLabel>{t.phone}</FieldLabel>
                  <Input placeholder={t.phonePlaceholder} />
                </Field>
              </div>
              <Field>
                <FieldLabel>{t.address}</FieldLabel>
                <Input placeholder={t.addressPlaceholder} />
              </Field>
              <div className="flex justify-end">
                <Button>{t.save}</Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

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
              <div className="flex justify-end">
                <Button>{t.save}</Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

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
              <div className="flex justify-end">
                <Button>{t.save}</Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

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
                <Button>{t.changePassword}</Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
