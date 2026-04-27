import { createClient } from "@/lib/supabase/server"
import { CategoryManager } from "./category-manager"

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })

  return <CategoryManager initialCategories={categories || []} />
}
