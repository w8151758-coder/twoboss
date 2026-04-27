"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Minus, Plus, ChevronRight, Check, Truck, Shield, MessageCircle, Flame, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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
import type { Product, ProductImage, ProductColor, ProductSize, PriceRule, Category } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProductDetailClientProps {
  product: Product & { category?: Category | null }
  images: ProductImage[]
  colors: ProductColor[]
  sizes: ProductSize[]
  priceRules: PriceRule[]
  isLoggedIn: boolean
}

// 规格选择项类型
interface SpecItem {
  id: string
  color: string
  colorCode: string
  size: string
  quantity: number
}

export function ProductDetailClient({
  product,
  images,
  colors,
  sizes,
}: ProductDetailClientProps) {
  const { addToCart } = useCart()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0]?.color_name || null)
  const [selectedColorCode, setSelectedColorCode] = useState<string>(colors[0]?.color_code || '#ccc')
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0]?.size_name || null)
  const [note, setNote] = useState("")
  
  // 存储每个颜色+尺寸组合的数量
  const [specItems, setSpecItems] = useState<SpecItem[]>([])
  
  // 当前选中组合的数量输入
  const [currentQuantity, setCurrentQuantity] = useState(0)

  // 生成唯一ID
  const generateSpecId = (color: string, size: string) => `${color}-${size}`

  // 更新当前选中组合的数量
  const updateSpecQuantity = (newQuantity: number) => {
    if (!selectedColor || !selectedSize) return
    
    const specId = generateSpecId(selectedColor, selectedSize)
    const validQuantity = Math.max(0, newQuantity)
    
    setSpecItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === specId)
      
      if (validQuantity === 0) {
        // 数量为0时移除该规格
        return prev.filter(item => item.id !== specId)
      }
      
      if (existingIndex >= 0) {
        // 更新已存在的规格
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: validQuantity
        }
        return updated
      } else {
        // 添加新规格
        return [...prev, {
          id: specId,
          color: selectedColor,
          colorCode: selectedColorCode,
          size: selectedSize,
          quantity: validQuantity
        }]
      }
    })
    
    setCurrentQuantity(validQuantity)
  }

  // 当颜色或尺寸改变时，更新当前数量显示
  const handleColorChange = (colorName: string, colorCode: string) => {
    setSelectedColor(colorName)
    setSelectedColorCode(colorCode)
    // 获取新组合的数量
    if (selectedSize) {
      const specId = generateSpecId(colorName, selectedSize)
      const existingSpec = specItems.find(item => item.id === specId)
      setCurrentQuantity(existingSpec?.quantity || 0)
    }
  }

  const handleSizeChange = (sizeName: string) => {
    setSelectedSize(sizeName)
    // 获取新组合的数量
    if (selectedColor) {
      const specId = generateSpecId(selectedColor, sizeName)
      const existingSpec = specItems.find(item => item.id === specId)
      setCurrentQuantity(existingSpec?.quantity || 0)
    }
  }

  // 删除某个规格
  const removeSpecItem = (specId: string) => {
    setSpecItems(prev => prev.filter(item => item.id !== specId))
    // 如果删除的是当前选中的规格，重置当前数量
    if (selectedColor && selectedSize && generateSpecId(selectedColor, selectedSize) === specId) {
      setCurrentQuantity(0)
    }
  }

  // 计算总数量
  const totalQuantity = useMemo(() => {
    return specItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [specItems])

  const displayImages = images.length > 0 ? images : [{ id: 'placeholder', image_url: '/placeholder-product.jpg', is_primary: true, sort_order: 0, product_id: product.id, created_at: '' }]
  const mainImageUrl = displayImages[0]?.image_url || '/placeholder-product.jpg'

  const handleAddToCart = () => {
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
      specs: specItems.map(spec => ({
        color: spec.color,
        size: spec.size,
        qty: spec.quantity
      })),
      note: note || undefined,
    })

    toast.success(`已添加 ${specItems.length} 个规格到询价车`)
    setSpecItems([])
    setCurrentQuantity(0)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-primary transition-colors shrink-0">首页</Link>
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
        <Link href="/products" className="hover:text-primary transition-colors shrink-0">产品</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <Link href={`/products?category=${product.category.id}`} className="hover:text-primary transition-colors shrink-0">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
        <span className="text-foreground truncate max-w-[120px] sm:max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={displayImages[selectedImageIndex]?.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {product.is_hot && (
                <Badge variant="destructive" className="gap-1">
                  <Flame className="h-3 w-3" />
                  热销
                </Badge>
              )}
              {product.is_new && (
                <Badge className="gap-1 bg-green-500 text-white">
                  <Sparkles className="h-3 w-3" />
                  新品
                </Badge>
              )}
            </div>
          </div>
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {displayImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                    selectedImageIndex === index ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border"
                  )}
                >
                  <Image src={image.image_url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide mb-1">
              款号: {product.sku}
            </p>
            <h1 className="mb-2 text-xl sm:text-2xl font-bold text-foreground lg:text-3xl">{product.name}</h1>
            {product.description && (
              <p className="text-sm sm:text-base text-muted-foreground">{product.description}</p>
            )}
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="rounded-lg bg-muted/50 p-2 sm:p-3">
              <p className="text-muted-foreground text-[10px] sm:text-xs">面料</p>
              <p className="font-semibold text-foreground text-xs sm:text-sm truncate">{product.fabric || '待定'}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 sm:p-3">
              <p className="text-muted-foreground text-[10px] sm:text-xs">定制Logo</p>
              <p className="font-semibold text-foreground text-xs sm:text-sm">{product.supports_logo ? '是' : '否'}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 sm:p-3">
              <p className="text-muted-foreground text-[10px] sm:text-xs">可选颜色</p>
              <p className="font-semibold text-foreground text-xs sm:text-sm">{colors.length} 种</p>
            </div>
          </div>

          <Separator />

          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-medium">
                颜色: <span className="text-primary font-semibold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorChange(color.color_name, color.color_code || '#ccc')}
                    className={cn(
                      "relative h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 transition-all",
                      selectedColor === color.color_name 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    )}
                    style={{ backgroundColor: color.color_code || '#ccc' }}
                    title={color.color_name}
                  >
                    {selectedColor === color.color_name && (
                      <Check className={cn(
                        "absolute inset-0 m-auto h-4 w-4 sm:h-5 sm:w-5",
                        color.color_code && color.color_code.toLowerCase() !== '#ffffff' ? 'text-white' : 'text-foreground'
                      )} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-medium">
                尺码: <span className="text-primary font-semibold">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size.id}
                    variant={selectedSize === size.size_name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSizeChange(size.size_name)}
                    className="min-w-[40px] sm:min-w-[48px] h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {size.size_name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity for current color+size */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              数量 
              {selectedColor && selectedSize && (
                <span className="text-muted-foreground ml-2">
                  ({selectedColor} / {selectedSize})
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <Button
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
                variant="outline" 
                size="icon" 
                onClick={() => updateSpecQuantity(currentQuantity + 1)}
                disabled={!selectedColor || !selectedSize}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground">件</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              选择颜色和尺码后填写数量，可添加多个规格
            </p>
          </div>

          {/* Selected Specs Summary Table */}
          {specItems.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                <h3 className="font-medium text-sm">已选规格明细</h3>
                <span className="text-sm text-muted-foreground">
                  共 {specItems.length} 个规格，{totalQuantity} 件
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">颜色</TableHead>
                    <TableHead className="w-[80px]">尺码</TableHead>
                    <TableHead className="w-[100px] text-right">数量</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specItems.map((spec) => (
                    <TableRow 
                      key={spec.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedColor === spec.color && selectedSize === spec.size && "bg-primary/5"
                      )}
                      onClick={() => {
                        handleColorChange(spec.color, spec.colorCode)
                        handleSizeChange(spec.size)
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 w-4 rounded-full border border-border"
                            style={{ backgroundColor: spec.colorCode }}
                          />
                          <span className="text-sm">{spec.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>{spec.size}</TableCell>
                      <TableCell className="text-right font-medium">{spec.quantity}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSpecItem(spec.id)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="mb-2 block text-sm font-medium">备注说明（选填）</label>
            <Textarea
              placeholder="如: 定制Logo位置、特殊包装要求、颜色配比说明..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Add to Cart */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={specItems.length === 0}
            >
              <ShoppingCart className="h-5 w-5" />
              {specItems.length > 0 ? `加入询价车 (${totalQuantity}件)` : '加入询价车'}
            </Button>
            <Link href="/inquiry-cart" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                查看询价车
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
            <div className="text-center">
              <div className="mx-auto mb-1 sm:mb-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">全球配送</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 sm:mb-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">品质保证</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 sm:mb-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">专属客服</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
