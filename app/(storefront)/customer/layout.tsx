import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions/auth"
import { CustomerLayoutClient } from "@/components/storefront/customer-layout-client"

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <CustomerLayoutClient signOutAction={signOut}>
      {children}
    </CustomerLayoutClient>
  )
}
