import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProductForm } from "./product-form"

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === "new"

  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)

  if (isNew) {
    return (
      <ProductForm
        categories={categories || []}
        product={null}
        attributes={[]}
        skus={[]}
        priceTiers={[]}
      />
    )
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (!product) {
    notFound()
  }

  const [
    { data: attributes },
    { data: skus },
    { data: priceTiers },
  ] = await Promise.all([
    supabase
      .from("product_attributes")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
    supabase
      .from("product_skus")
      .select("*")
      .eq("product_id", id),
    supabase
      .from("price_tiers")
      .select("*")
      .eq("product_id", id)
      .order("min_qty"),
  ])

  return (
    <ProductForm
      categories={categories || []}
      product={product}
      attributes={attributes || []}
      skus={skus || []}
      priceTiers={priceTiers || []}
    />
  )
}
