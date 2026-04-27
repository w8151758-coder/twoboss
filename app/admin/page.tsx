import { createAdminClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import { unstable_cache } from "next/cache"

// Cache dashboard stats for 1 minute
const getCachedDashboardStats = unstable_cache(
  async () => {
    const supabase = createAdminClient()

    const [
      { count: productCount },
      { count: inquiryCount },
      { count: quoteCount },
      { count: orderCount },
      { count: customerCount },
      { data: recentInquiries },
      { data: recentQuotes },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase
        .from("inquiries")
        .select("id, inquiry_no, status, created_at, profiles(name, company_name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("quotes")
        .select("id, quote_no, total_amount, status, created_at, profiles(name, company_name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

    return {
      productCount: productCount || 0,
      inquiryCount: inquiryCount || 0,
      quoteCount: quoteCount || 0,
      orderCount: orderCount || 0,
      customerCount: customerCount || 0,
      recentInquiries: recentInquiries || [],
      recentQuotes: recentQuotes || [],
    }
  },
  ['dashboard-stats'],
  {
    revalidate: 60, // 1 minute cache
    tags: ['dashboard'],
  }
)

export default async function AdminDashboard() {
  const data = await getCachedDashboardStats()
  return <DashboardClient data={data} />
}
