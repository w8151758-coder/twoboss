import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 检查用户权限
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "product_manager"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { categories } = await request.json()

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: "Invalid categories data" }, { status: 400 })
    }

    let created = 0

    for (const categoryName of categories) {
      // 检查是否已存在
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("name", categoryName)
        .single()

      if (!existing) {
        const { error } = await supabase
          .from("categories")
          .insert({
            name: categoryName,
            name_en: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
            is_active: true,
          })

        if (!error) {
          created++
        }
      }
    }

    return NextResponse.json({ created })
  } catch (error) {
    console.error("Batch category create error:", error)
    return NextResponse.json({ error: "Failed to create categories" }, { status: 500 })
  }
}
