import { createAdminClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // 'logo' or 'favicon'
    
    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 })
    }
    
    // 验证文件类型
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/x-icon", "image/ico", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "不支持的文件格式" }, { status: 400 })
    }
    
    // 验证文件大小 (最大2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过2MB" }, { status: 400 })
    }
    
    // 生成文件名
    const ext = file.name.split(".").pop()
    const fileName = `${type}-${Date.now()}.${ext}`
    const filePath = `site/${fileName}`
    
    // 上传到Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })
    
    if (uploadError) {
      console.error("上传失败:", uploadError)
      return NextResponse.json({ error: "上传失败" }, { status: 500 })
    }
    
    // 获取公共URL
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath)
    
    const publicUrl = urlData.publicUrl
    
    // 更新数据库设置
    const settingKey = type === "logo" ? "logo_url" : "favicon_url"
    const { error: updateError } = await supabase
      .from("site_settings")
      .upsert({ key: settingKey, value: publicUrl }, { onConflict: "key" })
    
    if (updateError) {
      console.error("更新设置失败:", updateError)
      return NextResponse.json({ error: "更新设置失败" }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      type: settingKey
    })
  } catch (error) {
    console.error("上传Logo失败:", error)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}
