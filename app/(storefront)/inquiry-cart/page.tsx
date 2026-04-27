import { createClient } from "@/lib/supabase/server"
import { InquiryCartClient } from "./inquiry-cart-client"

export default async function InquiryCartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    
    profile = profileData
  }

  return <InquiryCartClient profile={profile} isLoggedIn={!!user} />
}
