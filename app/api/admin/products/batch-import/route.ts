import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 检查用户权限
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "sales", "product_manager"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { products } = await request.json()

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid products data" }, { status: 400 })
    }

    let imported = 0
    const errors: string[] = []

    for (const product of products) {
      try {
        // 查找或创建分类
        let categoryId = null
        if (product.category) {
          const { data: existingCat } = await supabase
            .from("categories")
            .select("id")
            .eq("name", product.category)
            .single()

          if (existingCat) {
            categoryId = existingCat.id
          } else {
            // 创建新分类
            const { data: newCat } = await supabase
              .from("categories")
              .insert({
                name: product.category,
                name_en: product.category,
                slug: product.category.toLowerCase().replace(/\s+/g, "-"),
                is_active: true,
              })
              .select("id")
              .single()
            
            categoryId = newCat?.id
          }
        }

        // 检查SKU是否已存在
        const { data: existingProduct } = await supabase
          .from("products")
          .select("id")
          .eq("sku", product.sku)
          .single()

        if (existingProduct) {
          // 更新现有产品
          await supabase
            .from("products")
            .update({
              name: product.name,
              description: product.description || null,
              category_id: categoryId,
              image_url: product.image || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProduct.id)

          imported++
        } else {
          // 创建新产品
          const { data: newProduct, error: productError } = await supabase
            .from("products")
            .insert({
              name: product.name,
              sku: product.sku,
              description: product.description || null,
              category_id: categoryId,
              image_url: product.image || null,
              moq: 50,
              is_active: true,
              is_hot: false,
              is_new: true,
            })
            .select("id")
            .single()

          if (productError) {
            errors.push(`${product.sku}: ${productError.message}`)
            continue
          }

          // 添加颜色
          if (product.colors && product.colors.length > 0) {
            const colorInserts = product.colors.map((color: string) => ({
              product_id: newProduct.id,
              color_name: color,
              color_code: getColorCode(color),
            }))

            await supabase.from("product_colors").insert(colorInserts)
          }

          // 添加尺寸
          if (product.sizes && product.sizes.length > 0) {
            const sizeInserts = product.sizes.map((size: string, index: number) => ({
              product_id: newProduct.id,
              size_name: size,
              sort_order: index,
            }))

            await supabase.from("product_sizes").insert(sizeInserts)
          }

          imported++
        }
      } catch (error) {
        console.error(`Error importing product ${product.sku}:`, error)
        errors.push(`${product.sku}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json({
      imported,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Batch import error:", error)
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 })
  }
}

// 根据颜色名称获取颜色代码
function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    "白色": "#FFFFFF",
    "black": "#000000",
    "黑色": "#000000",
    "white": "#FFFFFF",
    "red": "#FF0000",
    "红色": "#FF0000",
    "blue": "#0000FF",
    "蓝色": "#0000FF",
    "navy": "#000080",
    "藏青色": "#000080",
    "藏青": "#000080",
    "深蓝": "#000080",
    "green": "#008000",
    "绿色": "#008000",
    "yellow": "#FFFF00",
    "黄色": "#FFFF00",
    "orange": "#FFA500",
    "橙色": "#FFA500",
    "purple": "#800080",
    "紫色": "#800080",
    "pink": "#FFC0CB",
    "粉色": "#FFC0CB",
    "gray": "#808080",
    "grey": "#808080",
    "灰色": "#808080",
    "brown": "#A52A2A",
    "棕色": "#A52A2A",
    "咖啡色": "#A52A2A",
    "beige": "#F5F5DC",
    "米色": "#F5F5DC",
    "卡其": "#C3B091",
    "khaki": "#C3B091",
  }

  const lowerName = colorName.toLowerCase()
  return colorMap[lowerName] || colorMap[colorName] || "#CCCCCC"
}
