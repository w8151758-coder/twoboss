"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface SubmitInquiryParams {
  companyName: string
  contactName: string
  phone: string
  email: string
  address?: string
  remark?: string
}

export async function submitInquiry(params: SubmitInquiryParams) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "请先登录" }
  }

  try {
    // Get cart items
    const { data: cart } = await supabase
      .from("inquiry_carts")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!cart) {
      return { success: false, error: "询价车为空" }
    }

    const { data: cartItems } = await supabase
      .from("inquiry_cart_items")
      .select(`
        *,
        product:products(id, name),
        sku:product_skus(id, attributes)
      `)
      .eq("cart_id", cart.id)

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "询价车为空" }
    }

    // Create inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .insert({
        user_id: user.id,
        company_name: params.companyName,
        contact_name: params.contactName,
        phone: params.phone,
        email: params.email,
        address: params.address,
        remark: params.remark,
        status: "pending",
      })
      .select("id, inquiry_no")
      .single()

    if (inquiryError) throw inquiryError

    // Create inquiry items
    const inquiryItems = cartItems.map((item) => ({
      inquiry_id: inquiry.id,
      product_id: item.product_id,
      sku_id: item.sku_id,
      product_name: item.product?.name || "",
      sku_attributes: item.sku?.attributes,
      quantity: item.quantity,
      remark: item.remark,
    }))

    const { error: itemsError } = await supabase
      .from("inquiry_items")
      .insert(inquiryItems)

    if (itemsError) throw itemsError

    // Clear cart
    await supabase
      .from("inquiry_cart_items")
      .delete()
      .eq("cart_id", cart.id)

    revalidatePath("/", "layout")
    return { success: true, inquiryNo: inquiry.inquiry_no }
  } catch (error) {
    console.error("Submit inquiry error:", error)
    return { success: false, error: "提交失败，请重试" }
  }
}

export async function getInquiryDetail(inquiryId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "请先登录" }
  }

  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .select(`
      *,
      items:inquiry_items(
        *,
        product:products(id, name, images, unit)
      )
    `)
    .eq("id", inquiryId)
    .single()

  if (error) {
    return { success: false, error: "询价单不存在" }
  }

  return { success: true, data: inquiry }
}
