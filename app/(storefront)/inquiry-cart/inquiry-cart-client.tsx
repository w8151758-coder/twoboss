"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, Minus, Plus, ShoppingCart, Send, ArrowLeft, Package, User, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Empty } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { useCart } from "@/lib/cart-context"
import { submitInquiryFromCart, submitInquiryAsGuest } from "@/lib/actions/cart"
import type { Profile } from "@/lib/types"

interface InquiryCartClientProps {
  profile: Profile | null
  isLoggedIn: boolean
}

export function InquiryCartClient({ profile, isLoggedIn }: InquiryCartClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showInquiryDialog, setShowInquiryDialog] = useState(false)
  const [inquiryNote, setInquiryNote] = useState("")
  
  // 游客信息表单
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    whatsapp: "",
    company: "",
    country: "",
    address: "",
    website: "",
    budget: "",
  })
  const [guestErrors, setGuestErrors] = useState<Record<string, string>>({})
  
  const { items, totalItems, totalQty, updateItem, removeItem, clearCart, isLoaded } = useCart()

  const handleUpdateSpecQty = (itemId: string, specIndex: number, newQty: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const newSpecs = [...item.specs]
    if (newQty <= 0) {
      newSpecs.splice(specIndex, 1)
    } else {
      newSpecs[specIndex] = { ...newSpecs[specIndex], qty: newQty }
    }

    if (newSpecs.length === 0) {
      removeItem(itemId)
    } else {
      const newTotalQty = newSpecs.reduce((sum, s) => sum + s.qty, 0)
      updateItem(itemId, { specs: newSpecs, totalQty: newTotalQty })
    }
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
    toast.success("已从询价车移除")
  }

  const handleClearCart = () => {
    clearCart()
    toast.success("询价车已清空")
  }

  const validateGuestInfo = () => {
    const errors: Record<string, string> = {}
    
    if (!guestInfo.name.trim()) {
      errors.name = "请输入您的姓名"
    }
    
    if (!guestInfo.email.trim()) {
      errors.email = "请输入邮箱地址"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
      errors.email = "请输入有效的邮箱地址"
    }
    
    if (!guestInfo.whatsapp.trim()) {
      errors.whatsapp = "请输入WhatsApp号码"
    }
    
    if (!guestInfo.country.trim()) {
      errors.country = "请输入国家/地区"
    }
    
    if (!guestInfo.budget.trim()) {
      errors.budget = "请输入预算范围"
    }
    
    setGuestErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitInquiry = () => {
    if (isLoggedIn) {
      // 已登录用户直接提交
      startTransition(async () => {
        const result = await submitInquiryFromCart({ 
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            totalQty: item.totalQty,
            specs: item.specs,
            note: item.note,
          })),
          note: inquiryNote 
        })
        
        if (result.success) {
          clearCart()
          toast.success(`询价提交成功！询价单号：${result.inquiryNo}`)
          setShowInquiryDialog(false)
          router.push(`/customer/inquiries`)
        } else {
          toast.error(result.error || "提交失败，请重试")
        }
      })
    } else {
      // 游客提交 - 验证表单
      if (!validateGuestInfo()) {
        return
      }
      
      startTransition(async () => {
        const result = await submitInquiryAsGuest({ 
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            totalQty: item.totalQty,
            specs: item.specs,
            note: item.note,
          })),
          note: inquiryNote,
          guestInfo: {
            name: guestInfo.name,
            email: guestInfo.email,
            whatsapp: guestInfo.whatsapp,
            company: guestInfo.company,
            country: guestInfo.country,
            budget: guestInfo.budget,
            website: guestInfo.website,
          }
        })
        
        if (result.success) {
          setShowInquiryDialog(false)
          clearCart()
          
          // 跳转到成功页面
          const params = new URLSearchParams({
            no: result.inquiryNo || "",
            email: result.email || guestInfo.email,
            new: result.autoLogin ? "1" : "0"
          })
          router.push(`/inquiry-success?${params.toString()}`)
        } else {
          toast.error(result.error || "提交失败，请重试")
        }
      })
    }
  }

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="animate-pulse">加载中...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <Empty
          icon={<ShoppingCart className="h-16 w-16" />}
          title="询价车为空"
          description="浏览产品目录，将心仪的产品加入询价车"
        >
          <Link href="/products">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              浏览产品
            </Button>
          </Link>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-foreground">询价车</h1>
          <p className="text-xs sm:text-base text-muted-foreground">{totalItems} 款产品，共 {totalQty} 件</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-10" onClick={handleClearCart}>
          清空
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-3 sm:space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  <Link href={`/products/${item.productId}`}>
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image 
                        src={item.productImage || "/placeholder-product.jpg"} 
                        alt={item.productName} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/products/${item.productId}`}>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">款号: {item.productSku}</p>
                          <h3 className="font-medium text-sm sm:text-base text-foreground hover:text-primary truncate">
                            {item.productName}
                          </h3>
                        </Link>
                        {item.fabric && (
                          <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">面料: {item.fabric}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Specs Table */}
                    {item.specs.length > 0 && (
                      <div className="mt-2 sm:mt-3 rounded-md border text-xs sm:text-sm">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-4">颜色</TableHead>
                              <TableHead className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-4">码</TableHead>
                              <TableHead className="h-7 sm:h-8 text-[10px] sm:text-xs text-center px-1 sm:px-4">数量</TableHead>
                              <TableHead className="h-7 sm:h-8 w-8 sm:w-10"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.specs.map((spec, idx) => (
                              <TableRow key={idx} className="hover:bg-muted/50">
                                <TableCell className="py-1.5 sm:py-2 text-xs sm:text-sm px-2 sm:px-4">{spec.color || '-'}</TableCell>
                                <TableCell className="py-1.5 sm:py-2 text-xs sm:text-sm px-2 sm:px-4">{spec.size || '-'}</TableCell>
                                <TableCell className="py-1.5 sm:py-2 px-1 sm:px-4">
                                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6 sm:h-7 sm:w-7"
                                      onClick={() => handleUpdateSpecQty(item.id, idx, spec.qty - 1)}
                                    >
                                      <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={spec.qty}
                                      onChange={(e) => handleUpdateSpecQty(item.id, idx, parseInt(e.target.value) || 0)}
                                      className="h-6 sm:h-7 w-12 sm:w-20 text-center text-xs sm:text-sm px-1 sm:px-2"
                                      min={0}
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6 sm:h-7 sm:w-7"
                                      onClick={() => handleUpdateSpecQty(item.id, idx, spec.qty + 1)}
                                    >
                                      <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="py-1.5 sm:py-2 px-1 sm:px-4">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleUpdateSpecQty(item.id, idx, 0)}
                                  >
                                    <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="border-t px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground">
                          小计: <span className="font-medium text-foreground">{item.totalQty} 件</span>
                        </div>
                      </div>
                    )}

                    {item.note && (
                      <p className="mt-2 text-xs text-muted-foreground">备注: {item.note}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20 sm:top-24">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">询价汇总</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-1.5 sm:space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                    <span className="truncate text-muted-foreground max-w-[120px] sm:max-w-[150px]">{item.productName}</span>
                    <span>x{item.totalQty}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">产品款数</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">总件数</span>
                  <span className="font-medium">{totalQty}</span>
                </div>
              </div>

              <Separator />

              {totalQty < 50 ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-sm text-amber-800 font-medium">
                    最低起订量为 50 件
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    当前共 {totalQty} 件，还需添加 {50 - totalQty} 件
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  提交询价后，注册或登录用户中心查看报价单，我们的销售团队将在24小时内为您提供报价。
                </p>
              )}

              <Button 
                className="w-full gap-2" 
                onClick={() => setShowInquiryDialog(true)}
                disabled={totalQty < 50}
              >
                <Send className="h-4 w-4" />
                提交询价 {totalQty < 50 && `(最少50件)`}
              </Button>

              <Link href="/products" className="block">
                <Button variant="outline" className="w-full gap-2">
                  <Package className="h-4 w-4" />
                  继续选品
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inquiry Dialog */}
      <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>提交询价</DialogTitle>
            <DialogDescription>
              {isLoggedIn 
                ? "确认您的联系信息，我们将在24小时内回复报价。"
                : "填写您的联系方式，我们将在24小时内回复报价。"
              }
            </DialogDescription>
          </DialogHeader>

          {isLoggedIn ? (
            // 已登录��户���示已有信息
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <h4 className="font-medium text-sm">联系信息</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">姓名:</span> {profile?.name || '未设置'}</p>
                  <p><span className="text-muted-foreground">公司:</span> {profile?.company_name || '未设置'}</p>
                  <p><span className="text-muted-foreground">邮箱:</span> {profile?.email || '未设置'}</p>
                  <p><span className="text-muted-foreground">WhatsApp:</span> {profile?.whatsapp || '未设置'}</p>
                </div>
                <Link href="/customer" className="text-xs text-primary hover:underline">
                  更新个人信息
                </Link>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <h4 className="font-medium text-sm">询价概要</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">产品款数:</span> {totalItems}</p>
                  <p><span className="text-muted-foreground">总件数:</span> {totalQty}</p>
                </div>
              </div>

              <Field>
                <FieldLabel>补充说明（选填）</FieldLabel>
                <Textarea
                  value={inquiryNote}
                  onChange={(e) => setInquiryNote(e.target.value)}
                  placeholder="特殊要求、定制需求或其他问题..."
                  rows={3}
                />
              </Field>
            </div>
          ) : (
            // 游客显示信息收集表单
            <div className="space-y-4">
              <Field>
                <FieldLabel className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  您的姓名 <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入您的姓名"
                />
                {guestErrors.name && (
                  <p className="text-xs text-destructive mt-1">{guestErrors.name}</p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    邮箱 <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                  {guestErrors.email && (
                    <p className="text-xs text-destructive mt-1">{guestErrors.email}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    WhatsApp <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    value={guestInfo.whatsapp}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+86 138 8888 8888"
                  />
                  {guestErrors.whatsapp && (
                    <p className="text-xs text-destructive mt-1">{guestErrors.whatsapp}</p>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel>公司名称（选填）</FieldLabel>
                <Input
                  value={guestInfo.company}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="您的公司名称"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>国家/地区 <span className="text-destructive">*</span></FieldLabel>
                  <Input
                    value={guestInfo.country}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="如：中国"
                  />
                  {guestErrors.country && (
                    <p className="text-xs text-destructive mt-1">{guestErrors.country}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>预算范围 <span className="text-destructive">*</span></FieldLabel>
                  <Input
                    value={guestInfo.budget}
                    onChange={(e) => setGuestInfo(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="如：$5000-10000"
                  />
                  {guestErrors.budget && (
                    <p className="text-xs text-destructive mt-1">{guestErrors.budget}</p>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel>公司网站（选填）</FieldLabel>
                <Input
                  value={guestInfo.website}
                  onChange={(e) => setGuestInfo(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.example.com"
                />
              </Field>

              <Separator />

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  提交后，系统将自动为您创建账号。您可以使用邮箱登录用户中心查看报价进度。
                </p>
              </div>

              <Field>
                <FieldLabel>补充说明（选填）</FieldLabel>
                <Textarea
                  value={inquiryNote}
                  onChange={(e) => setInquiryNote(e.target.value)}
                  placeholder="特殊要求、定制需求或其他问题..."
                  rows={2}
                />
              </Field>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInquiryDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitInquiry} disabled={isPending}>
              {isPending ? "提交中..." : "确认提交"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
