import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

// Cache tags for revalidation
export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  blogPosts: 'blog-posts',
} as const

// Cache durations (in seconds) - 更激进的缓存
export const CACHE_DURATION = {
  short: 120,       // 2 minutes
  medium: 600,      // 10 minutes  
  long: 3600,       // 1 hour
  day: 86400,       // 24 hours
} as const

// Singleton admin client
let adminClient: ReturnType<typeof createAdminClient> | null = null
const getSupabase = () => {
  if (!adminClient) {
    adminClient = createAdminClient()
  }
  return adminClient
}

// Cached function to get all categories - heavily cached (1 hour)
export const getCachedCategories = unstable_cache(
  async () => {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, is_active, sort_order')
      .eq('is_active', true)
      .order('sort_order')
    
    return data || []
  },
  ['categories-all'],
  {
    revalidate: CACHE_DURATION.long,
    tags: [CACHE_TAGS.categories],
  }
)

// Cached function to get products list - optimized query
export const getCachedProducts = unstable_cache(
  async (options?: {
    categoryId?: string
    search?: string
    filter?: 'hot' | 'new' | ''
    limit?: number
  }) => {
    const supabase = getSupabase()
    
    // Build cache key from options
    const cacheKey = JSON.stringify(options || {})
    
    // Simplified select for list view - only essential fields
    let query = supabase
      .from('products')
      .select(`
        id,
        sku,
        name,
        status,
        is_hot,
        is_new,
        fabric,
        supports_logo,
        category_id,
        product_colors(id, color_name, color_code),
        product_images(id, image_url, is_primary)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }

    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%`)
    }

    if (options?.filter === 'hot') {
      query = query.eq('is_hot', true)
    } else if (options?.filter === 'new') {
      query = query.eq('is_new', true)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    } else {
      query = query.limit(100)
    }

    const { data } = await query
    return data || []
  },
  ['products-list'],
  {
    revalidate: CACHE_DURATION.short,
    tags: [CACHE_TAGS.products],
  }
)

// Cached function to get a single product - full details
export const getCachedProduct = unstable_cache(
  async (productId: string) => {
    const supabase = getSupabase()
    
    const { data } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name),
        product_colors(id, color_name, color_code, sort_order),
        product_sizes(id, size_name, sort_order),
        price_rules(id, min_qty, max_qty, unit_price),
        product_images(id, image_url, is_primary, sort_order)
      `)
      .eq('id', productId)
      .single()

    return data
  },
  ['product-detail'],
  {
    revalidate: CACHE_DURATION.medium,
    tags: [CACHE_TAGS.products],
  }
)

// Cached function to get blog posts
export const getCachedBlogPosts = unstable_cache(
  async (limit?: number) => {
    const supabase = getSupabase()
    
    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, published_at, status')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data } = await query
    return data || []
  },
  ['blog-posts-list'],
  {
    revalidate: CACHE_DURATION.long,
    tags: [CACHE_TAGS.blogPosts],
  }
)

// Cached function to get hot products for homepage
export const getCachedHotProducts = unstable_cache(
  async (limit = 8) => {
    const supabase = getSupabase()
    
    const { data } = await supabase
      .from('products')
      .select(`
        id,
        sku,
        name,
        is_hot,
        is_new,
        product_colors(id, color_name, color_code),
        product_images(id, image_url, is_primary)
      `)
      .eq('status', 'active')
      .eq('is_hot', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data || []
  },
  ['hot-products'],
  {
    revalidate: CACHE_DURATION.medium,
    tags: [CACHE_TAGS.products],
  }
)

// Cached function for product count by category
export const getCachedProductCounts = unstable_cache(
  async () => {
    const supabase = getSupabase()
    
    const { data } = await supabase
      .from('products')
      .select('category_id')
      .eq('status', 'active')

    const counts: Record<string, number> = {}
    data?.forEach(p => {
      if (p.category_id) {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1
      }
    })
    
    return counts
  },
  ['product-counts'],
  {
    revalidate: CACHE_DURATION.long,
    tags: [CACHE_TAGS.products, CACHE_TAGS.categories],
  }
)

// Cached dashboard stats
export const getCachedDashboardStats = unstable_cache(
  async () => {
    const supabase = getSupabase()

    const [
      { count: productCount },
      { count: inquiryCount },
      { count: quoteCount },
      { count: orderCount },
      { count: customerCount },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    ])

    return {
      productCount: productCount || 0,
      inquiryCount: inquiryCount || 0,
      quoteCount: quoteCount || 0,
      orderCount: orderCount || 0,
      customerCount: customerCount || 0,
    }
  },
  ['dashboard-stats'],
  {
    revalidate: CACHE_DURATION.short,
    tags: ['dashboard'],
  }
)
