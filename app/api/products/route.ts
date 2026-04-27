import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Enable edge runtime for faster response
export const runtime = 'edge'

// Cache control headers
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category')
  const search = searchParams.get('search')
  const filter = searchParams.get('filter')
  const limit = parseInt(searchParams.get('limit') || '50')

  const supabase = await createClient()

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
      product_colors(id, color_name, color_code),
      product_images(id, image_url, is_primary)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

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

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data || [] }, { headers: CACHE_HEADERS })
}
