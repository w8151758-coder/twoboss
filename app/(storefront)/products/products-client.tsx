"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProductCard } from "@/components/storefront/product-card"
import { Empty } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Package, 
  Search, 
  ShoppingCart,
  Filter,
  X,
  ChevronRight,
  Flame,
  Sparkles
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Product, Category, ProductColor, ProductSize, PriceRule, ProductImage } from "@/lib/types"

interface ProductWithDetails extends Product {
  product_colors?: ProductColor[]
  product_sizes?: ProductSize[]
  price_rules?: PriceRule[]
  product_images?: ProductImage[]
}

interface ProductsClientProps {
  initialCategories: Category[]
  initialProducts: ProductWithDetails[]
  initialCategory: string
  initialFilter: string
  initialSearch: string
}

// Memoized Filter Sidebar Component
const FilterSidebar = ({ 
  categories,
  selectedCategory,
  selectedFilter,
  onCategoryChange,
  onFilterChange
}: { 
  categories: Category[]
  selectedCategory: string
  selectedFilter: string
  onCategoryChange: (id: string) => void
  onFilterChange: (filter: string) => void
}) => {
  return (
    <aside className="w-full rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold text-foreground flex items-center gap-2">
        <Filter className="h-4 w-4" />
        筛选条件
      </h3>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">产品分类</h4>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onCategoryChange("")}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-muted",
              !selectedCategory && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              全部产品
            </span>
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-muted",
                selectedCategory === category.id && "bg-primary/10 text-primary font-medium"
              )}
            >
              <span>{category.name}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </nav>
      </div>

      <div className="mb-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">产品类型</h4>
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => onFilterChange("")}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-muted",
              !selectedFilter && "bg-primary/10 text-primary font-medium"
            )}
          >
            全部类型
          </button>
          <button
            onClick={() => onFilterChange("hot")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-muted",
              selectedFilter === "hot" && "bg-primary/10 text-primary font-medium"
            )}
          >
            <Flame className="h-4 w-4 text-red-500" />
            热销款
          </button>
          <button
            onClick={() => onFilterChange("new")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-muted",
              selectedFilter === "new" && "bg-primary/10 text-primary font-medium"
            )}
          >
            <Sparkles className="h-4 w-4 text-green-500" />
            新品上架
          </button>
        </nav>
      </div>


    </aside>
  )
}

export function ProductsClient({
  initialCategories,
  initialProducts,
  initialCategory,
  initialFilter,
  initialSearch,
}: ProductsClientProps) {
  const router = useRouter()
  
  const [products, setProducts] = useState(initialProducts)
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedFilter, setSelectedFilter] = useState(initialFilter)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Memoize current category
  const currentCategory = useMemo(
    () => initialCategories.find(c => c.id === selectedCategory),
    [initialCategories, selectedCategory]
  )

  // Memoize page title
  const pageTitle = useMemo(() => {
    if (selectedFilter === "hot") return "热销款"
    if (selectedFilter === "new") return "新品上架"
    return currentCategory?.name || "全部产品"
  }, [selectedFilter, currentCategory])

  // Update URL params
  const updateFilters = useCallback((category: string, filter: string, search: string) => {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (filter) params.set("filter", filter)
    if (search) params.set("search", search)
    router.push(`/products?${params.toString()}`)
  }, [router])

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
    updateFilters(category, selectedFilter, searchQuery)
  }, [selectedFilter, searchQuery, updateFilters])

  const handleFilterChange = useCallback((filter: string) => {
    setSelectedFilter(filter)
    updateFilters(selectedCategory, filter, searchQuery)
  }, [selectedCategory, searchQuery, updateFilters])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    updateFilters(selectedCategory, selectedFilter, searchQuery)
  }, [selectedCategory, selectedFilter, searchQuery, updateFilters])

  // Fetch cart count on mount
  useEffect(() => {
    async function fetchCartCount() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: cart } = await supabase
          .from("inquiry_carts")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (cart) {
          const { count } = await supabase
            .from("inquiry_cart_items")
            .select("*", { count: "exact", head: true })
            .eq("cart_id", cart.id)

          setCartCount(count || 0)
        }
      }
    }

    fetchCartCount()
    
    const handleCartUpdate = () => fetchCartCount()
    window.addEventListener("cart-updated", handleCartUpdate)
    return () => window.removeEventListener("cart-updated", handleCartUpdate)
  }, [])

  // Update products when initial data changes
  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center gap-4">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>筛选条件</SheetTitle>
                </SheetHeader>
                <div className="p-4 overflow-y-auto h-full">
                  <FilterSidebar 
                    categories={initialCategories}
                    selectedCategory={selectedCategory}
                    selectedFilter={selectedFilter}
                    onCategoryChange={(id) => {
                      handleCategoryChange(id)
                      setMobileFiltersOpen(false)
                    }}
                    onFilterChange={(f) => {
                      handleFilterChange(f)
                      setMobileFiltersOpen(false)
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索产品名称或款号..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </form>

            <Link href="/inquiry-cart">
              <Button variant="default" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">询价车</span>
                {cartCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-accent text-accent-foreground">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {selectedFilter === "hot" && (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <Flame className="h-3 w-3" />
                    热销
                  </Badge>
                )}
                {selectedFilter === "new" && (
                  <Badge className="gap-1 text-xs bg-green-500 text-white">
                    <Sparkles className="h-3 w-3" />
                    新品
                  </Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{pageTitle}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                选择产品加入询价车，提交后获取报价
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(selectedCategory || selectedFilter || searchQuery) && (
                <>
                  {selectedCategory && currentCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {currentCategory.name}
                      <button onClick={() => handleCategoryChange("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedFilter && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedFilter === "hot" ? "热销款" : "新品上架"}
                      <button onClick={() => handleFilterChange("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      {`"${searchQuery}"`}
                      <button onClick={() => setSearchQuery("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6">
        <div className="flex gap-4 sm:gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar 
                categories={initialCategories}
                selectedCategory={selectedCategory}
                selectedFilter={selectedFilter}
                onCategoryChange={handleCategoryChange}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <Empty
                icon={<Package className="h-12 w-12" />}
                title="暂无产品"
                description="没有找到符合条件的产品，请尝试调整筛选条件"
              />
            ) : (
              <>
                <div className="mb-3 sm:mb-4 flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    共 {products.length} 个产品
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
            )}
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/8618888888888?text=您好，我对贵公司的产品感兴趣"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
        aria-label="WhatsApp 咨询"
      >
        <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}
