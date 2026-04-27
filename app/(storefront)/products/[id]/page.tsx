import { notFound } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ProductDetailClient } from "./product-detail-client"
import { Skeleton } from "@/components/ui/skeleton"

// Enable edge runtime for faster response
export const runtime = 'edge'

// Revalidate every 5 minutes
export const revalidate = 300

interface ProductPageProps {
  params: Promise<{ id: string }>
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

async function ProductContent({ id }: { id: string }) {
  const supabase = await createClient()

  // Fetch all data in parallel for better performance
  const [productResult, imagesResult, colorsResult, sizesResult, priceRulesResult, userResult] = await Promise.all([
    supabase
      .from("products")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("id", id)
      .eq("status", "active")
      .single(),
    
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
    
    supabase
      .from("product_colors")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
    
    supabase
      .from("product_sizes")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
    
    supabase
      .from("price_rules")
      .select("*")
      .eq("product_id", id)
      .order("min_qty"),
    
    supabase.auth.getUser()
  ])

  if (productResult.error || !productResult.data) {
    notFound()
  }

  return (
    <ProductDetailClient
      product={productResult.data}
      images={imagesResult.data || []}
      colors={colorsResult.data || []}
      sizes={sizesResult.data || []}
      priceRules={priceRulesResult.data || []}
      isLoggedIn={!!userResult.data?.user}
    />
  )
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent id={id} />
    </Suspense>
  )
}
