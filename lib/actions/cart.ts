"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface AddToCartParams {
  productId: string
  quantity: number
  color?: string | null
  size?: string | null
  note?: string
}

export async function addToCart({ productId, quantity, color, size, note }: AddToCartParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Please sign in to continue" }
  }

  try {
    // Get or create cart
    let { data: cart } = await supabase
      .from("inquiry_carts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from("inquiry_carts")
        .insert({ user_id: user.id })
        .select("id")
        .single()

      if (cartError) throw cartError
      cart = newCart
    }

    // For quick inquiry, just add item without color/size specs
    // For detailed inquiry, we'll add specs separately
    const inquiryType = color || size ? 'detailed' : 'quick'

    // Check if item already exists with same product
    const { data: existingItem } = await supabase
      .from("inquiry_cart_items")
      .select("id, total_qty")
      .eq("cart_id", cart.id)
      .eq("product_id", productId)
      .single()

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from("inquiry_cart_items")
        .update({
          total_qty: existingItem.total_qty + quantity,
          note: note || undefined,
          inquiry_type: inquiryType,
        })
        .eq("id", existingItem.id)

      if (error) throw error

      // Add spec if color/size provided
      if (color || size) {
        await supabase
          .from("inquiry_cart_item_specs")
          .insert({
            cart_item_id: existingItem.id,
            color: color || '',
            size: size || '',
            qty: quantity,
          })
      }
    } else {
      // Insert new item
      const { data: newItem, error } = await supabase
        .from("inquiry_cart_items")
        .insert({
          cart_id: cart.id,
          product_id: productId,
          inquiry_type: inquiryType,
          total_qty: quantity,
          note,
        })
        .select("id")
        .single()

      if (error) throw error

      // Add spec if color/size provided
      if (newItem && (color || size)) {
        await supabase
          .from("inquiry_cart_item_specs")
          .insert({
            cart_item_id: newItem.id,
            color: color || '',
            size: size || '',
            qty: quantity,
          })
      }
    }

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Add to cart error:", error)
    return { success: false, error: "Failed to add to cart, please try again" }
  }
}

export async function updateCartItem(itemId: string, totalQty: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Please sign in to continue" }
  }

  try {
    const { error } = await supabase
      .from("inquiry_cart_items")
      .update({ total_qty: totalQty })
      .eq("id", itemId)

    if (error) throw error

    revalidatePath("/inquiry-cart")
    return { success: true }
  } catch (error) {
    console.error("Update cart error:", error)
    return { success: false, error: "Update failed" }
  }
}

export async function removeCartItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Please sign in to continue" }
  }

  try {
    // First delete specs
    await supabase
      .from("inquiry_cart_item_specs")
      .delete()
      .eq("cart_item_id", itemId)

    // Then delete item
    const { error } = await supabase
      .from("inquiry_cart_items")
      .delete()
      .eq("id", itemId)

    if (error) throw error

    revalidatePath("/inquiry-cart")
    return { success: true }
  } catch (error) {
    console.error("Remove cart error:", error)
    return { success: false, error: "Delete failed" }
  }
}

export async function clearCart() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Please sign in to continue" }
  }

  try {
    const { data: cart } = await supabase
      .from("inquiry_carts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (cart) {
      // Get all cart items
      const { data: items } = await supabase
        .from("inquiry_cart_items")
        .select("id")
        .eq("cart_id", cart.id)

      if (items && items.length > 0) {
        // Delete all specs first
        for (const item of items) {
          await supabase
            .from("inquiry_cart_item_specs")
            .delete()
            .eq("cart_item_id", item.id)
        }
      }

      // Delete all items
      const { error } = await supabase
        .from("inquiry_cart_items")
        .delete()
        .eq("cart_id", cart.id)

      if (error) throw error
    }

    revalidatePath("/inquiry-cart")
    return { success: true }
  } catch (error) {
    console.error("Clear cart error:", error)
    return { success: false, error: "Clear cart failed" }
  }
}

interface CartItemFromClient {
  productId: string
  productName: string
  productSku: string
  totalQty: number
  specs: Array<{ color: string; size: string; qty: number }>
  note?: string
}

interface GuestInfo {
  name: string
  email: string
  whatsapp: string
  company?: string
  country?: string
  address?: string
  website?: string
  budget?: string
}

interface SubmitInquiryAsGuestParams {
  items: CartItemFromClient[]
  note?: string
  guestInfo: GuestInfo
}

// 游客提交询价 - 自动创建账号并登录
export async function submitInquiryAsGuest({ items, note, guestInfo }: SubmitInquiryAsGuestParams) {
  const supabase = await createClient()

  if (!items || items.length === 0) {
    return { success: false, error: "询价车为空" }
  }

  if (!guestInfo.name) {
    return { success: false, error: "请输入您的姓名" }
  }

  if (!guestInfo.email) {
    return { success: false, error: "请输入邮箱地址" }
  }

  if (!guestInfo.whatsapp) {
    return { success: false, error: "请输入WhatsApp号码" }
  }

  if (!guestInfo.country) {
    return { success: false, error: "请输入国家/地区" }
  }

  if (!guestInfo.budget) {
    return { success: false, error: "请输入预算范围" }
  }

  console.log("[v0] submitInquiryAsGuest called with:", { items: items.length, guestInfo })

  // 使用 admin client 绕过 RLS
  const adminSupabase = createAdminClient()

  try {
    let userId: string
    let autoLogin = false

    // 如果有邮箱，先检查是否已存在
    if (guestInfo.email) {
      // 首先检查邮箱是否已存在于 profiles 表中
      const { data: existingProfile } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("email", guestInfo.email)
        .single()

      if (existingProfile) {
        // 邮箱已存在，直接使用现有用户
        userId = existingProfile.id
        console.log("[v0] Using existing user:", userId)
        // 标记为已存在用户，前端可以提示登录
        autoLogin = false
      } else {
        // 邮箱不存在，创建新用户
        const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase()

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: guestInfo.email,
          password: randomPassword,
          options: {
            data: {
              name: guestInfo.name,
              company_name: guestInfo.company || '',
              whatsapp: guestInfo.whatsapp || '',
            },
            emailRedirectTo: undefined, // 禁用邮箱验证
          }
        })

        if (authError) {
          console.error("Auth error:", authError)
          // 如果是频率限制或其他错误，尝试直接创建 profile
          if (authError.message.includes("rate limit")) {
            // 使用 admin client 直接创建用户
            const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
              email: guestInfo.email,
              password: randomPassword,
              email_confirm: true, // 自动确认邮箱
              user_metadata: {
                name: guestInfo.name,
                company_name: guestInfo.company || '',
                whatsapp: guestInfo.whatsapp || '',
              }
            })

            if (createError) {
              console.error("Admin create user error:", createError)
              return { success: false, error: "系统繁忙，请稍后重试" }
            }

            if (newUser.user) {
              userId = newUser.user.id
              // 创建 profile
              await adminSupabase
                .from("profiles")
                .upsert({
                  id: userId,
                  email: guestInfo.email,
                  name: guestInfo.name,
                  company_name: guestInfo.company || null,
                  whatsapp: guestInfo.whatsapp || null,
                  role: 'customer',
                })
            } else {
              return { success: false, error: "创建账号失败，请重试" }
            }
          } else {
            return { success: false, error: "创建账号失败，请重试" }
          }
        } else if (authData.user) {
          userId = authData.user.id
          autoLogin = true

          // 更新/创建 profile (使用 admin client 绕过 RLS)
          await adminSupabase
            .from("profiles")
            .upsert({
              id: userId,
              email: guestInfo.email,
              name: guestInfo.name,
              company_name: guestInfo.company || null,
              whatsapp: guestInfo.whatsapp || null,
              role: 'customer',
            })
        } else {
          return { success: false, error: "创建账号失败，请重试" }
        }
      }
    } else {
      // 没有邮箱，使用WhatsApp创建临时账号
      // 使用 WhatsApp 号码作为唯一标识创建一个特殊邮箱
      const tempEmail = `guest_${guestInfo.whatsapp.replace(/\D/g, '')}@temp.inquiry.com`
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: randomPassword,
        options: {
          data: {
            name: guestInfo.name,
            company_name: guestInfo.company || '',
            whatsapp: guestInfo.whatsapp,
          }
        }
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          const { data: existingProfile } = await adminSupabase
            .from("profiles")
            .select("id")
            .eq("whatsapp", guestInfo.whatsapp)
            .single()

          if (existingProfile) {
            userId = existingProfile.id
          } else {
            return { success: false, error: "该WhatsApp号码已注册" }
          }
        } else {
          console.error("Auth error:", authError)
          return { success: false, error: "创建账号失败，请重试" }
        }
      } else if (authData.user) {
        userId = authData.user.id
        autoLogin = true

        await adminSupabase
          .from("profiles")
          .upsert({
            id: userId,
            email: tempEmail,
            name: guestInfo.name,
            company_name: guestInfo.company || null,
            whatsapp: guestInfo.whatsapp,
            role: 'customer',
          })
      } else {
        return { success: false, error: "创建账号失败，请重试" }
      }
    }

    // 生成询价单号
    const inquiryNo = `INQ${Date.now().toString(36).toUpperCase()}`

    // 创建询价单 (使用 admin client 绕过 RLS)
    const { data: inquiry, error: inquiryError } = await adminSupabase
      .from("inquiries")
      .insert({
        inquiry_no: inquiryNo,
        user_id: userId!,
        inquiry_type: 'detailed',
        status: 'new',
        note,
        source: 'website',
        contact_name: guestInfo.name,
        contact_email: guestInfo.email || null,
        contact_whatsapp: guestInfo.whatsapp || null,
        company_name: guestInfo.company || null,
        country: guestInfo.country || null,
        address: guestInfo.address || null,
        website: guestInfo.website || null,
        budget: guestInfo.budget || null,
      })
      .select("id")
      .single()

    if (inquiryError) {
      console.error("[v0] Inquiry creation error:", inquiryError)
      throw inquiryError
    }
    
    console.log("[v0] Inquiry created:", inquiry.id, inquiryNo)

    // 创建询价明细 (使用 admin client 绕过 RLS)
    for (const item of items) {
      const { data: product } = await adminSupabase
        .from("products")
        .select("*")
        .eq("id", item.productId)
        .single()

      const { data: inquiryItem, error: itemError } = await adminSupabase
        .from("inquiry_items")
        .insert({
          inquiry_id: inquiry.id,
          product_id: item.productId,
          product_snapshot: product,
          total_qty: item.totalQty,
          note: item.note,
        })
        .select("id")
        .single()

      if (itemError) throw itemError

      if (item.specs && item.specs.length > 0) {
        for (const spec of item.specs) {
          await adminSupabase
            .from("inquiry_item_specs")
            .insert({
              inquiry_item_id: inquiryItem.id,
              color: spec.color,
              size: spec.size,
              qty: spec.qty,
            })
        }
      }
    }

    revalidatePath("/", "layout")
    return { success: true, inquiryId: inquiry.id, inquiryNo, autoLogin, email: guestInfo.email }
  } catch (error) {
    console.error("Submit inquiry as guest error:", error)
    return { success: false, error: "提交询价失败，请重试" }
  }
}

interface SubmitInquiryFromCartParams {
  items: CartItemFromClient[]
  note?: string
}

// 从前端 localStorage 提交询价（已登录用户）
export async function submitInquiryFromCart({ items, note }: SubmitInquiryFromCartParams) {
  console.log("[v0] submitInquiryFromCart called with:", { items: items.length, note })
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log("[v0] User:", user?.id, user?.email)

  if (!user) {
    return { success: false, error: "请先登录" }
  }

  if (!items || items.length === 0) {
    return { success: false, error: "询价车为空" }
  }

  try {
    // Generate inquiry number
    const inquiryNo = `INQ${Date.now().toString(36).toUpperCase()}`

    // Create inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .insert({
        inquiry_no: inquiryNo,
        user_id: user.id,
        inquiry_type: 'detailed',
        status: 'new',
        note,
        source: 'website',
      })
      .select("id")
      .single()

    if (inquiryError) {
      console.error("[v0] Inquiry creation error:", inquiryError)
      throw inquiryError
    }
    
    console.log("[v0] Inquiry created:", inquiry.id, inquiryNo)

    // Create inquiry items
    for (const item of items) {
      // Get product snapshot
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.productId)
        .single()

      const { data: inquiryItem, error: itemError } = await supabase
        .from("inquiry_items")
        .insert({
          inquiry_id: inquiry.id,
          product_id: item.productId,
          product_snapshot: product,
          total_qty: item.totalQty,
          note: item.note,
        })
        .select("id")
        .single()

      if (itemError) throw itemError

      // Create inquiry item specs
      if (item.specs && item.specs.length > 0) {
        for (const spec of item.specs) {
          await supabase
            .from("inquiry_item_specs")
            .insert({
              inquiry_item_id: inquiryItem.id,
              color: spec.color,
              size: spec.size,
              qty: spec.qty,
            })
        }
      }
    }

    revalidatePath("/", "layout")
    return { success: true, inquiryId: inquiry.id, inquiryNo }
  } catch (error) {
    console.error("Submit inquiry error:", error)
    return { success: false, error: "提交询价失败，请重试" }
  }
}

interface SubmitInquiryParams {
  note?: string
}

// ���数据库购物车提交询价（已弃用，保留兼容）
export async function submitInquiry({ note }: SubmitInquiryParams = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Please sign in to continue" }
  }

  try {
    // Get cart with items
    const { data: cart } = await supabase
      .from("inquiry_carts")
      .select(`
        id,
        items:inquiry_cart_items(
          id,
          product_id,
          inquiry_type,
          total_qty,
          note,
          specs:inquiry_cart_item_specs(color, size, qty)
        )
      `)
      .eq("user_id", user.id)
      .single()

    if (!cart || !cart.items || cart.items.length === 0) {
      return { success: false, error: "Cart is empty" }
    }

    // Generate inquiry number
    const inquiryNo = `INQ${Date.now().toString(36).toUpperCase()}`

    // Determine inquiry type (quick if any item is quick)
    const inquiryType = cart.items.some(item => item.inquiry_type === 'quick') ? 'quick' : 'detailed'

    // Create inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .insert({
        inquiry_no: inquiryNo,
        user_id: user.id,
        inquiry_type: inquiryType,
        status: 'new',
        note,
        source: 'website',
      })
      .select("id")
      .single()

    if (inquiryError) throw inquiryError

    // Create inquiry items
    for (const item of cart.items) {
      // Get product snapshot
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .single()

      const { data: inquiryItem, error: itemError } = await supabase
        .from("inquiry_items")
        .insert({
          inquiry_id: inquiry.id,
          product_id: item.product_id,
          product_snapshot: product,
          total_qty: item.total_qty,
          note: item.note,
        })
        .select("id")
        .single()

      if (itemError) throw itemError

      // Create inquiry item specs
      if (item.specs && item.specs.length > 0) {
        for (const spec of item.specs) {
          await supabase
            .from("inquiry_item_specs")
            .insert({
              inquiry_item_id: inquiryItem.id,
              color: spec.color,
              size: spec.size,
              qty: spec.qty,
            })
        }
      }
    }

    // Clear cart after successful submission
    for (const item of cart.items) {
      await supabase
        .from("inquiry_cart_item_specs")
        .delete()
        .eq("cart_item_id", item.id)
    }

    await supabase
      .from("inquiry_cart_items")
      .delete()
      .eq("cart_id", cart.id)

    revalidatePath("/", "layout")
    return { success: true, inquiryId: inquiry.id, inquiryNo }
  } catch (error) {
    console.error("Submit inquiry error:", error)
    return { success: false, error: "Failed to submit inquiry" }
  }
}
