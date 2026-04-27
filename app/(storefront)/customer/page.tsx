import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "./profile-form"

export default async function CustomerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">个人资料</h2>
        <p className="text-sm text-muted-foreground">管理您的账户信息</p>
      </div>

      <ProfileForm profile={profile} email={user.email || ""} />
    </div>
  )
}
