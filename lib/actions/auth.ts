"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

interface SignUpParams {
  email: string
  password: string
  name: string
  companyName?: string
  whatsapp?: string
  country?: string
  budget?: string
  website?: string
}

interface SignInParams {
  email: string
  password: string
  redirectTo?: string
}

export async function signIn(params: SignInParams) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  })

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return { success: false, error: "请先验证您的邮箱" }
    }
    return { success: false, error: "邮箱或密码错误" }
  }

  revalidatePath("/", "layout")
  redirect(params.redirectTo || "/")
}

export async function signUp(params: SignUpParams) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      data: {
        name: params.name,
        company_name: params.companyName,
        whatsapp: params.whatsapp,
        country: params.country,
        budget: params.budget,
        website: params.website,
        role: "customer",
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Update profile with additional info
  if (data.user) {
    await supabase
      .from("profiles")
      .update({
        name: params.name,
        company_name: params.companyName,
        whatsapp: params.whatsapp,
        country: params.country,
        budget: params.budget,
        website: params.website,
      })
      .eq("id", data.user.id)
  }

  return { success: true, needsEmailConfirmation: !data.session }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

// 发送 OTP 验证码到邮箱
export async function signInWithOtp(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // 不自动创建用户，只允许已存在的用户登录
    },
  })

  if (error) {
    console.error("OTP error:", error)
    if (error.message.includes("User not found") || error.message.includes("Signups not allowed")) {
      return { success: false, error: "该邮箱未注册，请先提交询价或注册账号" }
    }
    if (error.message.includes("rate limit")) {
      return { success: false, error: "发送过于频繁，请稍后再试" }
    }
    return { success: false, error: "发送验证码失败，请重试" }
  }

  return { success: true }
}

// 验证 OTP 并登录
export async function verifyOtp(email: string, token: string, redirectTo?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  })

  if (error) {
    console.error("Verify OTP error:", error)
    if (error.message.includes("Token has expired")) {
      return { success: false, error: "验证码已过期，请重新发送" }
    }
    if (error.message.includes("Invalid") || error.message.includes("invalid")) {
      return { success: false, error: "验证码错误，请检查后重试" }
    }
    return { success: false, error: "验证失败，请重试" }
  }

  revalidatePath("/", "layout")
  redirect(redirectTo || "/")
}

// 普通客户直接登录（无需密码，使用 Admin API 生成 session）
export async function signInCustomerDirect(email: string, redirectTo?: string) {
  const adminSupabase = createAdminClient()
  const supabase = await createClient()

  // 首先检查用户是否存在且是普通客户
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .single()

  if (!profile) {
    return { success: false, error: "该邮箱未注册" }
  }

  // 如果是管理员，不允许直接登录
  if (profile.role === "admin" || profile.role === "super_admin") {
    return { success: false, error: "管理员请使用密码登录", requirePassword: true }
  }

  // 使用 Admin API 为用户生成登录链接
  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: "magiclink",
    email: email,
  })

  if (linkError || !linkData) {
    console.error("Generate link error:", linkError)
    return { success: false, error: "登录失败，请重试" }
  }

  // 从生成的链接中提取 token 并直接验证
  const token = linkData.properties?.hashed_token
  if (!token) {
    return { success: false, error: "登录失败，请重试" }
  }

  // 使用 verifyOtp 来验证 magic link token 并获取 session
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "magiclink",
  })

  if (verifyError || !verifyData.session) {
    return { success: false, error: "登录失败，请重试" }
  }

  revalidatePath("/", "layout")
  return { success: true, redirectTo: redirectTo || "/" }
}

export async function updateProfile(data: {
  name?: string
  companyName?: string
  whatsapp?: string
  country?: string
  budget?: string
  website?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Please log in first" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      company_name: data.companyName,
      whatsapp: data.whatsapp,
      country: data.country,
      budget: data.budget,
      website: data.website,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: "Update failed" }
  }

  revalidatePath("/customer")
  return { success: true }
}
