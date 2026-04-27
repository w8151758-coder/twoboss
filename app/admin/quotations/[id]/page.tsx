import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { QuotationEditor } from "./quotation-editor"

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: quotation } = await supabase
    .from("quotations")
    .select(`
      *,
      quotation_items(*)
    `)
    .eq("id", id)
    .single()

  if (!quotation) {
    notFound()
  }

  return <QuotationEditor quotation={quotation} />
}
