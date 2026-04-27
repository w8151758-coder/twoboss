import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

// 缓存网站设置，5分钟更新一次
const getCachedSiteSettings = unstable_cache(
  async () => {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
    
    if (error) throw error
    
    const settings: Record<string, string | null> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })
    
    return settings
  },
  ["site-settings"],
  { revalidate: 300, tags: ["site-settings"] }
)

export async function GET() {
  try {
    const settings = await getCachedSiteSettings()
    
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("获取网站设置失败:", error)
    return NextResponse.json({
      site_name: "MenswearWholesale",
      logo_url: null,
      favicon_url: null,
    })
  }
}
