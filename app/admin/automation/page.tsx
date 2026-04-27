"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Zap, Plus, Play, Pause, Settings, Clock, Mail, MessageSquare, Bell, FileText } from "lucide-react"

export default function AutomationPage() {
  const { locale } = useI18n()
  
  const automations = [
    {
      id: "1",
      name: locale === "zh" ? "新询价通知" : "New Inquiry Notification",
      description: locale === "zh" ? "收到新询价时自动发送邮件通知销售团队" : "Auto-send email to sales team on new inquiry",
      trigger: locale === "zh" ? "新询价提交" : "New inquiry submitted",
      action: locale === "zh" ? "发送邮件" : "Send email",
      icon: Mail,
      enabled: true,
      runs: 156,
      lastRun: "2024-01-15 14:30",
    },
    {
      id: "2",
      name: locale === "zh" ? "报价单跟进提醒" : "Quote Follow-up Reminder",
      description: locale === "zh" ? "报价单发送3天后自动提醒跟进" : "Auto-remind to follow up 3 days after quote sent",
      trigger: locale === "zh" ? "报价单发送后3天" : "3 days after quote sent",
      action: locale === "zh" ? "系统提醒" : "System notification",
      icon: Bell,
      enabled: true,
      runs: 89,
      lastRun: "2024-01-15 09:00",
    },
    {
      id: "3",
      name: locale === "zh" ? "WhatsApp 欢迎消息" : "WhatsApp Welcome Message",
      description: locale === "zh" ? "新客户注册后自动发送WhatsApp欢迎消息" : "Auto-send WhatsApp welcome on new customer",
      trigger: locale === "zh" ? "新客户注册" : "New customer registered",
      action: locale === "zh" ? "发送WhatsApp" : "Send WhatsApp",
      icon: MessageSquare,
      enabled: false,
      runs: 45,
      lastRun: "2024-01-10 16:00",
    },
    {
      id: "4",
      name: locale === "zh" ? "订单确认邮件" : "Order Confirmation Email",
      description: locale === "zh" ? "订单确认后自动发送确认邮件给客户" : "Auto-send confirmation email after order",
      trigger: locale === "zh" ? "订单确认" : "Order confirmed",
      action: locale === "zh" ? "发送邮件" : "Send email",
      icon: FileText,
      enabled: true,
      runs: 234,
      lastRun: "2024-01-15 11:30",
    },
    {
      id: "5",
      name: locale === "zh" ? "库存预警" : "Inventory Alert",
      description: locale === "zh" ? "库存低于阈值时自动通知采购" : "Auto-notify procurement on low inventory",
      trigger: locale === "zh" ? "库存低于阈值" : "Inventory below threshold",
      action: locale === "zh" ? "系统提醒" : "System notification",
      icon: Bell,
      enabled: true,
      runs: 12,
      lastRun: "2024-01-14 08:00",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "zh" ? "自动化中心" : "Automation Center"}
          </h1>
          <p className="text-muted-foreground">
            {locale === "zh" ? "配置自动化工作流，提高运营效率" : "Configure automated workflows to improve efficiency"}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {locale === "zh" ? "创建自动化" : "Create Automation"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? "活跃自动化" : "Active Automations"}
                </p>
                <p className="text-2xl font-bold">
                  {automations.filter(a => a.enabled).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? "本月执行次数" : "Runs This Month"}
                </p>
                <p className="text-2xl font-bold">
                  {automations.reduce((sum, a) => sum + a.runs, 0)}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? "已暂停" : "Paused"}
                </p>
                <p className="text-2xl font-bold">
                  {automations.filter(a => !a.enabled).length}
                </p>
              </div>
              <Pause className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {locale === "zh" ? "成功率" : "Success Rate"}
                </p>
                <p className="text-2xl font-bold">98.5%</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.map((automation) => {
          const Icon = automation.icon
          return (
            <Card key={automation.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${automation.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{automation.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {automation.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch checked={automation.enabled} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {locale === "zh" ? "触发" : "Trigger"}: {automation.trigger}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {locale === "zh" ? "动作" : "Action"}: {automation.action}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-muted-foreground">
                    <p className="text-xs">{locale === "zh" ? "执行" : "Runs"}: {automation.runs}</p>
                    <p className="text-xs">{locale === "zh" ? "上次" : "Last"}: {automation.lastRun}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="mr-1 h-3 w-3" />
                    {locale === "zh" ? "配置" : "Configure"}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Play className="mr-1 h-3 w-3" />
                    {locale === "zh" ? "测试" : "Test"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
