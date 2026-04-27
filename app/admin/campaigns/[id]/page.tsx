import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CampaignForm } from "./campaign-form"

export default async function CampaignEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === "new"

  if (isNew) {
    return <CampaignForm campaign={null} />
  }

  const supabase = await createClient()
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single()

  if (!campaign) {
    notFound()
  }

  return <CampaignForm campaign={campaign} />
}
