"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

interface FavoriteProduct {
  id: string
  product_id: string
  created_at: string
  product: {
    id: string
    name: string
    sku: string
    moq: number
    status: string
    is_hot: boolean
    is_new: boolean
    product_images: { image_url: string; is_primary: boolean }[]
    product_colors: { color_name: string; color_code: string }[]
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 由于没有favorites表，这里用占位数据
      // 实际项目中需要创建favorites表
      setFavorites([])
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (favoriteId: string) => {
    try {
      // 实际项目中删除收藏
      setFavorites(prev => prev.filter(f => f.id !== favoriteId))
      toast.success("已取消收藏")
    } catch (error) {
      toast.error("操作失败")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">收藏款式</h1>
          <p className="text-muted-foreground mt-1">
            您收藏的产品，方便快速查看和询价
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-1">
          {favorites.length} 件
        </Badge>
      </div>

      {favorites.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            const product = favorite.product
            const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
            
            return (
              <Card key={favorite.id} className="overflow-hidden">
                <div className="relative aspect-[4/3]">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {product.is_hot && (
                      <Badge className="bg-red-500 text-white">热销</Badge>
                    )}
                    {product.is_new && (
                      <Badge className="bg-green-500 text-white">新品</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500"
                    onClick={() => removeFavorite(favorite.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    款号：{product.sku}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {product.product_colors?.slice(0, 4).map((color, idx) => (
                      <div
                        key={idx}
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: color.color_code }}
                        title={color.color_name}
                      />
                    ))}
                    {(product.product_colors?.length || 0) > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{product.product_colors.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/products/${product.id}`}>
                        查看详情
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1 gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      加入询价
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">暂无收藏</h3>
            <p className="mt-2 text-muted-foreground text-center">
              浏览产品时点击心形图标即可收藏
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">浏览产品</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
