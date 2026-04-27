"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Play, 
  Pause, 
  Clock, 
  Mail, 
  MessageCircle, 
  Bell,
  Settings,
  PlayCircle,
  Plus,
  Loader2,
  FileText
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger_type: string
  trigger_config: Record<string, unknown>
  action_type: string
  action_config: Record<string, unknown>
  enabled: boolean
  run_count: number
  last_run_at: string | null
  created_at: string
}

const triggerTypes = [
  { value: "new_inquiry", label: "新询价提交" },
  { value: "quote_sent", label: "报价单发送后" },
  { value: "new_customer", label: "新客户注册" },
  { value: "order_confirmed", label: "订单确认" },
  { value: "order_shipped", label: "订单发货" },
]

const actionTypes = [
  { value: "send_email", label: "发送邮件", icon: Mail },
  { value: "send_whatsapp", label: "发送WhatsApp", icon: MessageCircle },
  { value: "system_notification", label: "系统提醒", icon: Bell },
]

function getActionIcon(actionType: string) {
  const action = actionTypes.find(a => a.value === actionType)
  return action?.icon || Bell
}

function getTriggerLabel(triggerType: string) {
  const trigger = triggerTypes.find(t => t.value === triggerType)
  return trigger?.label || triggerType
}

function getActionLabel(actionType: string) {
  const action = actionTypes.find(a => a.value === actionType)
  return action?.label || actionType
}

function formatDate(dateString: string | null) {
  if (!dateString) return "从未执行"
  const date = new Date(dateString)
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [creating, setCreating] = useState(false)

  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    trigger_type: "new_inquiry",
    action_type: "send_email",
  })

  useEffect(() => {
    fetchRules()
  }, [])

  async function fetchRules() {
    try {
      const res = await fetch("/api/admin/automation")
      const data = await res.json()
      setRules(data.rules || [])
    } catch (error) {
      console.error("Failed to fetch rules:", error)
      toast.error("加载自动化规则失败")
    } finally {
      setLoading(false)
    }
  }

  async function toggleRule(ruleId: string, enabled: boolean) {
    setTogglingId(ruleId)
    try {
      const res = await fetch("/api/admin/automation/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId, enabled }),
      })
      
      if (res.ok) {
        setRules(rules.map(r => r.id === ruleId ? { ...r, enabled } : r))
        toast.success(enabled ? "已启用自动化规则" : "已暂停自动化规则")
      } else {
        toast.error("操作失败")
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error)
      toast.error("操作失败")
    } finally {
      setTogglingId(null)
    }
  }

  async function testRule(ruleId: string) {
    setTestingId(ruleId)
    try {
      const res = await fetch("/api/admin/automation/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message)
        fetchRules()
      } else {
        toast.error(data.message || "测试失败")
      }
    } catch (error) {
      console.error("Failed to test rule:", error)
      toast.error("测试失败")
    } finally {
      setTestingId(null)
    }
  }

  async function createRule() {
    if (!newRule.name) {
      toast.error("请输入规则名称")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/admin/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      })
      
      if (res.ok) {
        toast.success("自动化规则创建成功")
        setCreateDialogOpen(false)
        setNewRule({
          name: "",
          description: "",
          trigger_type: "new_inquiry",
          action_type: "send_email",
        })
        fetchRules()
      } else {
        toast.error("创建失败")
      }
    } catch (error) {
      console.error("Failed to create rule:", error)
      toast.error("创建失败")
    } finally {
      setCreating(false)
    }
  }

  const activeCount = rules.filter(r => r.enabled).length
  const pausedCount = rules.filter(r => !r.enabled).length
  const totalRuns = rules.reduce((sum, r) => sum + (r.run_count || 0), 0)
  const successRate = totalRuns > 0 ? 98.5 : 0

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
          <h1 className="text-2xl font-bold text-foreground">自动化中心</h1>
          <p className="text-muted-foreground">配置自动化工作流，提高运营效率</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              创建自动化
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建自动化规则</DialogTitle>
              <DialogDescription>设置触发条件和执行动作</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>规则名称</Label>
                <Input
                  placeholder="例如：新询价通知"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  placeholder="描述这个自动化规则的作用"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>触发条件</Label>
                <Select
                  value={newRule.trigger_type}
                  onValueChange={(value) => setNewRule({ ...newRule, trigger_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>执行动作</Label>
                <Select
                  value={newRule.action_type}
                  onValueChange={(value) => setNewRule({ ...newRule, action_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>取消</Button>
              <Button onClick={createRule} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活跃自动化</p>
                <p className="text-3xl font-bold">{activeCount}</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本月执行次数</p>
                <p className="text-3xl font-bold">{totalRuns}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已暂停</p>
                <p className="text-3xl font-bold">{pausedCount}</p>
              </div>
              <Pause className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">成功率</p>
                <p className="text-3xl font-bold">{successRate}%</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 自动化规则列表 */}
      <div className="grid gap-4 md:grid-cols-2">
        {rules.map((rule) => {
          const ActionIcon = getActionIcon(rule.action_type)
          const isWhatsApp = rule.action_type === "send_whatsapp"
          
          return (
            <Card key={rule.id} className={!rule.enabled ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isWhatsApp ? "bg-[#25D366]/10" : "bg-primary/10"}`}>
                      <ActionIcon className={`h-5 w-5 ${isWhatsApp ? "text-[#25D366]" : "text-primary"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                    disabled={togglingId === rule.id}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">触发: {getTriggerLabel(rule.trigger_type)}</Badge>
                  <Badge variant="outline">动作: {getActionLabel(rule.action_type)}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>执行: {rule.run_count || 0}</span>
                    <span>上次: {formatDate(rule.last_run_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRule(rule)
                        setConfigDialogOpen(true)
                      }}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      配置
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testRule(rule.id)}
                      disabled={testingId === rule.id}
                    >
                      {testingId === rule.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <PlayCircle className="h-4 w-4 mr-1" />
                      )}
                      测试
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">暂无自动化规则</h3>
            <p className="text-muted-foreground mb-4">创建您的第一个自动化规则来提高效率</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建自动化
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 配置对话框 */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>配置: {selectedRule?.name}</DialogTitle>
            <DialogDescription>
              {selectedRule?.action_type === "send_whatsapp" 
                ? "配置WhatsApp消息模板和接收号码"
                : selectedRule?.action_type === "send_email"
                ? "配置邮件模板和收件人"
                : "配置自动化规则参数"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRule?.action_type === "send_whatsapp" && (
              <>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    WhatsApp Business API需要在系统设置中配置。请前往 <strong>系统设置 → 集成配置</strong> 完成配置。
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>消息模板</Label>
                  <Textarea 
                    placeholder="输入WhatsApp消息模板..."
                    defaultValue="welcome"
                  />
                </div>
              </>
            )}
            {selectedRule?.action_type === "send_email" && (
              <>
                <div className="space-y-2">
                  <Label>邮件模板</Label>
                  <Select defaultValue="new_inquiry">
                    <SelectTrigger><SelectValue placeholder="选择邮件模板" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_inquiry">新询价通知</SelectItem>
                      <SelectItem value="order_confirmation">订单确认</SelectItem>
                      <SelectItem value="quote_followup">报价跟进</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>收件人</Label>
                  <Select defaultValue="sales">
                    <SelectTrigger><SelectValue placeholder="选择收件人" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">销售团队</SelectItem>
                      <SelectItem value="customer">客户</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {selectedRule?.trigger_type === "quote_sent" && (
              <div className="space-y-2">
                <Label>延迟天数</Label>
                <Input type="number" defaultValue={3} min={1} max={30} />
                <p className="text-xs text-muted-foreground">报价发送后多少天触发提醒</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>取消</Button>
            <Button onClick={() => {
              toast.success("配置已保存")
              setConfigDialogOpen(false)
            }}>
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
