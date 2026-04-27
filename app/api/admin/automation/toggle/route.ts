import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const { ruleId, enabled } = await request.json()

    const { data, error } = await supabase
      .from("automation_rules")
      .update({ enabled })
      .eq("id", ruleId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ rule: data })
  } catch (error) {
    console.error("Error toggling automation rule:", error)
    return NextResponse.json({ error: "Failed to toggle rule" }, { status: 500 })
  }
}
