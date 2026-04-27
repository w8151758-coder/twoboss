"use client"

import { ProductCard } from "@/components/storefront/product-card"
import { Empty } from "@/components/ui/empty"
import { Package } from "lucide-react"
import type { Product, ProductColor, ProductSize, PriceRule, ProductImage } from "@/lib/types"

interface ProductWithDetails extends Product {
  product_colors?: ProductColor[]
  product_sizes?: ProductSize[]
  price_rules?: PriceRule[]
  product_images?: ProductImage[]
}

interface ProductsGridProps {
  products: ProductWithDetails[]
  totalCount: number
}

export function ProductsGrid({ products, totalCount }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <Empty
        icon={<Package className="h-12 w-12" />}
        title="暂无产品"
        description="没有找到符合条件的产品，请尝试调整筛选条件"
      />
    )
  }

  return (
    <>
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <p className="text-xs sm:text-sm text-muted-foreground">
          共 {totalCount} 个产品
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
          点击【选规格】可选择颜色尺码
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} showQuickAdd />
        ))}
      </div>
    </>
  )
}
