import { createAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// 获取所有网站设置
export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
    
    if (error) throw error
    
    // 转换为对象格式
    const settings: Record<string, string | null> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error("获取网站设置失败:", error)
    return NextResponse.json({ error: "获取设置失败" }, { status: 500 })
  }
}

// 更新网站设置
export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    
    // 批量更新设置
    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: value as string | null,
    }))
    
    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: update.key, value: update.value }, { onConflict: "key" })
      
      if (error) throw error
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("更新网站设置失败:", error)
    return NextResponse.json({ error: "更新设置失败" }, { status: 500 })
  }
}
