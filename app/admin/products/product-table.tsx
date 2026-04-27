"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  sku: string
  moq: number
  status: string
  is_hot: boolean
  is_new: boolean
  created_at: string
  category?: {
    id: string
    name: string
  }
  product_colors?: { id: string; color_name: string; color_code: string }[]
  product_sizes?: { id: string; size_name: string }[]
  price_rules?: { min_qty: number; unit_price: number }[]
}

interface ProductTableProps {
  products: Product[]
  currentPage: number
  totalPages: number
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  draft: "bg-yellow-100 text-yellow-700",
}

export function ProductTable({ products, currentPage, totalPages }: ProductTableProps) {
  const router = useRouter()

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    const supabase = createClient()
    await supabase
      .from("products")
      .update({ status: newStatus })
      .eq("id", id)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product? Related colors, sizes and price rules will also be deleted.")) return
    const supabase = createClient()
    await supabase.from("products").delete().eq("id", id)
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No products found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price Range</TableHead>
            <TableHead>Colors</TableHead>
            <TableHead>MOQ</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const lowestPrice = product.price_rules?.reduce((min, rule) => 
              rule.unit_price < min ? rule.unit_price : min,
              product.price_rules?.[0]?.unit_price || 0
            )
            const highestPrice = product.price_rules?.reduce((max, rule) => 
              rule.unit_price > max ? rule.unit_price : max,
              0
            )
            
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.name}</span>
                    {product.is_hot && <Badge className="bg-red-500 text-white text-xs">HOT</Badge>}
                    {product.is_new && <Badge className="bg-blue-500 text-white text-xs">NEW</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell>{product.category?.name || "-"}</TableCell>
                <TableCell>
                  {lowestPrice && highestPrice ? (
                    <span className="text-accent font-medium">
                      ${lowestPrice.toFixed(2)} - ${highestPrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {product.product_colors?.slice(0, 4).map((color) => (
                      <div
                        key={color.id}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color.color_code || "#ccc" }}
                        title={color.color_name}
                      />
                    ))}
                    {(product.product_colors?.length || 0) > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{(product.product_colors?.length || 0) - 4}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.moq}</TableCell>
                <TableCell>
                  <Badge 
                    className={`cursor-pointer ${statusColors[product.status]}`}
                    onClick={() => handleToggleStatus(product.id, product.status)}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/products/${product.id}`} target="_blank">
                      <Button size="icon" variant="ghost" title="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/products/${product.id}`}>
                      <Button size="icon" variant="ghost" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(product.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => router.push(`?page=${currentPage - 1}`)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => router.push(`?page=${currentPage + 1}`)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
