"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Eye, Flame, Sparkles, Check, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import type { Product, ProductColor, PriceRule, ProductImage, ProductSize } from "@/lib/types"

interface ProductWithDetails extends Product {
  product_colors?: ProductColor[]
  colors?: ProductColor[]
  product_sizes?: ProductSize[]
  sizes?: ProductSize[]
  price_rules?: PriceRule[]
  product_images?: ProductImage[]
  images?: ProductImage[]
}

interface ProductCardProps {
  product: ProductWithDetails
  showQuickAdd?: boolean
}

// 规格明细项
interface SpecItem {
  color: string
  colorCode: string
  size: string
  quantity: number
}

export function ProductCard({ product, showQuickAdd = false }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedColorCode, setSelectedColorCode] = useState<string>("#ccc")
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  
  // 存储每个颜色+尺寸组合的数量
  const [specQuantities, setSpecQuantities] = useState<Record<string, number>>({})

  // Get primary image or first image (support both field names)
  const allImages = product.product_images || product.images || []
  const primaryImage = allImages.find(img => img.is_primary) || allImages[0]
  const mainImageUrl = primaryImage?.image_url || "/placeholder-product.jpg"
  
  // Get colors and sizes (support both field names)
  const allColors = product.product_colors || product.colors || []
  const allSizes = product.product_sizes || product.sizes || []

  // Get available colors (first 4 for display)
  const displayColors = allColors.slice(0, 4)
  const hasMoreColors = allColors.length > 4

  // 生成规格key
  const getSpecKey = useCallback((color: string, size: string) => {
    return `${color}__${size}`
  }, [])

  // 获取当前选中规格的数量
  const currentQuantity = useMemo(() => {
    if (!selectedColor || !selectedSize) return 0
    const key = getSpecKey(selectedColor, selectedSize)
    return specQuantities[key] || 0
  }, [selectedColor, selectedSize, specQuantities, getSpecKey])

  // 更新规格数量
  const updateSpecQuantity = useCallback((newQuantity: number) => {
    if (!selectedColor || !selectedSize) return
    const key = getSpecKey(selectedColor, selectedSize)
    setSpecQuantities(prev => {
      if (newQuantity <= 0) {
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: newQuantity }
    })
  }, [selectedColor, selectedSize, getSpecKey])

  // 删除某个规格
  const removeSpec = useCallback((color: string, size: string) => {
    const key = getSpecKey(color, size)
    setSpecQuantities(prev => {
      const { [key]: _, ...rest } = prev
      return rest
    })
  }, [getSpecKey])

  // 获取已添加的规格列表
  const specItems = useMemo<SpecItem[]>(() => {
    return Object.entries(specQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([key, quantity]) => {
        const [color, size] = key.split("__")
        const colorObj = allColors.find(c => c.color_name === color)
        return {
          color,
          colorCode: colorObj?.color_code || "#ccc",
          size,
          quantity
        }
      })
  }, [specQuantities, allColors])

  // 计算总数量
  const totalQuantity = useMemo(() => {
    return specItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [specItems])

  // 选择颜色
  const handleColorSelect = useCallback((colorName: string, colorCode: string) => {
    setSelectedColor(colorName)
    setSelectedColorCode(colorCode)
  }, [])

  // 点击规格行快速选中
  const handleSpecRowClick = useCallback((item: SpecItem) => {
    setSelectedColor(item.color)
    setSelectedColorCode(item.colorCode)
    setSelectedSize(item.size)
  }, [])

  const handleQuickAdd = () => {
    // 快速添加，不选规格
    addToCart({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImage: mainImageUrl,
      fabric: product.fabric || undefined,
      supportsLogo: product.supports_logo || false,
      totalQty: 1,
      specs: [{ color: '', size: '', qty: 1 }],
    })
    toast.success(`${product.sku} 已添加到询价车`)
  }

  const handleAddWithSpecs = () => {
    if (specItems.length === 0) {
      toast.error("请选择颜色、尺寸并填写数量")
      return
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImage: mainImageUrl,
      fabric: product.fabric || undefined,
      supportsLogo: product.supports_logo || false,
      totalQty: totalQuantity,
      specs: specItems.map(item => ({
        color: item.color,
        size: item.size,
        qty: item.quantity
      })),
    })
    
    toast.success(`${product.sku} 共 ${totalQuantity} 件已添加到询价车`)
    handleClose()
  }

  // 关闭弹窗时重置
  const handleClose = () => {
    setIsOpen(false)
    setSelectedColor(null)
    setSelectedSize(null)
    setSpecQuantities({})
  }

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
        <Link href={`/products/${product.id}`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <Image
              src={mainImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              unoptimized={mainImageUrl === "/placeholder-product.jpg"}
            />
            {/* Badges */}
            <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 flex flex-col gap-0.5 sm:gap-1">
              {product.is_hot && (
                <Badge className="gap-0.5 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5 bg-primary text-primary-foreground">
                  <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  HOT
                </Badge>
              )}
              {product.is_new && (
                <Badge className="gap-0.5 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0 sm:py-0.5 bg-accent text-accent-foreground">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  NEW
                </Badge>
              )}
            </div>
            {/* Quick view overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="secondary" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                查看详情
              </Button>
            </div>
          </div>
        </Link>

        <CardContent className="p-2 sm:p-3">
          {/* SKU / Style Number */}
          <p className="text-[10px] sm:text-xs font-medium text-primary uppercase tracking-wide mb-0.5 sm:mb-1">
            {product.sku}
          </p>
          
          <Link href={`/products/${product.id}`}>
            <h3 className="line-clamp-2 text-xs sm:text-sm font-medium text-foreground transition-colors hover:text-primary">
              {product.name}
            </h3>
          </Link>
          
          {/* Colors */}
          {displayColors.length > 0 && (
            <div className="mt-1.5 sm:mt-2 flex items-center gap-0.5 sm:gap-1">
              {displayColors.map((color) => (
                <div
                  key={color.id}
                  className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border border-border"
                  style={{ backgroundColor: color.color_code || '#ccc' }}
                  title={color.color_name}
                />
              ))}
              {hasMoreColors && (
                <span className="text-[10px] sm:text-xs text-muted-foreground ml-0.5 sm:ml-1">
                  +{allColors.length - 4}
                </span>
              )}
            </div>
          )}
        </CardContent>

        {showQuickAdd && (
          <CardFooter className="flex gap-1.5 sm:gap-2 p-2 sm:p-3 pt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
              onClick={() => setIsOpen(true)}
            >
              选规格
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
              onClick={handleQuickAdd}
            >
              <ShoppingCart className="h-3 w-3" />
              <span className="hidden sm:inline">加入</span>询价
            </Button>
          </CardFooter>
        )}

        {!showQuickAdd && (
          <CardFooter className="flex gap-1.5 sm:gap-2 p-2 sm:p-3 pt-0">
            <Link href={`/products/${product.id}`} className="flex-1">
              <Button variant="outline" className="w-full gap-1 sm:gap-2 text-xs h-8" size="sm">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                查看
              </Button>
            </Link>
            <Button
              size="icon"
              className="h-8 w-8"
              onClick={handleQuickAdd}
              title="加入询价车"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Specs Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-primary">{product.sku}</span>
              <span className="text-muted-foreground">-</span>
              <span>{product.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Colors */}
            {allColors.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">选择颜色</Label>
                <div className="flex flex-wrap gap-2">
                  {allColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className={`relative h-10 w-10 rounded-full border-2 transition-all ${
                        selectedColor === color.color_name
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: color.color_code || '#ccc' }}
                      title={color.color_name}
                      onClick={() => handleColorSelect(color.color_name, color.color_code || '#ccc')}
                    >
                      {selectedColor === color.color_name && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="mt-2 text-sm text-muted-foreground">已选: {selectedColor}</p>
                )}
              </div>
            )}

            {/* Sizes */}
            {allSizes.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">选择尺码</Label>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      className={`h-10 min-w-[2.5rem] px-3 rounded-md border text-sm font-medium transition-all ${
                        selectedSize === size.size_name
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedSize(size.size_name)}
                    >
                      {size.size_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                数量
                {selectedColor && selectedSize && (
                  <span className="text-muted-foreground font-normal ml-2">
                    ({selectedColor} / {selectedSize})
                  </span>
                )}
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => updateSpecQuantity(currentQuantity - 1)}
                  disabled={!selectedColor || !selectedSize || currentQuantity <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={currentQuantity}
                  onChange={(e) => updateSpecQuantity(parseInt(e.target.value) || 0)}
                  className="w-24 text-center"
                  min={0}
                  disabled={!selectedColor || !selectedSize}
                />
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon" 
                  onClick={() => updateSpecQuantity(currentQuantity + 1)}
                  disabled={!selectedColor || !selectedSize}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(!selectedColor || !selectedSize) && (
                <p className="mt-2 text-xs text-muted-foreground">请先选择颜色和尺码</p>
              )}
            </div>

            {/* Spec Summary Table */}
            {specItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h4 className="text-sm font-medium">已选规格明细</h4>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>颜色</TableHead>
                      <TableHead>尺码</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specItems.map((item) => (
                      <TableRow 
                        key={`${item.color}__${item.size}`}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          selectedColor === item.color && selectedSize === item.size && "bg-primary/5"
                        )}
                        onClick={() => handleSpecRowClick(item)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-4 w-4 rounded-full border"
                              style={{ backgroundColor: item.colorCode }}
                            />
                            <span className="text-sm">{item.color}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.size}</TableCell>
                        <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSpec(item.color, item.size)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-muted px-4 py-2 border-t flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    共 {specItems.length} 个规格
                  </span>
                  <span className="text-sm font-medium">
                    合计: {totalQuantity} 件
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button 
              onClick={handleAddWithSpecs} 
              disabled={specItems.length === 0} 
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {specItems.length > 0 ? `加入询价车 (${totalQuantity}件)` : '加入询价车'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
