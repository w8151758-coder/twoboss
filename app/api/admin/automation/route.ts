import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: rules, error } = await supabase
      .from("automation_rules")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Error fetching automation rules:", error)
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("automation_rules")
      .insert({
        name: body.name,
        description: body.description,
        trigger_type: body.trigger_type,
        trigger_config: body.trigger_config || {},
        action_type: body.action_type,
        action_config: body.action_config || {},
        enabled: body.enabled ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ rule: data })
  } catch (error) {
    console.error("Error creating automation rule:", error)
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("automation_rules")
      .update({
        name: body.name,
        description: body.description,
        trigger_type: body.trigger_type,
        trigger_config: body.trigger_config,
        action_type: body.action_type,
        action_config: body.action_config,
        enabled: body.enabled,
      })
      .eq("id", body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ rule: data })
  } catch (error) {
    console.error("Error updating automation rule:", error)
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 })
  }
}
