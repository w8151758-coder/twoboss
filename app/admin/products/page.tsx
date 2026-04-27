"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Upload, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import useSWR from "swr"

const pageSize = 20

// Optimized fetcher
const fetchProducts = async (key: string) => {
  const params = new URLSearchParams(key.split('?')[1] || '')
  const page = parseInt(params.get('page') || '1')
  const search = params.get('search') || ''
  const categoryId = params.get('category') || ''
  
  const supabase = createClient()
  
  let query = supabase
    .from("products")
    .select(`
      id, sku, name, status, is_active, images,
      category:categories(id, name),
      product_colors(id),
      product_sizes(id)
    `, { count: "exact" })

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return { products: data || [], totalPages: Math.ceil((count || 0) / pageSize) }
}

const fetchCategories = async () => {
  const supabase = createClient()
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
  return data || []
}

export default function ProductsPage() {
  const { locale } = useI18n()
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, categoryId])

  const swrKey = useMemo(() => 
    `/products?page=${page}&search=${debouncedSearch}&category=${categoryId}`,
    [page, debouncedSearch, categoryId]
  )

  const { data: categories } = useSWR('categories', fetchCategories, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  })

  const { data, isLoading } = useSWR(swrKey, fetchProducts, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  })

  const products = data?.products || []
  const totalPages = data?.totalPages || 1

  const t = useMemo(() => ({
    title: locale === "zh" ? "产品列表" : "Products",
    subtitle: locale === "zh" ? "管理产品目录和规格" : "Manage product catalog and specifications",
    import: locale === "zh" ? "导入产品" : "Import Products",
    add: locale === "zh" ? "添加产品" : "Add Product",
    list: locale === "zh" ? "产品列表" : "Product List",
    searchPlaceholder: locale === "zh" ? "搜索产品..." : "Search products...",
    allCategories: locale === "zh" ? "全部分类" : "All Categories",
    image: locale === "zh" ? "图片" : "Image",
    name: locale === "zh" ? "名称" : "Name",
    sku: locale === "zh" ? "货号" : "SKU",
    category: locale === "zh" ? "分类" : "Category",
    colors: locale === "zh" ? "颜色" : "Colors",
    sizes: locale === "zh" ? "尺码" : "Sizes",
    status: locale === "zh" ? "状态" : "Status",
    actions: locale === "zh" ? "操作" : "Actions",
    edit: locale === "zh" ? "编辑" : "Edit",
    active: locale === "zh" ? "上架" : "Active",
    inactive: locale === "zh" ? "下架" : "Inactive",
    noProducts: locale === "zh" ? "暂无产品" : "No products found",
    previous: locale === "zh" ? "上一页" : "Previous",
    next: locale === "zh" ? "下一页" : "Next",
    page: locale === "zh" ? "页" : "Page",
    of: locale === "zh" ? "/" : "of",
  }), [locale])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              {t.import}
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.add}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.list}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t.allCategories}</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && products.length === 0 ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.image}</TableHead>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.sku}</TableHead>
                  <TableHead>{t.category}</TableHead>
                  <TableHead>{t.colors}</TableHead>
                  <TableHead>{t.sizes}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell>{product.product_colors?.length || 0}</TableCell>
                    <TableCell>{product.product_sizes?.length || 0}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active || product.status === 'active' ? "default" : "secondary"}>
                        {product.is_active || product.status === 'active' ? t.active : t.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/products/${product.id}`}>
                        <Button size="sm" variant="outline">{t.edit}</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">{t.noProducts}</div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t.page} {page} {t.of} {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  {t.previous}
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  {t.next}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
