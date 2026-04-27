import { Suspense } from "react"
import { getCachedCategories, getCachedProducts } from "@/lib/cache"
import { ProductsClient } from "./products-client"
import { Skeleton } from "@/components/ui/skeleton"

// Enable edge runtime for faster response
export const runtime = 'edge'

// Revalidate every 5 minutes with stale-while-revalidate
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  
  const categoryId = typeof resolvedParams.category === 'string' ? resolvedParams.category : ''
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''
  const filter = typeof resolvedParams.filter === 'string' ? resolvedParams.filter as 'hot' | 'new' | '' : ''
  
  // Use cached data - runs in parallel
  const [categories, products] = await Promise.all([
    getCachedCategories(),
    getCachedProducts({ categoryId: categoryId || undefined, search: search || undefined, filter: filter || undefined })
  ])

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient 
        initialCategories={categories}
        initialProducts={products}
        initialCategory={categoryId}
        initialFilter={filter}
        initialSearch={search}
      />
    </Suspense>
  )
}
