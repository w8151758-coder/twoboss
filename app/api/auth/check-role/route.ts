import { createAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ isAdmin: false })
    }

    const supabase = createAdminClient()

    // 查询用户的角色
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("email", email)
      .single()

    // 检查是否是管理员或超级管理员
    const adminRoles = ["admin", "super_admin", "superadmin", "administrator"]
    const isAdmin = profile?.role && adminRoles.includes(profile.role.toLowerCase())

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("Check role error:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
