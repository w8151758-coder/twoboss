"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronRight, Flame, Sparkles, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

interface CategorySidebarProps {
  categories: Category[]
}

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const searchParams = useSearchParams()
  const currentCategoryId = searchParams.get("category")
  const currentFilter = searchParams.get("filter")

  return (
    <aside className="w-full rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold text-foreground">Categories</h3>
      <nav className="flex flex-col gap-1">
        <Link
          href="/products"
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
            !currentCategoryId && !currentFilter && "bg-primary/10 text-primary font-medium"
          )}
        >
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Products
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
              currentCategoryId === category.id && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span>{category.name}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ))}
      </nav>

      {/* Quick Filters */}
      <div className="mt-6 pt-4 border-t border-border">
        <h3 className="mb-4 font-semibold text-foreground">Quick Filters</h3>
        <nav className="flex flex-col gap-1">
          <Link
            href="/products?filter=hot"
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
              currentFilter === "hot" && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              Best Sellers
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/products?filter=new"
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
              currentFilter === "new" && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              New Arrivals
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>

      {/* Contact CTA */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="rounded-lg bg-primary/5 p-4 text-center">
          <p className="text-sm font-medium text-foreground mb-2">Need Help?</p>
          <p className="text-xs text-muted-foreground mb-3">
            Contact us for custom quotes
          </p>
          <a 
            href="https://wa.me/8618888888888" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </aside>
  )
}
