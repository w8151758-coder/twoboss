"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string | null
  category_id: string | null
  base_price: number
  unit: string
  min_order_qty: number
  is_active: boolean
  images: string[]
}

interface Attribute {
  id: string
  name: string
  values: string[]
  sort_order: number
}

interface SKU {
  id: string
  sku_code: string
  attributes: Record<string, string>
  price: number
  stock: number
  is_active: boolean
}

interface PriceTier {
  id: string
  sku_id: string | null
  min_qty: number
  max_qty: number | null
  price: number
}

interface ProductFormProps {
  categories: Category[]
  product: Product | null
  attributes: Attribute[]
  skus: SKU[]
  priceTiers: PriceTier[]
}

export function ProductForm({
  categories,
  product,
  attributes: initialAttributes,
  skus: initialSkus,
  priceTiers: initialPriceTiers,
}: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isNew = !product

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    base_price: product?.base_price || 0,
    unit: product?.unit || "件",
    min_order_qty: product?.min_order_qty || 0,
    is_active: product?.is_active ?? true,
  })

  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes)
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(initialPriceTiers)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const supabase = createClient()

      if (isNew) {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(formData)
          .select()
          .single()

        if (error) {
          alert("创建失败：" + error.message)
          return
        }

        // 保存规格属性
        if (attributes.length > 0) {
          await supabase.from("product_attributes").insert(
            attributes.map((attr, index) => ({
              product_id: newProduct.id,
              name: attr.name,
              values: attr.values,
              sort_order: index,
            }))
          )
        }

        // 保存阶梯价格
        if (priceTiers.length > 0) {
          await supabase.from("price_tiers").insert(
            priceTiers.map((tier) => ({
              product_id: newProduct.id,
              min_qty: tier.min_qty,
              max_qty: tier.max_qty,
              price: tier.price,
            }))
          )
        }

        router.push("/admin/products")
      } else {
        const { error } = await supabase
          .from("products")
          .update(formData)
          .eq("id", product.id)

        if (error) {
          alert("更新失败：" + error.message)
          return
        }

        // 更新规格属性
        await supabase.from("product_attributes").delete().eq("product_id", product.id)
        if (attributes.length > 0) {
          await supabase.from("product_attributes").insert(
            attributes.map((attr, index) => ({
              product_id: product.id,
              name: attr.name,
              values: attr.values,
              sort_order: index,
            }))
          )
        }

        // 更新阶梯价格
        await supabase.from("price_tiers").delete().eq("product_id", product.id).is("sku_id", null)
        if (priceTiers.length > 0) {
          await supabase.from("price_tiers").insert(
            priceTiers.filter((t) => !t.sku_id).map((tier) => ({
              product_id: product.id,
              min_qty: tier.min_qty,
              max_qty: tier.max_qty,
              price: tier.price,
            }))
          )
        }

        router.push("/admin/products")
      }
    })
  }

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      { id: crypto.randomUUID(), name: "", values: [], sort_order: attributes.length },
    ])
  }

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter((a) => a.id !== id))
  }

  const updateAttribute = (id: string, field: keyof Attribute, value: string | string[]) => {
    setAttributes(
      attributes.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    )
  }

  const addPriceTier = () => {
    setPriceTiers([
      ...priceTiers,
      { id: crypto.randomUUID(), sku_id: null, min_qty: 1, max_qty: null, price: 0 },
    ])
  }

  const removePriceTier = (id: string) => {
    setPriceTiers(priceTiers.filter((t) => t.id !== id))
  }

  const updatePriceTier = (id: string, field: keyof PriceTier, value: number | null) => {
    setPriceTiers(
      priceTiers.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? "新增产品" : "编辑产品"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "创建新的产品信息" : `编辑 ${product.name}`}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "保存中..." : "保存"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 基本信息 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>产品名称</FieldLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>产品描述</FieldLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </Field>

              <Field>
                <FieldLabel>产品分类</FieldLabel>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">请选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>基础价格</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                  />
                </Field>

                <Field>
                  <FieldLabel>单位</FieldLabel>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </Field>


              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* 状态 */}
        <Card>
          <CardHeader>
            <CardTitle>状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">启用产品</span>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 规格属性 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>规格属性</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
            <Plus className="mr-2 h-4 w-4" />
            添加属性
          </Button>
        </CardHeader>
        <CardContent>
          {attributes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              暂无规格属性，点击上方按钮添加
            </p>
          ) : (
            <div className="space-y-4">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex items-start gap-4 rounded-lg border border-border p-4">
                  <div className="flex-1 space-y-4">
                    <Field>
                      <FieldLabel>属性名称</FieldLabel>
                      <Input
                        value={attr.name}
                        onChange={(e) => updateAttribute(attr.id, "name", e.target.value)}
                        placeholder="如：颜色、尺寸"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>属性值（用逗号分隔）</FieldLabel>
                      <Input
                        value={attr.values.join(",")}
                        onChange={(e) => updateAttribute(attr.id, "values", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}
                        placeholder="如：红色,蓝色,绿色"
                      />
                    </Field>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeAttribute(attr.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 阶梯价格 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>阶梯价格</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addPriceTier}>
            <Plus className="mr-2 h-4 w-4" />
            添加阶梯
          </Button>
        </CardHeader>
        <CardContent>
          {priceTiers.filter((t) => !t.sku_id).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              暂无阶梯价格，将使用基础价格
            </p>
          ) : (
            <div className="space-y-4">
              {priceTiers.filter((t) => !t.sku_id).map((tier) => (
                <div key={tier.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                  <div className="grid flex-1 grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>最小数量</FieldLabel>
                      <Input
                        type="number"
                        value={tier.min_qty}
                        onChange={(e) => updatePriceTier(tier.id, "min_qty", Number(e.target.value))}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>最大数量（留空表示无限）</FieldLabel>
                      <Input
                        type="number"
                        value={tier.max_qty || ""}
                        onChange={(e) => updatePriceTier(tier.id, "max_qty", e.target.value ? Number(e.target.value) : null)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>价格</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => updatePriceTier(tier.id, "price", Number(e.target.value))}
                      />
                    </Field>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removePriceTier(tier.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  )
}
