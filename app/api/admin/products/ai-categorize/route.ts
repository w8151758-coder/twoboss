import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { products, existingCategories } = await request.json()

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid products data" }, { status: 400 })
    }

    // 构建分析提示
    const productList = products
      .slice(0, 100) // 限制数量避免超出token限制
      .map((p: any, i: number) => `${i + 1}. ${p.name} | ${p.description || ""} | 原分类: ${p.originalCategory || "无"}`)
      .join("\n")

    const existingCatList = existingCategories?.length > 0 
      ? `\n\n现有分类：${existingCategories.join(", ")}`
      : ""

    const prompt = `你是一个专业的服装产品分类专家。请分析以下产品列表，为每个产品建议最合适的分类。

规则：
1. 优先使用现有分类（如果合适）
2. 如果现有分类都不适合，可以建议新分类
3. 分类应该简洁明了，如：T恤、衬衫、夹克、牛仔裤、运动裤、卫衣、外套、短裤、西装、针织衫等
4. 返回JSON格式
${existingCatList}

产品列表：
${productList}

请返回JSON格式：
{
  "suggestions": [
    {"id": "产品ID", "category": "建议分类"},
    ...
  ],
  "newCategories": ["新分类1", "新分类2"]
}

只返回JSON，不要其他解释。`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    })

    // 解析AI响应
    let result
    try {
      // 提取JSON部分
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", text)
      // 如果解析失败，返回基于规则的简单分类
      result = {
        suggestions: products.map((p: any) => ({
          id: p.id,
          category: guessCategory(p.name, existingCategories),
        })),
        newCategories: [],
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("AI categorize error:", error)
    return NextResponse.json({ error: "Failed to categorize products" }, { status: 500 })
  }
}

// 基于关键词的简单分类猜测（作为备选方案）
function guessCategory(name: string, existingCategories: string[]): string {
  const lowerName = name.toLowerCase()
  
  const keywords: Record<string, string[]> = {
    "T恤": ["t-shirt", "tee", "t恤", "短袖"],
    "衬衫": ["shirt", "衬衫", "衬衣"],
    "夹克": ["jacket", "夹克", "外套"],
    "牛仔裤": ["jeans", "牛仔", "denim"],
    "运动裤": ["sweatpants", "jogger", "运动裤"],
    "卫衣": ["hoodie", "sweatshirt", "卫衣", "连帽"],
    "外套": ["coat", "外套", "大衣"],
    "短裤": ["shorts", "短裤"],
    "西装": ["suit", "blazer", "西装", "西服"],
    "针织衫": ["sweater", "knit", "针织", "毛衣"],
    "裙子": ["skirt", "dress", "裙"],
    "运动服": ["sportswear", "athletic", "运动"],
  }

  for (const [category, kws] of Object.entries(keywords)) {
    if (kws.some(kw => lowerName.includes(kw))) {
      // 检查是否有匹配的现有分类
      const matchingExisting = existingCategories.find(
        ec => ec.toLowerCase().includes(category.toLowerCase())
      )
      return matchingExisting || category
    }
  }

  return existingCategories[0] || "其他"
}
