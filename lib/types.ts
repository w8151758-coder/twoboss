// B2B Menswear Wholesale - Type Definitions

export type UserRole = 'customer' | 'admin' | 'sales' | 'product_manager' | 'marketing'

export interface Profile {
  id: string
  name: string | null
  email: string | null
  whatsapp: string | null
  company_name: string | null
  country: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category_id: string | null
  description: string | null
  fabric: string | null
  moq: number
  supports_logo: boolean
  status: 'active' | 'inactive' | 'draft'
  is_hot: boolean
  is_new: boolean
  created_at: string
  updated_at: string
  // Joined data
  category?: Category
  images?: ProductImage[]
  colors?: ProductColor[]
  sizes?: ProductSize[]
  price_rules?: PriceRule[]
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface ProductColor {
  id: string
  product_id: string
  color_name: string
  color_code: string | null
  color_image_url: string | null
  sort_order: number
  created_at: string
}

export interface ProductSize {
  id: string
  product_id: string
  size_name: string
  sort_order: number
  created_at: string
}

export interface PriceRule {
  id: string
  product_id: string
  min_qty: number
  unit_price: number
  logo_extra_price: number
  packaging_extra_price: number
  created_at: string
}

export interface InquiryCart {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  items?: InquiryCartItem[]
}

export interface InquiryCartItem {
  id: string
  cart_id: string
  product_id: string
  inquiry_type: 'quick' | 'detailed'
  total_qty: number
  note: string | null
  created_at: string
  product?: Product
  specs?: InquiryCartItemSpec[]
}

export interface InquiryCartItemSpec {
  id: string
  cart_item_id: string
  color: string
  size: string
  qty: number
  created_at: string
}

export type InquiryStatus = 'new' | 'pending_quote' | 'quoted' | 'negotiating' | 'converted' | 'lost'

export interface Inquiry {
  id: string
  inquiry_no: string
  user_id: string | null
  inquiry_type: 'quick' | 'detailed'
  status: InquiryStatus
  note: string | null
  source: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  assigned_sales_id: string | null
  created_at: string
  // Joined data
  user?: Profile
  items?: InquiryItem[]
  assigned_sales?: Profile
}

export interface InquiryItem {
  id: string
  inquiry_id: string
  product_id: string | null
  product_snapshot: Record<string, unknown> | null
  total_qty: number
  note: string | null
  created_at: string
  product?: Product
  specs?: InquiryItemSpec[]
}

export interface InquiryItemSpec {
  id: string
  inquiry_item_id: string
  color: string
  size: string
  qty: number
  created_at: string
}

export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'negotiating' | 'confirmed' | 'expired'

export interface Quote {
  id: string
  quote_no: string
  inquiry_id: string | null
  user_id: string | null
  sales_id: string | null
  current_version: number
  status: QuoteStatus
  subtotal: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  valid_until: string
  note: string | null
  created_at: string
  sent_at: string | null
  // Joined data
  inquiry?: Inquiry
  user?: Profile
  sales?: Profile
  items?: QuoteItem[]
  versions?: QuoteVersion[]
}

export interface QuoteVersion {
  id: string
  quote_id: string
  version_no: number
  subtotal: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  change_reason: string | null
  changed_by: string | null
  created_at: string
}

export interface QuoteItem {
  id: string
  quote_id: string
  quote_version_id: string | null
  product_id: string | null
  product_snapshot: Record<string, unknown>
  unit_price: number
  total_qty: number
  subtotal: number
  created_at: string
  product?: Product
  specs?: QuoteItemSpec[]
}

export interface QuoteItemSpec {
  id: string
  quote_item_id: string
  color: string
  size: string
  qty: number
  created_at: string
}

export type OrderStatus = 'pending_payment' | 'paid' | 'in_production' | 'production_done' | 'shipping' | 'delivered' | 'completed' | 'cancelled'

export interface Order {
  id: string
  order_no: string
  quote_id: string | null
  user_id: string | null
  sales_id: string | null
  status: OrderStatus
  subtotal: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  paid_amount: number
  production_status: string | null
  production_note: string | null
  shipping_method: string | null
  tracking_number: string | null
  estimated_delivery: string | null
  note: string | null
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  // Joined data
  quote?: Quote
  user?: Profile
  sales?: Profile
  items?: OrderItem[]
  payments?: Payment[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_snapshot: Record<string, unknown>
  unit_price: number
  total_qty: number
  subtotal: number
  created_at: string
  specs?: OrderItemSpec[]
}

export interface OrderItemSpec {
  id: string
  order_item_id: string
  color: string
  size: string
  qty: number
  created_at: string
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  order_id: string
  amount: number
  payment_method: string | null
  transaction_id: string | null
  status: PaymentStatus
  note: string | null
  created_at: string
}

export type FollowupType = 'whatsapp' | 'email' | 'call' | 'meeting' | 'other'

export interface CustomerFollowup {
  id: string
  customer_id: string
  sales_id: string | null
  type: FollowupType
  content: string | null
  next_action: string | null
  next_action_date: string | null
  created_at: string
  customer?: Profile
  sales?: Profile
}

export type CampaignType = 'discount' | 'promotion' | 'banner' | 'popup'

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  description: string | null
  content: string | null
  image_url: string | null
  link_url: string | null
  discount_percent: number | null
  discount_code: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

export interface ShippingTemplate {
  id: string
  name: string
  carrier: string | null
  regions: string[]
  base_cost: number
  per_kg_cost: number
  estimated_days_min: number | null
  estimated_days_max: number | null
  is_active: boolean
  created_at: string
}

export interface MarketingPixel {
  id: string
  name: string
  type: 'facebook' | 'google' | 'tiktok' | 'other'
  pixel_id: string | null
  config: Record<string, unknown> | null
  is_active: boolean
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string | null
  content: string | null
  excerpt: string | null
  featured_image: string | null
  author_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Setting {
  id: string
  key: string
  value: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// Helper types for color/size matrix
export interface ColorSizeQty {
  color: string
  size: string
  qty: number
}

export interface ProductWithDetails extends Product {
  category: Category | null
  images: ProductImage[]
  colors: ProductColor[]
  sizes: ProductSize[]
  price_rules: PriceRule[]
}

// Cart calculation helpers
export interface CartCalculation {
  items: {
    product_id: string
    total_qty: number
    unit_price: number
    subtotal: number
  }[]
  subtotal: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
}
