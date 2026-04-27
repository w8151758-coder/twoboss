import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayoutClient } from "./layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login?redirect=/admin")
  }

  // Check user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name, email")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "sales", "product_manager", "marketing"].includes(profile.role)) {
    redirect("/")
  }

  return <AdminLayoutClient profile={profile}>{children}</AdminLayoutClient>
}
