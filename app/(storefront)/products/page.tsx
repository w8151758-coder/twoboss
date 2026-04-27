import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { ProductsClient } from "./products-client"
import { Skeleton } from "@/components/ui/skeleton"

// Enable edge runtime for faster response
export const runtime = 'edge'

// Revalidate every 5 minutes
export const revalidate = 300

// Loading skeleton
function ProductsLoading() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2 sm:space-y-3">
          <Skeleton className="aspect-[4/5] w-full rounded-lg" />
          <Skeleton className="h-4 sm:h-5 w-3/4" />
          <Skeleton className="h-3 sm:h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

// Server component to fetch data
async function getProductsData(searchParams: { [key: string]: string | string[] | undefined }) {
  const supabase = await createClient()
  
  const categoryId = typeof searchParams.category === 'string' ? searchParams.category : ''
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''
  const filter = typeof searchParams.filter === 'string' ? searchParams.filter : ''
  
  // Fetch categories and products in parallel
  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    
    (async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_colors(id, color_name, color_code),
          product_sizes(id, size_name),
          price_rules(id, min_qty, unit_price),
          product_images(id, image_url, is_primary)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
      }

      if (filter === 'hot') {
        query = query.eq('is_hot', true)
      } else if (filter === 'new') {
        query = query.eq('is_new', true)
      }

      return query
    })()
  ])

  return {
    categories: categoriesResult.data || [],
    products: productsResult.data || [],
    initialCategory: categoryId,
    initialFilter: filter,
    initialSearch: search,
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const data = await getProductsData(resolvedParams)

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient 
        initialCategories={data.categories}
        initialProducts={data.products}
        initialCategory={data.initialCategory}
        initialFilter={data.initialFilter}
        initialSearch={data.initialSearch}
      />
    </Suspense>
  )
}
